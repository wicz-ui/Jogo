const ESCOLHAS_POSITIVAS_FASE3 = Object.freeze({
  maquina: "fase3_seguir_procedimento",
  professor: "fase3_respeitar_orientacao",
  colegas: "fase3_recusar_risco"
});

function obterIdsDeEscolhas(perfil) {
  if (!Array.isArray(perfil?.escolhasRealizadas)) {
    return new Set();
  }

  return new Set(perfil.escolhasRealizadas.map((registro) =>
    typeof registro === "string" ? registro : registro?.choiceId
  ));
}

/** Retorna a textura correspondente apenas às decisões positivas já salvas. */
export function obterTexturaFase3(perfil) {
  const escolhas = obterIdsDeEscolhas(perfil);
  const maquina = escolhas.has(ESCOLHAS_POSITIVAS_FASE3.maquina);
  const professor = escolhas.has(ESCOLHAS_POSITIVAS_FASE3.professor);
  const colegas = escolhas.has(ESCOLHAS_POSITIVAS_FASE3.colegas);
  const estado = `${maquina ? 1 : 0}${professor ? 1 : 0}${colegas ? 1 : 0}`;

  const texturasPorEstado = {
    "000": "Fase3Desarrumada",
    "100": "Fase3ArrumadaMaquina",
    "010": "Fase3ArrumadaProfessor",
    "001": "Fase3ArrumadaColegas",
    "110": "Fase3ArrumadaMaquinaProfessor",
    "101": "Fase3ArrumadaMaquinaColegas",
    "011": "Fase3ArrumadaProfessorColegas",
    "111": "Fase3ArrumadaMaquinaProfessorColegas"
  };

  return texturasPorEstado[estado];
}

export { ESCOLHAS_POSITIVAS_FASE3 };
