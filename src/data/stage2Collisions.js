/** Hitboxes e limites em pixels da arte original da Fase 2 (1672 × 941). */
export const DEBUG_COLLISIONS_FASE2 = false;

// Área aberta do piso entre as paredes externas do corredor.
export const FASE2_AREA_CAMINHAVEL = Object.freeze({
  id: "piso-caminhavel",
  x: 27,
  y: 214,
  width: 1618,
  height: 594
});

export const FASE2_COLISOES_FIXAS = Object.freeze([
  // Banco superior: hitbox concentrada na base e nas pernas.
  { id: "banco-superior", x: 607, y: 211, width: 258, height: 44 },

  // Vasos: colisão somente nos vasos/base, não na copa das plantas.
  { id: "vaso-superior", x: 948, y: 190, width: 54, height: 48 },
  { id: "vaso-inferior-esquerdo", x: 37, y: 749, width: 54, height: 56 },
  { id: "vaso-inferior-direito", x: 1577, y: 748, width: 58, height: 57 },

  // Móveis fixos do corredor.
  { id: "lixeira-fixa", x: 194, y: 174, width: 78, height: 84 },
  { id: "bebedouro", x: 1552, y: 190, width: 78, height: 62 },

  // Os alunos permanecem no cenário mesmo quando a conversa é resolvida.
  { id: "colega-esquerdo", x: 1352, y: 345, width: 58, height: 43 },
  { id: "colega-central", x: 1406, y: 300, width: 60, height: 44 },
  { id: "colega-direito", x: 1483, y: 350, width: 68, height: 44 }
]);

export const FASE2_COLISOES_LIXO = Object.freeze([
  { id: "lixo-solto-esquerdo", x: 148, y: 238, width: 44, height: 44, dinamica: true },
  { id: "lixo-derramado", x: 212, y: 262, width: 96, height: 60, dinamica: true },
  { id: "lixo-solto-direito", x: 310, y: 235, width: 50, height: 46, dinamica: true }
]);

function obterEscalaImagem(imagem) {
  if (
    !imagem?.width || !imagem?.height ||
    !imagem?.displayWidth || !imagem?.displayHeight
  ) {
    throw new TypeError("A imagem da Fase 2 precisa ter dimensões e escala válidas.");
  }

  return {
    x: imagem.displayWidth / imagem.width,
    y: imagem.displayHeight / imagem.height,
    inicioX: imagem.x - imagem.displayWidth * (imagem.originX ?? 0.5),
    inicioY: imagem.y - imagem.displayHeight * (imagem.originY ?? 0.5)
  };
}

export function mapearPontoImagemFase2(x, y, imagem) {
  const escala = obterEscalaImagem(imagem);
  return {
    x: escala.inicioX + x * escala.x,
    y: escala.inicioY + y * escala.y
  };
}

export function mapearRaioImagemFase2(raio, imagem) {
  if (!Number.isFinite(raio) || raio < 0) {
    throw new TypeError("O raio da interação precisa ser um número não negativo.");
  }

  const escala = obterEscalaImagem(imagem);
  return raio * Math.min(escala.x, escala.y);
}

/** Converte hitboxes e áreas de piso da arte para o mundo lógico do Phaser. */
export function mapearRetanguloColisaoFase2(retangulo, imagem) {
  if (
    !retangulo ||
    !Number.isFinite(retangulo.x) ||
    !Number.isFinite(retangulo.y) ||
    !Number.isFinite(retangulo.width) ||
    !Number.isFinite(retangulo.height) ||
    retangulo.width <= 0 ||
    retangulo.height <= 0
  ) {
    throw new TypeError("A hitbox da Fase 2 precisa ter posição e dimensões válidas.");
  }

  const escala = obterEscalaImagem(imagem);
  return {
    x: escala.inicioX + (retangulo.x + retangulo.width / 2) * escala.x,
    y: escala.inicioY + (retangulo.y + retangulo.height / 2) * escala.y,
    width: retangulo.width * escala.x,
    height: retangulo.height * escala.y
  };
}
