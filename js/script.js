// Variáveis globais
let arquivosSelecionados = [];

// Inicialização quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    inicializarFormulario();
    carregarEstatisticas();
    aplicarMascaras();
});

// Inicializar funcionalidades do formulário
function inicializarFormulario() {
    const form = document.getElementById('chamadoForm');
    const fileInput = document.getElementById('anexos');
    const fileUploadArea = document.getElementById('fileUploadArea');
    
    // Configurar upload de arquivos
    configurarUploadArquivos(fileInput, fileUploadArea);
    
    // Configurar validação em tempo real
    configurarValidacaoTempoReal();
    
    // Configurar submissão do formulário
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        if (validarFormulario()) {
            enviarFormulario();
        }
    });
    
    // Configurar data padrão para hoje
    const dataOcorrencia = document.getElementById('data_ocorrencia');
    if (dataOcorrencia) {
        dataOcorrencia.value = new Date().toISOString().split('T')[0];
    }
}

// Configurar upload de arquivos
function configurarUploadArquivos(fileInput, uploadArea) {
    // Drag and drop
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        uploadArea.style.borderColor = '#667eea';
        uploadArea.style.background = '#f7fafc';
    });
    
    uploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        uploadArea.style.borderColor = '#cbd5e0';
        uploadArea.style.background = 'white';
    });
    
    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        uploadArea.style.borderColor = '#cbd5e0';
        uploadArea.style.background = 'white';
        
        const files = e.dataTransfer.files;
        adicionarArquivos(files);
    });
    
    // Click para selecionar arquivos
    fileInput.addEventListener('change', function(e) {
        adicionarArquivos(e.target.files);
    });
}

// Adicionar arquivos à lista
function adicionarArquivos(files) {
    const fileList = document.getElementById('fileList');
    
    Array.from(files).forEach(file => {
        // Validar tamanho do arquivo (10MB)
        if (file.size > 10 * 1024 * 1024) {
            mostrarNotificacao('Arquivo muito grande: ' + file.name + '. Máximo 10MB.', 'error');
            return;
        }
        
        // Validar tipo de arquivo
        const tiposPermitidos = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 
                               'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                               'text/plain'];
        
        if (!tiposPermitidos.includes(file.type)) {
            mostrarNotificacao('Tipo de arquivo não permitido: ' + file.name, 'error');
            return;
        }
        
        arquivosSelecionados.push(file);
        
        // Criar elemento visual do arquivo
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.innerHTML = `
            <span><i class="fas fa-file"></i> ${file.name} (${formatarTamanhoArquivo(file.size)})</span>
            <button type="button" onclick="removerArquivo('${file.name}')">
                <i class="fas fa-times"></i> Remover
            </button>
        `;
        
        fileList.appendChild(fileItem);
    });
}

// Remover arquivo da lista
function removerArquivo(nomeArquivo) {
    arquivosSelecionados = arquivosSelecionados.filter(file => file.name !== nomeArquivo);
    
    const fileList = document.getElementById('fileList');
    const fileItems = fileList.querySelectorAll('.file-item');
    
    fileItems.forEach(item => {
        if (item.textContent.includes(nomeArquivo)) {
            item.remove();
        }
    });
}

// Formatar tamanho do arquivo
function formatarTamanhoArquivo(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Aplicar máscaras nos campos
function aplicarMascaras() {
    // Máscara para telefone
    const telefone = document.getElementById('telefone');
    if (telefone) {
        telefone.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length <= 11) {
                value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
                if (value.length < 14) {
                    value = value.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
                }
            }
            e.target.value = value;
        });
    }
    
    // Máscara para CPF
    const cpf = document.getElementById('cpf');
    if (cpf) {
        cpf.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
            e.target.value = value;
        });
    }
    
    // Máscara para CNPJ
    const cnpj = document.getElementById('cnpj');
    if (cnpj) {
        cnpj.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            value = value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
            e.target.value = value;
        });
    }
}

// Configurar validação em tempo real
function configurarValidacaoTempoReal() {
    const campos = ['nome', 'email', 'assunto', 'categoria', 'prioridade', 'descricao'];
    
    campos.forEach(campo => {
        const elemento = document.getElementById(campo);
        if (elemento) {
            elemento.addEventListener('blur', function() {
                validarCampo(campo);
            });
            
            elemento.addEventListener('input', function() {
                removerEstadoValidacao(campo);
            });
        }
    });
}

// Validar campo individual
function validarCampo(nomeCampo) {
    const campo = document.getElementById(nomeCampo);
    const valor = campo.value.trim();
    let valido = true;
    let mensagem = '';
    
    // Remover mensagens anteriores
    removerMensagemValidacao(nomeCampo);
    
    switch (nomeCampo) {
        case 'nome':
            if (!valor) {
                valido = false;
                mensagem = 'Nome é obrigatório';
            } else if (valor.length < 2) {
                valido = false;
                mensagem = 'Nome deve ter pelo menos 2 caracteres';
            }
            break;
            
        case 'email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!valor) {
                valido = false;
                mensagem = 'E-mail é obrigatório';
            } else if (!emailRegex.test(valor)) {
                valido = false;
                mensagem = 'E-mail inválido';
            }
            break;
            
        case 'assunto':
            if (!valor) {
                valido = false;
                mensagem = 'Assunto é obrigatório';
            } else if (valor.length < 5) {
                valido = false;
                mensagem = 'Assunto deve ter pelo menos 5 caracteres';
            }
            break;
            
        case 'categoria':
        case 'prioridade':
            if (!valor) {
                valido = false;
                mensagem = 'Este campo é obrigatório';
            }
            break;
            
        case 'descricao':
            if (!valor) {
                valido = false;
                mensagem = 'Descrição é obrigatória';
            } else if (valor.length < 10) {
                valido = false;
                mensagem = 'Descrição deve ter pelo menos 10 caracteres';
            }
            break;
    }
    
    // Aplicar estado visual
    if (valido) {
        campo.classList.remove('error');
        campo.classList.add('success');
    } else {
        campo.classList.remove('success');
        campo.classList.add('error');
        mostrarMensagemValidacao(nomeCampo, mensagem, 'error');
    }
    
    return valido;
}

// Mostrar mensagem de validação
function mostrarMensagemValidacao(nomeCampo, mensagem, tipo) {
    const campo = document.getElementById(nomeCampo);
    const formGroup = campo.closest('.form-group');
    
    const mensagemElement = document.createElement('div');
    mensagemElement.className = tipo + '-message';
    mensagemElement.innerHTML = `<i class="fas fa-${tipo === 'error' ? 'exclamation-circle' : 'check-circle'}"></i> ${mensagem}`;
    
    formGroup.appendChild(mensagemElement);
}

// Remover mensagem de validação
function removerMensagemValidacao(nomeCampo) {
    const campo = document.getElementById(nomeCampo);
    const formGroup = campo.closest('.form-group');
    const mensagens = formGroup.querySelectorAll('.error-message, .success-message');
    
    mensagens.forEach(msg => msg.remove());
}

// Remover estado de validação
function removerEstadoValidacao(nomeCampo) {
    const campo = document.getElementById(nomeCampo);
    campo.classList.remove('error', 'success');
    removerMensagemValidacao(nomeCampo);
}

// Validar formulário completo
function validarFormulario() {
    const camposObrigatorios = ['nome', 'email', 'assunto', 'categoria', 'prioridade', 'descricao'];
    let formularioValido = true;
    
    camposObrigatorios.forEach(campo => {
        if (!validarCampo(campo)) {
            formularioValido = false;
        }
    });
    
    if (!formularioValido) {
        mostrarNotificacao('Por favor, corrija os erros no formulário antes de enviar.', 'error');
        
        // Rolar para o primeiro campo com erro
        const primeiroErro = document.querySelector('.form-group input.error, .form-group select.error, .form-group textarea.error');
        if (primeiroErro) {
            primeiroErro.scrollIntoView({ behavior: 'smooth', block: 'center' });
            primeiroErro.focus();
        }
    }
    
    return formularioValido;
}

// Enviar formulário
function enviarFormulario() {
    const form = document.getElementById('chamadoForm');
    const submitBtn = form.querySelector('button[type="submit"]');
    
    // Mostrar estado de carregamento
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    
    // Criar FormData para envio
    const formData = new FormData(form);
    
    // Adicionar arquivos selecionados
    arquivosSelecionados.forEach((arquivo, index) => {
        formData.append(`anexos[${index}]`, arquivo);
    });
    
    // Simular envio (substituir pela URL real do PHP)
    fetch('php/processar_chamado.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.sucesso) {
            mostrarModalSucesso(data.numeroChamado);
            limparFormulario();
            atualizarEstatisticas();
        } else {
            mostrarNotificacao(data.mensagem || 'Erro ao processar chamado', 'error');
        }
    })
    .catch(error => {
        console.error('Erro:', error);
        // Para demonstração, simular sucesso
        const numeroChamado = 'CH' + Date.now().toString().slice(-6);
        mostrarModalSucesso(numeroChamado);
        limparFormulario();
        atualizarEstatisticas();
    })
    .finally(() => {
        // Remover estado de carregamento
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
    });
}

// Mostrar modal de sucesso
function mostrarModalSucesso(numeroChamado) {
    const modal = document.getElementById('successModal');
    const numeroElement = document.getElementById('numeroChamado');
    
    numeroElement.textContent = numeroChamado;
    modal.style.display = 'block';
    
    // Fechar modal ao clicar fora
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            fecharModal();
        }
    });
}

// Fechar modal
function fecharModal() {
    const modal = document.getElementById('successModal');
    modal.style.display = 'none';
}

// Limpar formulário
function limparFormulario() {
    const form = document.getElementById('chamadoForm');
    form.reset();
    
    // Limpar arquivos selecionados
    arquivosSelecionados = [];
    document.getElementById('fileList').innerHTML = '';
    
    // Remover estados de validação
    const campos = form.querySelectorAll('input, select, textarea');
    campos.forEach(campo => {
        campo.classList.remove('error', 'success');
    });
    
    // Remover mensagens de validação
    const mensagens = form.querySelectorAll('.error-message, .success-message');
    mensagens.forEach(msg => msg.remove());
    
    // Definir data padrão novamente
    const dataOcorrencia = document.getElementById('data_ocorrencia');
    if (dataOcorrencia) {
        dataOcorrencia.value = new Date().toISOString().split('T')[0];
    }
    
    mostrarNotificacao('Formulário limpo com sucesso!', 'success');
}

// Mostrar notificação
function mostrarNotificacao(mensagem, tipo = 'info') {
    // Remover notificações existentes
    const notificacoesExistentes = document.querySelectorAll('.notificacao');
    notificacoesExistentes.forEach(n => n.remove());
    
    const notificacao = document.createElement('div');
    notificacao.className = `notificacao ${tipo}`;
    notificacao.innerHTML = `
        <i class="fas fa-${tipo === 'success' ? 'check-circle' : tipo === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${mensagem}</span>
        <button onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Adicionar estilos da notificação
    notificacao.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${tipo === 'success' ? '#38a169' : tipo === 'error' ? '#e53e3e' : '#3182ce'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 1001;
        display: flex;
        align-items: center;
        gap: 10px;
        max-width: 400px;
        animation: slideInRight 0.3s ease;
    `;
    
    notificacao.querySelector('button').style.cssText = `
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        padding: 0;
        margin-left: auto;
    `;
    
    document.body.appendChild(notificacao);
    
    // Remover automaticamente após 5 segundos
    setTimeout(() => {
        if (notificacao.parentElement) {
            notificacao.remove();
        }
    }, 5000);
}

// Carregar estatísticas (simulado)
function carregarEstatisticas() {
    // Simular dados de estatísticas
    const stats = {
        abertos: Math.floor(Math.random() * 50) + 10,
        andamento: Math.floor(Math.random() * 30) + 5,
        resolvidos: Math.floor(Math.random() * 100) + 50
    };
    
    document.getElementById('chamadosAbertos').textContent = stats.abertos;
    document.getElementById('chamadosAndamento').textContent = stats.andamento;
    document.getElementById('chamadosResolvidos').textContent = stats.resolvidos;
}

// Atualizar estatísticas
function atualizarEstatisticas() {
    const abertos = document.getElementById('chamadosAbertos');
    const atual = parseInt(abertos.textContent);
    abertos.textContent = atual + 1;
    
    // Animação de destaque
    abertos.parentElement.parentElement.style.transform = 'scale(1.05)';
    setTimeout(() => {
        abertos.parentElement.parentElement.style.transform = 'scale(1)';
    }, 300);
}

// Consultar chamados
function consultarChamados() {
    mostrarNotificacao('Funcionalidade de consulta será implementada em breve!', 'info');
}

// Acompanhar chamado
function acompanharChamado() {
    const numero = prompt('Digite o número do chamado:');
    if (numero) {
        mostrarNotificacao(`Buscando informações do chamado ${numero}...`, 'info');
        // Aqui seria implementada a busca real
    }
}

// Adicionar estilos CSS para animações via JavaScript
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .notificacao {
        animation: slideInRight 0.3s ease;
    }
`;
document.head.appendChild(style);

