import { ChoiceService } from "../services/ChoiceService.js";
import { criarBotaoImagem } from "./ImageButton.js";
import { pixelTextStyle } from "./TextStyles.js";

const QUADRO_KEY = "stage-hud-board";
const BOTAO_FASES_KEY = "stage-hud-button-phases";
const LARGURA_QUADRO = 1080;
const CENTRO_Y_QUADRO = 80;
const LARGURA_BOTAO_FASES = 144;

export class HUD {
  constructor(
    scene,
    perfil,
    listaInteracoesObrigatorias = [],
    objetivo = "",
    exibirDanos = false,
    onOpenStages = () => {}
  ) {
    this.scene = scene;
    this.listaInteracoesObrigatorias = listaInteracoesObrigatorias;
    this.objetivo = objetivo;
    this.exibirDanos = exibirDanos;
    const camera = scene.cameras.main;
    const centerX = camera.centerX;
    const texturaQuadro = scene.textures.get(QUADRO_KEY).getSourceImage();
    const escalaQuadro = LARGURA_QUADRO / texturaQuadro.width;

    this.board = scene.add
      .image(centerX, CENTRO_Y_QUADRO, QUADRO_KEY)
      .setScale(escalaQuadro)
      .setScrollFactor(0)
      .setDepth(20);

    this.objectiveText = scene.add
      .text(130, 19, this.formatarObjetivo(objetivo), pixelTextStyle({
        fontSize: "24px",
        fontStyle: "bold"
      }))
      .setScrollFactor(0)
      .setDepth(21);

    this.progressText = scene.add
      .text(130, 52, "Progresso: 0/3", pixelTextStyle({
        fontSize: "20px",
        fontStyle: "bold"
      }))
      .setScrollFactor(0)
      .setDepth(21);

    this.profileText = scene.add
      .text(130, 82, "", pixelTextStyle({
        fontSize: "18px"
      }))
      .setScrollFactor(0)
      .setDepth(21);

    this.scoreText = scene.add
      .text(975, 21, "", pixelTextStyle({
        fontSize: "21px",
        fontStyle: "bold",
        align: "right",
        fixedWidth: 230
      }))
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(21);

    this.stageButton = criarBotaoImagem(
      scene,
      1090,
      62,
      BOTAO_FASES_KEY,
      LARGURA_BOTAO_FASES,
      onOpenStages
    )
      .setScrollFactor(0)
      .setDepth(22);
    this.stageButton.add(
      scene.add
        .text(0, 0, "FASES", pixelTextStyle({
          fontSize: "17px",
          align: "center"
        }))
        .setOrigin(0.5)
    );

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
    this.board.destroy();
    this.objectiveText.destroy();
    this.progressText.destroy();
    this.profileText.destroy();
    this.scoreText.destroy();
    this.stageButton.destroy(true);
  }
}
