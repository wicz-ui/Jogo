import Phaser from "phaser";
import { carregarPerfilAtivo } from "../data/ProfileRepository.js";
import { ChoiceService } from "../services/ChoiceService.js";
import { obterConfiguracaoFase } from "../data/stagesData.js";
import { criarBotao } from "../ui/GameButton.js";

export class StageResultScene extends Phaser.Scene {
  constructor() {
    super("StageResultScene");
  }

  init(data) {
    this.perfil = data?.perfil || carregarPerfilAtivo();
    this.stageNumber = Number(data?.stageNumber) || 1;
    this.stageConfig = obterConfiguracaoFase(this.stageNumber) || obterConfiguracaoFase(1);
  }

  create() {
    if (!this.perfil) {
      this.scene.start("MainMenuScene");
      return;
    }

    const pontuacao = this.perfil.pontuacao || {};
    const progresso = ChoiceService.obterProgressoFase(
      this.perfil,
      this.stageConfig.interacoesObrigatorias
    );

    this.add.rectangle(640, 360, 1280, 720, 0x081a2d, 1);
    this.add
      .rectangle(640, 360, 850, 560, 0x102b43, 1)
      .setStrokeStyle(3, 0x8fe6e4, 1);

    this.add
      .text(640, 120, `FASE ${this.stageConfig.numeroFase} CONCLUÍDA`, {
        color: "#f4ffff",
        fontFamily: "Arial, sans-serif",
        fontSize: "44px",
        fontStyle: "bold",
        align: "center"
      })
      .setOrigin(0.5);

    this.add
      .text(640, 190, this.stageConfig.mensagemConclusao, {
        color: "#9fe6e5",
        fontFamily: "Arial, sans-serif",
        fontSize: "22px",
        align: "center",
        wordWrap: { width: 700 }
      })
      .setOrigin(0.5);

    this.add
      .text(
        640,
        305,
        `Perfil: ${this.perfil.nome}\n\nCuidado: ${Number(pontuacao.cuidado) || 0}\nConduta: ${Number(pontuacao.conduta) || 0}\n\nSituações analisadas: ${progresso.texto}`,
        {
          color: "#ffffff",
          fontFamily: "Arial, sans-serif",
          fontSize: "25px",
          align: "center",
          lineSpacing: 7
        }
      )
      .setOrigin(0.5);

    this.feedbackText = this.add
      .text(640, 495, "Seu progresso foi salvo. Escolha a próxima etapa.", {
        color: "#c6e9ee",
        fontFamily: "Arial, sans-serif",
        fontSize: "18px",
        align: "center",
        wordWrap: { width: 650 }
      })
      .setOrigin(0.5);

    criarBotao(
      this,
      485,
      575,
      "SELEÇÃO DE FASES",
      () => this.scene.start("StageSelectScene", { perfil: this.perfil }),
      { width: 300, height: 54, fontSize: "18px" }
    );
    criarBotao(
      this,
      795,
      575,
      "MENU PRINCIPAL",
      () => this.scene.start("MainMenuScene"),
      { width: 260, height: 54, fontSize: "18px", color: 0x287d5b }
    );
  }
}

export default StageResultScene;
