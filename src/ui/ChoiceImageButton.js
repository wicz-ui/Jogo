import { pixelTextStyle } from "./TextStyles.js";

const ESCALA_HOVER = 1.035;
const ESCALA_PRESSIONADA = 0.98;
const DURACAO_PRESSAO_MINIMA = 55;

/** Botão reutilizável: arte de giz, rótulo dinâmico e área clicável conjunta. */
export class ChoiceImageButton {
  constructor(scene, {
    x,
    y,
    imageKey,
    text = "",
    width = 540,
    fontSize = "20px",
    textWidthRatio = 0.78,
    onClick = () => {}
  }) {
    this.scene = scene;
    this.baseX = x;
    this.baseY = y;
    this.onClick = onClick;
    this.isHovered = false;
    this.isPressed = false;
    this.actionPending = false;
    this.pressStartedAt = 0;

    const textura = scene.textures.get(imageKey).getSourceImage();
    this.width = width;
    this.height = width * (textura.height / textura.width);
    this.textWidth = width * textWidthRatio;

    this.image = scene.add
      .image(0, 0, imageKey)
      .setDisplaySize(this.width, this.height);
    this.highlight = scene.add
      .image(0, 0, imageKey)
      .setDisplaySize(this.width, this.height)
      .setTintFill(0xffffff)
      .setAlpha(0);
    this.label = scene.add
      .text(0, 0, text, pixelTextStyle({
        fontSize,
        align: "center",
        lineSpacing: 1,
        maxLines: 2,
        wordWrap: { width: this.textWidth, useAdvancedWrap: true }
      }))
      .setOrigin(0.5);

    this.container = scene.add
      .container(x, y, [this.image, this.highlight, this.label])
      .setSize(this.width, this.height)
      .setInteractive({ useHandCursor: true });

    this.container.on("pointerover", this.onPointerOver, this);
    this.container.on("pointerout", this.onPointerOut, this);
    this.container.on("pointerdown", this.onPointerDown, this);
    this.container.on("pointerup", this.onPointerUp, this);
    this.container.on("pointerupoutside", this.onPointerUpOutside, this);
    this.setButtonVisible(false);
  }

  setLabel(text) {
    this.label.setText(text || "");
    return this;
  }

  setButtonVisible(visible) {
    this.container.setVisible(visible);
    if (visible) {
      this.container.setInteractive({ useHandCursor: true });
    } else {
      this.container.disableInteractive();
      this.isPressed = false;
      this.actionPending = false;
      this.isHovered = false;
      this.highlight.setAlpha(0);
      this.image.clearTint();
      this.container.setPosition(this.baseX, this.baseY).setScale(1);
    }
    return this;
  }

  setDepth(depth) {
    this.container.setDepth(depth);
    return this;
  }

  onPointerOver() {
    this.isHovered = true;
    if (this.isPressed || this.actionPending) return;
    this.scene.tweens.killTweensOf(this.container);
    this.scene.tweens.add({
      targets: this.container,
      scale: ESCALA_HOVER,
      duration: 120,
      ease: "Sine.Out"
    });
    this.scene.tweens.add({
      targets: this.highlight,
      alpha: 0.14,
      duration: 120,
      ease: "Sine.Out"
    });
  }

  onPointerOut() {
    this.isHovered = false;
    if (this.isPressed || this.actionPending) return;
    this.voltarAoRepouso();
  }

  onPointerDown() {
    if (this.isPressed || this.actionPending) return;
    this.isPressed = true;
    this.pressStartedAt = this.scene.time.now;
    this.scene.tweens.killTweensOf(this.container);
    this.scene.tweens.killTweensOf(this.highlight);
    this.image.setTint(0xd5d5d5);
    this.highlight.setAlpha(0);
    this.scene.tweens.add({
      targets: this.container,
      y: this.baseY + 3,
      scale: ESCALA_PRESSIONADA,
      duration: 55,
      ease: "Sine.Out"
    });
  }

  onPointerUp() {
    if (!this.isPressed) return;
    this.isPressed = false;
    this.actionPending = true;
    const restante = Math.max(
      0,
      DURACAO_PRESSAO_MINIMA - (this.scene.time.now - this.pressStartedAt)
    );
    this.scene.time.delayedCall(restante, () => this.voltarAoRepouso(true));
  }

  onPointerUpOutside() {
    if (!this.isPressed) return;
    this.isPressed = false;
    this.voltarAoRepouso();
  }

  voltarAoRepouso(executarAcao = false) {
    this.scene.tweens.killTweensOf(this.container);
    this.scene.tweens.killTweensOf(this.highlight);
    this.image.clearTint();

    this.scene.tweens.add({
      targets: this.container,
      x: this.baseX,
      y: this.baseY,
      scale: this.isHovered ? ESCALA_HOVER : 1,
      duration: 85,
      ease: "Sine.Out",
      onComplete: () => {
        if (executarAcao) {
          this.actionPending = false;
          this.onClick();
        }
      }
    });
    this.scene.tweens.add({
      targets: this.highlight,
      alpha: this.isHovered ? 0.14 : 0,
      duration: 85,
      ease: "Sine.Out"
    });
  }

  destroy() {
    this.scene.tweens.killTweensOf(this.container);
    this.scene.tweens.killTweensOf(this.highlight);
    this.container.destroy(true);
  }
}

export default ChoiceImageButton;
