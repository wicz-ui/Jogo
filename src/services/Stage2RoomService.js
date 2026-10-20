import { CHOICES } from "../data/choicesData.js";

const ESCOLHAS_VISUAIS = Object.freeze({
  lixo: "fase2_recolher_lixo",
  liquido: "fase2_sinalizar_liquido",
  conversa: "fase2_ajudar_colega"
});

// A ordem dos bits é: lixo, líquido, conversa.
const TEXTURAS_POR_ESTADO = Object.freeze({
  "000": "Fase2Desarrumada",
  "100": "Fase2ArrumadaLixo",
  "010": "Fase2ArrumadaLiquido",
  "001": "Fase2ArrumadaConversa",
  "110": "Fase2ArrumadaLixoLiquido",
  "101": "Fase2ArrumadaLixoConversa",
  "011": "Fase2ArrumadaLiquidoConversa",
  "111": "Fase2ArrumadaLixoLiquidoConversa"
});

function obterIdsEscolhidos(perfil) {
  const escolhas = Array.isArray(perfil?.escolhasRealizadas)
    ? perfil.escolhasRealizadas
    : [];

  return new Set(escolhas
    .map((registro) => typeof registro === "string" ? registro : registro?.choiceId)
    .filter(Boolean));
}

function escolhaPositivaRealizada(idsEscolhidos, situacao) {
  const choiceId = ESCOLHAS_VISUAIS[situacao];
  return idsEscolhidos.has(choiceId) && CHOICES[choiceId]?.tipo === "positiva";
}

export function lixoRecolhidoNaFase2(perfil) {
  return escolhaPositivaRealizada(obterIdsEscolhidos(perfil), "lixo");
}

/** Retorna a textura correspondente somente às três escolhas positivas salvas. */
export function obterTexturaFase2(perfil) {
  const idsEscolhidos = obterIdsEscolhidos(perfil);
  const estado = ["lixo", "liquido", "conversa"]
    .map((situacao) => escolhaPositivaRealizada(idsEscolhidos, situacao) ? "1" : "0")
    .join("");

  return TEXTURAS_POR_ESTADO[estado];
}
