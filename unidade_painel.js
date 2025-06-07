document.addEventListener('DOMContentLoaded', function() {
    const nomeUnidadeLogadaSpan = document.getElementById('nome-unidade-logada');
    const logoutButton = document.getElementById('logout-button');
    const stockUnidadeContainer = document.getElementById('stock-unidade-container');
    const formSolicitarInsumo = document.getElementById('form-solicitar-insumo');
    const listaInsumosParaSolicitacaoUI = document.getElementById('lista-insumos-para-solicitacao'); 
    const listaMinhasSolicitacoesUI = document.getElementById('lista-minhas-solicitacoes');

    const notificationModalUnidade = document.getElementById('notification-modal-unidade');
    const modalIconContainerUnidade = document.getElementById('modal-icon-container-unidade');
    const modalTitleTextUnidade = document.getElementById('modal-title-text-unidade');
    const modalMessageTextUnidade = document.getElementById('modal-message-text-unidade');
    const modalCloseButtonUnidade = document.getElementById('modal-close-button-unidade');

    const unidadeLogadaNomeExibicao = localStorage.getItem('unidadeLogadaNome');
    const unidadeLogadaLoginChave = localStorage.getItem('unidadeLogadaLogin');

    if (!unidadeLogadaNomeExibicao || !unidadeLogadaLoginChave) {
        window.location.href = 'unidade_login.html';
        return; 
    }
    nomeUnidadeLogadaSpan.textContent = unidadeLogadaNomeExibicao;

    // --- DADOS DO SISTEMA CARREGADOS DO LOCALSTORAGE ---
    const todosOsInsumosDoSistema = JSON.parse(localStorage.getItem('insumosAdmin')) || [];
    // A estrutura agora é { 'login_da_unidade': [ { nome: 'Insumo A', minimo: 10 } ] }
    const insumosPorUnidadeAdmin = JSON.parse(localStorage.getItem('insumosPorUnidadeAdmin')) || {};
    let stockLocalDaUnidade = JSON.parse(localStorage.getItem(`stockLocal_${unidadeLogadaLoginChave}`)) || {};
    let minhasSolicitacoes = JSON.parse(localStorage.getItem(`solicitacoesUnidade_${unidadeLogadaLoginChave}`)) || [];
    let todasAsSolicitacoesDoSistema = JSON.parse(localStorage.getItem('solicitacoesSistemaAdmin')) || [];

    // --- FUNÇÕES DO MODAL DE NOTIFICAÇÃO ---
    function showUnidadeNotification(title, message, isSuccess = true) {
        modalTitleTextUnidade.textContent = title;
        modalMessageTextUnidade.textContent = message;
        modalIconContainerUnidade.innerHTML = isSuccess ?
            `<svg class="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>` :
            `<svg class="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>`;
        modalIconContainerUnidade.className = `mx-auto flex items-center justify-center h-12 w-12 rounded-full ${isSuccess ? 'bg-green-100' : 'bg-red-100'}`;
        notificationModalUnidade.classList.remove('hidden', 'opacity-0');
        notificationModalUnidade.querySelector('.modal-content').classList.remove('scale-95');
    }
    if(modalCloseButtonUnidade) {
        modalCloseButtonUnidade.addEventListener('click', () => {
            notificationModalUnidade.classList.add('opacity-0');
            notificationModalUnidade.querySelector('.modal-content').classList.add('scale-95');
            setTimeout(() => notificationModalUnidade.classList.add('hidden'), 250);
        });
    }

    // --- FUNÇÕES DE RENDERIZAÇÃO E LÓGICA ---
    // CORRIGIDO: Esta função agora filtra corretamente
    function carregarInsumosParaSolicitacao() {
        listaInsumosParaSolicitacaoUI.innerHTML = ''; 
        
        // 1. Pega a lista de configurações de insumos fixos para a unidade logada, usando o LOGIN como chave.
        const insumosFixosConfig = insumosPorUnidadeAdmin[unidadeLogadaLoginChave] || [];
        
        // 2. Extrai apenas os nomes dos insumos dessa configuração.
        const nomesInsumosFixos = insumosFixosConfig.map(item => item.nome);
        
        // 3. Filtra a lista de todos os insumos do sistema, mantendo apenas aqueles cujos nomes estão na lista de nomes fixos.
        const insumosParaExibir = todosOsInsumosDoSistema.filter(insumo => nomesInsumosFixos.includes(insumo.nome));
        
        insumosParaExibir.sort((a,b) => a.nome.localeCompare(b.nome));

        if (insumosParaExibir.length === 0) {
            listaInsumosParaSolicitacaoUI.innerHTML = '<p class="text-gray-500 italic text-sm">Nenhum insumo fixo definido para esta unidade.</p>';
            return;
        }
        
        insumosParaExibir.forEach(insumo => {
            const insumoId = `solicitar-${insumo.nome.replace(/\s+/g, '-')}`;
            const itemDiv = document.createElement('div');
            itemDiv.className = 'insumo-item-solicitacao items-center'; 
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox'; checkbox.id = insumoId; checkbox.name = 'insumoSolicitado'; checkbox.value = insumo.nome;
            checkbox.className = 'h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500 checkbox-primary-red';
            const checkboxLabel = document.createElement('label');
            checkboxLabel.htmlFor = insumoId; checkboxLabel.className = 'ml-2 flex-grow text-sm text-gray-700 cursor-pointer'; 
            checkboxLabel.textContent = `${insumo.nome} (Estoque Matriz: ${insumo.quantidadeEstoqueMatriz || 0})`;
            itemDiv.appendChild(checkbox);
            itemDiv.appendChild(checkboxLabel);
            listaInsumosParaSolicitacaoUI.appendChild(itemDiv);
        });
    }

    function renderizarStockUnidade() {
        stockUnidadeContainer.innerHTML = '';
        // CORRIGIDO: Usa o LOGIN da unidade como chave para buscar os insumos fixos
        const insumosFixosConfig = insumosPorUnidadeAdmin[unidadeLogadaLoginChave] || [];
        const nomesInsumosFixos = insumosFixosConfig.map(item => item.nome);
        const nomesInsumosRelevantes = new Set([...nomesInsumosFixos, ...Object.keys(stockLocalDaUnidade)]);
        const insumosParaRenderizar = Array.from(nomesInsumosRelevantes).sort((a,b) => a.localeCompare(b));

        if (insumosParaRenderizar.length === 0) {
             stockUnidadeContainer.innerHTML = '<p class="text-gray-500 italic">Nenhum insumo associado a esta unidade.</p>';
            return;
        }

        insumosParaRenderizar.forEach(nomeInsumo => {
            const qtdAtualLocal = stockLocalDaUnidade[nomeInsumo] || 0;
            const configInsumoUnidade = insumosFixosConfig.find(item => item.nome === nomeInsumo);
            const qtdMinimaUnidade = configInsumoUnidade ? configInsumoUnidade.minimo : 0;

            const divInsumo = document.createElement('div');
            divInsumo.className = 'p-3 bg-gray-50 rounded-md shadow-sm flex justify-between items-center';
            divInsumo.innerHTML = `
                <div>
                    <span class="font-medium text-gray-800">${nomeInsumo}</span>
                    <span class="block text-sm text-gray-600">Stock Local: 
                        <strong class="${qtdAtualLocal < qtdMinimaUnidade && qtdMinimaUnidade > 0 ? 'text-red-500 font-bold' : 'text-green-600'}">${qtdAtualLocal}</strong> 
                    </span>
                    <span class="block text-xs text-gray-500">Mínimo para esta Unidade: ${qtdMinimaUnidade}</span>
                </div>
                <div class="flex items-center space-x-2">
                    <input type="number" value="${qtdAtualLocal}" min="0" class="w-20 px-2 py-1 border border-gray-300 rounded-md text-sm shadow-sm focus:ring-red-500 focus:border-red-500 input-focus-primary-red" data-insumo-nome="${nomeInsumo}">
                    <button class="atualizar-stock-btn text-xs bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1 px-2 rounded-md shadow-sm transition-colors" data-insumo-nome="${nomeInsumo}">Atualizar</button>
                </div>
            `;
            stockUnidadeContainer.appendChild(divInsumo);
        });

        document.querySelectorAll('.atualizar-stock-btn').forEach(button => {
            button.addEventListener('click', function() {
                const nomeInsumo = this.dataset.insumoNome;
                const inputQtd = this.previousElementSibling;
                const novaQuantidade = parseInt(inputQtd.value, 10);

                if (!isNaN(novaQuantidade) && novaQuantidade >= 0) {
                    stockLocalDaUnidade[nomeInsumo] = novaQuantidade;
                    localStorage.setItem(`stockLocal_${unidadeLogadaLoginChave}`, JSON.stringify(stockLocalDaUnidade));
                    showUnidadeNotification('Stock Atualizado!', `Stock de ${nomeInsumo} atualizado para ${novaQuantidade}.`, true); 
                    renderizarStockUnidade(); 
                } else {
                    showUnidadeNotification('Erro!', 'Quantidade inválida.', false); 
                }
            });
        });
    }

    function renderizarMinhasSolicitacoes() {
        todasAsSolicitacoesDoSistema = JSON.parse(localStorage.getItem('solicitacoesSistemaAdmin')) || [];
        listaMinhasSolicitacoesUI.innerHTML = '';
        if (minhasSolicitacoes.length === 0) {
            listaMinhasSolicitacoesUI.innerHTML = '<li class="text-gray-500 italic">Nenhuma solicitação feita recentemente.</li>';
            return;
        }
        const recentes = [...minhasSolicitacoes].sort((a,b) => new Date(b.data) - new Date(a.data)).slice(0,10); 
        recentes.forEach(solLocal => {
            const li = document.createElement('li');
            li.className = 'p-2 bg-gray-50 rounded-md text-sm flex justify-between items-center shadow-sm';
            const dataFormatada = new Date(solLocal.data).toLocaleDateString('pt-BR', {day: '2-digit', month: 'short', year:'2-digit'});
            const solicitacaoNoSistema = todasAsSolicitacoesDoSistema.find(s => s.id === solLocal.id);
            const statusAtual = solicitacaoNoSistema ? solicitacaoNoSistema.status : solLocal.status;
            if(solicitacaoNoSistema && solLocal.status !== solicitacaoNoSistema.status && solicitacaoNoSistema.status === 'Confirmado') {
                solLocal.status = solicitacaoNoSistema.status;
                if (solicitacaoNoSistema.quantidadeConfirmadaAdmin !== undefined) {
                    solLocal.quantidadeSolicitada = solicitacaoNoSistema.quantidadeConfirmadaAdmin;
                }
            }
            let statusClass = 'text-yellow-700';
            let statusBgClass = 'bg-yellow-200';
            if (statusAtual === 'Confirmado') { 
                statusClass = 'text-green-700'; 
                statusBgClass = 'bg-green-100'; 
            }
            if (statusAtual === 'Recusado' || statusAtual === 'Insumo Excluído' || statusAtual === 'Cancelada (Unidade Excluída)') { 
                statusClass = 'text-gray-500'; 
                statusBgClass = 'bg-gray-200';
            }

            const contabilizadoInfo = solLocal.contabilizada && statusAtual === 'Confirmado' ? '<span class="text-xs text-blue-500 ml-1">(Recebido)</span>' : '';
            const quantidadeExibida = solicitacaoNoSistema && solicitacaoNoSistema.quantidadeConfirmadaAdmin !== undefined 
                                    ? solicitacaoNoSistema.quantidadeConfirmadaAdmin 
                                    : (solLocal.quantidadeSolicitada === 0 ? "A definir" : solLocal.quantidadeSolicitada);

            li.innerHTML = `<div><strong>${solLocal.insumoNome}</strong> - Qtd: ${quantidadeExibida} <span class="text-xs text-gray-500">(${dataFormatada})</span></div> <span class="font-semibold text-xs ${statusClass} px-2 py-0.5 rounded-full ${statusBgClass}">${statusAtual.toUpperCase()}${contabilizadoInfo}</span>`;
            listaMinhasSolicitacoesUI.appendChild(li);
        });
    }

    function processarSolicitacoesConfirmadas() {
        let stockFoiAtualizado = false;
        todasAsSolicitacoesDoSistema = JSON.parse(localStorage.getItem('solicitacoesSistemaAdmin')) || [];
        minhasSolicitacoes.forEach(solLocal => {
            if (solLocal.contabilizada) return;
            const solicitacaoNoSistema = todasAsSolicitacoesDoSistema.find(s => s.id === solLocal.id);
            if (solicitacaoNoSistema && solicitacaoNoSistema.status === 'Confirmado') {
                const qtdRecebida = solicitacaoNoSistema.quantidadeConfirmadaAdmin !== undefined 
                                    ? solicitacaoNoSistema.quantidadeConfirmadaAdmin 
                                    : (solLocal.quantidadeSolicitada > 0 ? solLocal.quantidadeSolicitada : 0); 
                if (qtdRecebida > 0) { 
                    stockLocalDaUnidade[solLocal.insumoNome] = (stockLocalDaUnidade[solLocal.insumoNome] || 0) + qtdRecebida;
                    solLocal.contabilizada = true; solLocal.status = 'Confirmado'; 
                    solLocal.quantidadeSolicitada = qtdRecebida; stockFoiAtualizado = true;
                } else if (solicitacaoNoSistema.quantidadeConfirmadaAdmin === 0) {
                    solLocal.contabilizada = true; solLocal.status = 'Confirmado';
                    solLocal.quantidadeSolicitada = 0; stockFoiAtualizado = true;
                }
            }
        });
        if (stockFoiAtualizado) {
            localStorage.setItem(`stockLocal_${unidadeLogadaLoginChave}`, JSON.stringify(stockLocalDaUnidade));
            localStorage.setItem(`solicitacoesUnidade_${unidadeLogadaLoginChave}`, JSON.stringify(minhasSolicitacoes));
            showUnidadeNotification("Stock Atualizado / Solicitações Processadas", "Seu stock local e o status de algumas solicitações foram atualizados.", true);
            renderizarStockUnidade(); 
            renderizarMinhasSolicitacoes(); 
        }
    }

    formSolicitarInsumo.addEventListener('submit', function(event) {
        event.preventDefault();
        const insumosSelecionadosParaPedido = [];
        const checkboxes = listaInsumosParaSolicitacaoUI.querySelectorAll('input[type="checkbox"]:checked');

        checkboxes.forEach(checkbox => {
            const nomeInsumo = checkbox.value;
            insumosSelecionadosParaPedido.push({
                nome: nomeInsumo,
                quantidade: 0 
            });
        });

        if (insumosSelecionadosParaPedido.length === 0) {
            showUnidadeNotification('Nenhum Insumo Selecionado', 'Por favor, selecione ao menos um insumo para solicitar.', false);
            return;
        }

        let pedidosEnviadosNomes = [];
        insumosSelecionadosParaPedido.forEach(item => {
            const novaSolicitacao = {
                id: Date.now() + Math.floor(Math.random()*1000), 
                unidadeNome: unidadeLogadaNomeExibicao, 
                unidadeLogin: unidadeLogadaLoginChave, 
                insumoNome: item.nome,
                quantidadeSolicitada: item.quantidade, // Será 0
                data: new Date().toISOString(), 
                status: "Pendente",
                contabilizada: false 
            };
            minhasSolicitacoes.push(novaSolicitacao);
            todasAsSolicitacoesDoSistema.push(novaSolicitacao);
            pedidosEnviadosNomes.push(`${item.nome} (qtd. a definir)`); 
        });
        
        localStorage.setItem(`solicitacoesUnidade_${unidadeLogadaLoginChave}`, JSON.stringify(minhasSolicitacoes));
        localStorage.setItem('solicitacoesSistemaAdmin', JSON.stringify(todasAsSolicitacoesDoSistema));

        showUnidadeNotification('Pedido(s) Enviado(s)!', `Solicitações para: ${pedidosEnviadosNomes.join(', ')} foram enviadas.`);
        renderizarMinhasSolicitacoes(); 
        listaInsumosParaSolicitacaoUI.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
    });

    logoutButton.addEventListener('click', function() {
        localStorage.removeItem('unidadeLogadaNome');
        localStorage.removeItem('unidadeLogadaLogin');
        window.location.href = 'unidade_login.html';
    });

    function inicializarPainelUnidade() {
        // CORRIGIDO: Usa o LOGIN da unidade como chave para buscar os insumos fixos
        const insumosFixosDaUnidadeLogada = insumosPorUnidadeAdmin[unidadeLogadaLoginChave] || [];
        insumosFixosDaUnidadeLogada.forEach(item => { // Agora itera sobre objetos
            if (stockLocalDaUnidade[item.nome] === undefined) {
                stockLocalDaUnidade[item.nome] = 0; 
            }
        });
        localStorage.setItem(`stockLocal_${unidadeLogadaLoginChave}`, JSON.stringify(stockLocalDaUnidade));
        
        processarSolicitacoesConfirmadas(); 

        carregarInsumosParaSolicitacao();
        renderizarStockUnidade();
        renderizarMinhasSolicitacoes();
    }

    inicializarPainelUnidade();
});
