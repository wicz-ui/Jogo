export const PIXELIFY_SANS = '"Pixelify Sans"';

const TEXTO_BRANCO = "#FFFFFF";
const CONTORNO_PRETO = "#000000";

function obterEspessuraContorno(fontSize) {
  const tamanho = Number.parseFloat(fontSize);
  if (!Number.isFinite(tamanho)) return 2;
  if (tamanho <= 18) return 2;
  if (tamanho <= 28) return 3;
  if (tamanho <= 40) return 4;
  return 5;
}

/** Aplica a identidade tipográfica sem substituir o tamanho definido pela cena. */
export function pixelTextStyle(estilo = {}, { preservarCor = false } = {}) {
  const { color, stroke: _stroke, strokeThickness: _strokeThickness, ...demaisEstilos } = estilo;

  return {
    ...demaisEstilos,
    fontFamily: PIXELIFY_SANS,
    fontStyle: "bold",
    color: preservarCor && color ? color : TEXTO_BRANCO,
    stroke: CONTORNO_PRETO,
    strokeThickness: obterEspessuraContorno(estilo.fontSize)
  };
}
