import Phaser from "phaser";
import MainMenuScene from "./scenes/MainMenuScene.js";
import ProfileScene from "./scenes/ProfileScene.js";
import Stage1Scene from "./scenes/Stage1Scene.js";

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
  scene: [MainMenuScene, ProfileScene, Stage1Scene]
};

const game = new Phaser.Game(config);

export { config, game };
