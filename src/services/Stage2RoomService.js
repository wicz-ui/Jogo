import { CHOICES } from "../data/choicesData.js";

const ESCOLHAS_VISUAIS = Object.freeze({
  lixo: "fase2_recolher_lixo",
  liquido: "fase2_sinalizar_liquido",
  conversa: "fase2_ajudar_colega"
});

const IMAGENS_POR_PROGRESSO = Object.freeze({
  desarrumada: "Fase2Desarrumada",
  lixo: "Fase2ArrumadaLixo",
  liquido: "Fase2ArrumadaLixoLiquido",
  conversa: "Fase2ArrumadaLixoLiquidoConversa"
});

function obterIdsEscolhidos(perfil) {
  const escolhas = Array.isArray(perfil?.escolhasRealizadas)
    ? perfil.escolhasRealizadas
    : [];

  return new Set(escolhas
    .map((registro) => typeof registro === "string" ? registro : registro?.choiceId)
    .filter(Boolean));
}

function escolhaPositivaRealizada(idsEscolhidos, item) {
  const choiceId = ESCOLHAS_VISUAIS[item];
  return idsEscolhidos.has(choiceId) && CHOICES[choiceId]?.tipo === "positiva";
}

export function lixoRecolhidoNaFase2(perfil) {
  return escolhaPositivaRealizada(obterIdsEscolhidos(perfil), "lixo");
}

/** Deriva a arte do corredor somente das escolhas positivas salvas no perfil. */
export function obterImagemSalaFase2(perfil) {
  const escolhas = obterIdsEscolhidos(perfil);
  const lixo = escolhaPositivaRealizada(escolhas, "lixo");
  const liquido = escolhaPositivaRealizada(escolhas, "liquido");
  const conversa = escolhaPositivaRealizada(escolhas, "conversa");

  // As artes são cumulativas. Se ações posteriores forem feitas primeiro,
  // exibe o estado mais avançado cuja sequência visual está completa.
  if (lixo && liquido && conversa) return IMAGENS_POR_PROGRESSO.conversa;
  if (lixo && liquido) return IMAGENS_POR_PROGRESSO.liquido;
  if (lixo) return IMAGENS_POR_PROGRESSO.lixo;
  return IMAGENS_POR_PROGRESSO.desarrumada;
}
