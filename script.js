let clienteAtual = null;
let quiosqueSelecionadoId = null;
let quiosqueUltimaCompraId = null;
let mediaStreamAtiva = null;
const SENHA_ADMIN_MESTRE = "1983"; // Senha padrão para abrir o Admin

let adminConfig = {
    pedidosRealizados: 0,
    faturamentoQuiosques: 0.00,
    arrecadacaoBolao: 0.00,
    faturamentoFranquias: 1500.00,
    itensVendidosHistorico: {}
};

let franquiasData = [
    { id: 1, nome: "Carlos Eduardo", cidade: "Brasília / DF", whatsapp: "5561999999999", status: "Ativa (Setup + Royalties)", faturamentoPraça: 3500.00 }
];

let quiosquesData = [
    { 
        id: 1, 
        localizacao: 'prainha', 
        nome: 'Quiosque da Prainha', 
        responsavel: 'Seu Carlos', 
        whatsapp: '5561999999999', 
        pagamento: 'Pix / Dinheiro', 
        senhaCofre: '1234',
        premioCofre: '10% de desconto na próxima porção!',
        produtos: [{ nome: 'Cerveja Lata', desc: 'Gelada 350ml', preco: 'R$ 8,00' }, { nome: 'Água Mineral', desc: '500ml', preco: 'R$ 4,00' }] 
    },
    { 
        id: 2, 
        localizacao: 'pontao', 
        nome: 'Quiosque do Pontão Sul', 
        responsavel: 'Mariana', 
        whatsapp: '5561988888888', 
        pagamento: 'Pix / Cartão', 
        senhaCofre: '4321',
        premioCofre: 'Ganhou uma Água de Coco grátis!',
        produtos: [{ nome: 'Água de Coco', desc: 'Natural', preco: 'R$ 9,00' }, { nome: 'Espetinho', desc: 'Carne ou Frango', preco: 'R$ 12,00' }] 
    }
];

function entrarNaPlataforma() {
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

    atualizarCartaoFidelidade();
    atualizarPainelIndique();
    mudarLocalizacao(local);

    // Fecha a tela de login inicial
    document.getElementById('loginTelaInicio').style.display = 'none';
}

function sairDaPagina() {
    if (confirm("Deseja realmente sair e retornar à tela inicial de login?")) {
        clienteAtual = null;
        document.getElementById('loginNome').value = '';
        document.getElementById('loginWpp').value = '';
        document.getElementById('loginTelaInicio').style.display = 'flex';
        mudarAba('vitrine');
    }
}

function mudarAba(abaId) {
    if (abaId === 'admin') {
        // Exige senha antes de abrir o painel admin
        document.getElementById('senhaAdminInput').value = '';
        document.getElementById('adminSenhaModal').style.display = 'flex';
        return;
    }

    document.querySelectorAll('.aba-content').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.nav-tabs button').forEach(el => el.classList.remove('active'));

    document.getElementById(`aba-${abaId}`).style.display = 'block';
    
    // Ativa visualmente o botão correspondente
    const botoesNav = document.querySelectorAll('.nav-tabs button');
    botoesNav.forEach(btn => {
        if(btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(abaId)) {
            btn.classList.add('active');
        }
    });

    if (abaId === 'ranking') {
        atualizarRankingTop10();
    }
}

function validarSenhaAdmin() {
    const senhaDigitada = document.getElementById('senhaAdminInput').value.trim();
    if (senhaDigitada === SENHA_ADMIN_MESTRE) {
        document.getElementById('adminSenhaModal').style.display = 'none';
        
        document.querySelectorAll('.aba-content').forEach(el => el.style.display = 'none');
        document.querySelectorAll('.nav-tabs button').forEach(el => el.classList.remove('active'));
        
        document.getElementById('aba-admin').style.display = 'block';
        
        // Ativa botão admin
        const botoesNav = document.querySelectorAll('.nav-tabs button');
        botoesNav.forEach(btn => {
            if(btn.getAttribute('onclick') && btn.getAttribute('onclick').includes('admin')) {
                btn.classList.add('active');
            }
        });

        atualizarPainelAdmin();
    } else {
        alert("❌ Senha incorreta! Acesso negado.");
    }
}

function fecharAdminSenha() {
    document.getElementById('adminSenhaModal').style.display = 'none';
}

function mudarLocalizacao(polo) {
    const container = document.getElementById('listaQuiosquesContainer');
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
            <h4 style="font-size: 0.9rem; color: var(--secondary);">${q.nome}</h4>
            <p style="font-size: 0.75rem; color: #555;">Resp: ${q.responsavel} | Pag: ${q.pagamento}</p>
            <button class="btn-submit" style="margin-top: 8px; padding: 6px; font-size: 0.75rem;" onclick="abrirModalProdutos(${q.id})">Ver Vitrine & Pedir 🛍️</button>
        `;
        container.appendChild(div);
    });
}

function atualizarCartaoFidelidade() {
    if (!clienteAtual) return;
    const totalSelos = clienteAtual.selos;
    document.getElementById('fidelityStatusText').innerText = `${totalSelos}/6 Selos`;

    for (let i = 1; i <= 6; i++) {
        const circle = document.getElementById(`stamp-${i}`);
        if (i <= totalSelos) {
            circle.classList.add('active');
        } else {
            circle.classList.remove('active');
        }
    }
    document.getElementById('btnAbrirCofreMain').style.display = totalSelos >= 6 ? 'block' : 'none';
}

function atualizarPainelIndique() {
    if (!clienteAtual) return;
    document.getElementById('indIndicacoesDisplay').innerText = `${clienteAtual.indicacoesCompradoras} / 3 Amigos`;
}

function compartilharIndicação() {
    if (!clienteAtual) return;
    const link = document.getElementById('linkIndicacaoInput').value;
    const msg = encodeURIComponent(`Fala, meu irmão! Tô usando o app da Orla para pedir nos quiosques e ganhar brindes. Entra pelo meu link para garantir um brinde: ${link}`);
    window.open(`https://wa.me/?text=${msg}`, '_blank');
}

// BOTÕES DE MOBILIDADE E REDES SOCIAIS
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

// REPÓRTER DA ORLA
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
        document.getElementById('btnEncerrarLive').style.display = 'block';

        alert(`🔴 Transmissão iniciada com sucesso, ${clienteAtual.nome}! Você agora é o Repórter da Orla.`);
    } catch (error) {
        alert("Não foi possível acessar a câmera. Verifique as permissões do navegador.");
    }
}

function encerrarTransmissaoReporter() {
    if (mediaStreamAtiva) {
        mediaStreamAtiva.getTracks().forEach(track => track.stop());
        mediaStreamAtiva = null;
    }
    const videoElement = document.getElementById('liveVideoFeed');
    videoElement.srcObject = null;
    videoElement.style.display = 'none';

    document.getElementById('livePlaceholder').style.display = 'flex';
    document.getElementById('liveStatusText').innerText = 'Transmissão encerrada.';
    document.getElementById('btnEncerrarLive').style.display = 'none';
    alert("Transmissão encerrada.");
}

function abrirModalProdutos(quiosqueId) {
    quiosqueSelecionadoId = quiosqueId;
    const q = quiosquesData.find(item => item.id === quiosqueId);
    if (!q) return;

    document.getElementById('modalQuiosqueNome').innerText = q.nome;
    const listaDiv = document.getElementById('modalProdutosLista');
    listaDiv.innerHTML = '';

    q.produtos.forEach((prod, index) => {
        let pItem = document.createElement('div');
        pItem.className = 'produto-card';
        pItem.innerHTML = `
            <div>
                <strong style="font-size: 0.85rem;">${prod.nome}</strong><br>
                <small style="color: #666; font-size: 0.7rem;">${prod.desc} - ${prod.preco}</small>
            </div>
            <button class="btn-submit" style="width: auto; padding: 5px 10px; font-size: 0.75rem;" onclick="comprarProdutoVitrine(${index})">Comprar</button>
        `;
        listaDiv.appendChild(pItem);
    });

    document.getElementById('produtoModal').style.display = 'flex';
}

function fecharModal() {
    document.getElementById('produtoModal').style.display = 'none';
}

function registrarItemVendido(nomeItem) {
    adminConfig.itensVendidosHistorico[nomeItem] = (adminConfig.itensVendidosHistorico[nomeItem] || 0) + 1;
}

function comprarProdutoVitrine(produtoIndex) {
    const q = quiosquesData.find(item => item.id === quiosqueSelecionadoId);
    if (!q) return;

    quiosqueUltimaCompraId = q.id;
    const produto = q.produtos[produtoIndex];
    const clienteInfo = clienteAtual ? `${clienteAtual.nome} (${clienteAtual.local})` : "Cliente";

    let valorNumerico = 15.00;
    let precoStr = produto.preco.replace('R$', '').replace(',', '.').trim();
    let parsed = parseFloat(precoStr);
    if (!isNaN(parsed)) valorNumerico = parsed;

    adminConfig.pedidosRealizados += 1;
    adminConfig.faturamentoQuiosques += valorNumerico;
    registrarItemVendido(produto.nome);

    if (clienteAtual) {
        if (clienteAtual.selos < 6) {
            clienteAtual.selos += 1;
            atualizarCartaoFidelidade();
        }
        if (clienteAtual.indicacoesCompradoras < 3) {
            clienteAtual.indicacoesCompradoras += 1;
            atualizarPainelIndique();
            if (clienteAtual.indicacoesCompradoras === 3) {
                alert("🎉 PARABÉNS! Você completou 3 indicações e ganhou um brinde grátis!");
            }
        }
    }

    alert(`✅ Compra registrada!\nItem: ${produto.nome}\n⭐️ +1 Selo adicionado!`);
    window.open(`https://wa.me/${q.whatsapp}?text=PEDIDO:%20${produto.nome}%20-%20${produto.preco}%20-%20Cliente:%20${clienteInfo}`, '_blank');
}

function comprarPedidoPersonalizado() {
    const textoPedido = document.getElementById('customOrderInput').value.trim();
    if (!textoPedido) {
        alert("Digite o seu pedido.");
        return;
    }
    const q = quiosquesData.find(item => item.id === quiosqueSelecionadoId);
    if (!q) return;

    quiosqueUltimaCompraId = q.id;
    const clienteInfo = clienteAtual ? `${clienteAtual.nome} (${clienteAtual.local})` : "Cliente";

    adminConfig.pedidosRealizados += 1;
    adminConfig.faturamentoQuiosques += 20.00;
    registrarItemVendido("Pedido Personalizado");

    if (clienteAtual && clienteAtual.selos < 6) {
        clienteAtual.selos += 1;
        atualizarCartaoFidelidade();
    }

    alert(`✅ Pedido enviado!\n⭐️ +1 Selo adicionado!`);
    window.open(`https://wa.me/${q.whatsapp}?text=PEDIDO:%20${textoPedido}%20-%20Cliente:%20${clienteInfo}`, '_blank');
    fecharModal();
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

function comprarBolao() {
    const numeros = document.getElementById('bolaoNumeros').value.trim();

    if (!numeros) {
        alert("Digite os números do Mini Bolão.");
        return;
    }
    adminConfig.arrecadacaoBolao += 3.00;
    document.getElementById('poteBolaoDisplay').innerText = `R$ ${adminConfig.arrecadacaoBolao.toFixed(2)}`;
    alert(`🎲 Aposta registrada com sucesso, ${clienteAtual.nome}!`);
    document.getElementById('bolaoNumeros').value = '';
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
        nome: clienteAtual.nome,
        cidade: cidade,
        whatsapp: wpp,
        status: "Ativa (Setup R$ 1.500)",
        faturamentoPraça: 0.00
    });

    adminConfig.faturamentoFranquias += 1500.00;

    alert(`🚀 Solicitação e Setup registrados com sucesso, ${clienteAtual.nome}!\nPraça de ${cidade} adicionada à sua rede master.`);
    document.getElementById('franqCidade').value = '';
    document.getElementById('franqWpp').value = '';
}

function salvarNovoQuiosque() {
    const local = document.getElementById('novoLocalSelect').value;
    const nome = document.getElementById('novoNome').value.trim();
    const resp = document.getElementById('novoResp').value.trim();
    const wpp = document.getElementById('novoWpp').value.trim();
    const pag = document.getElementById('novoPag').value.trim();
    const prodTexto = document.getElementById('novoProdTexto').value.trim();
    const senhaCofre = document.getElementById('novoSenhaCofre').value.trim();
    const premioCofre = document.getElementById('novoPremioCofre').value.trim();

    if (!nome || !resp || !wpp || senhaCofre.length !== 4) {
        alert('Preencha os campos obrigatórios e senha de 4 dígitos para o cofre.');
        return;
    }

    let listaProdutos = [];
    if (prodTexto !== "") {
        prodTexto.split('|').forEach(item => {
            let sub = item.split('-');
            listaProdutos.push({
                nome: sub[0] ? sub[0].trim() : "Produto",
                desc: "Disponível",
                preco: sub[1] ? sub[1].trim() : "R$ 10,00"
            });
        });
    } else {
        listaProdutos.push({ nome: "Item Padrão", desc: "Consulte", preco: "R$ 15,00" });
    }

    const novoId = quiosquesData.length > 0 ? quiosquesData[quiosquesData.length - 1].id + 1 : 1;
    quiosquesData.push({
        id: novoId, localizacao: local, nome, responsavel: resp, whatsapp: wpp,
        pagamento: pag || 'Pix', senhaCofre, premioCofre: premioCofre || 'Brinde especial!', produtos: listaProdutos
    });

    document.getElementById('novoNome').value = '';
    document.getElementById('novoResp').value = '';
    document.getElementById('novoWpp').value = '';
    document.getElementById('novoPag').value = '';
    document.getElementById('novoProdTexto').value = '';
    document.getElementById('novoSenhaCofre').value = '';
    document.getElementById('novoPremioCofre').value = '';

    mudarLocalizacao(local);
    alert('Quiosque cadastrado com sucesso!');
}

function atualizarRankingTop10() {
    const container = document.getElementById('topTenContainer');
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
    const retencaoBolao = arrecadacaoBolao * 0.30;
    const faturamentoFranquias = adminConfig.faturamentoFranquias;
    const faturamentoTotalConsolidado = faturamentoQuiosques + retencaoBolao + faturamentoFranquias;

    document.getElementById('adminFaturamentoQuiosques').innerText = `R$ ${faturamentoQuiosques.toFixed(2)}`;
    document.getElementById('adminArrecadacaoBolao').innerText = `R$ ${arrecadacaoBolao.toFixed(2)}`;
    document.getElementById('adminRetencaoBolao').innerText = `R$ ${retencaoBolao.toFixed(2)} (30%)`;
    document.getElementById('adminFaturamentoFranquias').innerText = `R$ ${faturamentoFranquias.toFixed(2)}`;
    document.getElementById('adminFaturamentoTotal').innerText = `R$ ${faturamentoTotalConsolidado.toFixed(2)}`;

    const franquiasContainer = document.getElementById('listaFranquiasAdminContainer');
    if (franquiasData.length === 0) {
        franquiasContainer.innerHTML = `<p style="font-size: 0.75rem; color: #888;">Nenhuma franquia ativa.</p>`;
        return;
    }

    franquiasContainer.innerHTML = '';
    franquiasData.forEach(f => {
        let row = document.createElement('div');
        row.className = 'franquia-row';
        row.innerHTML = `
            <div>
                <strong>${f.cidade}</strong><br>
                <small style="color: #666;">Franqueado: ${f.nome} (${f.whatsapp})</small>
            </div>
            <div style="text-align: right;">
                <span style="color: #2E7D32; font-weight: bold; font-size: 0.75rem;">${f.status}</span><br>
                <small style="color: #555;">Movimento: R$ ${f.faturamentoPraça.toFixed(2)}</small>
            </div>
        `;
        franquiasContainer.appendChild(row);
    });
}
