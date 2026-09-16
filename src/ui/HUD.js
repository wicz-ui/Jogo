export class HUD {
  constructor(scene, perfil) {
    this.scene = scene;
    this.panel = scene.add
      .rectangle(640, 57, 1232, 104, 0x10263d, 0.98)
      .setStrokeStyle(2, 0x315572, 1)
      .setScrollFactor(0)
      .setDepth(20);

    this.objectiveText = scene.add
      .text(34, 24, "Objetivo: verifique o computador", {
        color: "#f4ffff",
        fontFamily: "Arial, sans-serif",
        fontSize: "24px",
        fontStyle: "bold"
      })
      .setScrollFactor(0)
      .setDepth(21);

    this.profileText = scene.add
      .text(34, 64, "", {
        color: "#b8d7e5",
        fontFamily: "Arial, sans-serif",
        fontSize: "18px"
      })
      .setScrollFactor(0)
      .setDepth(21);

    this.scoreText = scene.add
      .text(955, 26, "", {
        color: "#f4ffff",
        fontFamily: "Arial, sans-serif",
        fontSize: "21px",
        fontStyle: "bold",
        align: "right",
        fixedWidth: 260
      })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(21);

    this.update(perfil);
  }

  update(perfil) {
    const pontuacao = perfil?.pontuacao || {};
    this.profileText.setText(`Perfil: ${perfil?.nome || "Jogador"}`);
    this.scoreText.setText(
      `Cuidado: ${Number(pontuacao.cuidado) || 0}\nConduta: ${Number(pontuacao.conduta) || 0}`
    );
  }

  destroy() {
    this.panel.destroy();
    this.objectiveText.destroy();
    this.profileText.destroy();
    this.scoreText.destroy();
  }
}
