<?php
/**
 * Configurações do Sistema de Chamados
 * Arquivo de configuração principal
 */

// Configurações do Banco de Dados
define('DB_HOST', 'localhost');
define('DB_NAME', 'sistema_chamados');
define('DB_USER', 'root');
define('DB_PASS', 'senha123');
define('DB_CHARSET', 'utf8mb4');

// Configurações do Sistema
define('SISTEMA_NOME', 'Sistema de Chamados');
define('SISTEMA_EMAIL', 'noreply@sistema-chamados.com');
define('UPLOAD_DIR', '../uploads/');
define('MAX_FILE_SIZE', 10 * 1024 * 1024); // 10MB

// Configurações de E-mail (SMTP)
define('SMTP_HOST', 'smtp.gmail.com');
define('SMTP_PORT', 587);
define('SMTP_USER', '');
define('SMTP_PASS', '');
define('SMTP_SECURE', 'tls');

// Configurações de Segurança
define('CSRF_TOKEN_NAME', 'csrf_token');
define('SESSION_TIMEOUT', 3600); // 1 hora

// Timezone
date_default_timezone_set('America/Sao_Paulo');

// Configurações de Erro
error_reporting(E_ALL);
ini_set('display_errors', 1);

/**
 * Função para conectar ao banco de dados
 */
function conectarBanco() {
    try {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
        $pdo = new PDO($dsn, DB_USER, DB_PASS);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        return $pdo;
    } catch (PDOException $e) {
        error_log("Erro de conexão com o banco: " . $e->getMessage());
        return false;
    }
}

/**
 * Função para gerar token CSRF
 */
function gerarCSRFToken() {
    if (session_status() == PHP_SESSION_NONE) {
        session_start();
    }
    
    if (!isset($_SESSION[CSRF_TOKEN_NAME])) {
        $_SESSION[CSRF_TOKEN_NAME] = bin2hex(random_bytes(32));
    }
    
    return $_SESSION[CSRF_TOKEN_NAME];
}

/**
 * Função para validar token CSRF
 */
function validarCSRFToken($token) {
    if (session_status() == PHP_SESSION_NONE) {
        session_start();
    }
    
    return isset($_SESSION[CSRF_TOKEN_NAME]) && hash_equals($_SESSION[CSRF_TOKEN_NAME], $token);
}

/**
 * Função para sanitizar dados de entrada
 */
function sanitizar($dados) {
    if (is_array($dados)) {
        return array_map('sanitizar', $dados);
    }
    return htmlspecialchars(trim($dados), ENT_QUOTES, 'UTF-8');
}

/**
 * Função para validar e-mail
 */
function validarEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

/**
 * Função para gerar número de chamado único
 */
function gerarNumeroChamado() {
    return 'CH' . date('Ymd') . str_pad(mt_rand(1, 9999), 4, '0', STR_PAD_LEFT);
}

/**
 * Função para log de atividades
 */
function logarAtividade($acao, $detalhes = '', $usuario_id = null) {
    try {
        $pdo = conectarBanco();
        if (!$pdo) return false;
        
        $sql = "INSERT INTO logs (acao, detalhes, usuario_id, ip_address, user_agent, data_criacao) 
                VALUES (:acao, :detalhes, :usuario_id, :ip_address, :user_agent, NOW())";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':acao' => $acao,
            ':detalhes' => $detalhes,
            ':usuario_id' => $usuario_id,
            ':ip_address' => $_SERVER['REMOTE_ADDR'] ?? '',
            ':user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? ''
        ]);
        
        return true;
    } catch (Exception $e) {
        error_log("Erro ao registrar log: " . $e->getMessage());
        return false;
    }
}

/**
 * Função para enviar resposta JSON
 */
function enviarResposta($sucesso, $mensagem, $dados = []) {
    header('Content-Type: application/json; charset=utf-8');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    
    echo json_encode([
        'sucesso' => $sucesso,
        'mensagem' => $mensagem,
        'dados' => $dados,
        'timestamp' => date('Y-m-d H:i:s')
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * Função para validar upload de arquivo
 */
function validarUpload($arquivo) {
    $erros = [];
    
    // Verificar se houve erro no upload
    if ($arquivo['error'] !== UPLOAD_ERR_OK) {
        $erros[] = "Erro no upload do arquivo: " . $arquivo['name'];
        return $erros;
    }
    
    // Verificar tamanho do arquivo
    if ($arquivo['size'] > MAX_FILE_SIZE) {
        $erros[] = "Arquivo muito grande: " . $arquivo['name'] . " (máx. 10MB)";
    }
    
    // Verificar tipo de arquivo
    $tiposPermitidos = [
        'image/jpeg', 'image/png', 'image/gif',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
    ];
    
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $tipoArquivo = finfo_file($finfo, $arquivo['tmp_name']);
    finfo_close($finfo);
    
    if (!in_array($tipoArquivo, $tiposPermitidos)) {
        $erros[] = "Tipo de arquivo não permitido: " . $arquivo['name'];
    }
    
    return $erros;
}

/**
 * Função para criar diretório de upload se não existir
 */
function criarDiretorioUpload() {
    $uploadDir = __DIR__ . '/' . UPLOAD_DIR;
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }
    return $uploadDir;
}
?>

