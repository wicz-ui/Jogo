const ESCOLHAS_ARRUMADAS = Object.freeze({
  lixo: "recolher_lixo",
  computador: "desligar_computador",
  equipamentos: "guardar_equipamento"
});

const IMAGENS_POR_ESTADO = Object.freeze({
  "": "Fase1Desarrumada",
  lixo: "Fase1ArrumadaLixo",
  computador: "Fase1ArrumadaComputador",
  equipamentos: "Fase1ArrumadaEquipamentos",
  "lixo+computador": "Fase1ArrumadaLixoComputador",
  "lixo+equipamentos": "Fase1ArrumadaLixoEquipamentos",
  "computador+equipamentos": "Fase1ArrumadaEquipamentosComputador",
  "lixo+computador+equipamentos": "Fase1Arrumada"
});

function obterIdsEscolhidos(perfil) {
  const escolhas = Array.isArray(perfil?.escolhasRealizadas)
    ? perfil.escolhasRealizadas
    : [];

  return new Set(escolhas
    .map((registro) => typeof registro === "string" ? registro : registro?.choiceId)
    .filter(Boolean));
}

export function lixoRecolhidoNaFase1(perfil) {
  return obterIdsEscolhidos(perfil).has(ESCOLHAS_ARRUMADAS.lixo);
}

/** Deriva o visual do laboratório apenas das escolhas positivas já salvas. */
export function obterImagemSalaFase1(perfil) {
  const idsEscolhidos = obterIdsEscolhidos(perfil);

  const estado = Object.entries(ESCOLHAS_ARRUMADAS)
    .filter(([, choiceId]) => idsEscolhidos.has(choiceId))
    .map(([item]) => item)
    .join("+");

  return IMAGENS_POR_ESTADO[estado] || IMAGENS_POR_ESTADO[""];
}
