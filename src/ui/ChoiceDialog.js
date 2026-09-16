import { criarBotao } from "./GameButton.js";

export class ChoiceDialog {
  constructor(scene) {
    this.scene = scene;
    this.isOpen = false;
    this.selectionLocked = false;
    this.onChoice = null;

    this.overlay = scene.add
      .rectangle(640, 360, 1280, 720, 0x000000, 0.72)
      .setInteractive()
      .setDepth(50);
    this.panel = scene.add
      .rectangle(640, 360, 780, 410, 0x102b43, 1)
      .setStrokeStyle(3, 0x8fe6e4, 1)
      .setDepth(51);
    this.title = scene.add
      .text(640, 232, "Escolha uma ação", {
        color: "#f4ffff",
        fontFamily: "Arial, sans-serif",
        fontSize: "30px",
        fontStyle: "bold"
      })
      .setOrigin(0.5)
      .setDepth(52);
    this.message = scene.add
      .text(640, 305, "O computador está ligado sem necessidade.\nO que deseja fazer?", {
        color: "#ffffff",
        fontFamily: "Arial, sans-serif",
        fontSize: "22px",
        align: "center",
        lineSpacing: 8
      })
      .setOrigin(0.5)
      .setDepth(52);

    this.desligarButton = criarBotao(
      scene,
      640,
      420,
      "Desligar corretamente",
      () => this.choose("desligar_computador"),
      { width: 500, height: 62, fontSize: "21px" }
    ).setDepth(52);
    this.ignorarButton = criarBotao(
      scene,
      640,
      510,
      "Ignorar",
      () => this.choose("ignorar_computador"),
      { width: 500, height: 62, fontSize: "21px", color: 0x80533b }
    ).setDepth(52);

    this.elements = [
      this.overlay,
      this.panel,
      this.title,
      this.message,
      this.desligarButton,
      this.ignorarButton
    ];
    this.hide();
  }

  show(onChoice) {
    if (this.isOpen) {
      return;
    }

    this.isOpen = true;
    this.selectionLocked = false;
    this.onChoice = onChoice;
    this.elements.forEach((element) => element.setVisible(true));
  }

  choose(choiceId) {
    if (!this.isOpen || this.selectionLocked) {
      return;
    }

    this.selectionLocked = true;
    const callback = this.onChoice;
    this.hide();

    if (callback) {
      callback(choiceId);
    }
  }

  close() {
    if (this.isOpen) {
      this.hide();
    }
  }

  hide() {
    this.isOpen = false;
    this.elements?.forEach((element) => element.setVisible(false));
  }

  destroy() {
    this.elements.forEach((element) => element.destroy(true));
    this.elements = [];
  }
}
