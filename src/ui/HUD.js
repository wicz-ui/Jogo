import { ChoiceService } from "../services/ChoiceService.js";

export class HUD {
  constructor(scene, perfil, listaInteracoesObrigatorias = []) {
    this.scene = scene;
    this.listaInteracoesObrigatorias = listaInteracoesObrigatorias;
    this.panel = scene.add
      .rectangle(640, 60, 1232, 116, 0x10263d, 0.98)
      .setStrokeStyle(2, 0x315572, 1)
      .setScrollFactor(0)
      .setDepth(20);

    this.objectiveText = scene.add
      .text(34, 20, "Objetivo: cuide do laboratório", {
        color: "#f4ffff",
        fontFamily: "Arial, sans-serif",
        fontSize: "24px",
        fontStyle: "bold"
      })
      .setScrollFactor(0)
      .setDepth(21);

    this.progressText = scene.add
      .text(34, 55, "Progresso: 0/3", {
        color: "#9fe6e5",
        fontFamily: "Arial, sans-serif",
        fontSize: "20px",
        fontStyle: "bold"
      })
      .setScrollFactor(0)
      .setDepth(21);

    this.profileText = scene.add
      .text(34, 87, "", {
        color: "#b8d7e5",
        fontFamily: "Arial, sans-serif",
        fontSize: "18px"
      })
      .setScrollFactor(0)
      .setDepth(21);

    this.scoreText = scene.add
      .text(930, 23, "", {
        color: "#f4ffff",
        fontFamily: "Arial, sans-serif",
        fontSize: "21px",
        fontStyle: "bold",
        align: "right",
        fixedWidth: 230
      })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(21);

    this.update(perfil);
  }

  update(perfil) {
    const pontuacao = perfil?.pontuacao || {};
    const progresso = ChoiceService.obterProgressoFase(
      perfil,
      this.listaInteracoesObrigatorias
    );
    this.profileText.setText(`Perfil: ${perfil?.nome || "Jogador"}`);
    this.progressText.setText(`Progresso: ${progresso.texto}`);
    this.scoreText.setText(
      `Cuidado: ${Number(pontuacao.cuidado) || 0}\nConduta: ${Number(pontuacao.conduta) || 0}`
    );
  }

  destroy() {
    this.panel.destroy();
    this.objectiveText.destroy();
    this.progressText.destroy();
    this.profileText.destroy();
    this.scoreText.destroy();
  }
}
