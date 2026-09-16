export class InteractionPrompt {
  constructor(scene, x, y) {
    this.background = scene.add
      .rectangle(0, 0, 230, 48, 0x174f68, 1)
      .setStrokeStyle(2, 0x9ce9e8, 1);
    this.text = scene.add
      .text(0, 0, "[E] Interagir", {
        color: "#ffffff",
        fontFamily: "Arial, sans-serif",
        fontSize: "20px",
        fontStyle: "bold"
      })
      .setOrigin(0.5);
    this.container = scene.add
      .container(x, y, [this.background, this.text])
      .setDepth(15)
      .setVisible(false);
  }

  show(label = "[E] Interagir") {
    this.text.setText(label);
    this.container.setVisible(true);
  }

  hide() {
    this.container.setVisible(false);
  }

  setPosition(x, y) {
    this.container.setPosition(x, y);
  }

  destroy() {
    this.container.destroy(true);
  }
}
