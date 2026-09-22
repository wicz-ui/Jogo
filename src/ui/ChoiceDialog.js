import { criarBotao } from "./GameButton.js";

export class ChoiceDialog {
  constructor(scene) {
    this.scene = scene;
    this.isOpen = false;
    this.selectionLocked = false;
    this.onChoice = null;
    this.opcoes = [];

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
      .text(640, 305, "", {
        color: "#ffffff",
        fontFamily: "Arial, sans-serif",
        fontSize: "22px",
        align: "center",
        lineSpacing: 8,
        wordWrap: { width: 680 }
      })
      .setOrigin(0.5)
      .setDepth(52);

    this.optionButtons = [
      criarBotao(
      scene,
      640,
      420,
      "Opção 1",
      () => this.choose(0),
      { width: 500, height: 62, fontSize: "21px" }
      ).setDepth(52),
      criarBotao(
      scene,
      640,
      510,
      "Opção 2",
      () => this.choose(1),
      { width: 500, height: 62, fontSize: "21px", color: 0x80533b }
      ).setDepth(52)
    ];

    this.elements = [
      this.overlay,
      this.panel,
      this.title,
      this.message,
      ...this.optionButtons
    ];
    this.hide();
  }

  show(configuracao) {
    if (this.isOpen) {
      return;
    }

    const configuracaoNormalizada = configuracao || {};
    const opcoes = Array.isArray(configuracaoNormalizada.opcoes)
      ? configuracaoNormalizada.opcoes.filter((opcao) => opcao?.choiceId).slice(0, 2)
      : [];

    if (opcoes.length === 0) {
      return;
    }

    this.isOpen = true;
    this.selectionLocked = false;
    this.onChoice = configuracaoNormalizada.onChoice;
    this.opcoes = opcoes;
    this.title.setText(configuracaoNormalizada.titulo || "Escolha uma ação");
    this.message.setText(configuracaoNormalizada.mensagem || "");

    this.optionButtons.forEach((button, index) => {
      const opcao = this.opcoes[index];
      button.setLabel(opcao?.texto || "");
      button.setButtonVisible(Boolean(opcao));
    });

    this.elements.forEach((element) => element.setVisible(true));

    this.optionButtons.forEach((button, index) => {
      if (!this.opcoes[index]) {
        button.setButtonVisible(false);
      }
    });
  }

  choose(index) {
    if (!this.isOpen || this.selectionLocked) {
      return;
    }

    const opcao = this.opcoes[index];
    if (!opcao) {
      return;
    }

    this.selectionLocked = true;
    const callback = this.onChoice;
    this.hide();

    if (callback) {
      callback(opcao.choiceId, opcao);
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
    this.optionButtons?.forEach((button) => button.setButtonVisible(false));
  }

  destroy() {
    this.elements?.forEach((element) => element.destroy(true));
    this.elements = [];
    this.opcoes = [];
  }
}
