// ==========================================
// O banco de dados das HQs (variável "hqs") mora em dados.js.
// Esse script só tem a LÓGICA do site.
// ==========================================

let hqAtual = "spider-gwen";
let capituloAtual = "cap-1";
let paginaAtual = 0;
let filtroAtualBiblioteca = "todas";
let modoLeitura = "pagina"; // "pagina" ou "scroll"
let observerScroll = null;

const CHAVE_FAVORITOS = "spiderReaderFavoritos";
const CHAVE_USUARIO = "spiderReaderUsuario";
const CHAVE_MODO_LEITURA = "spiderReaderModoLeitura";
const CHAVE_PROGRESSO = "spiderReaderProgresso";
const CHAVE_LEITURAS = "spiderReaderLeituras";
const CHAVE_TEMA = "spiderReaderTema";
const CHAVE_LIDOS = "spiderReaderLidos";
const CHAVE_BRILHO = "spiderReaderBrilho";
const CHAVE_DUAS_PAGINAS = "spiderReaderDuasPaginas";
const CHAVE_PAGINAS_LIDAS = "spiderReaderPaginasLidas";
const CHAVE_MOLDURA_EQUIPADA = "spiderReaderMolduraEquipada";

let ordenacaoAtual = "recente";
let filtrosTags = new Set();
let duasPaginasAtivo = localStorage.getItem(CHAVE_DUAS_PAGINAS) === "1";

// Guarda quais páginas já foram contadas nesta sessão de navegador, pra
// não somar a mesma página várias vezes (ex: re-render do modo scroll)
let paginasContadasSessao = new Set();

const ROTULOS_SECAO = {
  todas: "Destaques",
  hq: "HQs",
  manga: "Mangás",
  favoritos: "Favoritos ♥"
};

// ==========================================
// TEMAS DE COR
// Cada tema troca a cor de destaque do site inteiro (o degradê preto de
// fundo continua o mesmo, só muda a cor que "brilha" nele). As cores reais
// de cada tema estão no style.css, em html[data-tema="..."]. Aqui é só
// pra montar a lista de opções e mostrar a bolinha com a cor certa.
// ==========================================
const TEMAS = [
  { id: "vermelho", nome: "Vermelho padrão", cor: "#ff1e27" },
  { id: "preto", nome: "Preto", cor: "#333333" },
  { id: "branco", nome: "Branco", cor: "#f2f2f2" },
  { id: "rosa", nome: "Rosa", cor: "#ff4d9e" },
  { id: "azul", nome: "Azul escuro", cor: "#3b6bff" },
  { id: "laranja", nome: "Laranja", cor: "#ff8c1a" },
  { id: "verde", nome: "Verde escuro", cor: "#1f8a4c" },
  { id: "roxo-azul", nome: "Roxo & Azul", cor: "linear-gradient(135deg, #8b5cf6, #1e2a78)" },
  { id: "homem-aranha", nome: "Homem-Aranha", cor: "linear-gradient(135deg, #ff1e27, #142d7a)" },
  { id: "goku-ui", nome: "Goku Ultra Instinto", cor: "linear-gradient(135deg, #ff8c1a, #4a6fa5)" },
  { id: "venom", nome: "Venom", cor: "linear-gradient(135deg, #8a0000, #000000)" } 
];

function obterTemaSalvo() {
  const salvo = localStorage.getItem(CHAVE_TEMA);
  return TEMAS.some(t => t.id === salvo) ? salvo : "vermelho";
}

// Aplica o tema (troca o atributo data-tema na <html>, que o CSS usa
// pra trocar as variáveis de cor) e guarda a escolha no navegador.
function aplicarTema(idTema) {
  document.documentElement.setAttribute('data-tema', idTema);
  localStorage.setItem(CHAVE_TEMA, idTema);
  montarListaTemas();
}

// Monta a lista de opções dentro do modal, marcando qual está ativa
function montarListaTemas() {
  const container = document.getElementById('lista-temas');
  if (!container) return;

  const temaAtual = obterTemaSalvo();
  container.innerHTML = '';

  TEMAS.forEach(tema => {
    const opcao = document.createElement('button');
    opcao.type = 'button';
    opcao.className = 'tema-opcao' + (tema.id === temaAtual ? ' ativo' : '');
    opcao.innerHTML = `
      <span class="tema-swatch" style="background: ${tema.cor}"></span>
      <span>${tema.nome}</span>
      <span class="tema-opcao-check">✓</span>
    `;
    opcao.onclick = () => aplicarTema(tema.id);
    container.appendChild(opcao);
  });
}

function abrirTemas() {
  montarListaTemas();
  document.getElementById('modal-temas')?.classList.remove('escondido');
  fecharMenu();
  document.getElementById('overlay')?.classList.add('ativo');
}

function fecharTemas() {
  document.getElementById('modal-temas')?.classList.add('escondido');
  document.getElementById('overlay')?.classList.remove('ativo');
}

// Monta o caminho da imagem sozinho a partir do número da página.
// Ex: caminhoPagina("spider-gwen", "cap-1", 3) -> "assets/hqs/spider-gwen/cap-1/pagina3.jpg"
function caminhoPagina(chaveHQ, capitulo, numeroPagina) {
  return `assets/hqs/${chaveHQ}/${capitulo}/pagina${numeroPagina}.jpg`;
}

// ==========================================
// PROGRESSO DE LEITURA ("continuar de onde parou")
// Guarda, pra cada HQ, em qual capítulo e página a pessoa parou.
// ==========================================
function obterProgressoTodos() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE_PROGRESSO)) || {};
  } catch (erro) {
    return {};
  }
}

function obterProgresso(chaveHQ) {
  const todos = obterProgressoTodos();
  return todos[chaveHQ] || null;
}

function salvarProgresso(chaveHQ, capitulo, pagina) {
  try {
    const todos = obterProgressoTodos();
    todos[chaveHQ] = { capitulo, pagina };
    localStorage.setItem(CHAVE_PROGRESSO, JSON.stringify(todos));
  } catch (erro) {
    console.error('Não foi possível salvar o progresso:', erro);
  }
}

// Apaga o progresso salvo de uma HQ específica (usado pelo botão "Limpar progresso")
function limparProgresso(chaveHQ) {
  try {
    const todos = obterProgressoTodos();
    delete todos[chaveHQ];
    localStorage.setItem(CHAVE_PROGRESSO, JSON.stringify(todos));
  } catch (erro) {
    console.error('Não foi possível limpar o progresso:', erro);
  }
}

// Pede confirmação e, se a pessoa aceitar, limpa o progresso salvo da HQ
// que está aberta na ficha no momento (não mexe no que já foi marcado como lido)
function confirmarLimparProgresso() {
  const hq = hqs[hqAtual];
  if (!hq) return;

  const progresso = obterProgresso(hqAtual);
  if (!progresso) return;

  const ok = window.confirm(
    `Limpar o progresso salvo de "${hq.titulo}"?\n\nIsso remove o "continuar de onde parou" — os capítulos marcados como lidos continuam como estão.`
  );
  if (!ok) return;

  limparProgresso(hqAtual);
  exibirFicha();
}

// ==========================================
// CONTAGEM DE LEITURAS (pra "Mais lido")
// ==========================================
function obterTodasLeituras() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE_LEITURAS)) || {};
  } catch (erro) {
    return {};
  }
}

function obterLeituras(chaveHQ) {
  return obterTodasLeituras()[chaveHQ] || 0;
}

function registrarLeitura(chaveHQ) {
  try {
    const todas = obterTodasLeituras();
    todas[chaveHQ] = (todas[chaveHQ] || 0) + 1;
    localStorage.setItem(CHAVE_LEITURAS, JSON.stringify(todas));
  } catch (erro) {
    console.error('Não foi possível registrar a leitura:', erro);
  }
}

// ==========================================
// CAPÍTULOS LIDOS (marcação manual, separada do progresso automático)
// Guarda, pra cada HQ, a lista de capítulos que a pessoa marcou como lidos.
// Serve tanto pro botão "Marcar tudo como lido" quanto pro selo de
// "capítulos novos" nos cards da biblioteca.
// ==========================================
function obterLidosTodos() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE_LIDOS)) || {};
  } catch (erro) {
    return {};
  }
}

function obterLidos(chaveHQ) {
  return obterLidosTodos()[chaveHQ] || [];
}

function capituloEhLido(chaveHQ, cap) {
  return obterLidos(chaveHQ).includes(cap);
}

function salvarLidosHQ(chaveHQ, listaCapitulos) {
  try {
    const todos = obterLidosTodos();
    if (listaCapitulos.length) {
      todos[chaveHQ] = listaCapitulos;
    } else {
      delete todos[chaveHQ];
    }
    localStorage.setItem(CHAVE_LIDOS, JSON.stringify(todos));
  } catch (erro) {
    console.error('Não foi possível salvar os capítulos lidos:', erro);
  }
}

// Marca/desmarca UM capítulo específico como lido (usado pelo botãozinho
// redondo ao lado de cada capítulo na ficha)
function alternarCapituloLido(chaveHQ, cap) {
  let lidos = obterLidos(chaveHQ);
  if (lidos.includes(cap)) {
    lidos = lidos.filter(c => c !== cap);
  } else {
    lidos = [...lidos, cap];
  }
  salvarLidosHQ(chaveHQ, lidos);
  montarListaCapitulos();
  atualizarBotaoMarcarTudo();
}

// Wrapper usado no onclick do botão redondo — evita que o clique também
// abra o capítulo (já que o item inteiro também é clicável)
function cliqueChipLido(evento, cap) {
  evento.stopPropagation();
  alternarCapituloLido(hqAtual, cap);
}

function todosCapitulosLidos(chaveHQ) {
  const hq = hqs[chaveHQ];
  if (!hq) return false;
  const todosCaps = Object.keys(hq.capitulos);
  if (!todosCaps.length) return false;
  const lidos = obterLidos(chaveHQ);
  return todosCaps.every(cap => lidos.includes(cap));
}

// Marca (ou desmarca, se já estiver tudo marcado) a HQ inteira como lida —
// botão "Marcar tudo como lido" na ficha
function alternarTudoLido() {
  const hq = hqs[hqAtual];
  if (!hq) return;

  const todosCaps = Object.keys(hq.capitulos);
  if (todosCapitulosLidos(hqAtual)) {
    salvarLidosHQ(hqAtual, []);
  } else {
    salvarLidosHQ(hqAtual, todosCaps);
  }

  montarListaCapitulos();
  atualizarBotaoMarcarTudo();
}

// Atualiza o texto/visual do botão "Marcar tudo como lido" conforme o
// estado atual da HQ aberta na ficha
function atualizarBotaoMarcarTudo() {
  const btn = document.getElementById('btn-marcar-lido');
  if (!btn) return;

  const tudoLido = todosCapitulosLidos(hqAtual);
  btn.textContent = tudoLido ? '↺ Desmarcar tudo como lido' : '✓ Marcar tudo como lido';
  btn.classList.toggle('ativo', tudoLido);
}

// Quantos capítulos de uma HQ ainda não foram marcados como lidos —
// usado no selo do card da biblioteca
function contarNaoLidos(chaveHQ) {
  const hq = hqs[chaveHQ];
  if (!hq) return 0;
  const todosCaps = Object.keys(hq.capitulos);
  const lidos = obterLidos(chaveHQ).filter(c => todosCaps.includes(c));
  return Math.max(0, todosCaps.length - lidos.length);
}

// ==========================================
// SISTEMA DE NÍVEL DE LEITURA E MOLDURAS DE AVATAR
// Quanto mais páginas a pessoa lê, mais alto o nível e mais molduras
// (imagens PNG que ficam em volta do avatar) ela desbloqueia. Cada nível
// também tem uma cor própria, usada na moldura e no nome do usuário.
// ==========================================
const NIVEIS_LEITURA = [
  { id: "novato", nome: "Novato", cor: "#9e9e9e", paginas: 0, moldura: "assets/molduras/novato.png", descricao: "Nível inicial. Toda jornada começa aqui." },
  { id: "intermediario", nome: "Intermediário", cor: "#4caf50", paginas: 50, moldura: "assets/molduras/intermediario.png", descricao: "Leia 50 páginas para desbloquear." },
  { id: "veterano", nome: "Veterano", cor: "#2196f3", paginas: 150, moldura: "assets/molduras/veterano.png", descricao: "Leia 150 páginas para desbloquear." },
  { id: "pro", nome: "Pro", cor: "#9c27b0", paginas: 300, moldura: "assets/molduras/pro.png", descricao: "Leia 300 páginas para desbloquear." },
  { id: "master", nome: "Master", cor: "#ff9800", paginas: 500, moldura: "assets/molduras/master.png", descricao: "Leia 500 páginas para desbloquear." },
  { id: "supremo", nome: "Supremo", cor: "#e53935", paginas: 800, moldura: "assets/molduras/supremo.png", descricao: "Leia 800 páginas para desbloquear." },
  { id: "ultimate", nome: "Ultimate", cor: "#00e5ff", paginas: 1200, moldura: "assets/molduras/ultimate.png", descricao: "Leia 1200 páginas para desbloquear." },
  { id: "divindade", nome: "Divindade", cor: "#ffd700", paginas: 1800, moldura: "assets/molduras/divindade.png", descricao: "Leia 1800 páginas para desbloquear." },
  { id: "godless", nome: "Godless", cor: "#ff1e27", paginas: 2500, moldura: "assets/molduras/godless.png", descricao: "Leia 2500 páginas para desbloquear." }
];

function obterPaginasLidas() {
  const salvo = parseInt(localStorage.getItem(CHAVE_PAGINAS_LIDAS), 10);
  return Number.isFinite(salvo) && salvo >= 0 ? salvo : 0;
}

function adicionarPaginasLidas(qtd) {
  try {
    const total = obterPaginasLidas() + qtd;
    localStorage.setItem(CHAVE_PAGINAS_LIDAS, total);
    atualizarUINivelLeitura();
  } catch (erro) {
    console.error('Não foi possível salvar as páginas lidas:', erro);
  }
}

// Conta uma página como lida só na primeira vez que ela aparece nesta
// sessão (evita somar de novo ao re-renderizar o leitor)
function contarPaginaSeNova(chaveUnica) {
  if (paginasContadasSessao.has(chaveUnica)) return;
  paginasContadasSessao.add(chaveUnica);
  adicionarPaginasLidas(1);
}

function niveisDesbloqueados() {
  const total = obterPaginasLidas();
  return NIVEIS_LEITURA.filter(nivel => total >= nivel.paginas);
}

function obterNivelAtual() {
  const desbloqueados = niveisDesbloqueados();
  return desbloqueados[desbloqueados.length - 1] || NIVEIS_LEITURA[0];
}

function nivelEhDesbloqueado(idNivel) {
  return niveisDesbloqueados().some(n => n.id === idNivel);
}

// A moldura equipada por padrão é a do nível atual, mas a pessoa pode
// equipar qualquer moldura de nível já desbloqueado (ex: usar uma de nível
// mais baixo mesmo já tendo passado dele)
function obterMolduraEquipada() {
  const salva = localStorage.getItem(CHAVE_MOLDURA_EQUIPADA);
  if (salva && nivelEhDesbloqueado(salva)) return salva;
  return obterNivelAtual().id;
}

function equiparMoldura(idNivel) {
  if (!nivelEhDesbloqueado(idNivel)) return;
  try {
    localStorage.setItem(CHAVE_MOLDURA_EQUIPADA, idNivel);
  } catch (erro) {
    console.error('Não foi possível salvar a moldura equipada:', erro);
  }
  atualizarUINivelLeitura();
  montarDropdownMolduras();
}

// Aplica a moldura equipada (imagem em volta do avatar) e a cor do nível
// atual no nome do usuário, no chip do topo e no rodapé do menu lateral
function aplicarMolduraNaUI() {
  const idEquipada = obterMolduraEquipada();
  const nivelEquipado = NIVEIS_LEITURA.find(n => n.id === idEquipada) || NIVEIS_LEITURA[0];
  const nivelAtual = obterNivelAtual();

  document.querySelectorAll('.chip-avatar, .perfil-avatar').forEach(avatar => {
    avatar.style.setProperty('--moldura-img', `url("${nivelEquipado.moldura}")`);
    avatar.classList.add('com-moldura');
  });

  document.querySelectorAll('.chip-nome, #perfil-texto-sidebar').forEach(nomeEl => {
    nomeEl.style.color = nivelAtual.cor;
  });
}

// Atualiza tudo relacionado a nível/moldura: avatares, cor do nome e o
// resumo textual dentro do modal "Nível de Leitura"
function atualizarUINivelLeitura() {
  aplicarMolduraNaUI();

  const total = obterPaginasLidas();
  const nivelAtual = obterNivelAtual();
  const proximoNivel = NIVEIS_LEITURA.find(n => n.paginas > total);

  const elTotal = document.getElementById('nivel-paginas-total');
  const elNome = document.getElementById('nivel-nome-atual');
  const elProximo = document.getElementById('nivel-proximo-info');

  if (elTotal) elTotal.textContent = total;
  if (elNome) {
    elNome.textContent = nivelAtual.nome;
    elNome.style.color = nivelAtual.cor;
  }
  if (elProximo) {
    elProximo.textContent = proximoNivel
      ? `Faltam ${proximoNivel.paginas - total} página${(proximoNivel.paginas - total) === 1 ? '' : 's'} para "${proximoNivel.nome}"`
      : 'Nível máximo alcançado! 🕷️';
  }
}

// Monta o menu suspenso com todas as molduras existentes. Molduras
// bloqueadas aparecem desabilitadas, com cadeado, e mostram como
// desbloquear ao passar o mouse ou focar (teclado)
function montarDropdownMolduras() {
  const container = document.getElementById('lista-molduras');
  if (!container) return;

  const equipada = obterMolduraEquipada();
  container.innerHTML = '';

  NIVEIS_LEITURA.forEach(nivel => {
    const desbloqueada = nivelEhDesbloqueado(nivel.id);

    const opcao = document.createElement('button');
    opcao.type = 'button';
    opcao.className = 'moldura-opcao'
      + (nivel.id === equipada ? ' ativo' : '')
      + (desbloqueada ? '' : ' bloqueada');
    opcao.disabled = !desbloqueada;

    opcao.innerHTML = `
      <span class="moldura-preview" style="border-color: ${nivel.cor}">
        <img src="${nivel.moldura}" alt="Moldura ${nivel.nome}" onerror="this.style.display='none'">
      </span>
      <span class="moldura-texto">
        <span class="moldura-nome" style="color: ${nivel.cor}">${nivel.nome}${desbloqueada ? '' : ' 🔒'}</span>
        <span class="moldura-descricao">${nivel.descricao}</span>
      </span>
      <span class="moldura-check">✓</span>
    `;

    opcao.title = desbloqueada ? `Equipar moldura de ${nivel.nome}` : nivel.descricao;
    opcao.onmouseenter = () => mostrarDescricaoMoldura(nivel);
    opcao.onfocus = () => mostrarDescricaoMoldura(nivel);
    opcao.onclick = () => equiparMoldura(nivel.id);

    container.appendChild(opcao);
  });

  mostrarDescricaoMoldura(NIVEIS_LEITURA.find(n => n.id === equipada));
}

// Mostra, na caixinha de descrição acima da lista, como desbloquear (ou que
// já está desbloqueada) a moldura que está sob o mouse/foco no momento
function mostrarDescricaoMoldura(nivel) {
  const el = document.getElementById('moldura-descricao-atual');
  if (!el || !nivel) return;
  const desbloqueada = nivelEhDesbloqueado(nivel.id);
  el.innerHTML = `<strong style="color:${nivel.cor}">${nivel.nome}</strong> — ${desbloqueada ? 'Desbloqueada. ' + nivel.descricao : nivel.descricao}`;
}

function abrirNiveis() {
  atualizarUINivelLeitura();
  montarDropdownMolduras();
  document.getElementById('modal-niveis')?.classList.remove('escondido');
  fecharMenu();
  document.getElementById('overlay')?.classList.add('ativo');
}

function fecharNiveis() {
  document.getElementById('modal-niveis')?.classList.add('escondido');
  document.getElementById('overlay')?.classList.remove('ativo');
}

// --- Modo de teste (dev): botões temporários pra simular progresso sem
// precisar ler centenas de páginas de verdade. Remova o bloco no HTML
// (.dev-caixa) antes de publicar o site em produção. ---
function devAdicionarPaginas(qtd = 50) {
  adicionarPaginasLidas(qtd);
  montarDropdownMolduras();
}

function devResetarPaginas() {
  try {
    localStorage.setItem(CHAVE_PAGINAS_LIDAS, 0);
    localStorage.removeItem(CHAVE_MOLDURA_EQUIPADA);
  } catch (erro) {
    console.error('Não foi possível resetar o nível de leitura:', erro);
  }
  atualizarUINivelLeitura();
  montarDropdownMolduras();
}

// ==========================================
// ORDENAÇÃO E FILTRO DE TAGS
// ==========================================
function parseDataBR(data) {
  if (!data) return new Date(0);
  const [dia, mes, ano] = data.split('/').map(Number);
  return new Date(ano || 1970, (mes || 1) - 1, dia || 1);
}

function ordenarChaves(chaves) {
  const lista = [...chaves];
  if (ordenacaoAtual === 'alfabetica') {
    lista.sort((a, b) => hqs[a].titulo.localeCompare(hqs[b].titulo, 'pt-BR'));
  } else if (ordenacaoAtual === 'lido') {
    lista.sort((a, b) => obterLeituras(b) - obterLeituras(a));
  } else {
    lista.sort((a, b) => parseDataBR(hqs[b].lancamento) - parseDataBR(hqs[a].lancamento));
  }
  return lista;
}

function passaFiltroTags(chave) {
  if (filtrosTags.size === 0) return true;
  const tags = hqs[chave].tags || [];
  return tags.some(t => filtrosTags.has(t));
}

function mudarOrdenacao() {
  const select = document.getElementById('select-ordenar');
  if (select) ordenacaoAtual = select.value;
  exibirBiblioteca(filtroAtualBiblioteca);
}

function alternarFiltroTag(tag) {
  if (filtrosTags.has(tag)) {
    filtrosTags.delete(tag);
  } else {
    filtrosTags.add(tag);
  }
  exibirBiblioteca(filtroAtualBiblioteca);
}

// Monta os "chips" clicáveis com todas as tags que existem no banco de dados
function montarChipsTags() {
  const container = document.getElementById('lista-tags');
  if (!container) return;

  const todasTags = new Set();
  Object.values(hqs).forEach(hq => (hq.tags || []).forEach(t => todasTags.add(t)));

  container.innerHTML = '';
  [...todasTags].sort((a, b) => a.localeCompare(b, 'pt-BR')).forEach(tag => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip-tag' + (filtrosTags.has(tag) ? ' ativo' : '');
    chip.textContent = tag;
    chip.onclick = () => alternarFiltroTag(tag);
    container.appendChild(chip);
  });

  const select = document.getElementById('select-ordenar');
  if (select) select.value = ordenacaoAtual;
}

// ==========================================
// CARD PEQUENO (usado nas fileiras "Continuar lendo" e "Recomendados")
// ==========================================
function criarCardMini(chave, mostrarProgresso) {
  const hq = hqs[chave];
  const card = document.createElement('div');
  card.className = 'hq-card-mini';

  let barraProgresso = '';
  if (mostrarProgresso) {
    const progresso = obterProgresso(chave);
    if (progresso && hq.capitulos[progresso.capitulo]) {
      const totalPaginas = hq.capitulos[progresso.capitulo];
      const percentual = Math.min(100, Math.round(((progresso.pagina + 1) / totalPaginas) * 100));
      barraProgresso = `
        <div class="mini-progresso">
          <div class="mini-progresso-preenchido" style="width: ${percentual}%"></div>
        </div>`;
    }
  }

  card.innerHTML = `
    <div class="capa-wrapper">
      <img src="${hq.capa}" alt="${hq.titulo}" loading="lazy">
    </div>
    <div class="mini-info">
      <p class="mini-titulo">${hq.titulo}</p>
      ${barraProgresso}
    </div>
  `;

  card.onclick = () => {
    if (mostrarProgresso) {
      hqAtual = chave;
      continuarLeitura();
    } else {
      selecionarDaBiblioteca(chave);
    }
  };

  return card;
}

// ==========================================
// FILEIRA "CONTINUAR LENDO"
// ==========================================
function montarContinuarLendo() {
  const secao = document.getElementById('secao-continuar');
  const linha = document.getElementById('continuar-lendo-linha');
  if (!secao || !linha) return;

  linha.innerHTML = '';
  const todosProgressos = obterProgressoTodos();

  const chaves = Object.keys(todosProgressos).filter(chave => {
    const hq = hqs[chave];
    const progresso = todosProgressos[chave];
    if (!hq || !hq.capitulos[progresso.capitulo]) return false;

    const capsDaHQ = Object.keys(hq.capitulos);
    const ultimoCap = capsDaHQ[capsDaHQ.length - 1];
    const totalPaginasCapAtual = hq.capitulos[progresso.capitulo];

    // Se já terminou a última página do último capítulo, não conta como "em andamento"
    if (progresso.capitulo === ultimoCap && progresso.pagina >= totalPaginasCapAtual - 1) {
      return false;
    }
    return true;
  });

  if (!chaves.length) {
    secao.classList.add('escondido');
    return;
  }

  chaves.forEach(chave => linha.appendChild(criarCardMini(chave, true)));
  secao.classList.remove('escondido');
}

// ==========================================
// FILEIRA "RECOMENDADOS" (baseada nos favoritos)
// ==========================================
function montarRecomendados() {
  const secao = document.getElementById('secao-recomendados');
  const linha = document.getElementById('recomendados-linha');
  if (!secao || !linha) return;

  linha.innerHTML = '';
  const favoritos = obterFavoritos();

  if (!favoritos.length) {
    secao.classList.add('escondido');
    return;
  }

  const tagsFavoritas = new Set();
  const generosFavoritos = new Set();
  favoritos.forEach(chave => {
    const hq = hqs[chave];
    if (!hq) return;
    (hq.tags || []).forEach(t => tagsFavoritas.add(t));
    generosFavoritos.add(hq.genero);
  });

  const candidatos = Object.keys(hqs).filter(chave => {
    if (favoritos.includes(chave)) return false;
    const hq = hqs[chave];
    const temTagEmComum = (hq.tags || []).some(t => tagsFavoritas.has(t));
    const mesmoGenero = generosFavoritos.has(hq.genero);
    return temTagEmComum || mesmoGenero;
  });

  if (!candidatos.length) {
    secao.classList.add('escondido');
    return;
  }

  candidatos.slice(0, 8).forEach(chave => linha.appendChild(criarCardMini(chave, false)));
  secao.classList.remove('escondido');
}

// ==========================================
// LOGIN BÁSICO (só visual, guardado no navegador)
// ==========================================
function obterUsuario() {
  return localStorage.getItem(CHAVE_USUARIO) || "";
}

function salvarUsuario(nome) {
  try {
    localStorage.setItem(CHAVE_USUARIO, nome);
  } catch (erro) {
    console.error('Não foi possível salvar o usuário:', erro);
  }
  aplicarUsuarioNaUI();
}

function removerUsuario() {
  localStorage.removeItem(CHAVE_USUARIO);
  aplicarUsuarioNaUI();
}

function aplicarUsuarioNaUI() {
  const nome = obterUsuario();
  const chipNome = document.getElementById('chip-nome');
  const chipAvatar = document.getElementById('chip-avatar');
  const textoSidebar = document.getElementById('perfil-texto-sidebar');
  const avatarSidebar = document.getElementById('perfil-avatar-sidebar');

  const iniciais = nome ? nome.trim().charAt(0).toUpperCase() : '';

  if (nome) {
    if (chipNome) chipNome.textContent = nome;
    if (chipAvatar) chipAvatar.textContent = iniciais || '👤';
    if (textoSidebar) textoSidebar.textContent = nome;
    if (avatarSidebar) avatarSidebar.textContent = iniciais || '👤';
  } else {
    if (chipNome) chipNome.textContent = 'Entrar';
    if (chipAvatar) chipAvatar.textContent = '👤';
    if (textoSidebar) textoSidebar.textContent = 'Entrar';
    if (avatarSidebar) avatarSidebar.textContent = '👤';
  }

  // Reaplica a moldura/cor de nível depois de trocar o conteúdo do avatar
  atualizarUINivelLeitura();
}

function abrirLogin() {
  const modal = document.getElementById('modal-login');
  const input = document.getElementById('input-login-nome');
  const btnSair = document.getElementById('btn-sair');
  const nomeAtual = obterUsuario();

  if (input) input.value = nomeAtual;
  if (btnSair) btnSair.classList.toggle('escondido', !nomeAtual);

  if (modal) modal.classList.remove('escondido');
  fecharMenu();
  document.getElementById('overlay')?.classList.add('ativo');

  setTimeout(() => input?.focus(), 50);
}

function fecharLogin() {
  document.getElementById('modal-login')?.classList.add('escondido');
  document.getElementById('overlay')?.classList.remove('ativo');
}

function confirmarLogin() {
  const input = document.getElementById('input-login-nome');
  const nome = input?.value.trim();

  if (!nome) {
    input?.focus();
    return;
  }

  salvarUsuario(nome);
  fecharLogin();
}

function sairLogin() {
  removerUsuario();
  fecharLogin();
}

// Fecha modais e menu lateral juntos (usado pelo overlay)
function fecharTudo() {
  fecharMenu();
  fecharLogin();
  fecharTemas();
  fecharNiveis();
  fecharPerfil();
}

// ==========================================
// FAVORITOS (salvos no navegador da pessoa, sem precisar de login)
// ==========================================
function obterFavoritos() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE_FAVORITOS)) || [];
  } catch (erro) {
    return [];
  }
}

function ehFavorito(chave) {
  return obterFavoritos().includes(chave);
}

function alternarFavorito(chave, evento) {
  if (evento) evento.stopPropagation();

  let favoritos = obterFavoritos();
  if (favoritos.includes(chave)) {
    favoritos = favoritos.filter(f => f !== chave);
  } else {
    favoritos.push(chave);
  }

  try {
    localStorage.setItem(CHAVE_FAVORITOS, JSON.stringify(favoritos));
  } catch (erro) {
    console.error('Não foi possível salvar os favoritos:', erro);
  }

  // Atualiza só o botão clicado, sem redesenhar a grade inteira
  const botao = document.querySelector(`.btn-favorito[data-chave="${chave}"]`);
  if (botao) {
    const ativo = ehFavorito(chave);
    botao.classList.toggle('ativo', ativo);
    botao.innerHTML = ativo ? '♥' : '♡';
  }

  // Se a pessoa estiver vendo a aba de Favoritos e desmarcar um, some da lista
  if (filtroAtualBiblioteca === 'favoritos') {
    exibirBiblioteca('favoritos');
  }
}

// ==========================================
// LÓGICA DO MENU LATERAL
// ==========================================
function toggleMenu() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');
  if (sidebar && overlay) {
    sidebar.classList.toggle('aberto');
    overlay.classList.toggle('ativo');
  }
}

function fecharMenu() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');
  if (sidebar) sidebar.classList.remove('aberto');

  const loginAberto = !document.getElementById('modal-login')?.classList.contains('escondido');
  const temasAberto = !document.getElementById('modal-temas')?.classList.contains('escondido');
  const niveisAberto = !document.getElementById('modal-niveis')?.classList.contains('escondido');
  const perfilAberto = !document.getElementById('modal-perfil')?.classList.contains('escondido');
  if (overlay && (loginAberto || temasAberto || niveisAberto || perfilAberto)) return;
  if (overlay) overlay.classList.remove('ativo');
}

// Marca como "active" só os links (sidebar + navbar) que combinam com a categoria atual
function marcarNavAtivo(categoria) {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.categoria === categoria);
  });
}

function filtrarHQs(categoria) {
  if (categoria === 'todas' || categoria === 'hq' || categoria === 'manga' || categoria === 'favoritos') {
    exibirBiblioteca(categoria);
  }
  fecharMenu();
  return false;
}

// ==========================================
// CRIA O CARD VISUAL DE UMA HQ (usado na biblioteca e na busca)
// ==========================================
function criarCardHQ(chave) {
  const hq = hqs[chave];
  const favoritoAtivo = ehFavorito(chave);
  const naoLidos = contarNaoLidos(chave);
  const badgeNaoLidos = naoLidos > 0
    ? `<span class="badge-nao-lido">${naoLidos} novo${naoLidos === 1 ? '' : 's'}</span>`
    : '';

  const card = document.createElement('div');
  card.className = 'hq-card';
  card.innerHTML = `
    <div class="capa-wrapper">
      <img src="${hq.capa}" alt="${hq.titulo}" loading="lazy">
      ${badgeNaoLidos}
      <button class="btn-favorito ${favoritoAtivo ? 'ativo' : ''}" data-chave="${chave}"
        onclick="alternarFavorito('${chave}', event)" aria-label="Favoritar ${hq.titulo}">${favoritoAtivo ? '♥' : '♡'}</button>
    </div>
    <div class="hq-info">
      <h3>${hq.titulo}</h3>
      <button class="btn-card" onclick="selecionarDaBiblioteca('${chave}')">📖 Ver mais</button>
    </div>
  `;
  return card;
}

// ==========================================
// BANNER GIRATÓRIO (só aparece na aba "Todas"/Destaques)
// Troca de slide sozinho a cada 5s; as setas deixam navegar na mão.
// ==========================================
let bannerIndice = 0;
let bannerTimer = null;
const BANNER_INTERVALO_MS = 10000;

function montarBanner() {
  const slidesEl = document.getElementById('banner-slides');
  const pontosEl = document.getElementById('banner-pontos');
  if (!slidesEl || !pontosEl) return;

  slidesEl.innerHTML = '';
  pontosEl.innerHTML = '';

  const chaves = Object.keys(hqs);

  chaves.forEach((chave, indice) => {
    const hq = hqs[chave];

    const slide = document.createElement('div');
    slide.className = 'banner-slide' + (indice === 0 ? ' ativo' : '');
    slide.innerHTML = `
      <img src="${hq.capa}" alt="${hq.titulo}">
      <div class="banner-legenda">
        <h3>${hq.titulo}</h3>
        <p class="banner-resumo">${hq.resumo || ''}</p>
        <button class="btn-card" onclick="selecionarDaBiblioteca('${chave}')">📖 Ver mais</button>
      </div>
    `;
    slidesEl.appendChild(slide);

    const ponto = document.createElement('span');
    ponto.className = 'banner-ponto' + (indice === 0 ? ' ativo' : '');
    ponto.onclick = () => irParaSlideBanner(indice);
    pontosEl.appendChild(ponto);
  });

  bannerIndice = 0;
  iniciarAutoBanner();
}

function mostrarSlideBanner(indice) {
  const slides = document.querySelectorAll('.banner-slide');
  const pontos = document.querySelectorAll('.banner-ponto');
  if (!slides.length) return;

  bannerIndice = (indice + slides.length) % slides.length;

  slides.forEach((slide, i) => slide.classList.toggle('ativo', i === bannerIndice));
  pontos.forEach((ponto, i) => ponto.classList.toggle('ativo', i === bannerIndice));
}

function bannerProximo() {
  mostrarSlideBanner(bannerIndice + 1);
  reiniciarAutoBanner();
}

function bannerAnterior() {
  mostrarSlideBanner(bannerIndice - 1);
  reiniciarAutoBanner();
}

function irParaSlideBanner(indice) {
  mostrarSlideBanner(indice);
  reiniciarAutoBanner();
}

function iniciarAutoBanner() {
  pararAutoBanner();
  bannerTimer = setInterval(() => mostrarSlideBanner(bannerIndice + 1), BANNER_INTERVALO_MS);
}

function pararAutoBanner() {
  if (bannerTimer) {
    clearInterval(bannerTimer);
    bannerTimer = null;
  }
}

// Clicar numa seta reinicia a contagem dos 5s, pra não trocar de novo
// "no meio" da pessoa escolhendo o que quer ver
function reiniciarAutoBanner() {
  iniciarAutoBanner();
}

// ==========================================
// EXIBIR BIBLIOTECA (GALERIA) - agora é a TELA INICIAL do site
// Aceita um filtro: 'todas', 'hq', 'manga' ou 'favoritos'
// ==========================================
function exibirBiblioteca(filtroGenero = 'todas') {
  filtroAtualBiblioteca = filtroGenero;

  const grid = document.getElementById('biblioteca-hqs');
  const areaLeitor = document.getElementById('area-leitor');
  const cardCapa = document.getElementById('card-capa');
  const seletores = document.getElementById('seletores-topo');
  const btnVoltar = document.getElementById('btn-voltar');
  const titulo = document.getElementById('titulo-secao');
  const banner = document.getElementById('banner-destaques');

  if (!grid) return;
  grid.innerHTML = '';

  const chavesOrdenadas = ordenarChaves(Object.keys(hqs));

  for (const chave of chavesOrdenadas) {
    const hq = hqs[chave];

    if (filtroGenero === 'favoritos') {
      if (!ehFavorito(chave)) continue;
    } else if (filtroGenero !== 'todas' && hq.genero !== filtroGenero) {
      continue;
    }

    if (!passaFiltroTags(chave)) continue;

    grid.appendChild(criarCardHQ(chave));
  }

  if (!grid.hasChildNodes()) {
    grid.innerHTML = filtroGenero === 'favoritos'
      ? '<p style="grid-column: 1 / -1;">Você ainda não favoritou nada. Toque no ♡ de um card pra salvar aqui.</p>'
      : '<p style="grid-column: 1 / -1;">Nenhuma história encontrada nessa categoria.</p>';
  }

  if (titulo) titulo.textContent = ROTULOS_SECAO[filtroGenero] || 'Destaques';
  marcarNavAtivo(filtroGenero);

  // Ao voltar pra biblioteca, o painel listrado e o título voltam a aparecer
  titulo?.classList.remove('escondido');
  document.getElementById('grade-painel')?.classList.remove('escondido');

  grid.classList.remove('escondido');
  if (areaLeitor) areaLeitor.classList.add('escondido');
  if (cardCapa) cardCapa.classList.add('escondido');
  if (seletores) seletores.classList.add('escondido');
  if (btnVoltar) btnVoltar.classList.add('escondido');

  // O banner giratório e as fileiras "Continuar lendo"/"Recomendados"
  // só fazem sentido na aba "Todas" (Destaques)
  if (filtroGenero === 'todas') {
    if (banner) banner.classList.remove('escondido');
    montarBanner();
    montarContinuarLendo();
    montarRecomendados();
  } else {
    if (banner) banner.classList.add('escondido');
    pararAutoBanner();
    document.getElementById('secao-continuar')?.classList.add('escondido');
    document.getElementById('secao-recomendados')?.classList.add('escondido');
  }

  document.getElementById('barra-filtros')?.classList.remove('escondido');
  montarChipsTags();

  document.body.classList.remove('pagina-leitura');
  pararObservadorScroll();
}

function selecionarDaBiblioteca(chave) {
  hqAtual = chave;
  const selectHQ = document.getElementById('select-hq');
  if (selectHQ) selectHQ.value = chave;

  // Mostra a ficha da HQ (capa, título, lançamento, resumo) antes de ler.
  // Quem inicia a leitura de fato é o botão "Capítulos" dentro da ficha.
  carregarCapitulos();
}

// ==========================================
// BARRA DE PESQUISA
// ==========================================
function pesquisarHQ() {
  const termoOriginal = document.getElementById('input-busca')?.value.trim();
  const termo = termoOriginal?.toLowerCase();

  if (!termo) {
    voltarInicio();
    return;
  }

  const grid = document.getElementById('biblioteca-hqs');
  const areaLeitor = document.getElementById('area-leitor');
  const cardCapa = document.getElementById('card-capa');
  const seletores = document.getElementById('seletores-topo');
  const btnVoltar = document.getElementById('btn-voltar');
  const titulo = document.getElementById('titulo-secao');
  const banner = document.getElementById('banner-destaques');

  if (!grid) return;
  grid.innerHTML = '';

  for (let chave in hqs) {
    const hq = hqs[chave];
    if (hq.titulo.toLowerCase().includes(termo)) {
      grid.appendChild(criarCardHQ(chave));
    }
  }

  if (!grid.hasChildNodes()) {
    grid.innerHTML = '<p style="grid-column: 1 / -1;">Nenhuma história encontrada com esse nome.</p>';
  }

  if (titulo) titulo.textContent = `Resultado da busca: "${termoOriginal}"`;
  marcarNavAtivo(null); // nenhum item de menu fica ativo durante a busca

  // A busca também acontece na tela inicial: garante que o painel/título estejam visíveis
  titulo?.classList.remove('escondido');
  document.getElementById('grade-painel')?.classList.remove('escondido');

  grid.classList.remove('escondido');
  if (areaLeitor) areaLeitor.classList.add('escondido');
  if (cardCapa) cardCapa.classList.add('escondido');
  if (seletores) seletores.classList.add('escondido');
  if (btnVoltar) btnVoltar.classList.add('escondido');

  // Busca não mostra o banner giratório, filtros nem as fileiras
  if (banner) banner.classList.add('escondido');
  pararAutoBanner();
  document.getElementById('secao-continuar')?.classList.add('escondido');
  document.getElementById('secao-recomendados')?.classList.add('escondido');
  document.getElementById('barra-filtros')?.classList.add('escondido');
  document.body.classList.remove('pagina-leitura');
  pararObservadorScroll();
}

// ==========================================
// BOTÃO VOLTAR (volta pra tela inicial / biblioteca)
// ==========================================
function voltarInicio() {
  const inputBusca = document.getElementById('input-busca');
  if (inputBusca) inputBusca.value = '';
  exibirBiblioteca('todas');
}

// ==========================================
// LÓGICA DO LEITOR DE HQs / QUADRINHOS
// ==========================================
function carregarMenu() {
  const selectHQ = document.getElementById('select-hq');
  if (!selectHQ) return;
  selectHQ.innerHTML = '';

  for (let chave in hqs) {
    let option = document.createElement('option');
    option.value = chave;
    option.textContent = hqs[chave].titulo;
    selectHQ.appendChild(option);
  }

  carregarCapitulos();
}

function carregarCapitulos() {
  const selectCap = document.getElementById('select-capitulo');
  if (!selectCap) return;
  selectCap.innerHTML = '';

  const caps = hqs[hqAtual].capitulos;
  for (let cap in caps) {
    let option = document.createElement('option');
    option.value = cap;
    option.textContent = `Capítulo ${cap.replace('cap-', '')}`;
    selectCap.appendChild(option);
  }

  capituloAtual = Object.keys(caps)[0];
  paginaAtual = 0;
  exibirFicha();
}

function mudarHQ() {
  hqAtual = document.getElementById('select-hq').value;
  carregarCapitulos();
}

function mudarCapitulo() {
  capituloAtual = document.getElementById('select-capitulo').value;
  paginaAtual = 0;
  exibirFicha();
}

// Clicar num item da lista de capítulos: define qual capítulo e já começa a ler
function abrirCapitulo(cap) {
  capituloAtual = cap;
  const selectCap = document.getElementById('select-capitulo');
  if (selectCap) selectCap.value = cap;
  paginaAtual = 0;
  iniciarLeitura();
}

// Monta a lista visual de capítulos (nome + nº de páginas), clicável.
// Cada item também tem um botãozinho redondo pra marcar/desmarcar
// aquele capítulo específico como lido, sem precisar abrir ele.
function montarListaCapitulos() {
  const lista = document.getElementById('lista-capitulos');
  const totalEl = document.getElementById('ficha-total-capitulos');
  if (!lista) return;

  const caps = hqs[hqAtual].capitulos;
  const chaves = Object.keys(caps);
  const progresso = obterProgresso(hqAtual);
  const lidos = obterLidos(hqAtual);

  lista.innerHTML = '';
  chaves.forEach(cap => {
    const totalPaginas = caps[cap];
    const emProgresso = progresso && progresso.capitulo === cap;
    const lido = lidos.includes(cap);

    // Usa <div> em vez de <button> pra poder ter um botão de verdade
    // (o chip-lido) dentro sem aninhar botão dentro de botão.
    const item = document.createElement('div');
    item.className = 'item-capitulo' + (emProgresso ? ' item-capitulo-progresso' : '');
    item.setAttribute('role', 'button');
    item.setAttribute('tabindex', '0');
    item.innerHTML = `
      <span>Capítulo ${cap.replace('cap-', '')}${emProgresso ? '<span class="capitulo-badge">Continuando</span>' : ''}</span>
      <span class="capitulo-info">
        <span class="capitulo-paginas">${totalPaginas} página${totalPaginas === 1 ? '' : 's'}</span>
        <button type="button" class="chip-lido ${lido ? 'ativo' : ''}"
          title="${lido ? 'Marcar como não lido' : 'Marcar como lido'}"
          aria-label="${lido ? 'Marcar capítulo como não lido' : 'Marcar capítulo como lido'}"
          onclick="cliqueChipLido(event, '${cap}')">${lido ? '✓' : '○'}</button>
      </span>
    `;
    item.onclick = () => abrirCapitulo(cap);
    item.onkeydown = (evento) => {
      if (evento.key === 'Enter' || evento.key === ' ') {
        evento.preventDefault();
        abrirCapitulo(cap);
      }
    };
    lista.appendChild(item);
  });

  const totalLidos = lidos.filter(c => chaves.includes(c)).length;
  if (totalEl) {
    totalEl.textContent = totalLidos > 0
      ? `(${chaves.length} — ${totalLidos} lido${totalLidos === 1 ? '' : 's'})`
      : `(${chaves.length})`;
  }
}

// Mostra a "ficha" da HQ: fundo com a capa desfocada, título, ano, resumo e lista de capítulos.
function exibirFicha() {
  const cardCapa = document.getElementById('card-capa');
  const areaLeitor = document.getElementById('area-leitor');
  const grid = document.getElementById('biblioteca-hqs');
  const banner = document.getElementById('banner-destaques');
  const imgCapa = document.getElementById('imagem-capa');
  const btnVoltar = document.getElementById('btn-voltar');
  const hq = hqs[hqAtual];

  if (cardCapa && areaLeitor && imgCapa && hq) {
    imgCapa.src = hq.capa;
    cardCapa.style.setProperty('--ficha-fundo', `url("${hq.capa}")`);

    const tituloEl = document.getElementById('ficha-titulo');
    const lancamentoEl = document.getElementById('ficha-lancamento');
    const resumoEl = document.getElementById('ficha-resumo-texto');

    if (tituloEl) tituloEl.textContent = hq.titulo;
    if (lancamentoEl) lancamentoEl.textContent = hq.lancamento || 'Não informado';
    if (resumoEl) resumoEl.textContent = hq.resumo || 'Resumo ainda não adicionado.';

    // Mostra o botão "Continuar de onde parou" e o "Limpar progresso" só se
    // já existir progresso salvo pra essa HQ e o capítulo salvo ainda existir.
    const progresso = obterProgresso(hqAtual);
    const continuarBox = document.getElementById('ficha-continuar');
    const spanCap = document.getElementById('continuar-capitulo');
    const spanPag = document.getElementById('continuar-pagina');
    const btnLimpar = document.getElementById('btn-limpar-progresso');
    if (progresso && hq.capitulos[progresso.capitulo]) {
      if (spanCap) spanCap.textContent = progresso.capitulo.replace('cap-', '');
      if (spanPag) spanPag.textContent = progresso.pagina + 1;
      continuarBox?.classList.remove('escondido');
      btnLimpar?.classList.remove('escondido');
    } else {
      continuarBox?.classList.add('escondido');
      btnLimpar?.classList.add('escondido');
    }

    montarListaCapitulos();
    atualizarBotaoMarcarTudo();

    cardCapa.classList.remove('escondido');
    areaLeitor.classList.add('escondido');
    if (grid) grid.classList.add('escondido');
    if (banner) banner.classList.add('escondido');
    if (btnVoltar) btnVoltar.classList.remove('escondido');

    // Esconde o painel listrado, o título "Destaques" e as fileiras/filtros ao entrar na ficha
    document.getElementById('grade-painel')?.classList.add('escondido');
    document.getElementById('titulo-secao')?.classList.add('escondido');
    document.getElementById('secao-continuar')?.classList.add('escondido');
    document.getElementById('secao-recomendados')?.classList.add('escondido');
    document.getElementById('barra-filtros')?.classList.add('escondido');
  }

  document.body.classList.add('pagina-leitura');
  pararAutoBanner();
  pararObservadorScroll();
}

function iniciarLeitura(manterPagina = false) {
  const cardCapa = document.getElementById('card-capa');
  const areaLeitor = document.getElementById('area-leitor');
  const grid = document.getElementById('biblioteca-hqs');
  const seletores = document.getElementById('seletores-topo');
  const btnVoltar = document.getElementById('btn-voltar');

  if (cardCapa && areaLeitor) {
    cardCapa.classList.add('escondido');
    if (grid) grid.classList.add('escondido');
    if (seletores) seletores.classList.remove('escondido');
    if (btnVoltar) btnVoltar.classList.remove('escondido');
    areaLeitor.classList.remove('escondido');
    if (!manterPagina) paginaAtual = 0;

    // Sincroniza o slider de brilho e o botão de duas páginas com o
    // estado salvo antes de renderizar a página em si
    const sliderBrilho = document.getElementById('slider-brilho');
    if (sliderBrilho) sliderBrilho.value = obterBrilhoSalvo();
    atualizarBotaoDuasPaginas();

    atualizarLeitor();
  }

  // Mantém o painel listrado, o título "Destaques" e as fileiras/filtros escondidos durante a leitura
  document.getElementById('grade-painel')?.classList.add('escondido');
  document.getElementById('titulo-secao')?.classList.add('escondido');
  document.getElementById('secao-continuar')?.classList.add('escondido');
  document.getElementById('secao-recomendados')?.classList.add('escondido');
  document.getElementById('barra-filtros')?.classList.add('escondido');

  registrarLeitura(hqAtual);

  document.body.classList.add('pagina-leitura');
}

// Chamada pelo botão "Continuar de onde parou" na ficha da HQ
function continuarLeitura() {
  const progresso = obterProgresso(hqAtual);
  if (!progresso) return;

  capituloAtual = progresso.capitulo;
  const selectCap = document.getElementById('select-capitulo');
  if (selectCap) selectCap.value = capituloAtual;

  paginaAtual = progresso.pagina;
  iniciarLeitura(true);
}

// ==========================================
// MODO DE LEITURA: "pagina" (uma a uma) ou "scroll" (arrastar e carregando)
// ==========================================
function obterModoLeituraPadrao() {
  const salvo = localStorage.getItem(CHAVE_MODO_LEITURA);
  if (salvo === 'pagina' || salvo === 'scroll') return salvo;
  // Sem preferência salva: celular começa em modo scroll, PC começa em modo página
  return window.matchMedia('(max-width: 760px)').matches ? 'scroll' : 'pagina';
}

function alternarModoLeitura() {
  modoLeitura = modoLeitura === 'pagina' ? 'scroll' : 'pagina';
  localStorage.setItem(CHAVE_MODO_LEITURA, modoLeitura);
  atualizarLeitor();
}

function atualizarLeitor() {
  const btnModo = document.getElementById('btn-modo-leitor');
  if (btnModo) {
    btnModo.textContent = modoLeitura === 'pagina' ? '📜 Scroll' : '📄 Página';
  }

  // O botão de "duas páginas" só faz sentido no modo página
  const btnDuas = document.getElementById('btn-duas-paginas');
  if (btnDuas) btnDuas.classList.toggle('escondido', modoLeitura !== 'pagina');

  // O botão flutuante "voltar ao topo" só faz sentido no modo scroll —
  // some imediatamente ao trocar pra modo página
  if (modoLeitura !== 'scroll') {
    document.getElementById('btn-topo-scroll')?.classList.add('escondido');
  }

  if (modoLeitura === 'scroll') {
    montarLeitorScroll();
  } else {
    montarLeitorPagina();
  }
}

// --- Modo página: uma página, ou duas lado a lado se o modo "dois em um" estiver ativo ---
function montarLeitorPagina() {
  pararObservadorScroll();

  const totalPaginas = hqs[hqAtual].capitulos[capituloAtual];
  const imgElement = document.getElementById('pagina-imagem');
  const imgElement2 = document.getElementById('pagina-imagem-2');
  const contador = document.getElementById('contador-pagina');
  const leitorPagina = document.getElementById('leitor-pagina');
  const leitorScroll = document.getElementById('leitor-scroll');
  const btnAnterior = document.getElementById('btn-anterior');
  const btnProxima = document.getElementById('btn-proxima');

  if (leitorPagina) leitorPagina.classList.remove('escondido');
  if (leitorScroll) leitorScroll.classList.add('escondido');
  if (btnAnterior) btnAnterior.classList.remove('escondido');
  if (btnProxima) btnProxima.classList.remove('escondido');

  const duasAgora = duasPaginasEstaoAtivas();
  leitorPagina?.classList.toggle('duas-paginas', duasAgora);

  if (imgElement && totalPaginas) {
    imgElement.src = caminhoPagina(hqAtual, capituloAtual, paginaAtual + 1);
  }

  if (imgElement2) {
    const temSegundaPagina = duasAgora && (paginaAtual + 2 <= totalPaginas);
    if (temSegundaPagina) {
      imgElement2.src = caminhoPagina(hqAtual, capituloAtual, paginaAtual + 2);
      imgElement2.classList.remove('escondido');
    } else {
      imgElement2.classList.add('escondido');
    }
  }

  if (contador && totalPaginas) {
    if (duasAgora && paginaAtual + 2 <= totalPaginas) {
      contador.innerText = `Páginas ${paginaAtual + 1}-${paginaAtual + 2} de ${totalPaginas}`;
    } else {
      contador.innerText = `Página ${paginaAtual + 1} de ${totalPaginas}`;
    }
  }

  salvarProgresso(hqAtual, capituloAtual, paginaAtual);

  // Conta a(s) página(s) exibida(s) agora pro nível de leitura (só na
  // primeira vez que aparecem nesta sessão)
  contarPaginaSeNova(`${hqAtual}|${capituloAtual}|${paginaAtual}`);
  if (duasAgora && (paginaAtual + 2 <= totalPaginas)) {
    contarPaginaSeNova(`${hqAtual}|${capituloAtual}|${paginaAtual + 1}`);
  }

  // Pré-carrega a(s) próxima(s) página(s) em segundo plano, pra trocar sem "flash" branco
  const proximaAPreCarregar = paginaAtual + (duasAgora ? 3 : 2);
  if (totalPaginas && proximaAPreCarregar <= totalPaginas) {
    const preCarrega = new Image();
    preCarrega.src = caminhoPagina(hqAtual, capituloAtual, proximaAPreCarregar);
  }

  // Volta o zoom ao normal sempre que a página muda
  if (typeof resetarZoomLeitor === 'function') resetarZoomLeitor();

  aplicarBrilhoNasPaginas(obterBrilhoSalvo());
}

// Quantas páginas avançar/voltar por vez: 2 no modo "dois em um" ativo em tela larga, senão 1
function passoDePaginas() {
  return duasPaginasEstaoAtivas() ? 2 : 1;
}

function proximaPagina() {
  if (modoLeitura !== 'pagina') return;
  const totalPaginas = hqs[hqAtual].capitulos[capituloAtual];
  if (paginaAtual < totalPaginas - 1) {
    paginaAtual = Math.min(paginaAtual + passoDePaginas(), totalPaginas - 1);
    montarLeitorPagina();
  }
}

function paginaAnterior() {
  if (modoLeitura !== 'pagina') return;
  if (paginaAtual > 0) {
    paginaAtual = Math.max(0, paginaAtual - passoDePaginas());
    montarLeitorPagina();
  }
}

// --- Modo scroll: todas as páginas em lista vertical, sem bordas, carregando sob demanda ---
function montarLeitorScroll() {
  const totalPaginas = hqs[hqAtual].capitulos[capituloAtual];
  const leitorPagina = document.getElementById('leitor-pagina');
  const leitorScroll = document.getElementById('leitor-scroll');
  const contador = document.getElementById('contador-pagina');
  const btnAnterior = document.getElementById('btn-anterior');
  const btnProxima = document.getElementById('btn-proxima');

  if (leitorPagina) leitorPagina.classList.add('escondido');
  if (btnAnterior) btnAnterior.classList.add('escondido');
  if (btnProxima) btnProxima.classList.add('escondido');
  if (!leitorScroll || !totalPaginas) return;

  leitorScroll.classList.remove('escondido');
  leitorScroll.innerHTML = '';

  // Cria todas as páginas do capítulo, mas com loading="lazy": o navegador só
  // baixa a imagem quando ela está perto de aparecer na tela (economiza dados).
  for (let i = 1; i <= totalPaginas; i++) {
    const img = document.createElement('img');
    img.src = caminhoPagina(hqAtual, capituloAtual, i);
    img.alt = `Página ${i}`;
    img.loading = 'lazy';
    img.dataset.pagina = i;
    img.className = 'scroll-pagina';
    leitorScroll.appendChild(img);
  }

  // Aviso de fim de capítulo + atalho pro próximo, se existir
  const caps = Object.keys(hqs[hqAtual].capitulos);
  const indiceAtual = caps.indexOf(capituloAtual);
  const proximoCap = caps[indiceAtual + 1];

  const fim = document.createElement('div');
  fim.className = 'scroll-fim';
  fim.innerHTML = proximoCap
    ? `<button class="btn-nav" onclick="irParaProximoCapitulo()">Fim do capítulo — Ir para o Capítulo ${proximoCap.replace('cap-', '')} ▶</button>`
    : `<p>Fim do capítulo 🕸️</p>`;
  leitorScroll.appendChild(fim);

  if (contador) contador.innerText = `Página 1 de ${totalPaginas}`;

  iniciarObservadorScroll(totalPaginas);
  aplicarBrilhoNasPaginas(obterBrilhoSalvo());
}

function irParaProximoCapitulo() {
  const caps = Object.keys(hqs[hqAtual].capitulos);
  const indiceAtual = caps.indexOf(capituloAtual);
  const proximoCap = caps[indiceAtual + 1];
  if (!proximoCap) return;

  capituloAtual = proximoCap;
  paginaAtual = 0;
  const selectCap = document.getElementById('select-capitulo');
  if (selectCap) selectCap.value = proximoCap;

  montarLeitorScroll();
  document.getElementById('leitor-scroll')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Atualiza o contador "Página X de Y" conforme a pessoa arrasta a tela
function iniciarObservadorScroll(totalPaginas) {
  pararObservadorScroll();

  const contador = document.getElementById('contador-pagina');
  if (!contador || typeof IntersectionObserver === 'undefined') return;

  observerScroll = new IntersectionObserver((entradas) => {
    entradas.forEach(entrada => {
      if (entrada.isIntersecting) {
        const numero = entrada.target.dataset.pagina;
        paginaAtual = Number(numero) - 1;
        contador.innerText = `Página ${numero} de ${totalPaginas}`;
        salvarProgresso(hqAtual, capituloAtual, paginaAtual);
        contarPaginaSeNova(`${hqAtual}|${capituloAtual}|${paginaAtual}`);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.scroll-pagina').forEach(img => observerScroll.observe(img));
}

function pararObservadorScroll() {
  if (observerScroll) {
    observerScroll.disconnect();
    observerScroll = null;
  }
}

// ==========================================
// AJUSTE DE BRILHO DA PÁGINA (slider — bom pra ler à noite)
// Aplica filter: brightness() nas imagens do leitor. Fica salvo no
// navegador e é reaplicado toda vez que uma página nova é carregada.
// ==========================================
function obterBrilhoSalvo() {
  const salvo = parseInt(localStorage.getItem(CHAVE_BRILHO), 10);
  return Number.isFinite(salvo) && salvo >= 40 && salvo <= 100 ? salvo : 100;
}

function ajustarBrilho(valor) {
  const brilho = Math.min(100, Math.max(40, Number(valor) || 100));
  try {
    localStorage.setItem(CHAVE_BRILHO, brilho);
  } catch (erro) {
    console.error('Não foi possível salvar o brilho:', erro);
  }
  aplicarBrilhoNasPaginas(brilho);
}

function aplicarBrilhoNasPaginas(brilho) {
  const filtro = `brightness(${brilho}%)`;
  const imgPagina = document.getElementById('pagina-imagem');
  const imgPagina2 = document.getElementById('pagina-imagem-2');
  if (imgPagina) imgPagina.style.filter = filtro;
  if (imgPagina2) imgPagina2.style.filter = filtro;
  document.querySelectorAll('.scroll-pagina').forEach(img => { img.style.filter = filtro; });
}

// ==========================================
// MODO "DOIS EM UM" (PC): mostra duas páginas lado a lado no modo página,
// como um livro/mangá aberto, em telas largas (>=1024px).
// ==========================================
function duasPaginasEstaoAtivas() {
  return duasPaginasAtivo && modoLeitura === 'pagina' && window.matchMedia('(min-width: 1024px)').matches;
}

function alternarModoDuasPaginas() {
  duasPaginasAtivo = !duasPaginasAtivo;
  try {
    localStorage.setItem(CHAVE_DUAS_PAGINAS, duasPaginasAtivo ? '1' : '0');
  } catch (erro) {
    console.error('Não foi possível salvar a preferência de duas páginas:', erro);
  }
  atualizarBotaoDuasPaginas();
  if (modoLeitura === 'pagina') montarLeitorPagina();
}

function atualizarBotaoDuasPaginas() {
  const btn = document.getElementById('btn-duas-paginas');
  if (!btn) return;
  btn.classList.toggle('ativo', duasPaginasAtivo);
  btn.textContent = duasPaginasAtivo ? '📖 Página única' : '📖 Duas páginas';
}

// Recalcula o layout de página(s) quando a tela é redimensionada (ex: girar
// o celular, ou o PC passar a valer/deixar de valer a regra de 1024px)
let redimensionamentoTimer = null;
window.addEventListener('resize', () => {
  clearTimeout(redimensionamentoTimer);
  redimensionamentoTimer = setTimeout(() => {
    const areaLeitor = document.getElementById('area-leitor');
    if (!areaLeitor || areaLeitor.classList.contains('escondido')) return;
    if (modoLeitura === 'pagina') montarLeitorPagina();
  }, 200);
});

// ==========================================
// BOTÃO FLUTUANTE "VOLTAR AO TOPO" (modo scroll)
// Aparece só quando a pessoa está lendo em modo scroll e já rolou bastante.
// ==========================================
function configurarBotaoTopo() {
  const btn = document.getElementById('btn-topo-scroll');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    const areaLeitor = document.getElementById('area-leitor');
    const emLeituraScroll = document.body.classList.contains('pagina-leitura')
      && modoLeitura === 'scroll'
      && areaLeitor && !areaLeitor.classList.contains('escondido');

    if (emLeituraScroll && window.scrollY > 600) {
      btn.classList.remove('escondido');
    } else {
      btn.classList.add('escondido');
    }
  }, { passive: true });
}

function voltarTopoScroll() {
  const areaLeitor = document.getElementById('area-leitor');
  if (areaLeitor) {
    areaLeitor.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// ==========================================
// ZOOM NA PÁGINA (modo página): roda do mouse no PC, pinça no celular,
// arrastar quando tiver zoom, e duplo clique/toque pra voltar ao normal.
// ==========================================
function configurarZoomLeitor() {
  const caixa = document.getElementById('leitor-pagina');
  const img = document.getElementById('pagina-imagem');
  if (!caixa || !img) return;

  let escala = 1;
  let transladoX = 0;
  let transladoY = 0;

  let distanciaInicialPinça = 0;
  let escalaInicialPinça = 1;

  let arrastando = false;
  let arrastoInicioX = 0;
  let arrastoInicioY = 0;
  let transladoInicioX = 0;
  let transladoInicioY = 0;

  function distanciaEntreToques(toques) {
    const dx = toques[0].clientX - toques[1].clientX;
    const dy = toques[0].clientY - toques[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function aplicarZoom(comTransicao) {
    img.style.transition = comTransicao ? 'transform 0.15s ease-out' : 'none';
    img.style.transform = `translate(${transladoX}px, ${transladoY}px) scale(${escala})`;
    caixa.classList.toggle('zoom-ativo', escala > 1);
  }

  function resetarZoom() {
    escala = 1;
    transladoX = 0;
    transladoY = 0;
    aplicarZoom(true);
  }

  // Exposto globalmente pra resetar sempre que a pessoa troca de página
  window.resetarZoomLeitor = resetarZoom;

  // --- PC: roda do mouse dá zoom ---
  caixa.addEventListener('wheel', (evento) => {
    if (modoLeitura !== 'pagina') return;
    evento.preventDefault();
    const variacao = -evento.deltaY * 0.0015;
    escala = Math.min(3, Math.max(1, escala + variacao));
    if (escala === 1) { transladoX = 0; transladoY = 0; }
    aplicarZoom(false);
  }, { passive: false });

  // --- PC: duplo clique reseta o zoom ---
  caixa.addEventListener('dblclick', () => resetarZoom());

  // --- PC: arrastar a imagem quando já tem zoom ---
  caixa.addEventListener('mousedown', (evento) => {
    if (escala <= 1) return;
    arrastando = true;
    arrastoInicioX = evento.clientX;
    arrastoInicioY = evento.clientY;
    transladoInicioX = transladoX;
    transladoInicioY = transladoY;
  });

  window.addEventListener('mousemove', (evento) => {
    if (!arrastando) return;
    transladoX = transladoInicioX + (evento.clientX - arrastoInicioX);
    transladoY = transladoInicioY + (evento.clientY - arrastoInicioY);
    aplicarZoom(false);
  });

  window.addEventListener('mouseup', () => { arrastando = false; });

  // --- Celular: pinça com 2 dedos dá zoom; 1 dedo arrasta se já tiver zoom ---
  caixa.addEventListener('touchstart', (evento) => {
    if (evento.touches.length === 2) {
      distanciaInicialPinça = distanciaEntreToques(evento.touches);
      escalaInicialPinça = escala;
    } else if (evento.touches.length === 1 && escala > 1) {
      arrastando = true;
      arrastoInicioX = evento.touches[0].clientX;
      arrastoInicioY = evento.touches[0].clientY;
      transladoInicioX = transladoX;
      transladoInicioY = transladoY;
    }
  }, { passive: true });

  caixa.addEventListener('touchmove', (evento) => {
    if (evento.touches.length === 2) {
      evento.preventDefault();
      const distanciaAtual = distanciaEntreToques(evento.touches);
      const fator = distanciaAtual / distanciaInicialPinça;
      escala = Math.min(3, Math.max(1, escalaInicialPinça * fator));
      if (escala === 1) { transladoX = 0; transladoY = 0; }
      aplicarZoom(false);
    } else if (evento.touches.length === 1 && arrastando) {
      evento.preventDefault();
      transladoX = transladoInicioX + (evento.touches[0].clientX - arrastoInicioX);
      transladoY = transladoInicioY + (evento.touches[0].clientY - arrastoInicioY);
      aplicarZoom(false);
    }
  }, { passive: false });

  caixa.addEventListener('touchend', (evento) => {
    if (evento.touches.length === 0) arrastando = false;
  });

  // --- Celular: duplo toque reseta o zoom ---
  let ultimoToqueEm = 0;
  caixa.addEventListener('touchend', () => {
    const agora = Date.now();
    if (agora - ultimoToqueEm < 300) resetarZoom();
    ultimoToqueEm = agora;
  });
}

// ==========================================
// ATALHOS DE TECLADO NO LEITOR
// Modo página: ← / → trocam de página.
// Modo scroll: ↓ / espaço rolam pra baixo, ↑ rola pra cima — do jeito
// que a pessoa já espera de um leitor tipo "webtoon".
// Só funciona quando a pessoa está de fato lendo, e nunca quando o
// foco está num campo de texto (input/select/textarea).
// ==========================================
document.addEventListener('keydown', (evento) => {
  if (!document.body.classList.contains('pagina-leitura')) return;

  const areaLeitor = document.getElementById('area-leitor');
  if (!areaLeitor || areaLeitor.classList.contains('escondido')) return;

  const foco = evento.target;
  const digitando = foco && ['INPUT', 'TEXTAREA', 'SELECT'].includes(foco.tagName);
  if (digitando) return;

  if (modoLeitura === 'pagina') {
    if (evento.key === 'ArrowRight') {
      proximaPagina();
    } else if (evento.key === 'ArrowLeft') {
      paginaAnterior();
    }
    return;
  }

  // modoLeitura === 'scroll'
  const alturaRolagem = window.innerHeight * 0.85;
  if (evento.key === 'ArrowDown' || evento.code === 'Space' || evento.key === ' ') {
    evento.preventDefault();
    window.scrollBy({ top: alturaRolagem, behavior: 'smooth' });
  } else if (evento.key === 'ArrowUp') {
    evento.preventDefault();
    window.scrollBy({ top: -alturaRolagem, behavior: 'smooth' });
  }
});

// ==========================================
// INICIALIZAÇÃO: carrega os dropdowns, aplica o tema salvo
// e já mostra a grade de Destaques
// ==========================================
function iniciarApp() {
  document.documentElement.setAttribute('data-tema', obterTemaSalvo());
  modoLeitura = obterModoLeituraPadrao();
  aplicarUsuarioNaUI();
  atualizarUINivelLeitura();
  carregarMenu();
  exibirBiblioteca('todas');
  configurarZoomLeitor();
  configurarBotaoTopo();
  atualizarBotaoDuasPaginas();
}
// ==========================================
// TELA CHEIA (esconde a barra de endereço/comandos do celular)
// Usa a Fullscreen API: funciona em navegadores mobile modernos e,
// quando o site é aberto como app instalado (PWA), some de vez.
// ==========================================
function documentoEmTelaCheia() {
  return !!(document.fullscreenElement || document.webkitFullscreenElement);
}

function alternarTelaCheia() {
  if (!documentoEmTelaCheia()) {
    const elemento = document.documentElement;
    const pedido = elemento.requestFullscreen
      || elemento.webkitRequestFullscreen
      || elemento.msRequestFullscreen;
    if (pedido) pedido.call(elemento).catch(() => {});
  } else {
    const saida = document.exitFullscreen
      || document.webkitExitFullscreen
      || document.msExitFullscreen;
    if (saida) saida.call(document).catch(() => {});
  }
  fecharMenu();
}

// Mantém o texto do botão sincronizado com o estado real de tela cheia
// (cobre também o caso da pessoa apertar Esc pra saber)
function atualizarTextoTelaCheia() {
  const texto = document.getElementById('texto-tela-cheia');
  if (texto) texto.textContent = documentoEmTelaCheia() ? 'Sair da Tela Cheia' : 'Tela Cheia';
}

document.addEventListener('fullscreenchange', atualizarTextoTelaCheia);
document.addEventListener('webkitfullscreenchange', atualizarTextoTelaCheia);

// ==========================================
// BOTÃO "VOLTAR" na tela de Nível de Leitura/Molduras
// Fecha o modal e reabre o menu lateral, de onde a pessoa veio
// ==========================================
function voltarNiveis() {
  fecharNiveis();
  toggleMenu();
}

// ==========================================
// PERFIL DO USUÁRIO (avatar com moldura + estatísticas)
// ==========================================

// Decide se clicar no avatar/nome abre o perfil (já logado) ou o login
function abrirPerfilOuLogin() {
  if (obterUsuario()) {
    abrirPerfil();
  } else {
    abrirLogin();
  }
}

// Soma quantos capítulos foram marcados como lidos em todas as HQs
function contarTotalCapitulosLidos() {
  const todos = obterLidosTodos();
  return Object.values(todos).reduce((soma, lista) => soma + lista.length, 0);
}

function abrirPerfil() {
  const nome = obterUsuario() || 'Aracnídeo';
  const iniciais = nome.trim().charAt(0).toUpperCase() || '👤';
  const nivelAtual = obterNivelAtual();
  const idEquipada = obterMolduraEquipada();
  const nivelEquipado = NIVEIS_LEITURA.find(n => n.id === idEquipada) || NIVEIS_LEITURA[0];
  const total = obterPaginasLidas();
  const proximoNivel = NIVEIS_LEITURA.find(n => n.paginas > total);

  const avatarGrande = document.getElementById('perfil-avatar-grande');
  const nomeGrande = document.getElementById('perfil-nome-grande');
  const nivelGrande = document.getElementById('perfil-nivel-grande');
  const proximoInfo = document.getElementById('perfil-proximo-nivel');

  if (avatarGrande) {
    avatarGrande.textContent = iniciais;
    avatarGrande.classList.remove('com-moldura');
    avatarGrande.style.removeProperty('--moldura-img');

    // Só aplica a moldura depois de confirmar que a imagem existe de
    // verdade, pra nunca deixar a moldura "sumida" ou quebrada
    const testeImg = new Image();
    testeImg.onload = () => {
      avatarGrande.style.setProperty('--moldura-img', `url("${nivelEquipado.moldura}")`);
      avatarGrande.classList.add('com-moldura');
    };
    testeImg.src = nivelEquipado.moldura;
  }

  if (nomeGrande) nomeGrande.textContent = nome;
  if (nivelGrande) {
    nivelGrande.textContent = nivelAtual.nome;
    nivelGrande.style.color = nivelAtual.cor;
  }
  if (proximoInfo) {
    proximoInfo.textContent = proximoNivel
      ? `Faltam ${proximoNivel.paginas - total} página${(proximoNivel.paginas - total) === 1 ? '' : 's'} para "${proximoNivel.nome}"`
      : 'Nível máximo alcançado! 🕷️';
  }

  const statPaginas = document.getElementById('perfil-stat-paginas');
  const statFavoritos = document.getElementById('perfil-stat-favoritos');
  const statCapitulos = document.getElementById('perfil-stat-capitulos');
  if (statPaginas) statPaginas.textContent = total;
  if (statFavoritos) statFavoritos.textContent = obterFavoritos().length;
  if (statCapitulos) statCapitulos.textContent = contarTotalCapitulosLidos();

  document.getElementById('modal-perfil')?.classList.remove('escondido');
  fecharMenu();
  document.getElementById('overlay')?.classList.add('ativo');
}

function fecharPerfil() {
  document.getElementById('modal-perfil')?.classList.add('escondido');
  document.getElementById('overlay')?.classList.remove('ativo');
}

window.onload = iniciarApp;