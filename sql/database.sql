-- Script de criação do banco de dados para Sistema de Chamados
-- Inspirado no sistema Milvus

-- Criar banco de dados
CREATE DATABASE IF NOT EXISTS sistema_chamados 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE sistema_chamados;

-- Tabela de usuários/solicitantes
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    telefone VARCHAR(20),
    empresa VARCHAR(255),
    cpf VARCHAR(14),
    cnpj VARCHAR(18),
    ativo BOOLEAN DEFAULT TRUE,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_cpf (cpf),
    INDEX idx_cnpj (cnpj)
);

-- Tabela de categorias de chamados
CREATE TABLE IF NOT EXISTS categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    cor VARCHAR(7) DEFAULT '#007bff',
    ativo BOOLEAN DEFAULT TRUE,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir categorias padrão
INSERT INTO categorias (nome, descricao, cor) VALUES
('Hardware', 'Problemas relacionados a equipamentos físicos', '#dc3545'),
('Software', 'Problemas com aplicativos e sistemas', '#28a745'),
('Rede/Conectividade', 'Problemas de conexão e rede', '#ffc107'),
('E-mail', 'Problemas relacionados a e-mail', '#17a2b8'),
('Impressora', 'Problemas com impressoras e periféricos', '#6f42c1'),
('Acesso/Permissões', 'Problemas de acesso e permissões', '#fd7e14'),
('Backup/Recuperação', 'Problemas com backup e recuperação de dados', '#20c997'),
('Outros', 'Outros tipos de solicitações', '#6c757d');

-- Tabela de status de chamados
CREATE TABLE IF NOT EXISTS status_chamados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    descricao VARCHAR(255),
    cor VARCHAR(7) DEFAULT '#007bff',
    ordem INT DEFAULT 0,
    ativo BOOLEAN DEFAULT TRUE
);

-- Inserir status padrão
INSERT INTO status_chamados (nome, descricao, cor, ordem) VALUES
('Aberto', 'Chamado recém criado, aguardando atendimento', '#007bff', 1),
('Em Andamento', 'Chamado sendo atendido pela equipe técnica', '#ffc107', 2),
('Aguardando Cliente', 'Aguardando resposta ou ação do cliente', '#17a2b8', 3),
('Resolvido', 'Chamado resolvido com sucesso', '#28a745', 4),
('Fechado', 'Chamado finalizado e fechado', '#6c757d', 5),
('Cancelado', 'Chamado cancelado', '#dc3545', 6);

-- Tabela principal de chamados
CREATE TABLE IF NOT EXISTS chamados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero_chamado VARCHAR(20) NOT NULL UNIQUE,
    usuario_id INT,
    categoria_id INT NOT NULL,
    status_id INT DEFAULT 1,
    
    -- Informações básicas
    assunto VARCHAR(255) NOT NULL,
    descricao TEXT NOT NULL,
    prioridade ENUM('baixa', 'media', 'alta', 'critica') DEFAULT 'media',
    urgencia ENUM('baixa', 'media', 'alta') DEFAULT 'media',
    impacto ENUM('baixo', 'medio', 'alto', 'critico') DEFAULT 'medio',
    
    -- Informações técnicas
    terminal VARCHAR(255),
    localizacao VARCHAR(255),
    url_relacionada VARCHAR(500),
    data_ocorrencia DATE,
    hora_ocorrencia TIME,
    
    -- Informações adicionais
    observacoes TEXT,
    
    -- Controle de tempo
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    data_resolucao TIMESTAMP NULL,
    data_fechamento TIMESTAMP NULL,
    
    -- Relacionamentos
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id),
    FOREIGN KEY (status_id) REFERENCES status_chamados(id),
    
    -- Índices
    INDEX idx_numero_chamado (numero_chamado),
    INDEX idx_status (status_id),
    INDEX idx_categoria (categoria_id),
    INDEX idx_prioridade (prioridade),
    INDEX idx_data_criacao (data_criacao),
    INDEX idx_usuario (usuario_id)
);

-- Tabela de anexos
CREATE TABLE IF NOT EXISTS anexos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    chamado_id INT NOT NULL,
    nome_original VARCHAR(255) NOT NULL,
    nome_arquivo VARCHAR(255) NOT NULL,
    tipo_arquivo VARCHAR(100),
    tamanho_arquivo INT,
    caminho_arquivo VARCHAR(500) NOT NULL,
    data_upload TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (chamado_id) REFERENCES chamados(id) ON DELETE CASCADE,
    INDEX idx_chamado (chamado_id)
);

-- Tabela de histórico/comentários
CREATE TABLE IF NOT EXISTS historico_chamados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    chamado_id INT NOT NULL,
    usuario_id INT,
    tipo ENUM('comentario', 'status', 'atribuicao', 'sistema') DEFAULT 'comentario',
    titulo VARCHAR(255),
    descricao TEXT NOT NULL,
    status_anterior_id INT,
    status_novo_id INT,
    publico BOOLEAN DEFAULT TRUE,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (chamado_id) REFERENCES chamados(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (status_anterior_id) REFERENCES status_chamados(id),
    FOREIGN KEY (status_novo_id) REFERENCES status_chamados(id),
    
    INDEX idx_chamado (chamado_id),
    INDEX idx_data (data_criacao)
);

-- Tabela de logs do sistema
CREATE TABLE IF NOT EXISTS logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    acao VARCHAR(100) NOT NULL,
    detalhes TEXT,
    usuario_id INT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_acao (acao),
    INDEX idx_data (data_criacao),
    INDEX idx_usuario (usuario_id)
);

-- Tabela de configurações do sistema
CREATE TABLE IF NOT EXISTS configuracoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    chave VARCHAR(100) NOT NULL UNIQUE,
    valor TEXT,
    descricao VARCHAR(255),
    tipo ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Inserir configurações padrão
INSERT INTO configuracoes (chave, valor, descricao, tipo) VALUES
('sistema_nome', 'Sistema de Chamados - Milvus', 'Nome do sistema', 'string'),
('email_notificacoes', 'true', 'Enviar notificações por e-mail', 'boolean'),
('auto_atribuicao', 'false', 'Atribuição automática de chamados', 'boolean'),
('tempo_resposta_padrao', '24', 'Tempo padrão de resposta em horas', 'number'),
('chamados_por_pagina', '20', 'Número de chamados por página', 'number');

-- View para relatórios de chamados
CREATE VIEW vw_chamados_completo AS
SELECT 
    c.id,
    c.numero_chamado,
    c.assunto,
    c.descricao,
    c.prioridade,
    c.urgencia,
    c.impacto,
    c.terminal,
    c.localizacao,
    c.data_criacao,
    c.data_atualizacao,
    c.data_resolucao,
    c.data_fechamento,
    u.nome as solicitante_nome,
    u.email as solicitante_email,
    u.empresa as solicitante_empresa,
    cat.nome as categoria_nome,
    cat.cor as categoria_cor,
    st.nome as status_nome,
    st.cor as status_cor,
    TIMESTAMPDIFF(HOUR, c.data_criacao, COALESCE(c.data_resolucao, NOW())) as tempo_resolucao_horas,
    (SELECT COUNT(*) FROM anexos a WHERE a.chamado_id = c.id) as total_anexos,
    (SELECT COUNT(*) FROM historico_chamados h WHERE h.chamado_id = c.id) as total_interacoes
FROM chamados c
LEFT JOIN usuarios u ON c.usuario_id = u.id
LEFT JOIN categorias cat ON c.categoria_id = cat.id
LEFT JOIN status_chamados st ON c.status_id = st.id;

-- Trigger para criar histórico quando status muda
DELIMITER //
CREATE TRIGGER tr_chamado_status_change 
AFTER UPDATE ON chamados
FOR EACH ROW
BEGIN
    IF OLD.status_id != NEW.status_id THEN
        INSERT INTO historico_chamados (
            chamado_id, 
            tipo, 
            titulo, 
            descricao, 
            status_anterior_id, 
            status_novo_id
        ) VALUES (
            NEW.id,
            'status',
            'Status alterado',
            CONCAT('Status alterado de ', 
                   (SELECT nome FROM status_chamados WHERE id = OLD.status_id),
                   ' para ',
                   (SELECT nome FROM status_chamados WHERE id = NEW.status_id)
            ),
            OLD.status_id,
            NEW.status_id
        );
    END IF;
END//
DELIMITER ;

-- Procedure para estatísticas
DELIMITER //
CREATE PROCEDURE sp_estatisticas_chamados()
BEGIN
    SELECT 
        (SELECT COUNT(*) FROM chamados WHERE status_id = 1) as abertos,
        (SELECT COUNT(*) FROM chamados WHERE status_id = 2) as em_andamento,
        (SELECT COUNT(*) FROM chamados WHERE status_id IN (4,5)) as resolvidos,
        (SELECT COUNT(*) FROM chamados WHERE DATE(data_criacao) = CURDATE()) as hoje,
        (SELECT COUNT(*) FROM chamados WHERE WEEK(data_criacao) = WEEK(NOW())) as esta_semana,
        (SELECT COUNT(*) FROM chamados WHERE MONTH(data_criacao) = MONTH(NOW())) as este_mes,
        (SELECT AVG(TIMESTAMPDIFF(HOUR, data_criacao, data_resolucao)) 
         FROM chamados WHERE data_resolucao IS NOT NULL) as tempo_medio_resolucao;
END//
DELIMITER ;

-- Inserir dados de exemplo para teste
INSERT INTO usuarios (nome, email, telefone, empresa) VALUES
('João Silva', 'joao.silva@empresa.com', '(11) 99999-9999', 'Empresa ABC'),
('Maria Santos', 'maria.santos@empresa.com', '(11) 88888-8888', 'Empresa XYZ'),
('Pedro Oliveira', 'pedro.oliveira@empresa.com', '(11) 77777-7777', 'Empresa ABC');

-- Comentários para documentação
-- Esta estrutura de banco de dados foi criada para suportar um sistema completo de chamados
-- similar ao Milvus, incluindo:
-- - Gestão de usuários e solicitantes
-- - Categorização de chamados
-- - Controle de status e workflow
-- - Anexos e evidências
-- - Histórico completo de interações
-- - Logs de auditoria
-- - Configurações flexíveis
-- - Views e procedures para relatórios
-- - Triggers para automação

