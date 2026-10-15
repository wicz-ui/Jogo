const DESFECHOS = Object.freeze({
  guardiao: Object.freeze({
    id: "guardiao",
    titulo: "GUARDIÃO DA ESCOLA",
    mensagem:
      "Suas escolhas demonstraram cuidado, cooperação e responsabilidade.\n" +
      "Você ajudou a preservar o ambiente e tornou a escola melhor para todos."
  }),
  reparacao: Object.freeze({
    id: "reparacao",
    titulo: "APRENDEU E REPAROU",
    mensagem:
      "Você cometeu alguns erros durante o caminho, mas também tomou decisões responsáveis.\n" +
      "As escolhas têm consequências, e mudar de atitude também faz diferença."
  }),
  responsabilizacao: Object.freeze({
    id: "responsabilizacao",
    titulo: "RESPONSABILIZAÇÃO",
    mensagem:
      "Algumas escolhas causaram danos e consequências para o ambiente escolar.\n" +
      "Cuidar dos espaços e equipamentos é responsabilidade de todos."
  })
});

export class EndingService {
  static calcularDesfecho(perfil) {
    const conduta = Number(perfil?.pontuacao?.conduta) || 0;
    const danos = Number(perfil?.pontuacao?.danos) || 0;

    if (danos >= 2 || conduta < -20) {
      return { ...DESFECHOS.responsabilizacao };
    }

    if (conduta >= 60 && danos <= 1) {
      return { ...DESFECHOS.guardiao };
    }

    return { ...DESFECHOS.reparacao };
  }

  static obterDesfecho(id) {
    const desfecho = DESFECHOS[id];
    return desfecho ? { ...desfecho } : null;
  }
}

export default EndingService;
