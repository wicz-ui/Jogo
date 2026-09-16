const CHAVE_PERFIS = "guardioes_perfis";
const CHAVE_PERFIL_ATIVO = "guardioes_perfil_ativo";
const CHAVE_LEGADA = "guardioes_perfil";

// Fallback pequeno para que o módulo também possa ser exercitado no Node.js.
const memoriaStorage = new Map();
const storageEmMemoria = {
  getItem(chave) {
    return memoriaStorage.has(chave) ? memoriaStorage.get(chave) : null;
  },
  setItem(chave, valor) {
    memoriaStorage.set(chave, String(valor));
  }
};

function obterStorage() {
  try {
    if (typeof globalThis !== "undefined" && globalThis.localStorage) {
      return globalThis.localStorage;
    }
  } catch {
    // Alguns ambientes podem bloquear o acesso ao localStorage.
  }

  return storageEmMemoria;
}

function clonar(valor) {
  if (typeof structuredClone === "function") {
    return structuredClone(valor);
  }

  return JSON.parse(JSON.stringify(valor));
}

function gerarId() {
  const sufixo = Math.random().toString(36).slice(2, 8);
  return `perfil-${Date.now()}-${sufixo}`;
}

function criarPerfilBase(nome) {
  return {
    id: gerarId(),
    nome,
    pontuacao: {
      cuidado: 0,
      conduta: 0,
      danos: 0
    },
    progresso: {
      faseAtual: 1,
      fasesConcluidas: []
    },
    escolhasRealizadas: []
  };
}

function normalizarPerfil(perfil) {
  const perfilSeguro = clonar(perfil || {});

  perfilSeguro.id = perfilSeguro.id || gerarId();
  perfilSeguro.nome = String(perfilSeguro.nome || "Jogador").trim() || "Jogador";
  perfilSeguro.pontuacao = {
    cuidado: Number(perfilSeguro.pontuacao?.cuidado) || 0,
    conduta: Number(perfilSeguro.pontuacao?.conduta) || 0,
    danos: Number(perfilSeguro.pontuacao?.danos) || 0
  };
  perfilSeguro.progresso = {
    faseAtual: Number(perfilSeguro.progresso?.faseAtual) || 1,
    fasesConcluidas: Array.isArray(perfilSeguro.progresso?.fasesConcluidas)
      ? [...perfilSeguro.progresso.fasesConcluidas]
      : []
  };
  perfilSeguro.escolhasRealizadas = Array.isArray(perfilSeguro.escolhasRealizadas)
    ? [...perfilSeguro.escolhasRealizadas]
    : [];

  return perfilSeguro;
}

function lerJSON(storage, chave) {
  const dados = storage.getItem(chave);

  if (!dados) {
    return null;
  }

  try {
    return JSON.parse(dados);
  } catch {
    return null;
  }
}

function armazenarPerfis(perfis) {
  obterStorage().setItem(CHAVE_PERFIS, JSON.stringify(perfis));
}

function lerPerfis() {
  const storage = obterStorage();
  const dados = lerJSON(storage, CHAVE_PERFIS);

  if (Array.isArray(dados)) {
    return dados.map(normalizarPerfil);
  }

  // Migração simples da primeira versão, que armazenava apenas um perfil.
  const perfilLegado = lerJSON(storage, CHAVE_LEGADA);
  if (perfilLegado && typeof perfilLegado === "object") {
    const perfilMigrado = normalizarPerfil(perfilLegado);
    armazenarPerfis([perfilMigrado]);

    if (!storage.getItem(CHAVE_PERFIL_ATIVO)) {
      storage.setItem(CHAVE_PERFIL_ATIVO, perfilMigrado.id);
    }

    return [perfilMigrado];
  }

  return [];
}

/** Salva ou atualiza um perfil e o torna o perfil ativo. */
function salvarPerfil(perfil) {
  const perfilSalvo = normalizarPerfil(perfil);
  const perfis = lerPerfis();
  const indice = perfis.findIndex((item) => item.id === perfilSalvo.id);

  if (indice >= 0) {
    perfis[indice] = perfilSalvo;
  } else {
    perfis.push(perfilSalvo);
  }

  armazenarPerfis(perfis);
  obterStorage().setItem(CHAVE_PERFIL_ATIVO, perfilSalvo.id);

  return clonar(perfilSalvo);
}

/**
 * Carrega um perfil pelo id. Sem id, mantém compatibilidade com a API antiga
 * e retorna o perfil ativo (ou o primeiro perfil disponível).
 */
function carregarPerfil(id) {
  const perfis = lerPerfis();
  const storage = obterStorage();
  const idProcurado = id || storage.getItem(CHAVE_PERFIL_ATIVO);
  const perfil = perfis.find((item) => item.id === idProcurado) || (!id ? perfis[0] : null);

  return perfil ? clonar(perfil) : null;
}

function listarPerfis() {
  return lerPerfis().map(clonar);
}

function selecionarPerfil(id) {
  const perfil = lerPerfis().find((item) => item.id === id);

  if (!perfil) {
    return null;
  }

  obterStorage().setItem(CHAVE_PERFIL_ATIVO, perfil.id);
  return clonar(perfil);
}

function carregarPerfilAtivo() {
  const perfis = lerPerfis();
  const storage = obterStorage();
  const idAtivo = storage.getItem(CHAVE_PERFIL_ATIVO);
  const perfilAtivo = perfis.find((item) => item.id === idAtivo) || perfis[0];

  if (!perfilAtivo) {
    return null;
  }

  if (idAtivo !== perfilAtivo.id) {
    storage.setItem(CHAVE_PERFIL_ATIVO, perfilAtivo.id);
  }

  return clonar(perfilAtivo);
}

function criarNovoPerfil(nomeDoJogador) {
  const nome = String(nomeDoJogador ?? "").trim();

  if (!nome) {
    throw new Error("Digite um nome para criar o perfil.");
  }

  return salvarPerfil(criarPerfilBase(nome));
}

export {
  salvarPerfil,
  carregarPerfil,
  listarPerfis,
  selecionarPerfil,
  carregarPerfilAtivo,
  criarNovoPerfil
};
