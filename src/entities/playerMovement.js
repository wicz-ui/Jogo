const DIRECTIONS = Object.freeze(["down", "left", "right", "up"]);

export const PLAYER_MOVEMENT_SPEED = 230;
export const PLAYER_WALK_FRAME_RATE = 7;

export const PLAYER_DIRECTION_VECTORS = Object.freeze({
  down: Object.freeze({ x: 0, y: 1 }),
  left: Object.freeze({ x: -1, y: 0 }),
  right: Object.freeze({ x: 1, y: 0 }),
  up: Object.freeze({ x: 0, y: -1 })
});

/** Recebe direções em ordem de pressionamento e retorna somente a mais recente. */
export function resolverDirecaoPrioritaria(teclasNaOrdem = []) {
  const ultimaTecla = teclasNaOrdem.at(-1);
  const direcao = typeof ultimaTecla === "string"
    ? ultimaTecla
    : ultimaTecla?.direction;

  return DIRECTIONS.includes(direcao) ? direcao : null;
}

export function obterVetorMovimento(direcao) {
  return PLAYER_DIRECTION_VECTORS[direcao] || { x: 0, y: 0 };
}
