import { PLAYABLE_CHARACTER_IDS } from "../data/charactersData.js";

/** Vincula um personagem aleatório apenas quando o perfil ainda não tem um válido. */
function obterOuSortearPersonagem(perfil, random = Math.random) {
  if (!perfil || typeof perfil !== "object") {
    throw new TypeError("É necessário informar um perfil para escolher o personagem.");
  }

  if (PLAYABLE_CHARACTER_IDS.includes(perfil.personagemId)) {
    return perfil.personagemId;
  }

  const valorRecebido = Number(random());
  const valorAleatorio = Number.isFinite(valorRecebido)
    ? Math.max(0, Math.min(valorRecebido, 1 - Number.EPSILON))
    : 0;
  const indice = Math.floor(valorAleatorio * PLAYABLE_CHARACTER_IDS.length);

  perfil.personagemId = PLAYABLE_CHARACTER_IDS[indice];
  return perfil.personagemId;
}

export const CharacterService = Object.freeze({
  obterOuSortearPersonagem
});
