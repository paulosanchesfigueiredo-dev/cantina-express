// Carrinho: cada item tem nome, preço e quantidade
let carrinho = [];

// Formata número como dinheiro brasileiro: 8 -> "R$ 8,00"
function dinheiro(valor) {
    return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Desafio: controle de quantidade
// Se o produto já está no carrinho, só aumenta a quantidade
function adicionar(nome, preco) {
    const existente = carrinho.find(function(item) {
        return item.nome === nome;
    });

    if (existente) {
        existente.quantidade++;
    } else {
        carrinho.push({
            nome: nome,
            preco: preco,
            quantidade: 1
        });
    }
    atualizarPedido();
}

function diminuir(nome) {
    const item = carrinho.find(function(i) { return i.nome === nome; });
    item.quantidade--;
    if (item.quantidade === 0) {
        remover(nome);
        return;
    }
    atualizarPedido();
}

// Desafio: botão para remover produtos
function remover(nome) {
    carrinho = carrinho.filter(function(item) {
        return item.nome !== nome;
    });
    atualizarPedido();
}

function calcularTotal(itens) {
    return itens.reduce(function(soma, item) {
        return soma + item.preco * item.quantidade;
    }, 0);
}

function atualizarPedido() {
    const lista = document.getElementById("lista");
    const total = document.getElementById("total");

    lista.innerHTML = "";

    if (carrinho.length === 0) {
        const vazio = document.createElement("li");
        vazio.className = "vazio";
        vazio.textContent = "Nenhum produto adicionado.";
        lista.appendChild(vazio);
    }

    carrinho.forEach(function(produto) {
        const item = document.createElement("li");

        const texto = document.createElement("span");
        texto.className = "item-nome";
        texto.textContent = produto.quantidade + "x " + produto.nome +
            " - " + dinheiro(produto.preco * produto.quantidade);

        const controles = document.createElement("div");
        controles.className = "controles";

        const menos = document.createElement("button");
        menos.textContent = "−";
        menos.setAttribute("aria-label", "Diminuir " + produto.nome);
        menos.onclick = function() { diminuir(produto.nome); };

        const mais = document.createElement("button");
        mais.textContent = "+";
        mais.setAttribute("aria-label", "Aumentar " + produto.nome);
        mais.onclick = function() { adicionar(produto.nome, produto.preco); };

        const excluir = document.createElement("button");
        excluir.textContent = "✕";
        excluir.className = "btn-remover";
        excluir.setAttribute("aria-label", "Remover " + produto.nome);
        excluir.onclick = function() { remover(produto.nome); };

        controles.appendChild(menos);
        controles.appendChild(mais);
        controles.appendChild(excluir);
        item.appendChild(texto);
        item.appendChild(controles);
        lista.appendChild(item);
    });

    total.textContent = "Total: " + dinheiro(calcularTotal(carrinho));
}

function lerPedidos() {
    return JSON.parse(localStorage.getItem("pedidos") || "[]");
}

function finalizarPedido() {
    const nome = document.getElementById("nome").value;

    if (nome.trim() === "") {
        alert("Digite seu nome!");
        return;
    }

    if (carrinho.length === 0) {
        alert("Adicione um produto!");
        return;
    }

    const pedido = {
        cliente: nome.trim(),
        produtos: carrinho.map(function(item) { return { ...item }; }),
        total: calcularTotal(carrinho),
        data: new Date().toLocaleString("pt-BR")
    };

    let pedidos = lerPedidos();
    pedidos.push(pedido);
    localStorage.setItem("pedidos", JSON.stringify(pedidos));

    alert("Pedido realizado com sucesso!");

    carrinho = [];
    atualizarPedido();
    mostrarHistorico();
}

function mostrarHistorico() {
    const historico = document.getElementById("historico");
    const pedidos = lerPedidos();

    historico.innerHTML = "";

    if (pedidos.length === 0) {
        historico.innerHTML = '<p class="vazio">Nenhum pedido realizado ainda.</p>';
        return;
    }

    // Mostra o mais recente primeiro
    pedidos.slice().reverse().forEach(function(pedido, i) {
        const indice = pedidos.length - 1 - i;
        const card = document.createElement("div");
        card.className = "produto pedido-card";
        card.textContent =
            pedido.cliente + " | " + dinheiro(pedido.total) + " | " + pedido.data;
        card.onclick = function() { abrirDetalhes(indice); };
        historico.appendChild(card);
    });
}

// Desafio: tela de detalhes do pedido
function abrirDetalhes(indice) {
    const pedido = lerPedidos()[indice];
    const conteudo = document.getElementById("conteudoDetalhes");
    conteudo.innerHTML = "";

    const cliente = document.createElement("p");
    cliente.innerHTML = "<b>Cliente:</b> ";
    cliente.append(pedido.cliente);

    const data = document.createElement("p");
    data.innerHTML = "<b>Data:</b> ";
    data.append(pedido.data);

    const itens = document.createElement("ul");
    pedido.produtos.forEach(function(p) {
        const qtd = p.quantidade || 1; // pedidos antigos não tinham quantidade
        const li = document.createElement("li");
        li.textContent = qtd + "x " + p.nome + " - " + dinheiro(p.preco * qtd);
        itens.appendChild(li);
    });

    const total = document.createElement("p");
    total.innerHTML = "<b>Total:</b> " + dinheiro(pedido.total);

    conteudo.append(cliente, data, itens, total);
    document.getElementById("detalhes").hidden = false;
}

function fecharDetalhes() {
    document.getElementById("detalhes").hidden = true;
}

// Desafio: categorias no cardápio
function filtrarCategoria(categoria, botao) {
    document.querySelectorAll(".categoria").forEach(function(b) {
        b.classList.remove("ativa");
    });
    botao.classList.add("ativa");

    document.querySelectorAll(".produtos .produto").forEach(function(produto) {
        const mostrar = categoria === "todos" || produto.dataset.categoria === categoria;
        produto.style.display = mostrar ? "" : "none";
    });
}

atualizarPedido();
mostrarHistorico();
