import { ChoiceImageButton } from "./ChoiceImageButton.js";

export const CHALK_TEXTURES = Object.freeze({
  board: "interaction-board",
  blue: "interaction-chalk-blue",
  orange: "interaction-chalk-orange",
  pink: "interaction-chalk-pink"
});

const CHALK_ASSETS = Object.freeze({
  [CHALK_TEXTURES.board]: "/assets/images/QuadroInteracoes.png",
  [CHALK_TEXTURES.blue]: "/assets/images/BotaoGizAzul.png",
  [CHALK_TEXTURES.orange]: "/assets/images/BotaoGizLaranja.png",
  [CHALK_TEXTURES.pink]: "/assets/images/BotaoGizRosa.png"
});

export function preloadChalkAssets(scene, { board = false, colors = [] } = {}) {
  const textures = [
    ...(board ? [CHALK_TEXTURES.board] : []),
    ...colors.map((color) => CHALK_TEXTURES[color]).filter(Boolean)
  ];

  textures.forEach((key) => {
    if (!scene.textures.exists(key)) scene.load.image(key, CHALK_ASSETS[key]);
  });
}

export function criarBotaoGiz(scene, {
  x,
  y,
  label,
  color = "blue",
  width = 360,
  fontSize = "20px",
  onClick
}) {
  const imageKey = CHALK_TEXTURES[color];
  if (!imageKey || !scene.textures.exists(imageKey)) {
    throw new Error(`Asset do botão de giz "${color}" não carregado.`);
  }

  return new ChoiceImageButton(scene, {
    x,
    y,
    imageKey,
    text: label,
    width,
    fontSize,
    textWidthRatio: 0.78,
    onClick
  }).setButtonVisible(true);
}
