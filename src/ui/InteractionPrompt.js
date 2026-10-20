const TEXTURE_KEY = "interaction-sign";
const LARGURA = 230;

export class InteractionPrompt {
  constructor(scene, x, y) {
    const textura = scene.textures.get(TEXTURE_KEY).getSourceImage();
    this.width = LARGURA;
    this.height = LARGURA * (textura.height / textura.width);
    this.image = scene.add
      .image(0, 0, TEXTURE_KEY)
      .setDisplaySize(this.width, this.height);
    this.container = scene.add
      .container(x, y, [this.image])
      .setDepth(15)
      .setVisible(false);
  }

  show() {
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
