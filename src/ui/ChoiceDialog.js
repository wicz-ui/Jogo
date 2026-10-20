import { ChoiceImageButton } from "./ChoiceImageButton.js";
import { pixelTextStyle } from "./TextStyles.js";

const QUADRO_KEY = "interaction-board";
const GIZ_AZUL_KEY = "interaction-chalk-blue";
const GIZ_LARANJA_KEY = "interaction-chalk-orange";

export class ChoiceDialog {
  constructor(scene) {
    this.scene = scene;
    this.isOpen = false;
    this.selectionLocked = false;
    this.onChoice = null;
    this.opcoes = [];

    const camera = scene.cameras.main;
    const centerX = camera.centerX;
    const centerY = camera.centerY;
    const quadroTexture = scene.textures.get(QUADRO_KEY).getSourceImage();
    const escalaQuadro = Math.min(
      camera.width * 0.76 / quadroTexture.width,
      camera.height * 0.76 / quadroTexture.height
    );
    const larguraQuadro = quadroTexture.width * escalaQuadro;

    this.overlay = scene.add
      .rectangle(centerX, centerY, camera.width, camera.height, 0x000000, 0.68)
      .setInteractive()
      .setDepth(50);
    this.panel = scene.add
      .image(centerX, centerY, QUADRO_KEY)
      .setScale(escalaQuadro)
      .setDepth(51);
    this.title = scene.add
      .text(centerX, centerY - 155, "Escolha uma ação", pixelTextStyle({
        fontSize: "30px",
        align: "center",
        wordWrap: { width: larguraQuadro * 0.72 }
      }))
      .setOrigin(0.5)
      .setDepth(52);
    this.message = scene.add
      .text(centerX, centerY - 82, "", pixelTextStyle({
        fontSize: "21px",
        align: "center",
        lineSpacing: 5,
        wordWrap: { width: larguraQuadro * 0.72, useAdvancedWrap: true }
      }))
      .setOrigin(0.5)
      .setDepth(52);

    this.optionButtons = [
      new ChoiceImageButton(scene, {
        x: centerX,
        y: centerY + 42,
        imageKey: GIZ_AZUL_KEY,
        width: 520,
        onClick: () => this.choose(0)
      }).setDepth(53),
      new ChoiceImageButton(scene, {
        x: centerX,
        y: centerY + 148,
        imageKey: GIZ_LARANJA_KEY,
        width: 520,
        onClick: () => this.choose(1)
      }).setDepth(53)
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

    this.overlay.setVisible(true);
    this.panel.setVisible(true);
    this.title.setVisible(true);
    this.message.setVisible(true);
    this.optionButtons.forEach((button, index) => {
      const opcao = this.opcoes[index];
      button.setLabel(opcao?.texto || "");
      button.setButtonVisible(Boolean(opcao));
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
    this.overlay?.setVisible(false);
    this.panel?.setVisible(false);
    this.title?.setVisible(false);
    this.message?.setVisible(false);
    this.optionButtons?.forEach((button) => button.setButtonVisible(false));
  }

  destroy() {
    this.overlay?.destroy();
    this.panel?.destroy();
    this.title?.destroy();
    this.message?.destroy();
    this.optionButtons?.forEach((button) => button.destroy());
    this.optionButtons = [];
    this.opcoes = [];
  }
}
