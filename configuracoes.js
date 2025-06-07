document.addEventListener('DOMContentLoaded', function() {
    // --- ARMAZENAMENTO DE DADOS (localStorage) ---
    // CORREÇÃO: Garante que os dados sejam lidos do localStorage antes de qualquer outra operação.
    let insumos = [];
    let unidades = [];
    let insumosPorUnidade = {};

    function carregarDados() {
        try {
            insumos = JSON.parse(localStorage.getItem('insumosAdmin')) || [];
            unidades = JSON.parse(localStorage.getItem('unidadesAdmin')) || [];
            insumosPorUnidade = JSON.parse(localStorage.getItem('insumosPorUnidadeAdmin')) || {};
        } catch (error) {
            console.error("Erro ao ler dados do localStorage. Os dados podem estar corrompidos. Resetando para valores padrão.", error);
            // Em caso de erro, começa com arrays vazios para evitar que a aplicação quebre.
            insumos = [];
            unidades = [];
            insumosPorUnidade = {};
        }
    }

    function salvarInsumosAdmin() { localStorage.setItem('insumosAdmin', JSON.stringify(insumos)); }
    function salvarUnidadesAdmin() { localStorage.setItem('unidadesAdmin', JSON.stringify(unidades)); }
    function salvarInsumosPorUnidadeAdmin() { localStorage.setItem('insumosPorUnidadeAdmin', JSON.stringify(insumosPorUnidade)); }

    // --- SELETORES DE ELEMENTOS DO DOM (página de configurações) ---
    const formInsumoConfig = document.getElementById('form-insumo-config');
    const inputNomeInsumoConfig = document.getElementById('nome-insumo-config');
    const selectUnidadeMedidaConfig = document.getElementById('unidade-medida-config');
    const inputValorCompraConfig = document.getElementById('valor-compra-config');
    const selectTipoValorCompraConfig = document.getElementById('tipo-valor-compra-config');
    const divEmbalagemDetailsConfig = document.getElementById('embalagem-details-config');
    const inputItensPorEmbalagemConfig = document.getElementById('itens-por-embalagem-config');
    const inputQtdEstoqueMatrizConfig = document.getElementById('qtd-estoque-matriz-config');
    const inputQtdMinimaInsumoConfig = document.getElementById('qtd-minima-insumo-config');
    const listaUltimosInsumosUIConfig = document.getElementById('lista-ultimos-insumos-config');

    const formUnidadeConfig = document.getElementById('form-unidade-config');
    const inputNomeUnidadeConfig = document.getElementById('nome-unidade-config');
    const inputLoginUnidadeConfig = document.getElementById('login-unidade-config');
    const inputSenhaUnidadeConfig = document.getElementById('senha-unidade-config');
    const selectTipoAcessoConfig = document.getElementById('tipo-acesso-config');
    const listaUnidadesUIConfig = document.getElementById('lista-unidades-config');

    const selectUnidadeConfig = document.getElementById('select-unidade-config');
    const checkboxesInsumosContainerConfig = document.getElementById('checkboxes-insumos-config');
    const btnSalvarAssociacaoConfig = document.getElementById('salvar-insumos-unidade-config');
    
    const notificationModalConfig = document.getElementById('notification-modal-config');
    const modalIconContainerConfig = document.getElementById('modal-icon-container-config');
    const modalTitleTextConfig = document.getElementById('modal-title-text-config');
    const modalMessageTextConfig = document.getElementById('modal-message-text-config');
    const modalCloseButtonConfig = document.getElementById('modal-close-button-config');

    const editUnidadeModalConfig = document.getElementById('edit-unidade-modal-config');
    const formEditUnidadeConfig = document.getElementById('form-edit-unidade-config');
    const editUnidadeOriginalLoginInputConfig = document.getElementById('edit-unidade-original-login-config');
    const editUnidadeNomeInputConfig = document.getElementById('edit-unidade-nome-config');
    const editUnidadeLoginInputConfig = document.getElementById('edit-unidade-login-config');
    const editUnidadeSenhaInputConfig = document.getElementById('edit-unidade-senha-config');
    const editTipoAcessoConfigSelect = document.getElementById('edit-tipo-acesso-config'); 
    const cancelEditUnidadeBtnConfig = document.getElementById('cancel-edit-unidade-btn-config');

    const deleteUnidadeConfirmModalConfig = document.getElementById('delete-unidade-confirm-modal-config');
    const deleteUnidadeNomeConfirmSpanConfig = document.getElementById('delete-unidade-nome-confirm-config');
    const cancelDeleteUnidadeBtnConfig = document.getElementById('cancel-delete-unidade-btn-config');
    const confirmDeleteUnidadeBtnConfig = document.getElementById('confirm-delete-unidade-btn-config');
    let unidadeParaExcluirLoginConfig = null;


    function showConfigNotification(title, message, isSuccess = true) {
        if (!notificationModalConfig) return;
        modalTitleTextConfig.textContent = title;
        modalMessageTextConfig.textContent = message;
        modalIconContainerConfig.innerHTML = `<svg class="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>`;
        modalIconContainerConfig.className = `mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100`;
        notificationModalConfig.classList.remove('hidden', 'opacity-0');
        notificationModalConfig.querySelector('.modal-content').classList.remove('scale-95');
    }
    if (modalCloseButtonConfig) {
        modalCloseButtonConfig.addEventListener('click', () => {
            notificationModalConfig.classList.add('opacity-0');
            notificationModalConfig.querySelector('.modal-content').classList.add('scale-95');
            setTimeout(() => notificationModalConfig.classList.add('hidden'), 250);
        });
    }
    
    function abrirModalEdicaoUnidadeConfig(unidadeLogin) {
        const unidade = unidades.find(u => u.login === unidadeLogin);
        if (unidade && editUnidadeModalConfig) {
            editUnidadeOriginalLoginInputConfig.value = unidade.login; 
            editUnidadeNomeInputConfig.value = unidade.nome; 
            editUnidadeLoginInputConfig.value = unidade.login; 
            editUnidadeSenhaInputConfig.value = ''; 
            editTipoAcessoConfigSelect.value = unidade.tipoAcesso || 'unidade_restrita';
            editUnidadeModalConfig.classList.remove('hidden', 'opacity-0');
            editUnidadeModalConfig.querySelector('.modal-content').classList.remove('scale-95');
        } else { showConfigNotification("Erro", "Unidade/Usuário não encontrado para edição.", false); }
    }
    function fecharModalEdicaoUnidadeConfig() {
        if(editUnidadeModalConfig){
            editUnidadeModalConfig.classList.add('opacity-0');
            editUnidadeModalConfig.querySelector('.modal-content').classList.add('scale-95');
            setTimeout(() => { editUnidadeModalConfig.classList.add('hidden'); formEditUnidadeConfig.reset(); }, 250);
        }
    }
    function abrirModalConfirmacaoExclusaoConfig(unidadeLogin) {
        const unidade = unidades.find(u => u.login === unidadeLogin);
        if (unidade && deleteUnidadeConfirmModalConfig) {
            unidadeParaExcluirLoginConfig = unidade.login; 
            deleteUnidadeNomeConfirmSpanConfig.textContent = unidade.nome; 
            deleteUnidadeConfirmModalConfig.classList.remove('hidden', 'opacity-0');
            deleteUnidadeConfirmModalConfig.querySelector('.modal-content').classList.remove('scale-95');
        } else { showConfigNotification("Erro", "Unidade/Usuário não encontrado para exclusão.", false); }
    }
    function fecharModalConfirmacaoExclusaoConfig() {
        if(deleteUnidadeConfirmModalConfig) {
            deleteUnidadeConfirmModalConfig.classList.add('opacity-0');
            deleteUnidadeConfirmModalConfig.querySelector('.modal-content').classList.add('scale-95');
            setTimeout(() => { deleteUnidadeConfirmModalConfig.classList.add('hidden'); unidadeParaExcluirLoginConfig = null; }, 250);
        }
    }

    // --- FUNÇÕES DE RENDERIZAÇÃO ---
    function renderizarUltimosInsumosConfig() {
        if (!listaUltimosInsumosUIConfig) return;
        listaUltimosInsumosUIConfig.innerHTML = '';
        if (insumos.length === 0) { listaUltimosInsumosUIConfig.innerHTML = '<li class="text-gray-500 italic">Nenhum insumo cadastrado ainda.</li>'; }
        else {
            const ultimos = insumos.slice(-5).reverse(); 
            ultimos.forEach(insumo => {
                const li = document.createElement('li'); li.className = 'p-3 bg-gray-50 rounded-md shadow-sm';
                let valorInfo = `R$ ${parseFloat(insumo.valorCompra || 0).toFixed(2)}`;
                if (insumo.tipoValorCompra !== 'unidade_medida_principal') {
                     valorInfo += ` / ${insumo.tipoValorCompra}`; 
                    if (insumo.itensPorEmbalagem > 0) {
                         valorInfo += ` (cont. ${insumo.itensPorEmbalagem} ${insumo.unidadeMedida}(s))`;
                    }
                } else {
                    valorInfo += ` / ${insumo.unidadeMedida}`; 
                }
                li.innerHTML = `<span class="font-medium text-gray-800">${insumo.nome}</span><span class="block list-item-detail">Un. Medida Principal: ${insumo.unidadeMedida || 'N/A'}</span><span class="block list-item-detail">Valor: ${valorInfo}</span><span class="block list-item-detail">Estoque Matriz: ${insumo.quantidadeEstoqueMatriz} ${insumo.unidadeMedida}(s) | Mínimo: ${insumo.quantidadeMinima} ${insumo.unidadeMedida}(s)</span>`;
                listaUltimosInsumosUIConfig.appendChild(li);
            });
        }
    }

    function renderizarListaUnidadesConfig() {
        if(!listaUnidadesUIConfig || !selectUnidadeConfig) return;
        listaUnidadesUIConfig.innerHTML = '';
        selectUnidadeConfig.innerHTML = '<option value="">-- Nenhuma unidade --</option>'; 
        if (unidades.length === 0) { listaUnidadesUIConfig.innerHTML = '<li class="text-gray-500 italic">Nenhum cadastrado.</li>'; }
        else {
             const unidadesOrdenadas = [...unidades].sort((a, b) => a.nome.localeCompare(b.nome));
            let algumaUnidadeRestrita = false;
            unidadesOrdenadas.forEach(unidade => {
                const li = document.createElement('li'); li.className = 'p-3 bg-gray-50 rounded-md shadow-sm flex justify-between items-center';
                const tipoAcessoTexto = unidade.tipoAcesso === 'admin_gestao' ? 'Admin Gestão' : 'Unidade Restrita';
                li.innerHTML = `<div><span class="font-medium text-gray-800">${unidade.nome}</span><span class="block list-item-detail">Login: ${unidade.login} | Tipo: ${tipoAcessoTexto}</span></div> <div class="space-x-2"> <button data-login="${unidade.login}" class="action-btn edit-btn editar-unidade-btn-config" title="Editar"><i class="fas fa-edit"></i></button> <button data-login="${unidade.login}" class="action-btn delete-btn excluir-unidade-btn-config" title="Excluir"><i class="fas fa-trash-alt"></i></button> </div>`;
                listaUnidadesUIConfig.appendChild(li);
                
                if (unidade.tipoAcesso === 'unidade_restrita') {
                    const option = document.createElement('option'); 
                    option.value = unidade.login; 
                    option.textContent = unidade.nome; 
                    selectUnidadeConfig.appendChild(option);
                    algumaUnidadeRestrita = true;
                }
            });
            if (!algumaUnidadeRestrita && selectUnidadeConfig.options.length === 1) { 
                 selectUnidadeConfig.innerHTML = '<option value="">Nenhuma unidade (tipo restrito) cadastrada</option>';
            }
            document.querySelectorAll('.editar-unidade-btn-config').forEach(btn => btn.addEventListener('click', (e) => abrirModalEdicaoUnidadeConfig(e.currentTarget.dataset.login)));
            document.querySelectorAll('.excluir-unidade-btn-config').forEach(btn => btn.addEventListener('click', (e) => abrirModalConfirmacaoExclusaoConfig(e.currentTarget.dataset.login)));
        }
    }
    
    function renderizarCheckboxesInsumosConfig() {
        if (!checkboxesInsumosContainerConfig || !selectUnidadeConfig) return;
        checkboxesInsumosContainerConfig.innerHTML = '';
        const unidadeLoginSelecionado = selectUnidadeConfig.value; 
        if (!unidadeLoginSelecionado) { checkboxesInsumosContainerConfig.innerHTML = '<p class="text-gray-500 italic text-xs sm:text-sm">Selecione uma unidade.</p>'; return; }
        if (insumos.length === 0) { checkboxesInsumosContainerConfig.innerHTML = '<p class="text-gray-500 italic text-xs sm:text-sm">Nenhum insumo cadastrado.</p>'; return; }
        
        const insumosAssociados = insumosPorUnidade[unidadeLoginSelecionado] || [];
        const insumosOrdenados = [...insumos].sort((a, b) => a.nome.localeCompare(b.nome));
        
        insumosOrdenados.forEach(insumo => {
            const insumoAssociado = insumosAssociados.find(item => item.nome === insumo.nome);
            const isChecked = !!insumoAssociado;
            const minimoUnidade = isChecked ? insumoAssociado.minimo : '';

            const itemDiv = document.createElement('div'); itemDiv.className = 'insumo-item-config';
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox'; checkbox.id = `chk-config-${unidadeLoginSelecionado}-${insumo.nome.replace(/\s+/g, '_')}`;
            checkbox.value = insumo.nome; checkbox.checked = isChecked;
            checkbox.className = 'h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500 checkbox-medlab insumo-checkbox';
            const label = document.createElement('label'); label.htmlFor = checkbox.id; label.className = 'text-sm text-gray-700 cursor-pointer'; label.textContent = insumo.nome;
            const inputMinimo = document.createElement('input');
            inputMinimo.type = 'number'; inputMinimo.min = '0'; inputMinimo.placeholder = "Mín."; inputMinimo.title = `Estoque mínimo para este insumo nesta unidade.`;
            inputMinimo.value = minimoUnidade;
            inputMinimo.className = 'input-minimo-unidade border border-gray-300 rounded-md shadow-sm focus:outline-none input-focus-medlab';
            inputMinimo.disabled = !isChecked; 
            checkbox.addEventListener('change', () => {
                inputMinimo.disabled = !checkbox.checked;
                if (!checkbox.checked) inputMinimo.value = '';
            });
            itemDiv.appendChild(checkbox); itemDiv.appendChild(label); itemDiv.appendChild(inputMinimo);
            checkboxesInsumosContainerConfig.appendChild(itemDiv);
        });
    }

    // --- EVENT LISTENERS ---
    if (selectTipoValorCompraConfig) {
        selectTipoValorCompraConfig.addEventListener('change', function() {
            if (this.value !== 'unidade_medida_principal') {
                divEmbalagemDetailsConfig.classList.remove('hidden');
                inputItensPorEmbalagemConfig.required = true;
            } else {
                divEmbalagemDetailsConfig.classList.add('hidden');
                inputItensPorEmbalagemConfig.required = false;
                inputItensPorEmbalagemConfig.value = '';
            }
        });
    }

    if (formInsumoConfig) { 
        formInsumoConfig.addEventListener('submit', function(event) {
            event.preventDefault();
            const nomeInsumo = inputNomeInsumoConfig.value.trim();
            const unidadeMedida = selectUnidadeMedidaConfig.value; 
            const valorCompra = parseFloat(inputValorCompraConfig.value);
            const tipoValorCompra = selectTipoValorCompraConfig.value; 
            const itensPorEmbalagemInput = inputItensPorEmbalagemConfig.value.trim();
            let itensPorEmbalagem = tipoValorCompra !== 'unidade_medida_principal' ? parseInt(itensPorEmbalagemInput, 10) : 1;
            
            const qtdEstoqueMatriz = parseInt(inputQtdEstoqueMatrizConfig.value, 10);
            const qtdMinima = parseInt(inputQtdMinimaInsumoConfig.value, 10);

            if (!nomeInsumo || !unidadeMedida || isNaN(valorCompra) || valorCompra < 0 || !tipoValorCompra || isNaN(qtdEstoqueMatriz) || qtdEstoqueMatriz < 0 || isNaN(qtdMinima) || qtdMinima < 0) {
                showConfigNotification('Erro!', 'Todos os campos são obrigatórios e valores numéricos devem ser válidos.', false);
                return;
            }
            if (tipoValorCompra !== 'unidade_medida_principal' && (isNaN(itensPorEmbalagem) || itensPorEmbalagem <= 0)) {
                 showConfigNotification('Erro!', 'Se o valor de compra não é pela unidade principal, "Itens por Embalagem" deve ser um número maior que 0.', false);
                 return;
            }
            if (tipoValorCompra === 'unidade_medida_principal') { 
                itensPorEmbalagem = 1;
            }

            if (!insumos.find(ins => ins.nome.toLowerCase() === nomeInsumo.toLowerCase())) {
                insumos.push({ 
                    nome: nomeInsumo, unidadeMedida: unidadeMedida, valorCompra: valorCompra,
                    tipoValorCompra: tipoValorCompra, itensPorEmbalagem: itensPorEmbalagem, 
                    quantidadeEstoqueMatriz: qtdEstoqueMatriz, quantidadeMinima: qtdMinima 
                });
                salvarInsumosAdmin(); renderizarUltimosInsumosConfig(); renderizarCheckboxesInsumosConfig(); 
                formInsumoConfig.reset(); 
                divEmbalagemDetailsConfig.classList.add('hidden'); inputItensPorEmbalagemConfig.required = false;
                selectUnidadeMedidaConfig.value = ""; selectTipoValorCompraConfig.value = "unidade_medida_principal";
                showConfigNotification('Sucesso!', `Insumo "${nomeInsumo}" adicionado.`);
            } else { showConfigNotification('Atenção!', `Insumo "${nomeInsumo}" já existe.`, false); }
        });
    }

    if (formUnidadeConfig) {
        formUnidadeConfig.addEventListener('submit', function(event) {
            event.preventDefault();
            const nomeUnidade = inputNomeUnidadeConfig.value.trim();
            const loginUnidade = inputLoginUnidadeConfig.value.trim();
            const senhaUnidade = inputSenhaUnidadeConfig.value; 
            const tipoAcesso = selectTipoAcessoConfig.value; 

            if (!nomeUnidade || !loginUnidade || !senhaUnidade || !tipoAcesso) {
                 showConfigNotification('Erro!', 'Todos os campos (Nome, Login, Senha e Tipo de Acesso) são obrigatórios.', false);
                 return;
            }
            if (!unidades.find(un => un.nome.toLowerCase() === nomeUnidade.toLowerCase() || un.login.toLowerCase() === loginUnidade.toLowerCase())) {
                unidades.push({ nome: nomeUnidade, login: loginUnidade, senha: senhaUnidade, tipoAcesso: tipoAcesso }); 
                salvarUnidadesAdmin(); 
                renderizarListaUnidadesConfig(); 
                formUnidadeConfig.reset(); 
                selectTipoAcessoConfig.value = ""; 
                showConfigNotification('Sucesso!', `"${nomeUnidade}" (${tipoAcesso === 'admin_gestao' ? 'Admin' : 'Unidade'}) adicionado(a).`);
            } else { showConfigNotification('Atenção!', 'Nome ou login já cadastrado.', false); }
        });
    }

    if (selectUnidadeConfig) selectUnidadeConfig.addEventListener('change', renderizarCheckboxesInsumosConfig);
    
    if (btnSalvarAssociacaoConfig) {
        btnSalvarAssociacaoConfig.addEventListener('click', function() {
            const unidadeLoginSelecionado = selectUnidadeConfig.value; 
            if (!unidadeLoginSelecionado) { showConfigNotification('Atenção!', 'Selecione uma unidade.', false); return; }
            
            const novosInsumosAssociados = [];
            const insumoItems = checkboxesInsumosContainerConfig.querySelectorAll('.insumo-item-config');
            let hasError = false;

            insumoItems.forEach(item => {
                if (hasError) return;
                const checkbox = item.querySelector('.insumo-checkbox');
                if (checkbox.checked) {
                    const nomeInsumo = checkbox.value;
                    const inputMinimo = item.querySelector('.input-minimo-unidade');
                    const minimo = parseInt(inputMinimo.value, 10);

                    if (isNaN(minimo) || minimo < 0) {
                        showConfigNotification('Erro!', `Defina um estoque mínimo válido para "${nomeInsumo}".`, false);
                        hasError = true;
                    } else {
                        novosInsumosAssociados.push({ nome: nomeInsumo, minimo: minimo });
                    }
                }
            });
            
            if (hasError) return; 
            
            const unidadeSelecionada = unidades.find(u => u.login === unidadeLoginSelecionado);
            insumosPorUnidade[unidadeLoginSelecionado] = novosInsumosAssociados; 
            salvarInsumosPorUnidadeAdmin(); 
            showConfigNotification('Sucesso!', `Insumos fixos para "${unidadeSelecionada.nome}" salvos!`);
        });
    }
    
    if(formEditUnidadeConfig) {
        formEditUnidadeConfig.addEventListener('submit', function(event) {
            event.preventDefault();
            const originalLogin = editUnidadeOriginalLoginInputConfig.value;
            const novoLogin = editUnidadeLoginInputConfig.value.trim();
            const novaSenha = editUnidadeSenhaInputConfig.value; 
            const novoTipoAcesso = editTipoAcessoConfigSelect.value; 

            if(!novoTipoAcesso){
                showConfigNotification('Erro!', 'O Tipo de Acesso é obrigatório.', false); return;
            }

            const unidadeIndex = unidades.findIndex(u => u.login === originalLogin);
            if (unidadeIndex === -1) { showConfigNotification('Erro!', 'Cadastro original não encontrado.', false); fecharModalEdicaoUnidadeConfig(); return; }
            if (novoLogin.toLowerCase() !== originalLogin.toLowerCase() && unidades.some(u => u.login.toLowerCase() === novoLogin.toLowerCase())) { showConfigNotification('Erro!', `O login "${novoLogin}" já está em uso.`, false); return; }
            
            const nomeUnidade = unidades[unidadeIndex].nome; 
            unidades[unidadeIndex].login = novoLogin;
            unidades[unidadeIndex].tipoAcesso = novoTipoAcesso; 
            if (novaSenha) { unidades[unidadeIndex].senha = novaSenha; }

            if (novoLogin.toLowerCase() !== originalLogin.toLowerCase()) {
                if (insumosPorUnidade[originalLogin]) {
                    insumosPorUnidade[novoLogin] = insumosPorUnidade[originalLogin];
                    delete insumosPorUnidade[originalLogin];
                    salvarInsumosPorUnidadeAdmin();
                }

                const stockLocalAntigo = localStorage.getItem(`stockLocal_${originalLogin}`);
                if (stockLocalAntigo) { localStorage.setItem(`stockLocal_${novoLogin}`, stockLocalAntigo); localStorage.removeItem(`stockLocal_${originalLogin}`); }
                const solicitacoesUnidadeAntigas = localStorage.getItem(`solicitacoesUnidade_${originalLogin}`);
                if (solicitacoesUnidadeAntigas) { localStorage.setItem(`solicitacoesUnidade_${novoLogin}`, solicitacoesUnidadeAntigas); localStorage.removeItem(`solicitacoesUnidade_${originalLogin}`);}
                
                let solicitacoesGlobais = JSON.parse(localStorage.getItem('solicitacoesSistemaAdmin')) || [];
                solicitacoesGlobais.forEach(sol => { if(sol.unidadeLogin === originalLogin) { sol.unidadeLogin = novoLogin; } });
                localStorage.setItem('solicitacoesSistemaAdmin', JSON.stringify(solicitacoesGlobais));
            }
            salvarUnidadesAdmin(); 
            showConfigNotification('Sucesso!', `Cadastro de "${nomeUnidade}" atualizado.`); 
            fecharModalEdicaoUnidadeConfig();
            renderizarListaUnidadesConfig(); 
        });
    }
    if (cancelEditUnidadeBtnConfig) cancelEditUnidadeBtnConfig.addEventListener('click', fecharModalEdicaoUnidadeConfig);

    if (confirmDeleteUnidadeBtnConfig) {
        confirmDeleteUnidadeBtnConfig.addEventListener('click', function() {
            if (!unidadeParaExcluirLoginConfig) return;
            const unidadeIndex = unidades.findIndex(u => u.login === unidadeParaExcluirLoginConfig);
            if (unidadeIndex > -1) {
                const nomeUnidadeExcluida = unidades[unidadeIndex].nome;
                const loginUnidadeExcluida = unidades[unidadeIndex].login;
                unidades.splice(unidadeIndex, 1);
                delete insumosPorUnidade[loginUnidadeExcluida]; 
                localStorage.removeItem(`stockLocal_${loginUnidadeExcluida}`);
                localStorage.removeItem(`solicitacoesUnidade_${loginUnidadeExcluida}`);
                let solicitacoesGlobais = JSON.parse(localStorage.getItem('solicitacoesSistemaAdmin')) || [];
                solicitacoesGlobais.forEach(sol => { if (sol.unidadeLogin === loginUnidadeExcluida && sol.status === "Pendente") { sol.status = "Cancelada (Unidade Excluída)"; } });
                localStorage.setItem('solicitacoesSistemaAdmin', JSON.stringify(solicitacoesGlobais));
                salvarUnidadesAdmin(); salvarInsumosPorUnidadeAdmin(); 
                showConfigNotification('Sucesso!', `Cadastro de "${nomeUnidadeExcluida}" excluído.`);
                renderizarListaUnidadesConfig();
                if(selectUnidadeConfig.value === loginUnidadeExcluida) { 
                    selectUnidadeConfig.value = ""; 
                    renderizarCheckboxesInsumosConfig(); 
                }
            } else { showConfigNotification('Erro!', 'Cadastro não encontrado para exclusão.', false); }
            fecharModalConfirmacaoExclusaoConfig();
        });
    }
    if (cancelDeleteUnidadeBtnConfig) cancelDeleteUnidadeBtnConfig.addEventListener('click', fecharModalConfirmacaoExclusaoConfig);

    function inicializarConfiguracoes() {
        carregarDados(); // Carrega os dados do localStorage primeiro
        renderizarUltimosInsumosConfig();
        renderizarListaUnidadesConfig();
        renderizarCheckboxesInsumosConfig(); 
        if (divEmbalagemDetailsConfig) divEmbalagemDetailsConfig.classList.add('hidden');
        if (inputItensPorEmbalagemConfig) inputItensPorEmbalagemConfig.required = false;
        if (selectTipoValorCompraConfig) selectTipoValorCompraConfig.value = "unidade_medida_principal"; 
        if (selectUnidadeMedidaConfig) selectUnidadeMedidaConfig.value = ""; 
        if (selectTipoAcessoConfig) selectTipoAcessoConfig.value = ""; 
    }

    inicializarConfiguracoes();
});
