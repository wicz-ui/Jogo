/** Hitboxes em pixels da arte original da Fase 3 (1877 × 838). */
export const DEBUG_COLLISIONS_FASE3 = false;

// Piso aberto dentro da moldura do laboratório; as bordas externas ficam fora.
export const FASE3_AREA_CAMINHAVEL = Object.freeze({
  id: "piso-caminhavel",
  x: 27,
  y: 214,
  width: 1823,
  height: 594
});

export const FASE3_COLISOES_FIXAS = Object.freeze([
  // Armários, bancadas e equipamentos fixos junto às paredes.
  { id: "armarios-esquerda", x: 25, y: 258, width: 74, height: 360 },
  { id: "vaso-esquerdo", x: 184, y: 189, width: 77, height: 57 },
  { id: "bancada-ferramentas", x: 383, y: 84, width: 234, height: 178 },
  { id: "banqueta-bancada-ferramentas", x: 463, y: 220, width: 68, height: 77 },
  { id: "armarios-centrais", x: 940, y: 94, width: 166, height: 155 },
  { id: "bancada-equipamento-menor", x: 1150, y: 184, width: 138, height: 82 },
  { id: "maquina-principal", x: 1313, y: 99, width: 267, height: 190 },
  { id: "armario-ferramentas-direito", x: 1580, y: 198, width: 111, height: 94 },
  { id: "armario-alto-direito", x: 1738, y: 43, width: 123, height: 204 },
  { id: "bancada-lateral-direita", x: 1740, y: 298, width: 137, height: 291 },
  { id: "lixeira-esquerda", x: 112, y: 363, width: 84, height: 91 },

  // Mesas centrais e seus bancos; a hitbox ocupa a área física do conjunto.
  { id: "mesa-central-esquerda", x: 575, y: 374, width: 359, height: 241 },
  { id: "mesa-central-direita", x: 1144, y: 374, width: 383, height: 241 },

  // Móveis de armazenamento na parte inferior da sala.
  { id: "estante-inferior-esquerda", x: 416, y: 689, width: 216, height: 149 },
  { id: "armario-inferior-direito", x: 1321, y: 702, width: 260, height: 136 },

  // Hitboxes pequenas, somente junto aos pés dos personagens.
  { id: "professor", x: 974, y: 330, width: 62, height: 47 },
  { id: "colega-esquerdo", x: 142, y: 638, width: 48, height: 47 },
  { id: "colega-central", x: 203, y: 600, width: 47, height: 48 },
  { id: "colega-direito", x: 282, y: 642, width: 48, height: 47 }
]);

function obterEscalaImagem(imagem) {
  if (
    !imagem?.width || !imagem?.height ||
    !imagem?.displayWidth || !imagem?.displayHeight
  ) {
    throw new TypeError("A imagem da Fase 3 precisa ter dimensões e escala válidas.");
  }

  return {
    x: imagem.displayWidth / imagem.width,
    y: imagem.displayHeight / imagem.height,
    inicioX: imagem.x - imagem.displayWidth * (imagem.originX ?? 0.5),
    inicioY: imagem.y - imagem.displayHeight * (imagem.originY ?? 0.5)
  };
}

export function mapearPontoImagemFase3(x, y, imagem) {
  const escala = obterEscalaImagem(imagem);
  return {
    x: escala.inicioX + x * escala.x,
    y: escala.inicioY + y * escala.y
  };
}

export function mapearRaioImagemFase3(raio, imagem) {
  if (!Number.isFinite(raio) || raio < 0) {
    throw new TypeError("O raio da interação precisa ser um número não negativo.");
  }

  const escala = obterEscalaImagem(imagem);
  return raio * Math.min(escala.x, escala.y);
}

/** Converte hitboxes e a área de piso da arte para coordenadas do Phaser. */
export function mapearRetanguloColisaoFase3(retangulo, imagem) {
  if (
    !retangulo ||
    !Number.isFinite(retangulo.x) ||
    !Number.isFinite(retangulo.y) ||
    !Number.isFinite(retangulo.width) ||
    !Number.isFinite(retangulo.height) ||
    retangulo.width <= 0 ||
    retangulo.height <= 0
  ) {
    throw new TypeError("A hitbox da Fase 3 precisa ter posição e dimensões válidas.");
  }

  const escala = obterEscalaImagem(imagem);
  return {
    x: escala.inicioX + (retangulo.x + retangulo.width / 2) * escala.x,
    y: escala.inicioY + (retangulo.y + retangulo.height / 2) * escala.y,
    width: retangulo.width * escala.x,
    height: retangulo.height * escala.y
  };
}
