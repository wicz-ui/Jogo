import { PLAYABLE_CHARACTER_IDS } from "../data/charactersData.js";

/** Valida o identificador persistido sem escolher personagem implicitamente. */
function isPlayableCharacterId(personagemId) {
  return PLAYABLE_CHARACTER_IDS.includes(personagemId);
}

export const CharacterService = Object.freeze({
  isPlayableCharacterId
});
