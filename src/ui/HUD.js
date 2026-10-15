import { ChoiceService } from "../services/ChoiceService.js";

export class HUD {
  constructor(
    scene,
    perfil,
    listaInteracoesObrigatorias = [],
    objetivo = "",
    exibirDanos = false
  ) {
    this.scene = scene;
    this.listaInteracoesObrigatorias = listaInteracoesObrigatorias;
    this.objetivo = objetivo;
    this.exibirDanos = exibirDanos;
    this.panel = scene.add
      .rectangle(640, 60, 1232, 116, 0x10263d, 0.98)
      .setStrokeStyle(2, 0x315572, 1)
      .setScrollFactor(0)
      .setDepth(20);

    this.objectiveText = scene.add
      .text(34, 20, this.formatarObjetivo(objetivo), {
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

  formatarObjetivo(objetivo) {
    const texto = String(objetivo || "").trim();
    return texto.toLowerCase().startsWith("objetivo:")
      ? texto
      : `Objetivo: ${texto || "complete a fase"}`;
  }

  update(perfil) {
    const pontuacao = perfil?.pontuacao || {};
    const progresso = ChoiceService.obterProgressoFase(
      perfil,
      this.listaInteracoesObrigatorias
    );
    this.profileText.setText(`Perfil: ${perfil?.nome || "Jogador"}`);
    this.progressText.setText(`Progresso: ${progresso.texto}`);
    const linhasPontuacao = [
      `Cuidado: ${Number(pontuacao.cuidado) || 0}`,
      `Conduta: ${Number(pontuacao.conduta) || 0}`
    ];
    if (this.exibirDanos) {
      linhasPontuacao.push(`Danos: ${Number(pontuacao.danos) || 0}`);
    }
    this.scoreText.setText(linhasPontuacao.join("\n"));
  }

  destroy() {
    this.panel.destroy();
    this.objectiveText.destroy();
    this.progressText.destroy();
    this.profileText.destroy();
    this.scoreText.destroy();
  }
}
