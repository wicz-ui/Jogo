/**
 * Hitboxes em pixels da arte original (1877 × 838). A cena as transforma
 * para coordenadas do jogo usando os limites atuais da imagem desenhada.
 */
export const DEBUG_COLLISIONS = false;

export const FASE1_COLISOES_FIXAS = Object.freeze([
  // Paredes internas do laboratório.
  { id: "parede-superior", x: 25, y: 126, width: 1827, height: 25 },
  { id: "parede-inferior", x: 25, y: 805, width: 1827, height: 25 },
  { id: "parede-esquerda", x: 25, y: 145, width: 27, height: 662 },
  { id: "parede-direita", x: 1825, y: 145, width: 27, height: 662 },

  // Armários e bancada lateral, banco, mesa central e estação de computador.
  { id: "bancada-e-armarios", x: 53, y: 76, width: 472, height: 171 },
  { id: "banco-esquerdo", x: 223, y: 231, width: 67, height: 80 },
  { id: "mesa-central", x: 1043, y: 77, width: 298, height: 215 },
  { id: "mesa-computador", x: 1258, y: 371, width: 480, height: 161 },
  { id: "cadeira-computador", x: 1421, y: 529, width: 115, height: 82 },

  // Vasos e lixeira continuam sólidos em todos os estados visuais.
  { id: "vaso-superior", x: 1774, y: 179, width: 74, height: 43 },
  { id: "vaso-inferior", x: 43, y: 724, width: 81, height: 63 },
  { id: "lixeira", x: 551, y: 585, width: 118, height: 130 }
]);

export const FASE1_COLISOES_LIXO = Object.freeze([
  { id: "papel-no-chao-01", x: 669, y: 671, width: 42, height: 41 },
  { id: "papel-no-chao-02", x: 637, y: 718, width: 39, height: 39 }
]);

/** Mapeia um retângulo da arte para o espaço lógico da cena, respeitando origem e escala. */
export function mapearRetanguloColisaoFase1(retangulo, imagem) {
  if (!imagem?.width || !imagem?.height || !imagem?.displayWidth || !imagem?.displayHeight) {
    throw new TypeError("A imagem da sala precisa ter dimensões e tamanho exibido válidos.");
  }

  const escalaX = imagem.displayWidth / imagem.width;
  const escalaY = imagem.displayHeight / imagem.height;
  const origemX = imagem.originX ?? 0.5;
  const origemY = imagem.originY ?? 0.5;
  const inicioX = imagem.x - imagem.displayWidth * origemX;
  const inicioY = imagem.y - imagem.displayHeight * origemY;

  return {
    x: inicioX + (retangulo.x + retangulo.width / 2) * escalaX,
    y: inicioY + (retangulo.y + retangulo.height / 2) * escalaY,
    width: retangulo.width * escalaX,
    height: retangulo.height * escalaY
  };
}
