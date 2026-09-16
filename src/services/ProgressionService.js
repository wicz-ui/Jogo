export class ProgressionService {
  /**
   * Conclui a fase atual e atualiza a fase ativa no perfil.
   * @param {Object} perfil Objeto do perfil atual
   * @param {number} faseConcluida Número da fase
   * @returns {Object} Perfil atualizado
   */
  static concluirFase(perfil, faseConcluida) {
    if (!perfil.progresso) {
      perfil.progresso = { faseAtual: 1, fasesConcluidas: [] };
    }

    if (!Array.isArray(perfil.progresso.fasesConcluidas)) {
      perfil.progresso.fasesConcluidas = [];
    }

    if (!perfil.progresso.fasesConcluidas.includes(faseConcluida)) {
      perfil.progresso.fasesConcluidas.push(faseConcluida);
    }
    
    // Atualiza para a próxima fase
    perfil.progresso.faseAtual = faseConcluida + 1;

    return perfil;
  }
}
