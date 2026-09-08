// src/data/ProfileRepository.js

// 1. O molde inicial do perfil (estado inicial de um novo jogador)
const perfilInicial = {
  id: "perfil-001",
  nome: "João",
  pontuacao: {
    cuidado: 0,
    conduta: 0,
    danos: 0
  },
  progresso: {
    faseAtual: 1,
    fasesConcluidas: []
  }
};

// 2. Função para salvar os dados no navegador
function salvarPerfil(perfil) {
  localStorage.setItem("guardioes_perfil", JSON.stringify(perfil));
}

// 3. Função para recuperar os dados do navegador
function carregarPerfil() {
  const dados = localStorage.getItem("guardioes_perfil");
  // Se existir, transforma de volta em objeto. Se não, retorna vazio (null)
  return dados ? JSON.parse(dados) : null;
}

// 4. Função pronta para o Front-end usar quando o jogador digitar o nome na tela inicial
function criarNovoPerfil(nomeDoJogador) {
  // Cria uma cópia exata do perfilInicial para não alterar o molde original
  const novoPerfil = { ...perfilInicial }; 
  
  // Atualiza com o nome que o jogador digitou na tela
  novoPerfil.nome = nomeDoJogador;
  
  // Cria um ID único (usando a data/hora atual) para evitar conflitos de salvamento
  novoPerfil.id = "perfil-" + Date.now(); 

  // Salva o perfil recém-criado
  salvarPerfil(novoPerfil);
  
  return novoPerfil;
}
export { salvarPerfil, carregarPerfil, criarNovoPerfil };