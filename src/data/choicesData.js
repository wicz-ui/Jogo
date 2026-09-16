export const CHOICES = {
  desligar_computador: {
    id: "desligar_computador",
    interacaoId: "computador_01",
    tipo: "positiva",
    cuidado: 10,
    conduta: 8,
    mensagem: "Você desligou corretamente o equipamento."
  },
  ignorar_computador: {
    id: "ignorar_computador",
    interacaoId: "computador_01",
    tipo: "negativa",
    cuidado: 0,
    conduta: -5,
    mensagem: "O equipamento continuou ligado consumindo energia sem necessidade."
  }
};
