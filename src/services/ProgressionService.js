export class ProgressionService {
  /**
   * Verifica se o perfil pode entrar em uma fase jogável neste marco.
   * A regra fica no serviço para que a interface não seja a única barreira.
   */
  static podeAcessarFase(perfil, numeroFase) {
    if (numeroFase === 1) {
      return true;
    }

    if (numeroFase === 2) {
      return Boolean(perfil?.progresso?.fasesConcluidas?.includes(1));
    }

    // A Fase 3 aparece na seleção, mas ainda não possui gameplay.
    return false;
  }

  /**
   * Retorna o estado que a tela de seleção deve apresentar para a fase.
   */
  static obterStatusFase(perfil, numeroFase) {
    if (numeroFase === 3) {
      return "em_desenvolvimento";
    }

    if (perfil?.progresso?.fasesConcluidas?.includes(numeroFase)) {
      return "concluida";
    }

    return this.podeAcessarFase(perfil, numeroFase)
      ? "disponivel"
      : "bloqueada";
  }

  /**
   * Conclui a fase atual e atualiza a fase ativa no perfil.
   * @param {Object} perfil Objeto do perfil atual
   * @param {number} faseConcluida Número da fase
   * @returns {Object} Perfil atualizado
   */
  static concluirFase(perfil, faseConcluida) {
    if (!perfil || typeof perfil !== "object") {
      return { sucesso: false, erro: "Perfil inválido." };
    }

    if (!perfil.progresso) {
      perfil.progresso = { faseAtual: 1, fasesConcluidas: [] };
    }

    if (!Array.isArray(perfil.progresso.fasesConcluidas)) {
      perfil.progresso.fasesConcluidas = [];
    }

    if (!perfil.progresso.fasesConcluidas.includes(faseConcluida)) {
      perfil.progresso.fasesConcluidas.push(faseConcluida);
    }
    
    // Atualiza para a próxima fase mantendo a maior fase alcançada
    perfil.progresso.faseAtual = Math.max(perfil.progresso.faseAtual || 1, faseConcluida + 1);

    return perfil;
  }
}
