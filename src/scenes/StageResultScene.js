import Phaser from "phaser";
import { carregarPerfilAtivo } from "../data/ProfileRepository.js";
import { ChoiceService } from "../services/ChoiceService.js";
import { criarBotao } from "../ui/GameButton.js";

const INTERACOES_OBRIGATORIAS = [
  "computador_01",
  "lixo_01",
  "equipamento_01"
];

export class StageResultScene extends Phaser.Scene {
  constructor() {
    super("StageResultScene");
  }

  init(data) {
    this.perfil = data?.perfil || carregarPerfilAtivo();
  }

  create() {
    if (!this.perfil) {
      this.scene.start("MainMenuScene");
      return;
    }

    const pontuacao = this.perfil.pontuacao || {};
    const progresso = ChoiceService.obterProgressoFase(
      this.perfil,
      INTERACOES_OBRIGATORIAS
    );

    this.add.rectangle(640, 360, 1280, 720, 0x081a2d, 1);
    this.add
      .rectangle(640, 360, 850, 560, 0x102b43, 1)
      .setStrokeStyle(3, 0x8fe6e4, 1);

    this.add
      .text(640, 120, "FASE 1 CONCLUÍDA", {
        color: "#f4ffff",
        fontFamily: "Arial, sans-serif",
        fontSize: "44px",
        fontStyle: "bold",
        align: "center"
      })
      .setOrigin(0.5);

    this.add
      .text(640, 190, "Você analisou todas as situações do laboratório.", {
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
      .text(640, 495, "Fase 2 desbloqueada e será implementada no próximo marco.", {
        color: "#c6e9ee",
        fontFamily: "Arial, sans-serif",
        fontSize: "18px",
        align: "center",
        wordWrap: { width: 650 }
      })
      .setOrigin(0.5);

    criarBotao(
      this,
      640,
      575,
      "CONTINUAR",
      () => this.feedbackText.setText("A Fase 2 ainda será desenvolvida no próximo marco."),
      { width: 290, height: 54, fontSize: "19px" }
    );
    criarBotao(
      this,
      640,
      650,
      "MENU PRINCIPAL",
      () => this.scene.start("MainMenuScene"),
      { width: 290, height: 54, fontSize: "19px", color: 0x287d5b }
    );
  }
}

export default StageResultScene;
