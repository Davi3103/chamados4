# Guia de Instalação - Sistema de Chamados

Este guia fornece instruções detalhadas para instalar e configurar o Sistema de Abertura de Chamados em diferentes ambientes.

## 📋 Requisitos do Sistema

### Requisitos Mínimos

- **PHP**: 8.1 ou superior
- **MySQL**: 8.0 ou superior (ou MariaDB 10.6+)
- **Servidor Web**: Apache 2.4+ ou Nginx 1.18+
- **Memória RAM**: 512MB mínimo (1GB recomendado)
- **Espaço em Disco**: 100MB para aplicação + espaço para uploads

### Extensões PHP Necessárias

```bash
# Verificar extensões instaladas
php -m | grep -E "(pdo|mysql|json|mbstring|fileinfo|gd)"
```

Extensões obrigatórias:
- `pdo`
- `pdo_mysql`
- `json`
- `mbstring`
- `fileinfo`
- `gd` (opcional, para manipulação de imagens)

## 🐧 Instalação no Ubuntu/Debian

### 1. Atualizar o Sistema

```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Instalar PHP e Extensões

```bash
# PHP 8.1
sudo apt install php8.1 php8.1-cli php8.1-mysql php8.1-json php8.1-mbstring php8.1-gd php8.1-curl -y

# Verificar instalação
php --version
```

### 3. Instalar MySQL

```bash
# Instalar MySQL Server
sudo apt install mysql-server -y

# Configurar MySQL (opcional, mas recomendado)
sudo mysql_secure_installation
```

### 4. Instalar Servidor Web (Apache)

```bash
# Instalar Apache
sudo apt install apache2 -y

# Habilitar módulo PHP
sudo a2enmod php8.1

# Reiniciar Apache
sudo systemctl restart apache2
```

### 5. Configurar o Projeto

```bash
# Navegar para o diretório web
cd /var/www/html

# Clonar ou copiar o projeto
sudo git clone [URL_DO_REPOSITORIO] sistema-chamados
# ou
sudo cp -r /caminho/para/sistema-chamados .

# Configurar permissões
sudo chown -R www-data:www-data sistema-chamados/
sudo chmod -R 755 sistema-chamados/
sudo chmod -R 777 sistema-chamados/uploads/
```

## 🔴 Instalação no CentOS/RHEL

### 1. Instalar Repositórios

```bash
# EPEL Repository
sudo yum install epel-release -y

# Remi Repository para PHP 8.1
sudo yum install https://rpms.remirepo.net/enterprise/remi-release-8.rpm -y
sudo yum module enable php:remi-8.1 -y
```

### 2. Instalar PHP e Extensões

```bash
sudo yum install php php-cli php-mysqlnd php-json php-mbstring php-gd php-curl -y
```

### 3. Instalar MySQL

```bash
sudo yum install mysql-server -y
sudo systemctl start mysqld
sudo systemctl enable mysqld
```

### 4. Configurar Firewall

```bash
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

## 🪟 Instalação no Windows

### 1. Instalar XAMPP

1. Baixe o XAMPP do site oficial: https://www.apachefriends.org/
2. Execute o instalador como administrador
3. Selecione Apache, MySQL e PHP
4. Instale no diretório padrão (C:\xampp)

### 2. Configurar o Projeto

```cmd
# Copiar projeto para htdocs
copy sistema-chamados C:\xampp\htdocs\

# Ou usar o explorador de arquivos
```

### 3. Iniciar Serviços

1. Abra o XAMPP Control Panel
2. Inicie Apache e MySQL
3. Verifique se os serviços estão rodando (luz verde)

## 🗄️ Configuração do Banco de Dados

### 1. Criar Banco de Dados

```sql
# Conectar ao MySQL
mysql -u root -p

# Criar banco
CREATE DATABASE sistema_chamados CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Criar usuário (opcional, mas recomendado)
CREATE USER 'chamados_user'@'localhost' IDENTIFIED BY 'senha_segura';
GRANT ALL PRIVILEGES ON sistema_chamados.* TO 'chamados_user'@'localhost';
FLUSH PRIVILEGES;

# Sair
EXIT;
```

### 2. Importar Estrutura

```bash
# Importar o arquivo SQL
mysql -u root -p sistema_chamados < sql/database.sql

# Ou se criou usuário específico
mysql -u chamados_user -p sistema_chamados < sql/database.sql
```

### 3. Verificar Importação

```sql
mysql -u root -p sistema_chamados

# Listar tabelas
SHOW TABLES;

# Verificar dados iniciais
SELECT * FROM categorias;
SELECT * FROM status_chamados;
```

## ⚙️ Configuração da Aplicação

### 1. Configurar Conexão com Banco

Edite o arquivo `php/config.php`:

```php
<?php
// Configurações do Banco de Dados
define('DB_HOST', 'localhost');
define('DB_NAME', 'sistema_chamados');
define('DB_USER', 'chamados_user');  // ou 'root'
define('DB_PASS', 'senha_segura');   // sua senha
define('DB_CHARSET', 'utf8mb4');
?>
```

### 2. Configurar Diretórios

```bash
# Criar diretório de uploads se não existir
mkdir -p uploads/
chmod 777 uploads/

# Verificar permissões
ls -la uploads/
```

### 3. Testar Conexão

Crie um arquivo `test_connection.php`:

```php
<?php
require_once 'php/config.php';

try {
    $pdo = conectarBanco();
    if ($pdo) {
        echo "✅ Conexão com banco de dados: OK\n";
        
        // Testar consulta
        $stmt = $pdo->query("SELECT COUNT(*) as total FROM categorias");
        $result = $stmt->fetch();
        echo "✅ Categorias encontradas: " . $result['total'] . "\n";
    }
} catch (Exception $e) {
    echo "❌ Erro: " . $e->getMessage() . "\n";
}
?>
```

Execute:
```bash
php test_connection.php
```

## 🌐 Configuração do Servidor Web

### Apache Virtual Host

Crie `/etc/apache2/sites-available/sistema-chamados.conf`:

```apache
<VirtualHost *:80>
    ServerName sistema-chamados.local
    DocumentRoot /var/www/html/sistema-chamados
    
    <Directory /var/www/html/sistema-chamados>
        AllowOverride All
        Require all granted
    </Directory>
    
    ErrorLog ${APACHE_LOG_DIR}/sistema-chamados_error.log
    CustomLog ${APACHE_LOG_DIR}/sistema-chamados_access.log combined
</VirtualHost>
```

Ativar o site:
```bash
sudo a2ensite sistema-chamados.conf
sudo systemctl reload apache2
```

### Nginx Configuration

Crie `/etc/nginx/sites-available/sistema-chamados`:

```nginx
server {
    listen 80;
    server_name sistema-chamados.local;
    root /var/www/html/sistema-chamados;
    index index.html index.php;

    location / {
        try_files $uri $uri/ =404;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
    }

    location ~ /\.ht {
        deny all;
    }
}
```

Ativar:
```bash
sudo ln -s /etc/nginx/sites-available/sistema-chamados /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🔧 Configurações Avançadas

### PHP Configuration

Edite `/etc/php/8.1/apache2/php.ini` (ou equivalente):

```ini
# Aumentar limites para upload
upload_max_filesize = 10M
post_max_size = 12M
max_file_uploads = 20

# Configurar timezone
date.timezone = America/Sao_Paulo

# Habilitar logs de erro
log_errors = On
error_log = /var/log/php_errors.log

# Configurações de sessão
session.gc_maxlifetime = 3600
session.cookie_httponly = 1
```

### MySQL Optimization

Edite `/etc/mysql/mysql.conf.d/mysqld.cnf`:

```ini
[mysqld]
# Configurações básicas
innodb_buffer_pool_size = 256M
max_connections = 100
query_cache_size = 32M
query_cache_type = 1

# Configurações de charset
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci
```

## 🧪 Testes de Instalação

### 1. Teste Básico

Acesse: `http://localhost/sistema-chamados/`

Deve aparecer a página principal com o formulário.

### 2. Teste de Funcionalidade

1. Preencha o formulário com dados de teste
2. Clique em "Abrir Chamado"
3. Verifique se aparece mensagem de sucesso ou erro

### 3. Teste de Upload

1. Tente anexar um arquivo pequeno (imagem ou PDF)
2. Verifique se o arquivo é aceito
3. Confirme se o arquivo foi salvo em `uploads/`

### 4. Teste de API

```bash
# Testar endpoint de estatísticas
curl -X GET "http://localhost/sistema-chamados/php/consultar_chamados.php?acao=estatisticas"
```

## 🚨 Solução de Problemas Comuns

### Erro 500 - Internal Server Error

1. Verificar logs do Apache/Nginx:
   ```bash
   sudo tail -f /var/log/apache2/error.log
   ```

2. Verificar logs do PHP:
   ```bash
   sudo tail -f /var/log/php_errors.log
   ```

3. Verificar permissões:
   ```bash
   ls -la sistema-chamados/
   ```

### Erro de Conexão com Banco

1. Verificar se MySQL está rodando:
   ```bash
   sudo systemctl status mysql
   ```

2. Testar conexão manual:
   ```bash
   mysql -u root -p -h localhost
   ```

3. Verificar credenciais em `config.php`

### Problemas com Upload

1. Verificar permissões da pasta uploads:
   ```bash
   chmod 777 uploads/
   ```

2. Verificar configurações PHP:
   ```bash
   php -i | grep upload
   ```

### Página em Branco

1. Habilitar exibição de erros temporariamente:
   ```php
   ini_set('display_errors', 1);
   error_reporting(E_ALL);
   ```

2. Verificar se todos os arquivos foram copiados corretamente

## 🔒 Configurações de Segurança

### 1. Configurar HTTPS (Recomendado)

```bash
# Instalar Certbot (Let's Encrypt)
sudo apt install certbot python3-certbot-apache -y

# Obter certificado
sudo certbot --apache -d sistema-chamados.local
```

### 2. Configurar Firewall

```bash
# UFW (Ubuntu)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# Firewalld (CentOS)
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### 3. Hardening do MySQL

```sql
# Remover usuários anônimos
DELETE FROM mysql.user WHERE User='';

# Remover banco de teste
DROP DATABASE IF EXISTS test;

# Atualizar privilégios
FLUSH PRIVILEGES;
```

## 📊 Monitoramento

### Logs Importantes

- Apache: `/var/log/apache2/access.log` e `/var/log/apache2/error.log`
- PHP: `/var/log/php_errors.log`
- MySQL: `/var/log/mysql/error.log`
- Sistema: `/var/log/syslog`

### Comandos Úteis

```bash
# Verificar status dos serviços
sudo systemctl status apache2 mysql

# Monitorar logs em tempo real
sudo tail -f /var/log/apache2/error.log

# Verificar uso de disco
df -h

# Verificar processos PHP
ps aux | grep php
```

## 🔄 Backup e Manutenção

### Backup do Banco

```bash
# Backup completo
mysqldump -u root -p sistema_chamados > backup_$(date +%Y%m%d).sql

# Backup apenas estrutura
mysqldump -u root -p --no-data sistema_chamados > estrutura_$(date +%Y%m%d).sql
```

### Backup dos Arquivos

```bash
# Backup da aplicação
tar -czf sistema_chamados_backup_$(date +%Y%m%d).tar.gz sistema-chamados/

# Backup apenas uploads
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz sistema-chamados/uploads/
```

---

**Para suporte adicional, consulte o README.md principal ou abra uma issue no repositório.**

