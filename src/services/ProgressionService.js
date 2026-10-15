import { STAGE_CONFIGS } from '../data/stagesData.js';

export class ProgressionService {
  /** Migra campos ausentes dos perfis antigos para o formato atual. */
  static normalizarPerfil(perfil) {
    if (!perfil || typeof perfil !== "object" || Array.isArray(perfil)) return;

    if (!perfil.progresso || typeof perfil.progresso !== "object" || Array.isArray(perfil.progresso)) {
      perfil.progresso = {
        faseAtual: 1,
        fasesConcluidas: [],
        campanhaConcluida: false
      };
    }

    if (!Array.isArray(perfil.progresso.fasesConcluidas)) {
      perfil.progresso.fasesConcluidas = [];
    }

    if (!Number.isFinite(Number(perfil.progresso.faseAtual))) {
      perfil.progresso.faseAtual = 1;
    }

    if (typeof perfil.progresso.campanhaConcluida !== "boolean") {
      perfil.progresso.campanhaConcluida = perfil.progresso.fasesConcluidas.includes(3);
    }

    if (!perfil.pontuacao || typeof perfil.pontuacao !== "object" || Array.isArray(perfil.pontuacao)) {
      perfil.pontuacao = {};
    }

    for (const campo of ["cuidado", "conduta", "danos"]) {
      const valor = Number(perfil.pontuacao[campo]);
      perfil.pontuacao[campo] = Number.isFinite(valor) ? valor : 0;
    }
  }

  /** Verifica o acesso sequencial às fases que estão implementadas. */
  static podeAcessarFase(perfil, numeroFase) {
    if (!Number.isInteger(numeroFase) || !STAGE_CONFIGS[numeroFase]) return false;
    if (!perfil || typeof perfil !== "object" || Array.isArray(perfil)) return false;

    this.normalizarPerfil(perfil);

    for (let faseAnterior = 1; faseAnterior < numeroFase; faseAnterior += 1) {
      if (!perfil.progresso.fasesConcluidas.includes(faseAnterior)) return false;
    }

    return true;
  }

  /** Retorna o estado de uma fase para a tela de seleção. */
  static obterStatusFase(perfil, numeroFase) {
    if (!Number.isInteger(numeroFase) || !STAGE_CONFIGS[numeroFase]) {
      return "em_desenvolvimento";
    }
    if (!perfil || typeof perfil !== "object" || Array.isArray(perfil)) return "bloqueada";

    this.normalizarPerfil(perfil);

    if (perfil.progresso.fasesConcluidas.includes(numeroFase)) return "concluida";

    return this.podeAcessarFase(perfil, numeroFase)
      ? "disponivel"
      : "bloqueada";
  }

  /** Conclui a fase atual, mantém a ordem cronológica e atualiza a campanha. */
  static concluirFase(perfil, faseConcluida) {
    if (!perfil || typeof perfil !== "object" || Array.isArray(perfil)) {
      return { sucesso: false, erro: "Perfil inválido." };
    }

    if (!Number.isInteger(faseConcluida) || !STAGE_CONFIGS[faseConcluida]) {
      return { sucesso: false, erro: "Número de fase inválido." };
    }

    if (!this.podeAcessarFase(perfil, faseConcluida)) {
      return {
        sucesso: false,
        erro: `Conclua as fases anteriores antes da Fase ${faseConcluida}.`
      };
    }

    if (!perfil.progresso.fasesConcluidas.includes(faseConcluida)) {
      perfil.progresso.fasesConcluidas.push(faseConcluida);
    }

    perfil.progresso.faseAtual = Math.max(
      Number(perfil.progresso.faseAtual) || 1,
      faseConcluida + 1
    );
    if (faseConcluida === 3) perfil.progresso.campanhaConcluida = true;

    return perfil;
  }
}
