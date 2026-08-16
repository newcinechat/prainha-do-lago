let clienteAtual = null;
let quiosqueSelecionadoId = null;
let quiosqueUltimaCompraId = null;
let mediaStreamAtiva = null;
const SENHA_ADMIN_MESTRE = "00256383";

let produtosTemporariosCadastro = [];
let listaComprasUsuario = [];

// Base de Supermercados atualizada com região, gerente, endereço e link direto
let superOfertasData = [
    { mercado: "Supermercado Extra", regiao: "Prainha / Asa Norte", gerente: "Roberto Carlos", endereco: "SGAN 602", siteUrl: "https://www.extra.com.br", produto: "Cerveja Heineken 350ml", preco: 5.49, compensa: true },
    { mercado: "Supermercado Carrefour", regiao: "Pontão / Lago Sul", gerente: "Ana Souza", endereco: "SHIS QI 7/9", siteUrl: "https://www.carrefour.com.br", produto: "Arroz Tipo 1 (5kg)", preco: 23.90, compensa: true },
    { mercado: "Supermercado Pão de Açúcar", regiao: "Lago Sul", gerente: "Marcos Paulo", endereco: "SHIS QI 21", siteUrl: "https://www.paodeacucar.com", produto: "Água Mineral 500ml", preco: 2.50, compensa: false }
];

let adminConfig = {
    pedidosRealizados: 0,
    faturamentoQuiosques: 0.00,
    arrecadacaoBolao: 0.00,
    faturamentoFranquias: 3000.00,
    itensVendidosHistorico: {}
};

// Módulo Contábil e RH Integrado ao Admin Master
let funcionariosRHData = [
    { id: 1, nome: "João da Silva", cargo: "Gerente Operacional", endereco: "Asa Sul Q. 302", telefone: "61988887777", email: "joao@orla.com", salarioBruto: 3500.00, descontos: 350.00 },
    { id: 2, nome: "Carla Mendes", cargo: "Contadora / RH", endereco: "Lago Norte QI 4", telefone: "61977776666", email: "carla@orla.com", salarioBruto: 4200.00, descontos: 420.00 }
];

let franquiasData = [
    { 
        id: 1, 
        nome: "Carlos Eduardo", 
        cidade: "Brasília / DF", 
        whatsapp: "5561999999999", 
        status: "Ativa", 
        faturamentoPraça: 4200.00,
        historicoOperacoes: "Implantado com 4 quiosques na Orla do Paranoá.",
        oQueDáCerto: "Entrega rápida via comanda digital e bolões.",
        oQueMelhorar: "Expandir cobertura de quiosques noturnos."
    },
    { 
        id: 2, 
        nome: "Fernanda Lima", 
        cidade: "São Paulo / SP", 
        whatsapp: "5511988888888", 
        status: "Ativa", 
        faturamentoPraça: 8900.00,
        historicoOperacoes: "Parceria consolidada com quiosques na represa.",
        oQueDáCerto: "Eventos semanais e divulgação no Instagram.",
        oQueMelhorar: "Agilizar o atendimento nos horários de pico."
    }
];

let quiosquesData = [
    { 
        id: 1, 
        localizacao: 'prainha', 
        nome: 'Quiosque da Prainha', 
        responsavel: 'Seu Carlos', 
        whatsapp: '5561999999999', 
        pagamento: 'Pix / Dinheiro', 
        logomarca: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=150',
        senhaCofre: '1234',
        premioCofre: '10% de desconto na próxima porção!',
        produtos: [
            { categoria: 'ESPETINHOS', nome: 'Carne de sol c/ queijo', preco: 10.00 },
            { categoria: 'BEBIDAS', nome: 'Heineken 330ml', preco: 10.00 },
            { categoria: 'BEBIDAS', nome: 'Água Mineral', preco: 5.00 }
        ] 
    },
    { 
        id: 2, 
        localizacao: 'pontao', 
        nome: 'Quiosque do Pontão Sul', 
        responsavel: 'Mariana', 
        whatsapp: '5561988888888', 
        pagamento: 'Pix / Cartão', 
        logomarca: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=150',
        senhaCofre: '4321',
        premioCofre: 'Ganhou uma Água de Coco grátis!',
        produtos: [
            { categoria: 'BEBIDAS', nome: 'Água de Coco', preco: 9.00 },
            { categoria: 'ESPETINHOS', nome: 'Espetinho de Carne', preco: 12.00 }
        ] 
    }
];

function alternarCamposLogin(tipo) {
    if (tipo === 'admin') {
        document.getElementById('blocoLoginUsuario').style.display = 'none';
        document.getElementById('blocoLoginAdmin').style.display = 'block';
    } else {
        document.getElementById('blocoLoginUsuario').style.display = 'block';
        document.getElementById('blocoLoginAdmin').style.display = 'none';
    }
}

function entrarNaPlataforma() {
    const tipoAcesso = document.getElementById('tipoAcessoSelect').value;

    if (tipoAcesso === 'admin') {
        const senha = document.getElementById('loginSenhaAdmin').value.trim();
        if (senha === SENHA_ADMIN_MESTRE) {
            clienteAtual = { id: 0, nome: "Administrador Master", local: "prainha", selos: 0, indicacoesCompradoras: 0 };
            document.getElementById('navAdminBtn').style.display = 'block';
            document.getElementById('loginTelaInicio').style.display = 'none';
            mudarAba('admin');
            alert("🔒 Bem-vindo ao Painel Master Administrator, Contabilidade & RH!");
        } else {
            alert("❌ Senha Master incorreta!");
        }
    } else {
        const nome = document.getElementById('loginNome').value.trim();
        const wpp = document.getElementById('loginWpp').value.trim();
        const local = document.getElementById('loginLocal').value;

        if (!nome || !wpp) {
            alert('Por favor, informe seu Nome e WhatsApp.');
            return;
        }

        clienteAtual = { id: Date.now(), nome, wpp, local, selos: 0, indicacoesCompradoras: 0 };
        document.getElementById('clientNameDisplay').innerText = nome;
        document.getElementById('fidelityCardBox').style.display = 'block';
        
        const linkInd = `https://orla-inteligente.app/convite?ref=${encodeURIComponent(nome)}`;
        document.getElementById('linkIndicacaoInput').value = linkInd;

        document.getElementById('navAdminBtn').style.display = 'none';

        atualizarCartaoFidelidade();
        atualizarPainelIndique();
        mudarLocalizacao(local);

        document.getElementById('loginTelaInicio').style.display = 'none';
        mudarAba('vitrine');
    }
}

function sairDaPagina() {
    if (confirm("Deseja realmente sair e retornar à tela inicial de login?")) {
        clienteAtual = null;
        document.getElementById('loginNome').value = '';
        document.getElementById('loginWpp').value = '';
        document.getElementById('loginSenhaAdmin').value = '';
        document.getElementById('tipoAcessoSelect').value = 'usuario';
        alternarCamposLogin('usuario');
        document.getElementById('loginTelaInicio').style.display = 'flex';
    }
}

function mudarAba(abaId) {
    if (abaId === 'admin') {
        const navAdminBtn = document.getElementById('navAdminBtn');
        if (navAdminBtn.style.display === 'none') {
            alert("❌ Acesso restrito apenas para o perfil Administrador.");
            return;
        }
    }

    document.querySelectorAll('.aba-content').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.nav-tabs button').forEach(el => el.classList.remove('active'));

    const abaAlvo = document.getElementById(abaId === 'vitrineQuiosque' ? 'abaVitrineQuiosque' : `aba-${abaId}`);
    if (abaAlvo) {
        abaAlvo.style.display = 'block';
    }

    const botoesNav = document.querySelectorAll('.nav-tabs button');
    botoesNav.forEach(btn => {
        if (btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(abaId)) {
            btn.classList.add('active');
        }
    });

    if (abaId === 'vitrine') {
        renderizarStoriesQuiosques();
    } else if (abaId === 'ranking') {
        atualizarRankingTop10();
    } else if (abaId === 'admin') {
        atualizarPainelAdmin();
    }
}

// 🍔 Gestão de Produtos no Cadastro
function adicionarProdutoTemporario() {
    const nomeProd = document.getElementById('inputNomeProduto').value.trim();
    const precoProd = parseFloat(document.getElementById('inputPrecoProduto').value);

    if (!nomeProd || isNaN(precoProd)) {
        alert("Informe o nome e um preço válido para o produto.");
        return;
    }

    produtosTemporariosCadastro.push({ categoria: 'CARDÁPIO', nome: nomeProd, preco: precoProd });
    document.getElementById('inputNomeProduto').value = '';
    document.getElementById('inputPrecoProduto').value = '';
    renderizarListaProdutosTemporarios();
}

function renderizarListaProdutosTemporarios() {
    const container = document.getElementById('listaProdutosTemporariosContainer');
    if (!container) return;

    if (produtosTemporariosCadastro.length === 0) {
        container.innerHTML = `<p style="font-size: 0.75rem; color: #888; text-align: center;">Nenhum produto adicionado ainda.</p>`;
        return;
    }

    container.innerHTML = '';
    produtosTemporariosCadastro.forEach((p, index) => {
        let div = document.createElement('div');
        div.className = 'produto-card-adm';
        div.innerHTML = `
            <span><b>${p.nome}</b> - R$ ${p.preco.toFixed(2).replace('.', ',')}</span>
            <div>
                <button onclick="editarProdutoTemporario(${index})" style="background: #0288D1; color: white; border: none; padding: 2px 6px; border-radius: 3px; cursor: pointer; font-size: 0.7rem; margin-right: 4px;">Editar</button>
                <button onclick="removerProdutoTemporario(${index})" style="background: #D32F2F; color: white; border: none; padding: 2px 6px; border-radius: 3px; cursor: pointer; font-size: 0.7rem;">Apagar</button>
            </div>
        `;
        container.appendChild(div);
    });
}

function removerProdutoTemporario(index) {
    produtosTemporariosCadastro.splice(index, 1);
    renderizarListaProdutosTemporarios();
}

function editarProdutoTemporario(index) {
    let p = produtosTemporariosCadastro[index];
    document.getElementById('inputNomeProduto').value = p.nome;
    document.getElementById('inputPrecoProduto').value = p.preco;
    produtosTemporariosCadastro.splice(index, 1);
    renderizarListaProdutosTemporarios();
}

// 🌴 Renderizar Stories
function renderizarStoriesQuiosques() {
    const storiesContainer = document.getElementById('storiesContainer');
    const contadorStories = document.getElementById('contadorQuiosquesStories');
    if (!storiesContainer) return;

    contadorStories.innerText = quiosquesData.length;
    storiesContainer.innerHTML = '';

    quiosquesData.forEach(q => {
        let logo = q.logomarca || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=150';
        let div = document.createElement('div');
        div.className = 'story-item';
        div.onclick = () => abrirComandaQuiosque(q.id);
        div.innerHTML = `
            <div class="story-circle">
                <img src="${logo}" alt="${q.nome}">
            </div>
            <span class="story-name">${q.nome}</span>
        `;
        storiesContainer.appendChild(div);
    });
}

function mudarLocalizacao(polo) {
    renderizarStoriesQuiosques();
    const container = document.getElementById('listaQuiosquesContainer');
    if (!container) return;
    container.innerHTML = '';

    const filtrados = quiosquesData.filter(q => q.localizacao === polo);
    if (filtrados.length === 0) {
        container.innerHTML = `<p style="font-size:0.8rem; text-align:center; color:#666;">Nenhum quiosque cadastrado neste polo.</p>`;
        return;
    }

    filtrados.forEach(q => {
        let div = document.createElement('div');
        div.className = 'card quiosque-item';
        div.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <img src="${q.logomarca || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=150'}" style="width: 45px; height: 45px; border-radius: 50%; object-fit: cover; border: 2px solid var(--primary);">
                <div>
                    <h4 style="font-size: 0.9rem; color: var(--secondary);">${q.nome}</h4>
                    <p style="font-size: 0.75rem; color: #555;">Resp: ${q.responsavel} | Pag: ${q.pagamento}</p>
                </div>
            </div>
            <button class="btn-submit" style="margin-top: 10px; padding: 6px; font-size: 0.75rem;" onclick="abrirComandaQuiosque(${q.id})">Abrir Comanda Digital 📋</button>
        `;
        container.appendChild(div);
    });
}

function abrirComandaQuiosque(quiosqueId) {
    quiosqueSelecionadoId = quiosqueId;
    const q = quiosquesData.find(item => item.id === quiosqueId);
    if (!q) return;

    document.getElementById('nomeQuiosqueComanda').innerText = q.nome;
    if (clienteAtual && clienteAtual.name !== "Administrador Master") {
        document.getElementById('comandaCliente').value = clienteAtual.nome;
    }
    document.getElementById('comandaMesa').value = '';
    document.getElementById('comandaObservacoes').value = '';
    
    document.getElementById('statusRetornoPainel').style.display = 'none';
    document.getElementById('contadorEsperaComanda').style.display = 'none';

    const containerItens = document.getElementById('itensComandaContainer');
    containerItens.innerHTML = '';

    let categorias = {};
    q.produtos.forEach(prod => {
        let cat = prod.categoria || 'OUTROS';
        if (!categorias[cat]) categorias[cat] = [];
        categorias[cat].push(prod);
    });

    for (let cat in categorias) {
        let headerBg = cat.includes('ESPET') ? '#ffecb3' : '#b2ebf2';
        let headerColor = cat.includes('ESPET') ? '#8d6e63' : '#006064';

        let catDiv = document.createElement('div');
        catDiv.style.marginBottom = '15px';
        catDiv.innerHTML = `<h4 style="background: ${headerBg}; padding: 5px 10px; margin: 0 0 8px 0; border-radius: 4px; color: ${headerColor}; font-size: 13px;">${cat}</h4>`;

        categorias[cat].forEach(prod => {
            let itemRow = document.createElement('div');
            itemRow.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: 1px solid #eee; font-size: 13px;';
            
            // Lista de Compras Inteligente: botões de + e - para quantidade e exclusão
            itemRow.innerHTML = `
                <div style="display: flex; align-items: center; gap: 8px; flex: 1;">
                    <input type="checkbox" class="chk-item" value="${prod.nome}" data-preco="${prod.preco}" data-idprod="${prod.nome}" onchange="calcularTotalComanda()"> 
                    <span>${prod.nome} (R$ ${prod.preco.toFixed(2).replace('.', ',')})</span>
                </div>
                <div style="display: flex; align-items: center; gap: 4px;">
                    <button type="button" onclick="alterarQtdItemComanda('${prod.nome}', -1)" style="background: #ddd; border: none; width: 22px; height: 22px; border-radius: 3px; font-weight: bold; cursor: pointer;">-</button>
                    <span id="qtd-item-${prod.nome.replace(/\s+/g, '')}" style="font-size: 12px; font-weight: bold; width: 18px; text-align: center;">1</span>
                    <button type="button" onclick="alterarQtdItemComanda('${prod.nome}', 1)" style="background: var(--primary); color: white; border: none; width: 22px; height: 22px; border-radius: 3px; font-weight: bold; cursor: pointer;">+</button>
                    <button type="button" onclick="removerItemComandaElemento(this)" style="background: #D32F2F; color: white; border: none; padding: 2px 5px; border-radius: 3px; font-size: 10px; cursor: pointer; margin-left: 4px;" title="Excluir item">🗑️</button>
                </div>
            `;
            catDiv.appendChild(itemRow);
        });

        containerItens.appendChild(catDiv);
    }

    calcularTotalComanda();
    mudarAba('vitrineQuiosque');
}

function alterarQtdItemComanda(nomeProd, delta) {
    let key = `qtd-item-${nomeProd.replace(/\s+/g, '')}`;
    let el = document.getElementById(key);
    if (!el) return;
    let qtdAtual = parseInt(el.innerText) || 1;
    let novaQtd = qtdAtual + delta;
    if (novaQtd < 1) novaQtd = 1;
    el.innerText = novaQtd;
    calcularTotalComanda();
}

function removerItemComandaElemento(btn) {
    let row = btn.closest('div').parentNode;
    if (row) row.remove();
    calcularTotalComanda();
}

function calcularTotalComanda() {
    let total = 0;
    const checkboxes = document.querySelectorAll('.chk-item:checked');
    checkboxes.forEach(chk => {
        let preco = parseFloat(chk.getAttribute('data-preco')) || 0;
        let nomeProd = chk.getAttribute('data-idprod');
        let elQtd = document.getElementById(`qtd-item-${nomeProd.replace(/\s+/g, '')}`);
        let qtd = elQtd ? parseInt(elQtd.innerText) || 1 : 1;
        total += preco * qtd;
    });
    document.getElementById('valorTotalComanda').innerText = `R$ ${total.toFixed(2).replace('.', ',')}`;
}

let timerEsperaInterval = null;

function enviarComandaParaQuiosque(destinoOpcao = 'whatsapp') {
    const cliente = document.getElementById('comandaCliente').value.trim();
    const mesa = document.getElementById('comandaMesa').value.trim();
    const obs = document.getElementById('comandaObservacoes').value.trim();
    const checkboxes = document.querySelectorAll('.chk-item:checked');

    if (!cliente) {
        alert("Por favor, preencha o nome do cliente.");
        return;
    }
    if (checkboxes.length === 0) {
        alert("Selecione pelo menos um item na comanda.");
        return;
    }

    const q = quiosquesData.find(item => item.id === quiosqueSelecionadoId);
    if (!q) return;

    quiosqueUltimaCompraId = q.id;
    let itensSelecionadosStr = [];
    let valorTotal = 0;

    checkboxes.forEach(chk => {
        let preco = parseFloat(chk.getAttribute('data-preco')) || 0;
        let nomeProd = chk.getAttribute('data-idprod');
        let elQtd = document.getElementById(`qtd-item-${nomeProd.replace(/\s+/g, '')}`);
        let qtd = elQtd ? parseInt(elQtd.innerText) || 1 : 1;
        
        valorTotal += preco * qtd;
        itensSelecionadosStr.push(`${qtd}x ${nomeProd}`);
        adminConfig.itensVendidosHistorico[nomeProd] = (adminConfig.itensVendidosHistorico[nomeProd] || 0) + qtd;
    });

    adminConfig.pedidosRealizados += 1;
    adminConfig.faturamentoQuiosques += valorTotal;

    if (clienteAtual && clienteAtual.id !== 0) {
        if (clienteAtual.selos < 6) {
            clienteAtual.selos += 1;
            atualizarCartaoFidelidade();
        }
        if (clienteAtual.indicacoesCompradoras < 3) {
            clienteAtual.indicacoesCompradoras += 1;
            atualizarPainelIndique();
        }
    }

    const statusPainel = document.getElementById('statusRetornoPainel');
    statusPainel.style.display = 'block';
    statusPainel.innerText = "Seu pedido já foi entregue ao quiosque, aguarde....";

    const contadorBox = document.getElementById('contadorEsperaComanda');
    const tempoTexto = document.getElementById('tempoEsperaSegundos');
    contadorBox.style.display = 'block';
    
    let segundosRestantes = 300; 
    if (timerEsperaInterval) clearInterval(timerEsperaInterval);
    
    timerEsperaInterval = setInterval(() => {
        segundosRestantes--;
        let min = Math.floor(segundosRestantes / 60);
        let seg = segundosRestantes % 60;
        tempoTexto.innerText = `${min}:${seg < 10 ? '0' : ''}${seg}`;
        if (segundosRestantes <= 0) {
            clearInterval(timerEsperaInterval);
            tempoTexto.innerText = "Pronto / Entregando!";
        }
    }, 1000);

    let mensagemWhatsApp = `*COMANDA DIGITAL - ${q.nome}*%0aCliente: ${cliente}%0aMesa/Retirada: ${mesa || 'Não informada'}%0a%0a*Itens:*%0a- ${itensSelecionadosStr.join('%0a- ')}%0a%0aObs: ${obs || 'Nenhuma'}%0a*VALOR TOTAL: R$ ${valorTotal.toFixed(2).replace('.', ',')}*`;

    if (destinoOpcao === 'comparador') {
        alert(`✅ Pedido contabilizado no comparador de preços! Total: R$ ${valorTotal.toFixed(2).replace('.', ',')}`);
    } else {
        alert(`✅ Pedido gerado e enviado ao WhatsApp da Loja com sucesso!\n⭐️ +1 Selo adicionado ao seu cartão fidelidade!`);
        window.open(`https://wa.me/${q.whatsapp}?text=${mensagemWhatsApp}`, '_blank');
    }
}

// 🛒 Módulo de Supermercados, Promoções, Robô de Escuta, Comparativo e Pesquisa por Região
function abrirModalSupermercados() {
    document.getElementById('supermercadosModal').style.display = 'flex';
    mudarAbaSupermercado('ofertas');
}

function fecharModalSupermercados() {
    document.getElementById('supermercadosModal').style.display = 'none';
}

function mudarAbaSupermercado(subAba) {
    document.getElementById('supSecOfertas').style.display = subAba === 'ofertas' ? 'block' : 'none';
    document.getElementById('supSecComparativo').style.display = subAba === 'comparativo' ? 'block' : 'none';
    document.getElementById('supSecLista').style.display = subAba === 'lista' ? 'block' : 'none';

    document.getElementById('btnSupOfertas').style.background = subAba === 'ofertas' ? '#E65100' : '#ddd';
    document.getElementById('btnSupOfertas').style.color = subAba === 'ofertas' ? 'white' : '#333';

    document.getElementById('btnSupComparativo').style.background = subAba === 'comparativo' ? '#E65100' : '#ddd';
    document.getElementById('btnSupComparativo').style.color = subAba === 'comparativo' ? 'white' : '#333';

    document.getElementById('btnSupLista').style.background = subAba === 'lista' ? '#E65100' : '#ddd';
    document.getElementById('btnSupLista').style.color = subAba === 'lista' ? 'white' : '#333';

    if (subAba === 'ofertas') renderizarOfertasSupermercados();
    if (subAba === 'comparativo') renderizarComparativoPrecos();
    if (subAba === 'lista') renderizarListaComprasUsuario();
}

function cadastrarPromocaoSupermercado() {
    const mercado = document.getElementById('supMercadoNome').value.trim();
    const regiao = document.getElementById('supRegiaoNome').value.trim();
    const gerente = document.getElementById('supGerenteNome').value.trim();
    const endereco = document.getElementById('supEnderecoLoja').value.trim();
    const siteUrl = document.getElementById('supSiteUrl').value.trim();
    const produto = document.getElementById('supProdutoNome').value.trim();
    const preco = parseFloat(document.getElementById('supProdutoPreco').value);
    const compensa = document.getElementById('supCompensaSelect').value === 'sim';

    if (!mercado || !produto || isNaN(preco)) {
        alert("Preencha os campos obrigatórios do supermercado e da promoção.");
        return;
    }

    superOfertasData.push({ mercado, regiao, gerente, endereco, siteUrl, produto, preco, compensa });
    
    document.getElementById('supMercadoNome').value = '';
    document.getElementById('supRegiaoNome').value = '';
    document.getElementById('supGerenteNome').value = '';
    document.getElementById('supEnderecoLoja').value = '';
    document.getElementById('supSiteUrl').value = '';
    document.getElementById('supProdutoNome').value = '';
    document.getElementById('supProdutoPreco').value = '';

    renderizarOfertasSupermercados();
    alert("🤖 Robô de Promoções: Entrada direta por nome do mercado executada! Oferta varrida e lançada com sucesso.");
}

function renderizarOfertasSupermercados() {
    const container = document.getElementById('listaOfertasSupermercados');
    if (!container) return;

    if (superOfertasData.length === 0) {
        container.innerHTML = `<p style="font-size:0.75rem; color:#888; text-align:center;">Nenhuma oferta encontrada pelo robô.</p>`;
        return;
    }

    container.innerHTML = '';
    superOfertasData.forEach(o => {
        let div = document.createElement('div');
        div.style.cssText = 'background: #fafafa; padding: 8px; border-radius: 4px; margin-bottom: 6px; border: 1px solid #ddd; font-size: 0.8rem;';
        div.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <b>${o.produto}</b><br>
                    <small style="color: #666;">🏢 ${o.mercado} | 📍 ${o.regiao || 'Geral'}</small><br>
                    <small style="color: #444;">Gerente: ${o.gerente || 'Não inf.'} | End: ${o.endereco || 'Não inf.'}</small>
                </div>
                <div style="text-align: right;">
                    <strong style="color: #E65100; font-size: 0.9rem;">R$ ${o.preco.toFixed(2).replace('.', ',')}</strong><br>
                    ${o.siteUrl ? `<a href="${o.siteUrl}" target="_blank" style="font-size: 0.7rem; color: #0288D1; text-decoration: underline;">Abrir Site 🔗</a>` : ''}
                </div>
            </div>
        `;
        container.appendChild(div);
    });
}

function pesquisarMercadosRegiao() {
    const termo = document.getElementById('inputBuscaRegiaoSup').value.toLowerCase().trim();
    const container = document.getElementById('tabelaComparativoContainer');
    if (!container) return;

    const filtrados = superOfertasData.filter(o => 
        (o.regiao && o.regiao.toLowerCase().includes(termo)) || 
        (o.mercado && o.mercado.toLowerCase().includes(termo)) ||
        (o.produto && o.produto.toLowerCase().includes(termo))
    );

    renderizarComparativoPrecosFiltrados(filtrados);
}

function renderizarComparativoPrecos() {
    renderizarComparativoPrecosFiltrados(superOfertasData);
}

function renderizarComparativoPrecosFiltrados(lista) {
    const container = document.getElementById('tabelaComparativoContainer');
    if (!container) return;

    if (lista.length === 0) {
        container.innerHTML = `<p style="font-size:0.75rem; color:#888; text-align:center;">Nenhum mercado ou promoção encontrado para esta região.</p>`;
        return;
    }

    container.innerHTML = '';
    lista.forEach(o => {
        let statusCompensa = o.compensa ? 
            `<span style="color: #2e7d32; font-weight: bold; background: #e8f5e9; padding: 2px 6px; border-radius: 3px;">✅ Compensa Comprar</span>` : 
            `<span style="color: #c62828; font-weight: bold; background: #ffebee; padding: 2px 6px; border-radius: 3px;">❌ Não Compensa</span>`;

        let div = document.createElement('div');
        div.style.cssText = 'background: #f1f8e9; padding: 10px; border-radius: 4px; margin-bottom: 8px; border: 1px solid #c8e6c9; font-size: 0.8rem;';
        div.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                <span>🏷️ <b>${o.produto}</b></span>
                <span style="color: #2e7d32; font-weight: bold; font-size: 0.9rem;">R$ ${o.preco.toFixed(2).replace('.', ',')}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <small style="color: #333;">🏢 ${o.mercado} (📍 ${o.regiao || 'Geral'})</small><br>
                    ${statusCompensa}
                </div>
                ${o.siteUrl ? `<a href="${o.siteUrl}" target="_blank" style="font-size: 0.75rem; color: #0288D1; font-weight: bold;">Visitar Loja ➔</a>` : ''}
            </div>
        `;
        container.appendChild(div);
    });
}

function adicionarItemListaCompras() {
    const item = document.getElementById('inputItemListaCompras').value.trim();
    if (!item) return;

    listaComprasUsuario.push({ nome: item, qtd: 1 });
    document.getElementById('inputItemListaCompras').value = '';
    renderizarListaComprasUsuario();
}

function alterarQtdListaCompras(index, delta) {
    listaComprasUsuario[index].qtd += delta;
    if (listaComprasUsuario[index].qtd < 1) listaComprasUsuario[index].qtd = 1;
    renderizarListaComprasUsuario();
}

function excluirItemListaCompras(index) {
    listaComprasUsuario.splice(index, 1);
    renderizarListaComprasUsuario();
}

function renderizarListaComprasUsuario() {
    const container = document.getElementById('containerItensListaCompras');
    if (!container) return;

    if (listaComprasUsuario.length === 0) {
        container.innerHTML = `<p style="font-size: 0.75rem; color: #888; text-align: center;">Sua lista de compras inteligente está vazia.</p>`;
        return;
    }

    container.innerHTML = '';
    let valorTotalEstimado = 0;

    listaComprasUsuario.forEach((it, index) => {
        let subtotal = it.qtd * 5.00; // Valor médio estimado por item
        valorTotalEstimado += subtotal;

        let div = document.createElement('div');
        div.style.cssText = 'display: flex; justify-content: space-between; padding: 6px; background: #fafafa; border-bottom: 1px solid #eee; font-size: 0.8rem; align-items: center;';
        div.innerHTML = `
            <span><b>${it.nome}</b></span>
            <div style="display: flex; align-items: center; gap: 6px;">
                <button onclick="alterarQtdListaCompras(${index}, -1)" style="background: #ddd; border: none; width: 20px; height: 20px; border-radius: 3px; cursor: pointer; font-weight: bold;">-</button>
                <span>${it.qtd}</span>
                <button onclick="alterarQtdListaCompras(${index}, 1)" style="background: var(--primary); color: white; border: none; width: 20px; height: 20px; border-radius: 3px; cursor: pointer; font-weight: bold;">+</button>
                <button onclick="excluirItemListaCompras(${index})" style="background: #D32F2F; color: white; border: none; padding: 2px 5px; border-radius: 3px; cursor: pointer; font-size: 0.7rem;">Excluir</button>
            </div>
        `;
        container.appendChild(div);
    });

    let contadorDiv = document.getElementById('contadorValoresListaCompras');
    if (contadorDiv) {
        contadorDiv.innerText = `Total Estimado de Itens: R$ ${valorTotalEstimado.toFixed(2).replace('.', ',')}`;
    }
}

function compartilharListaComprasWpp() {
    if (listaComprasUsuario.length === 0) {
        alert("Sua lista está vazia.");
        return;
    }
    let itensStr = listaComprasUsuario.map(i => `${i.qtd}x ${i.nome}`).join('\n- ');
    const msg = encodeURIComponent(`🛒 *Lista de Compras Inteligente da Orla:*\n- ${itensStr}`);
    window.open(`https://wa.me/?text=${msg}`, '_blank');
}

// 💬 Chat
function enviarMensagemChat() {
    const input = document.getElementById('chatInputMensagem');
    const texto = input.value.trim();
    if (!texto) return;

    adicionarMensagemChatBox(clienteAtual ? clienteAtual.nome : "Visitante", texto, "sent", "text");
    input.value = '';

    setTimeout(() => {
        adicionarMensagemChatBox("Orla Bot", "Recebido! Aproveite a orla com responsabilidade 🌊", "received", "text");
    }, 1200);
}

function enviarMidiaChat(input) {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        const reader = new FileReader();

        reader.onload = function(e) {
            const tipoMidia = file.type.startsWith('video') ? 'video' : 'image';
            adicionarMensagemChatBox(clienteAtual ? clienteAtual.nome : "Visitante", e.target.result, "sent", tipoMidia);
        }
        reader.readAsDataURL(file);
    }
}

function adicionarMensagemChatBox(remetente, conteudo, tipoEnvio, tipoMidia) {
    const chatBox = document.getElementById('chatBoxContainer');
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-msg ${tipoEnvio}`;

    let htmlConteudo = `<b>${remetente}:</b> `;
    if (tipoMidia === 'text') {
        htmlConteudo += `${conteudo}`;
    } else if (tipoMidia === 'image') {
        htmlConteudo += `<br><img src="${conteudo}">`;
    } else if (tipoMidia === 'video') {
        htmlConteudo += `<br><video src="${conteudo}" controls></video>`;
    }

    msgDiv.innerHTML = htmlConteudo;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function atualizarCartaoFidelidade() {
    if (!clienteAtual) return;
    const totalSelos = clienteAtual.selos;
    const statusText = document.getElementById('fidelityStatusText');
    if (statusText) statusText.innerText = `${totalSelos}/6 Selos`;

    for (let i = 1; i <= 6; i++) {
        const circle = document.getElementById(`stamp-${i}`);
        if (circle) {
            if (i <= totalSelos) {
                circle.classList.add('active');
            } else {
                circle.classList.remove('active');
            }
        }
    }
    const btnCofre = document.getElementById('btnAbrirCofreMain');
    if (btnCofre) btnCofre.style.display = totalSelos >= 6 ? 'block' : 'none';
}

function atualizarPainelIndique() {
    if (!clienteAtual) return;
    const disp = document.getElementById('indIndicacoesDisplay');
    if (disp) disp.innerText = `${clienteAtual.indicacoesCompradoras} / 3 Amigos`;
}

function compartilharIndicação() {
    if (!clienteAtual) return;
    const link = document.getElementById('linkIndicacaoInput').value;
    if (clienteAtual.indicacoesCompradoras < 3) {
        alert("⚠️ Regra de Indicação Restrita: É necessário completar 3 cadastros com compras efetivadas para liberar a premiação total.");
    }
    const msg = encodeURIComponent(`Fala, meu irmão! Tô usando o app da Orla para pedir nos quiosques e ganhar brindes. Entra pelo meu link para garantir um brinde: ${link}`);
    window.open(`https://wa.me/?text=${msg}`, '_blank');
}

function chamarMobilidade(servico) {
    if (servico === 'uber') {
        window.open('https://m.uber.com', '_blank');
    } else if (servico === '99') {
        window.open('https://99app.com', '_blank');
    }
}

function abrirSocial(rede) {
    const modal = document.getElementById('socialModal');
    const title = document.getElementById('socialModalTitle');
    const container = document.getElementById('socialContainer');
    modal.style.display = 'flex';

    if (rede === 'tiktok') {
        title.innerText = '🎵 TikTok';
        container.innerHTML = `<iframe src="https://www.tiktok.com" style="width:100%; height:100%; border:none;"></iframe>`;
    } else if (rede === 'kwai') {
        title.innerText = '⚡ Kwai';
        container.innerHTML = `<iframe src="https://www.kwai.com" style="width:100%; height:100%; border:none;"></iframe>`;
    } else if (rede === 'instagram') {
        title.innerText = '📸 Instagram';
        container.innerHTML = `<iframe src="https://www.instagram.com" style="width:100%; height:100%; border:none;"></iframe>`;
    } else if (rede === 'whatsapp') {
        title.innerText = '💬 WhatsApp';
        window.open('https://wa.me/?text=Olá%20conheça%20o%20Marketplace%20da%20Orla', '_blank');
        fecharSocial();
    } else if (rede === 'telegram') {
        title.innerText = '✈️ Telegram';
        window.open('https://t.me', '_blank');
        fecharSocial();
    } else if (rede === 'fb') {
        title.innerText = '👥 Facebook';
        container.innerHTML = `<iframe src="https://m.facebook.com" style="width:100%; height:100%; border:none;"></iframe>`;
    }
}

function fecharSocial() {
    document.getElementById('socialModal').style.display = 'none';
    document.getElementById('socialContainer').innerHTML = '';
}

// Gravação de Live e Links Sociais com Controles Completos
let mediaRecorderLive = null;
let recordedBlobsLive = [];

async function iniciarTransmissaoReporter() {
    const titulo = document.getElementById('reporterTitulo').value.trim();
    if (!titulo) {
        alert("Preencha o título da transmissão.");
        return;
    }

    try {
        mediaStreamAtiva = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        const videoElement = document.getElementById('liveVideoFeed');
        videoElement.srcObject = mediaStreamAtiva;
        videoElement.style.display = 'block';

        document.getElementById('livePlaceholder').style.display = 'none';
        document.getElementById('btnEncerrarLive').style.display = 'inline-block';
        document.getElementById('btnPausarLive').style.display = 'inline-block';
        document.getElementById('btnGravarLive').style.display = 'inline-block';

        // Inicializar gravador
        recordedBlobsLive = [];
        mediaRecorderLive = new MediaRecorder(mediaStreamAtiva, { mimeType: 'video/webm' });
        mediaRecorderLive.ondataavailable = (event) => {
            if (event.data && event.data.size > 0) {
                recordedBlobsLive.push(event.data);
            }
        };
        mediaRecorderLive.start(100);

        alert(`🔴 Transmissão e Gravação iniciadas, ${clienteAtual.nome}! Você é o Repórter da Orla.`);
    } catch (error) {
        alert("Não foi possível acessar a câmera. Verifique as permissões do navegador.");
    }
}

function pausarContinuarLive() {
    if (!mediaRecorderLive) return;
    const btnPausar = document.getElementById('btnPausarLive');
    if (mediaRecorderLive.state === "recording") {
        mediaRecorderLive.pause();
        btnPausar.innerText = "▶️ Continuar";
        alert("⏸️ Transmissão pausada.");
    } else if (mediaRecorderLive.state === "paused") {
        mediaRecorderLive.resume();
        btnPausar.innerText = "⏸️ Pausar";
        alert("▶️ Transmissão retomada.");
    }
}

function encerrarTransmissaoReporter() {
    if (mediaRecorderLive && mediaRecorderLive.state !== "inactive") {
        mediaRecorderLive.stop();
    }
    if (mediaStreamAtiva) {
        mediaStreamAtiva.getTracks().forEach(track => track.stop());
        mediaStreamAtiva = null;
    }
    const videoElement = document.getElementById('liveVideoFeed');
    videoElement.srcObject = null;
    videoElement.style.display = 'none';

    document.getElementById('livePlaceholder').style.display = 'flex';
    document.getElementById('liveStatusText').innerText = 'Transmissão encerrada e salva!';
    document.getElementById('btnEncerrarLive').style.display = 'none';
    document.getElementById('btnPausarLive').style.display = 'none';
    document.getElementById('btnGravarLive').style.display = 'none';

    // Download automático do vídeo gravado
    setTimeout(() => {
        const blob = new Blob(recordedBlobsLive, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'reporter-orla-live.webm';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 100);
    }, 500);

    alert("⏹️ Live encerrada e arquivo de vídeo baixado com sucesso!");
}

function compartilharLiveRedesSociais(rede) {
    const texto = encodeURIComponent("🎥 Acompanhe agora a transmissão ao vivo do Repórter da Orla! Venha conferir os bastidores em tempo real.");
    if (rede === 'whatsapp') {
        window.open(`https://wa.me/?text=${texto}`, '_blank');
    } else if (rede === 'telegram') {
        window.open(`https://t.me/share/url?url=https://orla-inteligente.app&text=${texto}`, '_blank');
    } else if (rede === 'facebook') {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=https://orla-inteligente.app`, '_blank');
    }
}

function abrirModalCofre() {
    document.getElementById('cofreSenhaInput').value = '';
    document.getElementById('cofreResultadoBox').style.display = 'none';
    document.getElementById('cofreModal').style.display = 'flex';
}

function fecharCofre() {
    document.getElementById('cofreModal').style.display = 'none';
}

function tentarAbrirCofre() {
    const senhaDigitada = document.getElementById('cofreSenhaInput').value.trim();
    if (senhaDigitada.length !== 4) {
        alert("A senha deve ter 4 dígitos.");
        return;
    }
    const quiosqueAlvo = quiosquesData.find(item => item.id === quiosqueUltimaCompraId) || quiosquesData[0];

    if (senhaDigitada === quiosqueAlvo.senhaCofre) {
        document.getElementById('cofrePremioTexto').innerText = `${quiosqueAlvo.nome}: ${quiosqueAlvo.premioCofre}`;
        document.getElementById('cofreResultadoBox').style.display = 'block';
    } else {
        alert("❌ Senha incorreta!");
    }
}

// Mini Bolão com Pix, QR Code, Validade de 24h e Exibição ao Vivo
function comprarBolao() {
    const numeros = document.getElementById('bolaoNumeros').value.trim();
    if (!numeros) {
        alert("Digite os números do Mini Bolão.");
        return;
    }
    document.getElementById('modalPagamentoPixBolao').style.display = 'flex';
}

function confirmarPagamentoPixBolao() {
    adminConfig.arrecadacaoBolao += 3.00;
    const poteDisplay = document.getElementById('poteBolaoDisplay');
    if (poteDisplay) poteDisplay.innerText = `R$ ${adminConfig.arrecadacaoBolao.toFixed(2)}`;
    
    document.getElementById('modalPagamentoPixBolao').style.display = 'none';
    document.getElementById('bolaoNumeros').value = '';
    
    // Gerar comprovante visual de aposta
    document.getElementById('comprovanteApostaBox').style.display = 'block';
    document.getElementById('comprovanteTextoInfo').innerText = `Aposta registrada com sucesso! Validade do bilhete: 24h (Reversão automática para o próximo bolão se não resgatado).`;
    alert(`🎲 Pagamento via Pix confirmado! Comprovante emitido com sucesso.`);
}

function fecharModalPixBolao() {
    document.getElementById('modalPagamentoPixBolao').style.display = 'none';
}

// Sorteio ao vivo relógio e timer
setInterval(() => {
    const agora = new Date();
    const dataSorteio = new Date(agora.getTime() + 86400000); // 24h no futuro
    const elSorteio = document.getElementById('exibicaoAoVivoSorteio');
    if (elSorteio) {
        elSorteio.innerText = `Próximo Sorteio: ${dataSorteio.toLocaleDateString()} às 20:00`;
    }
}, 1000);

// Galeria Momento Lazer
function publicarMomentoLazer(input) {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        const reader = new FileReader();
        reader.onload = function(e) {
            const container = document.getElementById('galeriaLazerContainer');
            let card = document.createElement('div');
            card.style.cssText = 'background: white; border-radius: 6px; padding: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); text-align: center;';
            card.innerHTML = `
                <img src="${e.target.result}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 4px; margin-bottom: 5px;">
                <p style="font-size: 0.75rem; font-weight: bold; color: var(--secondary);">${clienteAtual ? clienteAtual.nome : 'Visitante'}</p>
            `;
            container.prepend(card);
            alert("📸 Foto publicada com sucesso no Momento Lazer!");
        }
        reader.readAsDataURL(file);
    }
}

function solicitarFranquia() {
    const cidade = document.getElementById('franqCidade').value.trim();
    const wpp = document.getElementById('franqWpp').value.trim();

    if (!cidade || !wpp) {
        alert("Preencha todos os campos para solicitar sua franquia.");
        return;
    }

    franquiasData.push({
        id: franquiasData.length + 1,
        nome: clienteAtual ? clienteAtual.nome : "Parceiro",
        cidade: cidade,
        whatsapp: wpp,
        status: "Ativa",
        faturamentoPraça: 1500.00,
        historicoOperacoes: "Nova franquia recém implantada na região.",
        oQueDáCerto: "Estrutura inicial pronta para captação de quiosques.",
        oQueMelhorar: "Intensificar divulgação comercial local."
    });

    adminConfig.faturamentoFranquias += 1500.00;

    alert(`🚀 Solicitação e Setup registrados com sucesso!\nPraça de ${cidade} adicionada à rede master.`);
    document.getElementById('franqCidade').value = '';
    document.getElementById('franqWpp').value = '';
}

function salvarNovoQuiosque() {
    const local = document.getElementById('novoLocalSelect').value;
    const nome = document.getElementById('novoNome').value.trim();
    const resp = document.getElementById('novoResp').value.trim();
    const wpp = document.getElementById('novoWpp').value.trim();
    const pag = document.getElementById('novoPag').value.trim();
    const senhaCofre = document.getElementById('novoSenhaCofre').value.trim();
    const premioCofre = document.getElementById('novoPremioCofre').value.trim();
    const logoInput = document.getElementById('novoLogoInput');

    if (!nome || !resp || !wpp || senhaCofre.length !== 4) {
        alert('Preencha os campos obrigatórios e senha de cofre com 4 dígitos.');
        return;
    }

    let logomarcaUrl = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=150';
    if (logoInput.files && logoInput.files[0]) {
        logomarcaUrl = URL.createObjectURL(logoInput.files[0]);
    }

    let quiosqueExistente = quiosquesData.find(q => q.nome.toLowerCase() === nome.toLowerCase());

    if (quiosqueExistente) {
        quiosqueExistente.responsavel = resp;
        quiosqueExistente.whatsapp = wpp;
        quiosqueExistente.pagamento = pag || quiosqueExistente.pagamento;
        if (logoInput.files && logoInput.files[0]) quiosqueExistente.logomarca = logomarcaUrl;
        quiosqueExistente.senhaCofre = senhaCofre;
        quiosqueExistente.premioCofre = premioCofre || quiosqueExistente.premioCofre;
        if (produtosTemporariosCadastro.length > 0) {
            quiosqueExistente.produtos = [...produtosTemporariosCadastro];
        }
        alert(`✅ Quiosque "${nome}" atualizado com sucesso com novos produtos!`);
    } else {
        let produtosFinais = produtosTemporariosCadastro.length > 0 ? [...produtosTemporariosCadastro] : [{ categoria: 'OUTROS', nome: 'Item Padrão', preco: 15.00 }];
        const novoId = quiosquesData.length > 0 ? quiosquesData[quiosquesData.length - 1].id + 1 : 1;
        
        quiosquesData.push({
            id: novoId, localizacao: local, nome, responsavel: resp, whatsapp: wpp,
            pagamento: pag || 'Pix', logomarca: logomarcaUrl, senhaCofre, 
            premioCofre: premioCofre || 'Brinde especial!', produtos: produtosFinais
        });
        alert('Novo quiosque cadastrado com sucesso!');
    }

    document.getElementById('novoNome').value = '';
    document.getElementById('novoResp').value = '';
    document.getElementById('novoWpp').value = '';
    document.getElementById('novoPag').value = '';
    document.getElementById('novoSenhaCofre').value = '';
    document.getElementById('novoPremioCofre').value = '';
    logoInput.value = '';
    produtosTemporariosCadastro = [];
    renderizarListaProdutosTemporarios();

    mudarLocalizacao(local);
}

function atualizarRankingTop10() {
    const container = document.getElementById('topTenContainer');
    if (!container) return;
    const sortedItens = Object.entries(adminConfig.itensVendidosHistorico)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

    if (sortedItens.length === 0) {
        container.innerHTML = `<p style="font-size: 0.8rem; color: #888; text-align: center;">Nenhum produto vendido.</p>`;
        return;
    }

    container.innerHTML = '';
    sortedItens.forEach(([item, qtd], index) => {
        let div = document.createElement('div');
        div.className = 'ranking-item';
        div.innerHTML = `
            <div style="display: flex; align-items: center;">
                <span class="ranking-pos">${index + 1}º</span>
                <span>${item}</span>
            </div>
            <strong style="color: var(--secondary);">${qtd} pedidos</strong>
        `;
        container.appendChild(div);
    });
}

function atualizarPainelAdmin() {
    const faturamentoQuiosques = adminConfig.faturamentoQuiosques;
    const arrecadacaoBolao = adminConfig.arrecadacaoBolao;
    const faturamentoFranquias = adminConfig.faturamentoFranquias;
    const faturamentoTotalConsolidado = faturamentoQuiosques + arrecadacaoBolao + faturamentoFranquias;

    const elContadorFrq = document.getElementById('contadorFranqueadosAtivos');
    const elFatQ = document.getElementById('adminFaturamentoQuiosques');
    const elArrecB = document.getElementById('adminArrecadacaoBolao');
    const elFatF = document.getElementById('adminFaturamentoFranquias');
    const elFatT = document.getElementById('adminFaturamentoTotal');

    if (elContadorFrq) elContadorFrq.innerText = franquiasData.length;
    if (elFatQ) elFatQ.innerText = `R$ ${faturamentoQuiosques.toFixed(2)}`;
    if (elArrecB) elArrecB.innerText = `R$ ${arrecadacaoBolao.toFixed(2)}`;
    if (elFatF) elFatF.innerText = `R$ ${faturamentoFranquias.toFixed(2)}`;
    if (elFatT) elFatT.innerText = `R$ ${faturamentoTotalConsolidado.toFixed(2)}`;

    // Renderizar Franquias com opção de exclusão interativa
    const franquiasContainer = document.getElementById('listaFranquiasAdminContainer');
    if (franquiasContainer) {
        if (franquiasData.length === 0) {
            franquiasContainer.innerHTML = `<p style="font-size: 0.75rem; color: #888;">Nenhuma franquia ativa.</p>`;
        } else {
            franquiasContainer.innerHTML = '';
            franquiasData.forEach((f, idx) => {
                let row = document.createElement('div');
                row.className = 'franquia-row';
                row.innerHTML = `
                    <div onclick="abrirAuditoriaFranquia(${f.id})" style="flex: 1;">
                        <strong>🏢 ${f.cidade}</strong><br>
                        <small style="color: #555;">Franqueado: ${f.nome} (${f.whatsapp})</small>
                    </div>
                    <div style="display: flex; gap: 5px; align-items: center;">
                        <button onclick="abrirAuditoriaFranquia(${f.id})" style="background: #0288D1; color: white; border: none; padding: 4px 8px; border-radius: 4px; font-size: 0.7rem; cursor: pointer;">Auditar</button>
                        <button onclick="excluirFranquiaMaster(${idx})" style="background: #D32F2F; color: white; border: none; padding: 4px 8px; border-radius: 4px; font-size: 0.7rem; cursor: pointer;">Excluir</button>
                    </div>
                `;
                franquiasContainer.appendChild(row);
            });
        }
    }

    // Renderizar Mini Escritório Contábil e de RH
    renderizarEscritorioContabilRH();
}

function excluirFranquiaMaster(index) {
    if (confirm("Deseja realmente excluir esta franquia da rede master?")) {
        franquiasData.splice(index, 1);
        atualizarPainelAdmin();
        alert("Franquia excluída com sucesso.");
    }
}

// Mini Escritório Contábil e de RH completo
function renderizarEscritorioContabilRH() {
    const containerFuncs = document.getElementById('listaFuncionariosRHContainer');
    if (!containerFuncs) return;

    if (funcionariosRHData.length === 0) {
        containerFuncs.innerHTML = `<p style="font-size: 0.75rem; color: #888;">Nenhum funcionário ou sócio cadastrado.</p>`;
    } else {
        containerFuncs.innerHTML = '';
        let totalBruto = 0;
        let totalDescontos = 0;

        funcionariosRHData.forEach((func, idx) => {
            totalBruto += func.salarioBruto;
            totalDescontos += func.descontos;
            let liquido = func.salarioBruto - func.descontos;

            let div = document.createElement('div');
            div.style.cssText = 'background: #f9f9f9; padding: 8px; border-radius: 4px; margin-bottom: 6px; border: 1px solid #ddd; font-size: 0.8rem;';
            div.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <b>${func.nome}</b> (${func.cargo})<br>
                        <small style="color: #555;">📍 ${func.endereco} | 📞 ${func.telefone} | ✉️ ${func.email}</small><br>
                        <small style="color: #2e7d32;">Bruto: R$ ${func.salarioBruto.toFixed(2)} | Descontos: R$ ${func.descontos.toFixed(2)} | <b>Líquido: R$ ${liquido.toFixed(2)}</b></small>
                    </div>
                    <div style="display: flex; gap: 4px; flex-direction: column;">
                        <button onclick="emitirPdfValoresPagos(${func.id})" style="background: #2E7D32; color: white; border: none; padding: 3px 6px; border-radius: 3px; font-size: 0.7rem; cursor: pointer;">PDF Holerite</button>
                        <button onclick="excluirFuncionarioRH(${idx})" style="background: #D32F2F; color: white; border: none; padding: 3px 6px; border-radius: 3px; font-size: 0.7rem; cursor: pointer;">Excluir</button>
                    </div>
                </div>
            `;
            containerFuncs.appendChild(div);
        });

        let totalLiquido = totalBruto - totalDescontos;
        document.getElementById('relatorioContabilResumo').innerHTML = `
            <b>Folha de Pagamento Consolidada:</b><br>
            • Total Bruto: R$ ${totalBruto.toFixed(2)}<br>
            • Total Descontos: R$ ${totalDescontos.toFixed(2)}<br>
            • <b>Total Líquido: R$ ${totalLiquido.toFixed(2)}</b>
        `;
    }
}

function cadastrarFuncionarioRH() {
    const nome = document.getElementById('rhNome').value.trim();
    const cargo = document.getElementById('rhCargo').value.trim();
    const endereco = document.getElementById('rhEndereco').value.trim();
    const telefone = document.getElementById('rhTelefone').value.trim();
    const email = document.getElementById('rhEmail').value.trim();
    const bruto = parseFloat(document.getElementById('rhBruto').value);
    const descontos = parseFloat(document.getElementById('rhDescontos').value) || 0;

    if (!nome || !cargo || isNaN(bruto)) {
        alert("Preencha os campos obrigatórios do funcionário/sócio.");
        return;
    }

    funcionariosRHData.push({
        id: funcionariosRHData.length + 1,
        nome, cargo, endereco, telefone, email, salarioBruto: bruto, descontos
    });

    document.getElementById('rhNome').value = '';
    document.getElementById('rhCargo').value = '';
    document.getElementById('rhEndereco').value = '';
    document.getElementById('rhTelefone').value = '';
    document.getElementById('rhEmail').value = '';
    document.getElementById('rhBruto').value = '';
    document.getElementById('rhDescontos').value = '';

    renderizarEscritorioContabilRH();
    alert("✅ Funcionário / Sócio cadastrado com sucesso!");
}

function excluirFuncionarioRH(index) {
    if (confirm("Deseja excluir este registro de RH?")) {
        funcionariosRHData.splice(index, 1);
        renderizarEscritorioContabilRH();
    }
}

function emitirPdfValoresPagos(funcId) {
    const f = funcionariosRHData.find(item => item.id === funcId);
    if (!f) return;
    let liquido = f.salarioBruto - f.descontos;
    alert(`📄 [EMISSÃO DE PDF DE VALORES PAGOS]\n\nColaborador: ${f.nome}\nCargo: ${f.cargo}\nSalário Bruto: R$ ${f.salarioBruto.toFixed(2)}\nDescontos: R$ ${f.descontos.toFixed(2)}\nValor Líquido Pago: R$ ${liquido.toFixed(2)}\n\n(PDF gerado e pronto para envio ao contador!)`);
}

function enviarRelatorioContadorWpp() {
    let totalBruto = funcionariosRHData.reduce((acc, f) => acc + f.salarioBruto, 0);
    let totalDescontos = funcionariosRHData.reduce((acc, f) => acc + f.descontos, 0);
    let totalLiquido = totalBruto - totalDescontos;

    let msg = encodeURIComponent(`📊 *RELATÓRIO CONTÁBIL & FOLHA DE PAGAMENTO*\n\n• Total Bruto: R$ ${totalBruto.toFixed(2)}\n• Descontos: R$ ${totalDescontos.toFixed(2)}\n• Líquido: R$ ${totalLiquido.toFixed(2)}\n\nEnviado diretamente ao escritório de contabilidade.`);
    window.open(`https://wa.me/?text=${msg}`, '_blank');
}

function abrirAuditoriaFranquia(id) {
    const f = franquiasData.find(item => item.id === id);
    if (!f) return;

    document.getElementById('auditoriaTitulo').innerText = `Auditoria: ${f.cidade}`;
    const conteudo = document.getElementById('auditoriaDetalhesConteudo');
    conteudo.innerHTML = `
        <p><b>Franqueado:</b> ${f.nome}</p>
        <p><b>WhatsApp:</b> ${f.whatsapp}</p>
        <p><b>Status:</b> <span style="color: #2E7D32;">${f.status}</span></p>
        <p><b>Faturamento da Praça:</b> R$ ${f.faturamentoPraça.toFixed(2)}</p>
        <hr style="margin: 8px 0; border: 0; border-top: 1px solid #ddd;">
        <p><b>Histórico de Operações:</b><br>${f.historicoOperacoes}</p>
        <p style="margin-top: 6px; color: #2E7D32;"><b>O que está dando certo:</b><br>${f.oQueDáCerto}</p>
        <p style="margin-top: 6px; color: #D32F2F;"><b>O que precisa melhorar:</b><br>${f.oQueMelhorar}</p>
    `;

    document.getElementById('auditoriaModal').style.display = 'flex';
}

function fecharAuditoria() {
    document.getElementById('auditoriaModal').style.display = 'none';
}
