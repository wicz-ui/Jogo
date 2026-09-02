function salvarPerfil(perfil) {
  localStorage.setItem("guardioes_perfil", JSON.stringify(perfil));
}

function carregarPerfil() {
  const dados = localStorage.getItem("guardioes_perfil");
  return dados ? JSON.parse(dados) : null;
}