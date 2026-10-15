export class ProgressionService {
  /** Verifica acesso sequencial, independentemente da tela que iniciou a fase. */
  static podeAcessarFase(perfil, numeroFase) {
    if (!Number.isInteger(numeroFase) || numeroFase < 1 || numeroFase > 3) {
      return false;
    }

    if (numeroFase === 1) return true;

    const concluidas = perfil?.progresso?.fasesConcluidas;
    if (!Array.isArray(concluidas)) return false;

    for (let faseAnterior = 1; faseAnterior < numeroFase; faseAnterior += 1) {
      if (!concluidas.includes(faseAnterior)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Retorna o estado que a tela de seleção deve apresentar para a fase.
   */
  static obterStatusFase(perfil, numeroFase) {
    if (perfil?.progresso?.fasesConcluidas?.includes(numeroFase)) {
      return "concluida";
    }

    if (!Number.isInteger(numeroFase) || numeroFase < 1 || numeroFase > 3) {
      return "em_desenvolvimento";
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

    if (!Number.isInteger(faseConcluida) || faseConcluida < 1 || faseConcluida > 3) {
      return { sucesso: false, erro: "Número de fase inválido." };
    }

    if (!this.podeAcessarFase(perfil, faseConcluida)) {
      return {
        sucesso: false,
        erro: `Conclua as fases anteriores antes da Fase ${faseConcluida}.`
      };
    }

    if (!perfil.progresso) {
      perfil.progresso = {
        faseAtual: 1,
        fasesConcluidas: [],
        campanhaConcluida: false
      };
    }

    if (!Array.isArray(perfil.progresso.fasesConcluidas)) {
      perfil.progresso.fasesConcluidas = [];
    }

    if (!perfil.progresso.fasesConcluidas.includes(faseConcluida)) {
      perfil.progresso.fasesConcluidas.push(faseConcluida);
    }

    perfil.progresso.faseAtual = Math.max(
      Number(perfil.progresso.faseAtual) || 1,
      faseConcluida + 1
    );
    perfil.progresso.campanhaConcluida = faseConcluida === 3
      ? true
      : perfil.progresso.campanhaConcluida === true;

    return perfil;
  }
}
