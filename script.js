let clienteAtual = null;
let quiosqueSelecionadoId = null;
let quiosqueUltimaCompraId = null;
let mediaStreamAtiva = null;
const SENHA_ADMIN_MESTRE = "00256383"; // Nova senha master de auditoria

let adminConfig = {
    pedidosRealizados: 0,
    faturamentoQuiosques: 0.00,
    arrecadacaoBolao: 0.00,
    faturamentoFranquias: 3000.00,
    itensVendidosHistorico: {}
};

let franquiasData = [
    { 
        id: 1, 
        nome: "Carlos Eduardo", 
        cidade: "Brasília / DF", 
        whatsapp: "5561999999999", 
        status: "Ativa", 
        faturamentoPraça: 4200.00,
        historicoOperacoes: "Implantado com 4 quiosques na Orla do Paranoá. Alta demanda em fins de semana.",
        oQueDáCerto: "Entrega rápida via comanda digital e forte engajamento nos bolões.",
        oQueMelhorar: "Expandir cobertura de quiosques noturnos e iluminação na praça."
    },
    { 
        id: 2, 
        nome: "Fernanda Lima", 
        cidade: "São Paulo / SP", 
        whatsapp: "5511988888888", 
        status: "Ativa", 
        faturamentoPraça: 8900.00,
        historicoOperacoes: "Parceria consolidada com quiosques na represa e ciclovia.",
        oQueDáCerto: "Eventos semanais e forte divulgação no Instagram.",
        oQueMelhorar: "Agilizar o tempo de resposta dos ambulantes nos horários de pico."
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
            { categoria: 'ESPETINHOS', nome: 'Frango c/ bacon', preco: 10.00 },
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
            alert("🔒 Bem-vindo ao Painel Master Administrator & Auditoria!");
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
        if(btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(abaId)) {
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

// 🌴 Renderizar Stories / Bolinhas de Quiosques no Topo
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
            itemRow.className = 'item-comanda';
            itemRow.style.cssText = 'display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #eee; font-size: 13px;';
            itemRow.innerHTML = `
                <label><input type="checkbox" class="chk-item" value="${prod.nome}" data-preco="${prod.preco}" onchange="calcularTotalComanda()"> ${prod.nome}</label>
                <span>R$ ${prod.preco.toFixed(2).replace('.', ',')}</span>
            `;
            catDiv.appendChild(itemRow);
        });

        containerItens.appendChild(catDiv);
    }

    calcularTotalComanda();
    mudarAba('vitrineQuiosque');
}

function calcularTotalComanda() {
    let total = 0;
    const checkboxes = document.querySelectorAll('.chk-item:checked');
    checkboxes.forEach(chk => {
        total += parseFloat(chk.getAttribute('data-preco')) || 0;
    });
    document.getElementById('valorTotalComanda').innerText = `R$ ${total.toFixed(2).replace('.', ',')}`;
}

function enviarComandaParaQuiosque() {
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
        valorTotal += preco;
        itensSelecionadosStr.push(chk.value);
        adminConfig.itensVendidosHistorico[chk.value] = (adminConfig.itensVendidosHistorico[chk.value] || 0) + 1;
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
            if (clienteAtual.indicacoesCompradoras === 3) {
                alert("🎉 PARABÉNS! Você completou 3 indicações e ganhou um brinde grátis!");
            }
        }
    }

    let mensagemWhatsApp = `*COMANDA DIGITAL - ${q.nome}*%0aCliente: ${cliente}%0aMesa/Retirada: ${mesa || 'Não informada'}%0a%0a*Itens:*%0a- ${itensSelecionadosStr.join('%0a- ')}%0a%0aObs: ${obs || 'Nenhuma'}%0a*TOTAL: R$ ${valorTotal.toFixed(2).replace('.', ',')}*`;

    alert(`✅ Pedido gerado com sucesso!\n⭐️ +1 Selo adicionado ao seu cartão fidelidade!`);
    window.open(`https://wa.me/${q.whatsapp}?text=${mensagemWhatsApp}`, '_blank');
    mudarAba('vitrine');
}

// 💬 Funções do Bate-Papo com Envio de Mídia
function enviarMensagemChat() {
    const input = document.getElementById('chatInputMensagem');
    const texto = input.value.trim();
    if (!texto) return;

    adicionarMensagemChatBox(clienteAtual ? clienteAtual.nome : "Visitante", texto, "sent", "text");
    input.value = '';

    // Resposta simulada automatizada
    setTimeout(() => {
        adicionarMensagemChatBox("Quiosque Central", "Recebido! Aproveite a orla com responsabilidade 🌊", "received", "text");
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
    const poteDisplay = document.getElementById('poteBolaoDisplay');
    if (poteDisplay) poteDisplay.innerText = `R$ ${adminConfig.arrecadacaoBolao.toFixed(2)}`;
    alert(`🎲 Aposta registrada com sucesso!`);
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

// 📝 Cadastro de Novos Quiosques com Logomarca e Produtos
function salvarNovoQuiosque() {
    const local = document.getElementById('novoLocalSelect').value;
    const nome = document.getElementById('novoNome').value.trim();
    const resp = document.getElementById('novoResp').value.trim();
    const wpp = document.getElementById('novoWpp').value.trim();
    const pag = document.getElementById('novoPag').value.trim();
    const prodTexto = document.getElementById('novoProdTexto').value.trim();
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

    let listaProdutos = [];
    if (prodTexto !== "") {
        prodTexto.split('|').forEach(item => {
            let sub = item.split('-');
            let nomeProd = sub[0] ? sub[0].trim() : "Produto";
            let precoStr = sub[1] ? sub[1].replace('R$', '').replace(',', '.').trim() : "10.00";
            let precoNum = parseFloat(precoStr) || 10.00;
            listaProdutos.push({ categoria: 'GELADOS & PORÇÕES', nome: nomeProd, preco: precoNum });
        });
    } else {
        listaProdutos.push({ categoria: 'OUTROS', nome: 'Item Padrão', preco: 15.00 });
    }

    const novoId = quiosquesData.length > 0 ? quiosquesData[quiosquesData.length - 1].id + 1 : 1;
    quiosquesData.push({
        id: novoId, localizacao: local, nome, responsavel: resp, whatsapp: wpp,
        pagamento: pag || 'Pix', logomarca: logomarcaUrl, senhaCofre, 
        premioCofre: premioCofre || 'Brinde especial!', produtos: listaProdutos
    });

    document.getElementById('novoNome').value = '';
    document.getElementById('novoResp').value = '';
    document.getElementById('novoWpp').value = '';
    document.getElementById('novoPag').value = '';
    document.getElementById('novoProdTexto').value = '';
    document.getElementById('novoSenhaCofre').value = '';
    document.getElementById('novoPremioCofre').value = '';
    logoInput.value = '';

    mudarLocalizacao(local);
    alert('Quiosque e logomarca cadastrados com sucesso na vitrine!');
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

    const franquiasContainer = document.getElementById('listaFranquiasAdminContainer');
    if (franquiasContainer) {
        if (franquiasData.length === 0) {
            franquiasContainer.innerHTML = `<p style="font-size: 0.75rem; color: #888;">Nenhuma franquia ativa.</p>`;
            return;
        }

        franquiasContainer.innerHTML = '';
        franquiasData.forEach(f => {
            let row = document.createElement('div');
            row.className = 'franquia-row';
            row.onclick = () => abrirAuditoriaFranquia(f.id);
            row.innerHTML = `
                <div>
                    <strong>🏢 ${f.cidade}</strong><br>
                    <small style="color: #555;">Franqueado: ${f.nome} (${f.whatsapp})</small>
                </div>
                <div style="text-align: right;">
                    <span style="color: #2E7D32; font-weight: bold; font-size: 0.75rem;">${f.status}</span><br>
                    <small style="color: #0288D1; font-weight: bold;">Auditar 🔍</small>
                </div>
            `;
            franquiasContainer.appendChild(row);
        });
    }
}

// ⚙️ Funções de Auditoria Interativa de Franquias
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
