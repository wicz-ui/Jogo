import Phaser from "phaser";
import MainMenuScene from "./scenes/MainMenuScene.js";
import ProfileScene from "./scenes/ProfileScene.js";
import StageSelectScene from "./scenes/StageSelectScene.js";
import Stage1Scene from "./scenes/Stage1Scene.js";
import Stage2Scene from "./scenes/Stage2Scene.js";
import Stage3Scene from "./scenes/Stage3Scene.js";
import StageResultScene from "./scenes/StageResultScene.js";
import EndingScene from "./scenes/EndingScene.js";
import InstructionsScene from "./scenes/InstructionsScene.js";
import SettingsScene from "./scenes/SettingsScene.js";
import CreditsScene from "./scenes/CreditsScene.js";

const config = {
  // O MVP usa apenas formas 2D; Canvas mantém a renderização previsível
  // também em máquinas sem aceleração WebGL disponível.
  type: Phaser.CANVAS,
  width: 1280,
  height: 720,
  parent: "game-container",
  backgroundColor: "#08111f",
  dom: {
    createContainer: true
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: [
    MainMenuScene,
    ProfileScene,
    StageSelectScene,
    Stage1Scene,
    Stage2Scene,
    Stage3Scene,
    StageResultScene,
    EndingScene,
    InstructionsScene,
    SettingsScene,
    CreditsScene
  ]
};

const fontesPixelify = await document.fonts.load('700 16px "Pixelify Sans"');
const fontePixelifyCarregada = fontesPixelify.some((fonte) =>
  fonte.family.replaceAll('"', "") === "Pixelify Sans" && fonte.status === "loaded"
);

if (!fontePixelifyCarregada) {
  throw new Error("Não foi possível carregar a fonte Pixelify Sans Bold.");
}

const game = new Phaser.Game(config);

export { config, game };
