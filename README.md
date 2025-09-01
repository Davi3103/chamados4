# Sistema de Abertura de Chamados 
Um sistema completo de abertura e gestão de chamados desenvolvido em HTML, CSS, JavaScript e PHP, inspirado na plataforma Milvus. Este sistema oferece uma interface moderna e intuitiva para abertura de chamados de suporte técnico com todos os campos essenciais para um atendimento eficiente.

## 🚀 Características Principais

- **Interface Moderna**: Design responsivo e intuitivo inspirado no Milvus
- **Formulário Completo**: Todos os campos necessários para abertura de chamados
- **Validação em Tempo Real**: Validação JavaScript para melhor experiência do usuário
- **Upload de Arquivos**: Suporte para anexar evidências (screenshots, documentos)
- **Máscaras de Entrada**: Formatação automática para telefone, CPF e CNPJ
- **Painel de Status**: Visualização em tempo real das estatísticas de chamados
- **Backend Robusto**: API PHP completa para processamento e armazenamento
- **Banco de Dados Estruturado**: Schema completo com relacionamentos e triggers
- **Responsivo**: Funciona perfeitamente em desktop e dispositivos móveis

## 📋 Campos do Formulário

### Informações do Solicitante
- Nome Completo (obrigatório)
- E-mail (obrigatório)
- Telefone
- Empresa/Departamento
- CPF
- CNPJ

### Informações do Chamado
- Assunto (obrigatório)
- Categoria (obrigatório): Hardware, Software, Rede, E-mail, Impressora, Acesso, Backup, Outros
- Prioridade (obrigatório): Baixa, Média, Alta, Crítica
- Urgência: Baixa, Média, Alta
- Terminal/Equipamento
- Localização
- Descrição Detalhada (obrigatório)
- Data da Ocorrência
- Hora da Ocorrência

### Anexos e Informações Adicionais
- Upload de Evidências (Screenshots, fotos, documentos)
- URL Relacionada
- Impacto no Negócio: Baixo, Médio, Alto, Crítico
- Observações Adicionais

## 🛠️ Tecnologias Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: PHP 8.1+
- **Banco de Dados**: MySQL 8.0+
- **Estilização**: CSS Grid, Flexbox, Animações CSS
- **Ícones**: Font Awesome 6.0
- **Responsividade**: Mobile-first design

## 📁 Estrutura do Projeto

```
sistema-chamados/
├── index.html              # Página principal com formulário
├── css/
│   └── style.css           # Estilos CSS responsivos
├── js/
│   └── script.js           # JavaScript para interatividade
├── php/
│   ├── config.php          # Configurações do sistema
│   ├── processar_chamado.php # Processamento de chamados
│   └── consultar_chamados.php # API para consultas
├── sql/
│   └── database.sql        # Script de criação do banco
├── uploads/                # Diretório para arquivos anexados
├── assets/                 # Recursos adicionais
└── README.md              # Documentação do projeto
```

## ⚙️ Instalação e Configuração

### Pré-requisitos

- PHP 8.1 ou superior
- MySQL 8.0 ou superior
- Servidor web (Apache/Nginx) ou PHP built-in server
- Extensões PHP: PDO, PDO_MySQL, JSON, MBString, FileInfo

### Passo a Passo

1. **Clone ou baixe o projeto**
   ```bash
   git clone [URL_DO_REPOSITORIO]
   cd sistema-chamados
   ```

2. **Configure o banco de dados**
   - Crie um banco de dados MySQL
   - Execute o script `sql/database.sql` para criar as tabelas
   ```sql
   mysql -u root -p < sql/database.sql
   ```

3. **Configure as credenciais**
   - Edite o arquivo `php/config.php`
   - Atualize as constantes de conexão com o banco:
   ```php
   define('DB_HOST', 'localhost');
   define('DB_NAME', 'sistema_chamados');
   define('DB_USER', 'seu_usuario');
   define('DB_PASS', 'sua_senha');
   ```

4. **Configure permissões**
   ```bash
   chmod 755 uploads/
   chmod 644 php/*.php
   ```

5. **Inicie o servidor**
   
   **Opção 1: PHP Built-in Server (desenvolvimento)**
   ```bash
   php -S localhost:8080
   ```
   
   **Opção 2: Apache/Nginx**
   - Configure um virtual host apontando para o diretório do projeto
   - Certifique-se de que o módulo PHP está habilitado

6. **Acesse o sistema**
   - Abra o navegador e acesse: `http://localhost:8080`
   - O sistema estará pronto para uso!

## 🎯 Como Usar

### Abrindo um Chamado

1. Acesse a página principal do sistema
2. Preencha os campos obrigatórios:
   - Nome Completo
   - E-mail
   - Assunto
   - Categoria
   - Prioridade
   - Descrição Detalhada
3. Preencha os campos opcionais conforme necessário
4. Anexe evidências se houver (opcional)
5. Clique em "Abrir Chamado"
6. Anote o número do chamado gerado para acompanhamento

### Consultando Chamados

- Use os botões "Consultar Chamados" ou "Acompanhar Chamado" no painel lateral
- Informe o número do chamado para buscar informações específicas

## 🗃️ Estrutura do Banco de Dados

### Tabelas Principais

- **usuarios**: Informações dos solicitantes
- **chamados**: Dados principais dos chamados
- **categorias**: Categorias de chamados
- **status_chamados**: Status possíveis dos chamados
- **anexos**: Arquivos anexados aos chamados
- **historico_chamados**: Histórico de interações
- **logs**: Logs de auditoria do sistema

### Relacionamentos

- Chamados pertencem a usuários (1:N)
- Chamados têm uma categoria (N:1)
- Chamados têm um status (N:1)
- Chamados podem ter múltiplos anexos (1:N)
- Chamados têm histórico de interações (1:N)

## 🔧 Personalização

### Modificando Categorias

Edite a tabela `categorias` no banco de dados ou modifique o array no arquivo `index.html`:

```html
<option value="nova_categoria">Nova Categoria</option>
```

### Alterando Cores e Estilos

Modifique as variáveis CSS no arquivo `css/style.css`:

```css
:root {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  --success-color: #28a745;
  --danger-color: #dc3545;
}
```

### Configurando E-mail

Para habilitar notificações por e-mail, configure as constantes SMTP no `php/config.php`:

```php
define('SMTP_HOST', 'smtp.gmail.com');
define('SMTP_PORT', 587);
define('SMTP_USER', 'seu_email@gmail.com');
define('SMTP_PASS', 'sua_senha_app');
```

## 🔒 Segurança

O sistema implementa várias medidas de segurança:

- **Sanitização de Dados**: Todos os inputs são sanitizados
- **Validação Server-side**: Validação dupla (client + server)
- **Prepared Statements**: Proteção contra SQL Injection
- **Upload Seguro**: Validação de tipos e tamanhos de arquivo
- **Logs de Auditoria**: Registro de todas as ações importantes
- **Headers CORS**: Configuração adequada para APIs

## 📱 Responsividade

O sistema é totalmente responsivo e funciona em:

- **Desktop**: Telas grandes (1200px+)
- **Tablet**: Telas médias (768px - 1199px)
- **Mobile**: Telas pequenas (até 767px)

### Breakpoints CSS

```css
/* Mobile First */
@media (max-width: 768px) { /* Tablets e menores */ }
@media (max-width: 480px) { /* Smartphones */ }
```

## 🚀 Funcionalidades Avançadas

### API Endpoints

- `POST /php/processar_chamado.php` - Criar novo chamado
- `GET /php/consultar_chamados.php?acao=estatisticas` - Obter estatísticas
- `GET /php/consultar_chamados.php?acao=listar` - Listar chamados
- `GET /php/consultar_chamados.php?acao=buscar&numero=CH123` - Buscar chamado específico

### Validações JavaScript

- Validação em tempo real dos campos obrigatórios
- Máscaras automáticas para telefone, CPF e CNPJ
- Validação de formato de e-mail
- Validação de tamanho e tipo de arquivos

### Recursos do Backend

- Geração automática de números de chamado únicos
- Processamento seguro de uploads
- Sistema de logs completo
- Triggers automáticos para histórico
- Procedures para relatórios

## 🐛 Solução de Problemas

### Erro de Conexão com Banco

1. Verifique as credenciais em `php/config.php`
2. Certifique-se de que o MySQL está rodando
3. Verifique se o banco de dados foi criado

### Problemas com Upload

1. Verifique permissões da pasta `uploads/`
2. Confirme se as extensões PHP estão habilitadas
3. Verifique limites de upload no `php.ini`

### Problemas de CSS/JS

1. Verifique se os arquivos estão sendo carregados corretamente
2. Limpe o cache do navegador
3. Verifique o console do navegador para erros

## 📈 Melhorias Futuras

- [ ] Sistema de autenticação para técnicos
- [ ] Dashboard administrativo
- [ ] Notificações por e-mail automáticas
- [ ] Sistema de comentários nos chamados
- [ ] Relatórios avançados com gráficos
- [ ] API REST completa
- [ ] Integração com sistemas externos
- [ ] App mobile nativo

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👥 Autores

- **Desenvolvedor Principal** - Sistema inspirado na plataforma Milvus
- **Design** - Interface baseada nas melhores práticas de UX/UI

## 🙏 Agradecimentos

- Inspirado na plataforma Milvus de gestão de chamados
- Font Awesome pelos ícones
- Comunidade PHP e JavaScript pelas bibliotecas e recursos

## 📞 Suporte

Para suporte e dúvidas:

- Abra uma issue no GitHub
- Consulte a documentação completa
- Verifique os logs do sistema em caso de erros

---

**Desenvolvido com ❤️ para facilitar a gestão de chamados de suporte técnico**

