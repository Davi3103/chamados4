<?php
/**
 * Script para consultar chamados e estatísticas
 * Sistema de Chamados - 
 */

require_once 'config.php';

// Configurar headers CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

// Tratar requisições OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    // Conectar ao banco de dados
    $pdo = conectarBanco();
    if (!$pdo) {
        enviarResposta(false, 'Erro de conexão com o banco de dados.');
    }
    
    // Determinar ação baseada no parâmetro
    $acao = $_GET['acao'] ?? $_POST['acao'] ?? 'estatisticas';
    
    switch ($acao) {
        case 'estatisticas':
            obterEstatisticas($pdo);
            break;
            
        case 'listar':
            listarChamados($pdo);
            break;
            
        case 'buscar':
            buscarChamado($pdo);
            break;
            
        case 'detalhes':
            obterDetalhesChamado($pdo);
            break;
            
        default:
            enviarResposta(false, 'Ação não reconhecida.');
    }
    
} catch (Exception $e) {
    error_log("Erro na consulta: " . $e->getMessage());
    enviarResposta(false, 'Erro interno do servidor.');
}

/**
 * Obter estatísticas dos chamados
 */
function obterEstatisticas($pdo) {
    try {
        // Usar a procedure criada no banco
        $stmt = $pdo->prepare("CALL sp_estatisticas_chamados()");
        $stmt->execute();
        $estatisticas = $stmt->fetch();
        
        // Estatísticas por categoria
        $sql = "SELECT c.nome, COUNT(ch.id) as total 
                FROM categorias c 
                LEFT JOIN chamados ch ON c.id = ch.categoria_id 
                GROUP BY c.id, c.nome 
                ORDER BY total DESC";
        $stmt = $pdo->prepare($sql);
        $stmt->execute();
        $categorias = $stmt->fetchAll();
        
        // Chamados recentes
        $sql = "SELECT numero_chamado, assunto, prioridade, data_criacao,
                       u.nome as solicitante, st.nome as status
                FROM chamados ch
                LEFT JOIN usuarios u ON ch.usuario_id = u.id
                LEFT JOIN status_chamados st ON ch.status_id = st.id
                ORDER BY ch.data_criacao DESC 
                LIMIT 10";
        $stmt = $pdo->prepare($sql);
        $stmt->execute();
        $recentes = $stmt->fetchAll();
        
        enviarResposta(true, 'Estatísticas obtidas com sucesso', [
            'resumo' => $estatisticas,
            'categorias' => $categorias,
            'recentes' => $recentes
        ]);
        
    } catch (Exception $e) {
        error_log("Erro ao obter estatísticas: " . $e->getMessage());
        enviarResposta(false, 'Erro ao obter estatísticas.');
    }
}

/**
 * Listar chamados com filtros
 */
function listarChamados($pdo) {
    try {
        $filtros = [];
        $params = [];
        $sql = "SELECT * FROM vw_chamados_completo WHERE 1=1";
        
        // Filtro por status
        if (!empty($_GET['status'])) {
            $sql .= " AND status_nome = :status";
            $params[':status'] = sanitizar($_GET['status']);
        }
        
        // Filtro por categoria
        if (!empty($_GET['categoria'])) {
            $sql .= " AND categoria_nome = :categoria";
            $params[':categoria'] = sanitizar($_GET['categoria']);
        }
        
        // Filtro por prioridade
        if (!empty($_GET['prioridade'])) {
            $sql .= " AND prioridade = :prioridade";
            $params[':prioridade'] = sanitizar($_GET['prioridade']);
        }
        
        // Filtro por data
        if (!empty($_GET['data_inicio'])) {
            $sql .= " AND DATE(data_criacao) >= :data_inicio";
            $params[':data_inicio'] = sanitizar($_GET['data_inicio']);
        }
        
        if (!empty($_GET['data_fim'])) {
            $sql .= " AND DATE(data_criacao) <= :data_fim";
            $params[':data_fim'] = sanitizar($_GET['data_fim']);
        }
        
        // Filtro por busca textual
        if (!empty($_GET['busca'])) {
            $sql .= " AND (numero_chamado LIKE :busca OR assunto LIKE :busca OR solicitante_nome LIKE :busca)";
            $params[':busca'] = '%' . sanitizar($_GET['busca']) . '%';
        }
        
        // Ordenação
        $ordenacao = sanitizar($_GET['ordenar'] ?? 'data_criacao');
        $direcao = sanitizar($_GET['direcao'] ?? 'DESC');
        $sql .= " ORDER BY {$ordenacao} {$direcao}";
        
        // Paginação
        $pagina = max(1, intval($_GET['pagina'] ?? 1));
        $por_pagina = min(100, max(10, intval($_GET['por_pagina'] ?? 20)));
        $offset = ($pagina - 1) * $por_pagina;
        
        $sql .= " LIMIT {$por_pagina} OFFSET {$offset}";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $chamados = $stmt->fetchAll();
        
        // Contar total para paginação
        $sqlCount = str_replace('SELECT * FROM vw_chamados_completo', 'SELECT COUNT(*) as total FROM vw_chamados_completo', 
                               substr($sql, 0, strpos($sql, 'ORDER BY')));
        $stmtCount = $pdo->prepare($sqlCount);
        $stmtCount->execute($params);
        $total = $stmtCount->fetch()['total'];
        
        enviarResposta(true, 'Chamados listados com sucesso', [
            'chamados' => $chamados,
            'paginacao' => [
                'pagina_atual' => $pagina,
                'por_pagina' => $por_pagina,
                'total_registros' => $total,
                'total_paginas' => ceil($total / $por_pagina)
            ]
        ]);
        
    } catch (Exception $e) {
        error_log("Erro ao listar chamados: " . $e->getMessage());
        enviarResposta(false, 'Erro ao listar chamados.');
    }
}

/**
 * Buscar chamado específico por número
 */
function buscarChamado($pdo) {
    try {
        $numero = sanitizar($_GET['numero'] ?? $_POST['numero'] ?? '');
        
        if (empty($numero)) {
            enviarResposta(false, 'Número do chamado é obrigatório.');
        }
        
        $sql = "SELECT * FROM vw_chamados_completo WHERE numero_chamado = :numero";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':numero' => $numero]);
        $chamado = $stmt->fetch();
        
        if (!$chamado) {
            enviarResposta(false, 'Chamado não encontrado.');
        }
        
        enviarResposta(true, 'Chamado encontrado', ['chamado' => $chamado]);
        
    } catch (Exception $e) {
        error_log("Erro ao buscar chamado: " . $e->getMessage());
        enviarResposta(false, 'Erro ao buscar chamado.');
    }
}

/**
 * Obter detalhes completos do chamado incluindo histórico e anexos
 */
function obterDetalhesChamado($pdo) {
    try {
        $id = intval($_GET['id'] ?? $_POST['id'] ?? 0);
        
        if ($id <= 0) {
            enviarResposta(false, 'ID do chamado é obrigatório.');
        }
        
        // Buscar dados principais do chamado
        $sql = "SELECT * FROM vw_chamados_completo WHERE id = :id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':id' => $id]);
        $chamado = $stmt->fetch();
        
        if (!$chamado) {
            enviarResposta(false, 'Chamado não encontrado.');
        }
        
        // Buscar histórico
        $sql = "SELECT h.*, u.nome as usuario_nome, 
                       sa.nome as status_anterior, sn.nome as status_novo
                FROM historico_chamados h
                LEFT JOIN usuarios u ON h.usuario_id = u.id
                LEFT JOIN status_chamados sa ON h.status_anterior_id = sa.id
                LEFT JOIN status_chamados sn ON h.status_novo_id = sn.id
                WHERE h.chamado_id = :id
                ORDER BY h.data_criacao DESC";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':id' => $id]);
        $historico = $stmt->fetchAll();
        
        // Buscar anexos
        $sql = "SELECT nome_original, nome_arquivo, tipo_arquivo, tamanho_arquivo, data_upload
                FROM anexos 
                WHERE chamado_id = :id
                ORDER BY data_upload";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':id' => $id]);
        $anexos = $stmt->fetchAll();
        
        enviarResposta(true, 'Detalhes do chamado obtidos com sucesso', [
            'chamado' => $chamado,
            'historico' => $historico,
            'anexos' => $anexos
        ]);
        
    } catch (Exception $e) {
        error_log("Erro ao obter detalhes do chamado: " . $e->getMessage());
        enviarResposta(false, 'Erro ao obter detalhes do chamado.');
    }
}
?>

