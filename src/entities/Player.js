import Phaser from "phaser";

export class Player extends Phaser.GameObjects.Rectangle {
  constructor(scene, x, y) {
    super(scene, x, y, 44, 58, 0xf0b44d, 1);

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setStrokeStyle(3, 0xffe7a3, 1);
    this.body.setCollideWorldBounds(true);
    this.body.setSize(44, 58);
    this.speed = 230;
  }

  update(cursors, keys) {
    if (!this.body) {
      return;
    }

    let eixoX = 0;
    let eixoY = 0;

    if (cursors.left.isDown || keys.A.isDown) eixoX -= 1;
    if (cursors.right.isDown || keys.D.isDown) eixoX += 1;
    if (cursors.up.isDown || keys.W.isDown) eixoY -= 1;
    if (cursors.down.isDown || keys.S.isDown) eixoY += 1;

    if (eixoX !== 0 || eixoY !== 0) {
      const vetor = new Phaser.Math.Vector2(eixoX, eixoY).normalize();
      this.body.setVelocity(vetor.x * this.speed, vetor.y * this.speed);
    } else {
      this.body.setVelocity(0, 0);
    }
  }

  parar() {
    this.body?.setVelocity(0, 0);
  }
}

export default Player;
