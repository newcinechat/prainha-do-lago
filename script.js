const firebaseConfig = {
    databaseURL: "https://prainhadolago-chat-default-rtdb.firebaseio.com/"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();

let quiosquesData = [];
let clientesCadastrados = [];
let adminConfig = {
    senha: "genio123", 
    pedidosRealizados: 0,
    faturamentoTotal: 0.00,
    porcentagemComissao: 10 
};

let clienteAtual = null;
let quiosqueSelecionadoId = null;
let arquivoMidiaSelecionado = null;

function renderQuiosques() {
    const listEl = document.getElementById('quiosques-list');
    listEl.innerHTML = '';
    
    if (quiosquesData.length === 0) {
        listEl.innerHTML = `
            <div style="text-align: center; padding: 25px; background: white; border-radius: 10px; border: 1px dashed #ccc;">
                <p style="font-size: 0.85rem; color: #666;">Nenhum quiosque cadastrado na orla ainda.</p>
                <p style="font-size: 0.75rem; color: #999; margin-top: 4px;">Seja o primeiro a cadastrar clicando em "+ Cadastrar Quiosque" acima!</p>
            </div>
        `;
        return;
    }

    quiosquesData.forEach(q => {
        listEl.innerHTML += `
            <div class="quiosque-card" onclick="abrirModal(${q.id})">
                <div class="quiosque-info">
                    <h4>${q.nome}</h4>
                    <p>Resp: ${q.responsavel} • Ver vitrine e cardápio</p>
                </div>
                <span class="badge">Aberto</span>
            </div>
        `;
    });
}

function toggleForm(formId) {
    const form = document.getElementById(formId);
    const outroForm = formId === 'clienteForm' ? document.getElementById('quiosqueForm') : document.getElementById('clienteForm');
    
    outroForm.style.display = 'none';
    form.style.display = form.style.display === 'block' ? 'none' : 'block';
}

function salvarCliente() {
    const nome = document.getElementById('cliNome').value;
    const wpp = document.getElementById('cliWpp').value;
    const local = document.getElementById('cliLocal').value;

    if (!nome || !wpp) {
        alert('Por favor, informe seu Nome e WhatsApp para entrar.');
        return;
    }

    clienteAtual = { id: Date.now(), nome, wpp, local };
    clientesCadastrados.push(clienteAtual);

    document.getElementById('clientNameDisplay').innerText = nome;
    document.getElementById('clientWelcomeBox').style.display = 'flex';
    document.getElementById('clienteForm').style.display = 'none';
    
    alert(`Bem-vindo à Prainha do Lago, ${nome}!`);
}

function logoutClient() {
    clienteAtual = null;
    document.getElementById('clientWelcomeBox').style.display = 'none';
    alert('Você saiu da sessão de cliente.');
}

function salvarNovoQuiosque() {
    const nome = document.getElementById('novoNome').value;
    const resp = document.getElementById('novoResp').value;
    const wpp = document.getElementById('novoWpp').value;
    const pag = document.getElementById('novoPag').value;
    const prodTexto = document.getElementById('novoProdTexto').value;

    if (!nome || !resp || !wpp) {
        alert('Por favor, preencha pelo menos o Nome do quiosque, Responsável e WhatsApp.');
        return;
    }

    let listaProdutos = [];
    if (prodTexto.trim() !== "") {
        let partes = prodTexto.split('|');
        partes.forEach(item => {
            let sub = item.split('-');
            let pNome = sub[0] ? sub[0].trim() : "Produto";
            let pPreco = sub[1] ? sub[1].trim() : "R$ 10,00";
            listaProdutos.push({ nome: pNome, desc: "Disponível na Orla", preco: pPreco });
        });
    } else {
        listaProdutos.push({ nome: "Produto Padrão", desc: "Consulte o cardápio", preco: "R$ 15,00" });
    }

    const novoId = quiosquesData.length > 0 ? quiosquesData[quiosquesData.length - 1].id + 1 : 1;
    quiosquesData.push({
        id: novoId,
        nome: nome,
        responsavel: resp,
        whatsapp: wpp,
        pagamento: pag || 'Pix e Dinheiro',
        produtos: listaProdutos
    });

    document.getElementById('novoNome').value = '';
    document.getElementById('novoResp').value = '';
    document.getElementById('novoWpp').value = '';
    document.getElementById('novoPag').value = '';
    document.getElementById('novoProdTexto').value = '';
    toggleForm('quiosqueForm');
    renderQuiosques();

    alert('Quiosque e vitrine cadastrados com sucesso!');
}

function abrirModal(id) {
    const q = quiosquesData.find(item => item.id === id);
    if (!q) return;

    quiosqueSelecionadoId = id;
    document.getElementById('modal-title').innerText = q.nome;
    document.getElementById('modal-subtitle').innerText = `Responsável: ${q.responsavel}`;
    document.getElementById('modal-payment').innerHTML = `<strong>Formas de Pagamento:</strong> ${q.pagamento}`;
    document.getElementById('customOrderInput').value = '';
    
    const prodEl = document.getElementById('modal-products');
    prodEl.innerHTML = '';
    
    if (q.produtos && q.produtos.length > 0) {
        q.produtos.forEach((p, index) => {
            prodEl.innerHTML += `
                <div class="product-item">
                    <div class="product-details">
                        <h5>${p.nome}</h5>
                        <p>${p.desc}</p>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span class="product-price">${p.preco}</span>
                        <button class="btn-buy-item" onclick="comprarProdutoVitrine(${index})">Comprar</button>
                    </div>
                </div>
            `;
        });
    } else {
        prodEl.innerHTML = `<p style="font-size:0.8rem; color:#777; text-align:center; padding:10px;">Nenhum produto cadastrado na vitrine.</p>`;
    }
    
    document.getElementById('quiosqueModal').style.display = 'flex';
}

function fecharModal() {
    document.getElementById('quiosqueModal').style.display = 'none';
}

// Registrar compra ao clicar em Comprar na Vitrine
function comprarProdutoVitrine(produtoIndex) {
    const q = quiosquesData.find(item => item.id === quiosqueSelecionadoId);
    if (!q) return;

    const produto = q.produtos[produtoIndex];
    const dataHora = new Date().toLocaleString('pt-BR');
    const clienteInfo = clienteAtual ? `${clienteAtual.nome} (${clienteAtual.local})` : "Cliente da Orla";

    // Extrair valor numérico aproximado para o relatório administrativo
    let valorNumerico = 15.00;
    let precoStr = produto.preco.replace('R$', '').replace(',', '.').trim();
    let parsed = parseFloat(precoStr);
    if (!isNaN(parsed)) valorNumerico = parsed;

    // Atualizar painel de relatórios automaticamente
    adminConfig.pedidosRealizados += 1;
    adminConfig.faturamentoTotal += valorNumerico;

    alert(`✅ Compra registrada com sucesso!\nData/Hora: ${dataHora}\nItem: ${produto.name || produto.nome} (${produto.preco})\nO ambulante e o painel administrativo foram notificados.`);

    let mensagemWpp = `*NOVO PEDIDO REGISTRADO - PRAINHA DO LAGO*%0A🕒 ${dataHora}%0A👤 Cliente: ${clienteInfo}%0A🛒 Produto: ${produto.nome} - ${produto.preco}%0A✅ _Comprovado e registrado no sistema!_`;
    window.open(`https://wa.me/${q.whatsapp}?text=${mensagemWpp}`, '_blank');
}

// Registrar compra personalizada digitada pelo cliente
function comprarPedidoPersonalizado() {
    const textoPedido = document.getElementById('customOrderInput').value.trim();
    if (!textoPedido) {
        alert("Por favor, digite o que deseja comprar.");
        return;
    }

    const q = quiosquesData.find(item => item.id === quiosqueSelecionadoId);
    if (!q) return;

    const dataHora = new Date().toLocaleString('pt-BR');
    const clienteInfo = clienteAtual ? `${clienteAtual.nome} (${clienteAtual.local})` : "Cliente da Orla";

    // Registrar no painel administrativo (considerando base de R$ 20 para pedidos livres)
    adminConfig.pedidosRealizados += 1;
    adminConfig.faturamentoTotal += 20.00;

    alert(`✅ Pedido personalizado registrado!\nData/Hora: ${dataHora}\nQuiosque: ${q.nome}\nO relatório administrativo foi atualizado.`);

    let mensagemWpp = `*PEDIDO PERSONALIZADO - PRAINHA DO LAGO*%0A🕒 ${dataHora}%0A👤 Cliente: ${clienteInfo}%0A📝 Pedido: ${textoPedido}%0A✅ _Registrado no sistema da orla!_`;
    window.open(`https://wa.me/${q.whatsapp}?text=${mensagemWpp}`, '_blank');
    fecharModal();
}

// Funções de Mídia (Câmera e Galeria)
function processarArquivoMidia(input) {
    if (input.files && input.files[0]) {
        arquivoMidiaSelecionado = input.files[0];
        const container = document.getElementById('mediaContainerContent');
        container.innerHTML = '';

        const urlObjeto = URL.createObjectURL(arquivoMidiaSelecionado);
        if (arquivoMidiaSelecionado.type.startsWith('image/')) {
            container.innerHTML = `<img src="${urlObjeto}" style="max-width: 100%; max-height: 150px; border-radius: 6px;">`;
        } else if (arquivoMidiaSelecionado.type.startsWith('video/')) {
            container.innerHTML = `<video src="${urlObjeto}" controls style="max-width: 100%; max-height: 150px; border-radius: 6px;"></video>`;
        }

        document.getElementById('mediaPreviewArea').style.display = 'block';
    }
}

function enviarMidiaParaGrupo() {
    if (!arquivoMidiaSelecionado) {
        alert("Nenhuma mídia selecionada.");
        return;
    }
    alert("Mídia pronta! Abrindo o WhatsApp da Orla para você enviar.");
    window.open(`https://wa.me/5561999999999?text=Olá,%20compartilhando%20foto/vídeo%20pelo%20App%20Prainha%20do%20Lago!`, '_blank');
}

function abrirBanco(banco) {
    const linksBancos = {
        nubank: { app: "nubank://app", web: "https://nuank.com.br" },
        picpay: { app: "picpay://app", web: "https://www.picpay.com" },
        santander: { app: "santander://app", web: "https://www.santander.com.br" },
        caixa: { app: "caixa://app", web: "https://www.caixa.gov.br" }
    };

    const dados = linksBancos[banco];
    if (!dados) return;

    navigator.clipboard.writeText("prainhadolago@exemplo.com").catch(() => {});

    let iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = dados.app;
    document.body.appendChild(iframe);

    setTimeout(() => {
        document.body.removeChild(iframe);
        window.open(dados.web, "_blank");
    }, 600);

    alert("Chave Pix copiada! Abrindo o aplicativo/site do banco...");
}

function deletarQuiosqueAtual() {
    if (confirm("Tem certeza que deseja excluir permanentemente este quiosque?")) {
        quiosquesData = quiosquesData.filter(item => item.id !== quiosqueSelecionadoId);
        fecharModal();
        renderQuiosques();
        alert("Quiosque removido com sucesso.");
    }
}

// Chat Firebase
function abrirChat() {
    document.getElementById('chatModal').style.display = 'flex';
    escutarMensagensFirebase();
}

function fecharChat() {
    document.getElementById('chatModal').style.display = 'none';
}

function enviarMensagemFirebase() {
    const input = document.getElementById('chatInput');
    const texto = input.value.trim();
    if (!texto) return;

    const nomeUsuario = clienteAtual ? clienteAtual.nome : "Visitante Anônimo";

    db.ref('mensagens_orla').push({
        nome: nomeUsuario,
        texto: texto,
        timestamp: Date.now()
    });

    input.value = '';
}

function escutarMensagensFirebase() {
    const chatMessages = document.getElementById('chatMessages');
    
    db.ref('mensagens_orla').limitToLast(30).on('value', (snapshot) => {
        chatMessages.innerHTML = '';
        const dados = snapshot.val();
        
        if (!dados) {
            chatMessages.innerHTML = `<p style="color: #888; text-align: center; margin-top: 20px;">Nenhuma mensagem ainda.</p>`;
            return;
        }

        Object.values(dados).forEach(msg => {
            chatMessages.innerHTML += `
                <div style="margin-top: 6px; background: #fff; padding: 8px; border-radius: 6px; border: 1px solid #eee;">
                    <strong>${msg.nome}:</strong> ${msg.texto}
                </div>
            `;
        });
        chatMessages.scrollTop = chatMessages.scrollHeight;
    });
}

// Painel Administrativo
function abrirAdmin() {
    document.getElementById('adminLoginArea').style.display = 'block';
    document.getElementById('adminDashboardArea').style.display = 'none';
    document.getElementById('adminSenha').value = '';
    document.getElementById('adminModal').style.display = 'flex';
}

function verificarAdmin() {
    const senhaDigitada = document.getElementById('adminSenha').value;
    
    if (senhaDigitada === adminConfig.senha) {
        document.getElementById('adminLoginArea').style.display = 'none';
        document.getElementById('adminDashboardArea').style.display = 'block';
        
        document.getElementById('statPedidos').innerText = adminConfig.pedidosRealizados;
        document.getElementById('statVendas').innerText = `R$ ${adminConfig.faturamentoTotal.toFixed(2).replace('.', ',')}`;
        document.getElementById('inputPorcentagem').value = adminConfig.porcentagemComissao;
        
        calcularComissaoTela();
        renderizarClientesAdmin();
    } else {
        alert('Senha incorreta!');
    }
}

function renderizarClientesAdmin() {
    const container = document.getElementById('adminClientList');
    container.innerHTML = '';

    if (clientesCadastrados.length === 0) {
        container.innerHTML = `<p style="font-size: 0.7rem; color: #888; text-align: center;">Nenhum cliente cadastrado.</p>`;
        return;
    }

    clientesCadastrados.forEach(c => {
        container.innerHTML += `
            <div class="client-item-admin">
                <span><strong>${c.nome}</strong> (${c.wpp})</span>
                <button onclick="deletarCliente(${c.id})" style="background: #d32f2f; color: white; border: none; padding: 3px 6px; border-radius: 3px; cursor: pointer; font-size: 0.65rem;">Excluir</button>
            </div>
        `;
    });
}

function deletarCliente(id) {
    if (confirm("Deseja realmente remover este cliente?")) {
        clientesCadastrados = clientesCadastrados.filter(c => c.id !== id);
        renderizarClientesAdmin();
    }
}

function atualizarPorcentagemComissao() {
    let novaTaxa = parseFloat(document.getElementById('inputPorcentagem').value);
    if (isNaN(novaTaxa) || novaTaxa < 0) novaTaxa = 0;
    adminConfig.porcentagemComissao = novaTaxa;
    calcularComissaoTela();
}

function calcularComissaoTela() {
    let comissaoCalculada = adminConfig.faturamentoTotal * (adminConfig.porcentagemComissao / 100);
    document.getElementById('statComissao').innerText = `R$ ${comissaoCalculada.toFixed(2).replace('.', ',')}`;
}

function fecharAdmin() {
    document.getElementById('adminModal').style.display = 'none';
}

window.onclick = function(event) {
    if (event.target == document.getElementById('quiosqueModal')) fecharModal();
    if (event.target == document.getElementById('adminModal')) fecharAdmin();
    if (event.target == document.getElementById('chatModal')) fecharChat();
}

renderQuiosques();