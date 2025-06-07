document.addEventListener('DOMContentLoaded', function() {
    // --- ARMAZENAMENTO DE DADOS (localStorage) ---
    let insumos = [];
    let unidades = [];
    let insumosPorUnidadeAdminView = {};
    let solicitacoes = [];

    // Função central para carregar todos os dados do localStorage
    function carregarDados() {
        try {
            insumos = JSON.parse(localStorage.getItem('insumosAdmin')) || [];
            unidades = JSON.parse(localStorage.getItem('unidadesAdmin')) || [];
            insumosPorUnidadeAdminView = JSON.parse(localStorage.getItem('insumosPorUnidadeAdmin')) || {};
            solicitacoes = JSON.parse(localStorage.getItem('solicitacoesSistemaAdmin')) || [];
        } catch (error) {
            console.error("Erro ao ler dados do localStorage:", error);
            // Em caso de erro, zera os dados para evitar que a aplicação quebre
            insumos = [];
            unidades = [];
            insumosPorUnidadeAdminView = {};
            solicitacoes = [];
        }
    }
    
    function salvarInsumosAdmin() { localStorage.setItem('insumosAdmin', JSON.stringify(insumos)); }
    function salvarSolicitacoesSistemaAdmin() { localStorage.setItem('solicitacoesSistemaAdmin', JSON.stringify(solicitacoes)); }

    // --- SELETORES DE ELEMENTOS DO DOM ---
    const tabelaEstoqueMatrizUI = document.getElementById('tabela-estoque-matriz');
    const btnAtualizarEstoqueMatriz = document.getElementById('btn-atualizar-estoque-matriz');
    const tabelaSolicitacoesUI = document.getElementById('tabela-solicitacoes'); 
    const filtrosSolicitacoesContainer = document.getElementById('filtros-solicitacoes-container');
    
    // Dashboard
    const totalInsumosMatrizSpan = document.getElementById('total-insumos-matriz');
    const totalUnidadesCadastradasSpan = document.getElementById('total-unidades-cadastradas');
    const solicitacoesPendentesSpan = document.getElementById('solicitacoes-pendentes');
    const listaInsumosMaisSolicitadosUI = document.getElementById('lista-insumos-mais-solicitados');
    const listaValorEstoqueUnidadeUI = document.getElementById('lista-valor-estoque-unidade'); 
    const graficoStockUnidadesCanvas = document.getElementById('grafico-stock-unidades');
    const selectFiltroUnidadeDashboard = document.getElementById('select-filtro-unidade-dashboard'); 
    const valorGastoUnidadeDashboardSpan = document.getElementById('valor-gasto-unidade-dashboard'); 
    const infoValorGastoUnidadeSpan = document.getElementById('info-valor-gasto-unidade');
    const tabelaEstoqueDetalhadoUnidadesUI = document.getElementById('tabela-estoque-detalhado-unidades');
    let stockUnidadesChart = null; 

    // Modais
    const notificationModal = document.getElementById('notification-modal');
    const modalIconContainer = document.getElementById('modal-icon-container');
    const modalTitleText = document.getElementById('modal-title-text');
    const modalMessageText = document.getElementById('modal-message-text');
    const modalCloseButton = document.getElementById('modal-close-button');

    const deleteInsumoMatrizConfirmModal = document.getElementById('delete-insumo-matriz-confirm-modal');
    const deleteInsumoMatrizNomeConfirmSpan = document.getElementById('delete-insumo-matriz-nome-confirm');
    const cancelDeleteInsumoMatrizBtn = document.getElementById('cancel-delete-insumo-matriz-btn');
    const confirmDeleteInsumoMatrizBtn = document.getElementById('confirm-delete-insumo-matriz-btn');
    let insumoMatrizParaExcluirNome = null; 

    const reporEstoqueModal = document.getElementById('repor-estoque-modal');
    const formReporEstoque = document.getElementById('form-repor-estoque');
    const reporInsumoNomeSpan = document.getElementById('repor-insumo-nome');
    const reporInsumoNomeHiddenInput = document.getElementById('repor-insumo-nome-hidden');
    const reporQtdCompradaInput = document.getElementById('repor-qtd-comprada');
    const reporUnidadeCompraSelect = document.getElementById('repor-unidade-compra');
    const reporEmbalagemDetailsDiv = document.getElementById('repor-embalagem-details');
    const reporItensPorEmbalagemCompraInput = document.getElementById('repor-itens-por-embalagem-compra');
    const reporTipoEmbalagemCompraLabelSpan = document.getElementById('repor-tipo-embalagem-compra-label');
    const reporValorPagoInput = document.getElementById('repor-valor-pago');
    const cancelReporEstoqueBtn = document.getElementById('cancel-repor-estoque-btn');

    const deleteSolicitacaoConfirmModal = document.getElementById('delete-solicitacao-confirm-modal');
    const cancelDeleteSolicitacaoBtn = document.getElementById('cancel-delete-solicitacao-btn');
    const confirmDeleteSolicitacaoBtn = document.getElementById('confirm-delete-solicitacao-btn');
    let solicitacaoParaExcluirId = null;

    // NOVO: Seletores para o modal de Reset do Sistema
    const btnResetarSistema = document.getElementById('btn-resetar-sistema');
    const resetSistemaConfirmModal = document.getElementById('reset-sistema-confirm-modal');
    const resetAdminPasswordInput = document.getElementById('reset-admin-password');
    const resetErrorMessage = document.getElementById('reset-error-message');
    const cancelResetSistemaBtn = document.getElementById('cancel-reset-sistema-btn');
    const confirmResetSistemaBtn = document.getElementById('confirm-reset-sistema-btn');


    // --- FUNÇÕES DE MODAL ---
    function showNotification(title, message, isSuccess = true) { /* ... (inalterada) ... */ }
    function abrirModalConfirmacaoExcluirInsumoMatriz(insumoNome) { /* ... (inalterada) ... */ }
    function fecharModalConfirmacaoExcluirInsumoMatriz() { /* ... (inalterada) ... */ }
    function abrirModalReporEstoque(insumoNome) { /* ... (inalterada) ... */ }
    function fecharModalReporEstoque() { /* ... (inalterada) ... */ }
    function abrirModalConfirmacaoExcluirSolicitacao(id) { /* ... (inalterada) ... */ }
    function fecharModalConfirmacaoExcluirSolicitacao() { /* ... (inalterada) ... */ }

    // NOVO: Funções para o modal de Reset
    function abrirModalReset() {
        if(resetSistemaConfirmModal) {
            resetAdminPasswordInput.value = '';
            resetErrorMessage.classList.add('hidden');
            resetSistemaConfirmModal.classList.remove('hidden', 'opacity-0');
            resetSistemaConfirmModal.querySelector('.modal-content').classList.remove('scale-95');
        }
    }
    function fecharModalReset() {
        if(resetSistemaConfirmModal) {
            resetSistemaConfirmModal.classList.add('opacity-0');
            resetSistemaConfirmModal.querySelector('.modal-content').classList.add('scale-95');
            setTimeout(() => {
                resetSistemaConfirmModal.classList.add('hidden');
            }, 250);
        }
    }


    // --- FUNÇÕES DE RENDERIZAÇÃO ---
    function renderizarTabelaEstoqueMatriz() { /* ... (inalterada) ... */ }
    function isDateInRange(isoDateString, range) { /* ... (inalterada) ... */ }
    function renderizarTabelaSolicitacoes() { /* ... (inalterada) ... */ }
    function calcularCustoUnitario(insumo) { /* ... (inalterada) ... */ }
    function renderizarTabelaEstoqueDetalhadoUnidades() { /* ... (inalterada) ... */ }
    function atualizarDashboard() { /* ... (inalterada) ... */ }
    function popularFiltroUnidadeDashboard() { /* ... (inalterada) ... */ }
    function renderizarGraficoStockUnidades() { /* ... (inalterada) ... */ }
    

    // --- LÓGICA DE EVENTOS E MANIPULAÇÃO ---
    function handleConfirmarSolicitacao(event) { /* ... (inalterada) ... */ }
    
    if(filtrosSolicitacoesContainer) {
        filtrosSolicitacoesContainer.addEventListener('click', function(event) {
            if (event.target.classList.contains('filtro-solicitacao-btn')) {
                filtrosSolicitacoesContainer.querySelectorAll('.filtro-solicitacao-btn').forEach(btn => btn.classList.remove('active'));
                event.target.classList.add('active'); 
                filtroDataSolicitacoes = event.target.dataset.range; 
                renderizarTabelaSolicitacoes();
            }
        });
    }
    
    if(btnAtualizarEstoqueMatriz) {
        btnAtualizarEstoqueMatriz.addEventListener('click', function() {
            carregarDados(); // Recarrega todos os dados do localStorage
            renderizarTabelaEstoqueMatriz();
            atualizarDashboard(); 
            popularFiltroUnidadeDashboard(); 
            showNotification("Visualização Atualizada", "Os dados do painel foram recarregados.", true);
        });
    }

    function handleAdicionarQuantidadeMatriz(event) { /* ... (inalterada) ... */ }

    if(confirmDeleteInsumoMatrizBtn) {
        confirmDeleteInsumoMatrizBtn.addEventListener('click', function() {
            if (!insumoMatrizParaExcluirNome) return;
            const insumoIndex = insumos.findIndex(i => i.nome === insumoMatrizParaExcluirNome);
            if (insumoIndex > -1) {
                insumos.splice(insumoIndex, 1); 
                let currentInsumosPorUnidade = JSON.parse(localStorage.getItem('insumosPorUnidadeAdmin')) || {};
                for (const unidadeLoginKey in currentInsumosPorUnidade) { // Usar login como chave
                    currentInsumosPorUnidade[unidadeLoginKey] = currentInsumosPorUnidade[unidadeLoginKey].filter(
                        item => item.nome !== insumoMatrizParaExcluirNome);
                }
                localStorage.setItem('insumosPorUnidadeAdmin', JSON.stringify(currentInsumosPorUnidade));
                insumosPorUnidadeAdminView = currentInsumosPorUnidade;
                unidades.forEach(unidade => {
                    const stockLocalKey = `stockLocal_${unidade.login}`;
                    let stockLocal = JSON.parse(localStorage.getItem(stockLocalKey)) || {};
                    if (stockLocal[insumoMatrizParaExcluirNome] !== undefined) { 
                        delete stockLocal[insumoMatrizParaExcluirNome]; 
                        localStorage.setItem(stockLocalKey, JSON.stringify(stockLocal)); 
                    }
                });
                solicitacoes.forEach(sol => { if (sol.insumoNome === insumoMatrizParaExcluirNome && sol.status === "Pendente") { sol.status = "Insumo Excluído"; } });
                salvarInsumosAdmin(); 
                salvarSolicitacoesSistemaAdmin(); 
                showNotification('Sucesso!', `Insumo "${insumoMatrizParaExcluirNome}" excluído.`);
                renderizarTabelaEstoqueMatriz(); 
                renderizarTabelaSolicitacoes(); 
                atualizarDashboard();
            } else { showNotification('Erro!', 'Insumo não encontrado para exclusão.', false); }
            fecharModalConfirmacaoExcluirInsumoMatriz();
        });
    }
    if(cancelDeleteInsumoMatrizBtn) cancelDeleteInsumoMatrizBtn.addEventListener('click', fecharModalConfirmacaoExcluirInsumoMatriz);

    if (selectFiltroUnidadeDashboard) {
        selectFiltroUnidadeDashboard.addEventListener('change', function(event) {
            filtroUnidadeDashboard = event.target.value;
            atualizarDashboard(); 
        });
    }
    
    if (formReporEstoque) { /* ... (inalterada) ... */ }
    if(cancelReporEstoqueBtn) cancelReporEstoqueBtn.addEventListener('click', fecharModalReporEstoque);
    if(reporUnidadeCompraSelect) { /* ... (inalterada) ... */ }

    if(confirmDeleteSolicitacaoBtn) {
        confirmDeleteSolicitacaoBtn.addEventListener('click', function() {
            if (!solicitacaoParaExcluirId) return;
            const idParaExcluir = parseInt(solicitacaoParaExcluirId, 10);
            const index = solicitacoes.findIndex(s => s.id === idParaExcluir);
            if (index > -1) {
                if (solicitacoes[index].status === 'Pendente') {
                    solicitacoes.splice(index, 1);
                    salvarSolicitacoesSistemaAdmin();
                    showNotification('Sucesso', 'A solicitação pendente foi excluída.');
                    renderizarTabelaSolicitacoes();
                    atualizarDashboard();
                } else {
                    showNotification('Aviso', 'Apenas solicitações pendentes podem ser excluídas.', false);
                }
            } else {
                showNotification('Erro', 'Solicitação não encontrada.', false);
            }
            fecharModalConfirmacaoExcluirSolicitacao();
        });
    }
    if(cancelDeleteSolicitacaoBtn) cancelDeleteSolicitacaoBtn.addEventListener('click', fecharModalConfirmacaoExcluirSolicitacao);

    // --- NOVO: LÓGICA PARA RESETAR O SISTEMA ---
    if(btnResetarSistema) {
        btnResetarSistema.addEventListener('click', abrirModalReset);
    }
    if(cancelResetSistemaBtn) {
        cancelResetSistemaBtn.addEventListener('click', fecharModalReset);
    }
    if(confirmResetSistemaBtn) {
        confirmResetSistemaBtn.addEventListener('click', function() {
            const senhaAdmin = resetAdminPasswordInput.value;
            // Valida a senha do administrador principal
            if (senhaAdmin === '2501jg') {
                const confirmacaoFinal = confirm("ALERTA FINAL: Tem a certeza absoluta que deseja apagar TODOS os dados? Esta ação é permanente.");
                if (confirmacaoFinal) {
                    // Limpa todos os dados do localStorage relacionados à aplicação
                    const chavesParaLimpar = [
                        'insumosAdmin',
                        'unidadesAdmin',
                        'insumosPorUnidadeAdmin',
                        'solicitacoesSistemaAdmin'
                    ];
                    // Limpa também os estoques e solicitações individuais de cada unidade
                    if (unidades && unidades.length > 0) {
                        unidades.forEach(unidade => {
                            chavesParaLimpar.push(`stockLocal_${unidade.login}`);
                            chavesParaLimpar.push(`solicitacoesUnidade_${unidade.login}`);
                        });
                    }
                    
                    chavesParaLimpar.forEach(chave => localStorage.removeItem(chave));

                    alert('Sistema resetado com sucesso! A página será recarregada.');
                    window.location.reload();
                } else {
                    fecharModalReset();
                }
            } else {
                resetErrorMessage.classList.remove('hidden');
                setTimeout(() => {
                    resetErrorMessage.classList.add('hidden');
                }, 3000);
            }
        });
    }


    // --- INICIALIZAÇÃO ---
    function inicializarPainelPrincipal() {
        carregarDados(); // Carrega os dados do localStorage primeiro
        popularFiltroUnidadeDashboard(); 
        renderizarTabelaEstoqueMatriz();
        renderizarTabelaSolicitacoes(); 
        atualizarDashboard(); 
    }
    inicializarPainelPrincipal();
});
