import { STAGE_CONFIGS } from '../data/stagesData.js';

export class ProgressionService {
  /**
   * Normaliza o estado de progresso do perfil para garantir compatibilidade com saves antigos.
   * @param {Object} perfil 
   */
  static normalizarPerfil(perfil) {
    if (!perfil || typeof perfil !== "object") return;

    if (!perfil.progresso) {
      perfil.progresso = { faseAtual: 1, fasesConcluidas: [], campanhaConcluida: false };
    }

    if (!Array.isArray(perfil.progresso.fasesConcluidas)) {
      perfil.progresso.fasesConcluidas = [];
    }

    if (typeof perfil.progresso.campanhaConcluida !== "boolean") {
      perfil.progresso.campanhaConcluida = perfil.progresso.fasesConcluidas.includes(3);
    }

    if (!perfil.pontuacao) {
      perfil.pontuacao = { cuidado: 0, conduta: 0, danos: 0 };
    } else if (typeof perfil.pontuacao.danos !== "number") {
      perfil.pontuacao.danos = 0;
    }
  }

  /**
   * Verifica se o perfil pode acessar uma fase jogável de forma estritamente sequencial.
   * @param {Object} perfil 
   * @param {number} numeroFase 
   * @returns {boolean}
   */
  static podeAcessarFase(perfil, numeroFase) {
    if (!perfil || typeof perfil !== "object") return false;
    this.normalizarPerfil(perfil);

    if (numeroFase === 1) return true;

    const fasesConcluidas = perfil.progresso.fasesConcluidas;

    for (let i = 1; i < numeroFase; i++) {
      if (!fasesConcluidas.includes(i)) {
        return false;
      }
    }

    return Boolean(STAGE_CONFIGS[numeroFase]);
  }

  /**
   * Retorna o status de apresentação para a StageSelectScene ("concluida" | "disponivel" | "bloqueada" | "em_desenvolvimento").
   * @param {Object} perfil 
   * @param {number} numeroFase 
   * @returns {string}
   */
  static obterStatusFase(perfil, numeroFase) {
    this.normalizarPerfil(perfil);

    if (!STAGE_CONFIGS[numeroFase]) {
      return "em_desenvolvimento";
    }

    if (perfil.progresso.fasesConcluidas.includes(numeroFase)) {
      return "concluida";
    }

    return this.podeAcessarFase(perfil, numeroFase)
      ? "disponivel"
      : "bloqueada";
  }

  /**
   * Conclui a fase atual garantindo a ordem cronológica, adicionando ao histórico e atualizando a campanha.
   * @param {Object} perfil Objeto do perfil atual
   * @param {number} faseConcluida Número da fase
   * @returns {Object} Perfil atualizado ou objeto de erro
   */
  static concluirFase(perfil, faseConcluida) {
    if (!perfil || typeof perfil !== "object") {
      return { sucesso: false, erro: "Perfil inválido." };
    }

    this.normalizarPerfil(perfil);

    if (faseConcluida > 1) {
      const faseAnteriorConcluida = perfil.progresso.fasesConcluidas.includes(faseConcluida - 1);
      if (!faseAnteriorConcluida) {
        return {
          sucesso: false,
          erro: `Não é possível concluir a Fase ${faseConcluida} sem ter concluído a Fase ${faseConcluida - 1}.`
        };
      }
    }

    if (!perfil.progresso.fasesConcluidas.includes(faseConcluida)) {
      perfil.progresso.fasesConcluidas.push(faseConcluida);
    }

    perfil.progresso.faseAtual = Math.max(
      perfil.progresso.faseAtual || 1,
      faseConcluida + 1
    );

    if (faseConcluida === 3) {
      perfil.progresso.campanhaConcluida = true;
    }

    return perfil;
  }
}