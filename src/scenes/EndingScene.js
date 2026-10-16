import Phaser from "phaser";
import { carregarPerfilAtivo, salvarPerfil } from "../data/ProfileRepository.js";
import { EndingService } from "../services/EndingService.js";
import { criarBotao } from "../ui/GameButton.js";
import { pixelTextStyle } from "../ui/TextStyles.js";

export class EndingScene extends Phaser.Scene {
  constructor() {
    super("EndingScene");
  }

  init(data) {
    this.perfil = data?.perfil || carregarPerfilAtivo();
  }

  create() {
    if (!this.perfil?.progresso?.campanhaConcluida) {
      this.scene.start("StageSelectScene", { perfil: this.perfil });
      return;
    }

    const desfecho = EndingService.obterDesfecho(this.perfil.desfecho) ||
      EndingService.calcularDesfecho(this.perfil);
    if (this.perfil.desfecho !== desfecho.id) {
      this.perfil.desfecho = desfecho.id;
      this.perfil = salvarPerfil(this.perfil);
    }

    const pontuacao = this.perfil.pontuacao || {};
    this.add.rectangle(640, 360, 1280, 720, 0x081a2d, 1);
    this.add
      .rectangle(640, 360, 900, 590, 0x102b43, 1)
      .setStrokeStyle(3, 0x8fe6e4, 1);

    this.add
      .text(640, 112, desfecho.titulo, pixelTextStyle({
        color: desfecho.id === "guardiao" ? "#9ff5b5" : "#ffffff",
        fontSize: "38px",
        fontStyle: "bold",
        align: "center",
        wordWrap: { width: 790 }
      }, { preservarCor: true }))
      .setOrigin(0.5);

    this.add
      .text(640, 225, desfecho.mensagem, pixelTextStyle({
        fontSize: "23px",
        align: "center",
        lineSpacing: 10,
        wordWrap: { width: 740 }
      }))
      .setOrigin(0.5);

    this.add
      .text(
        640,
        390,
        `Perfil: ${this.perfil.nome}\n\nCuidado: ${Number(pontuacao.cuidado) || 0}\nConduta: ${Number(pontuacao.conduta) || 0}\nDanos: ${Number(pontuacao.danos) || 0}`,
        pixelTextStyle({
          fontSize: "24px",
          align: "center",
          lineSpacing: 7
        })
      )
      .setOrigin(0.5);

    criarBotao(
      this,
      470,
      585,
      "VER FASES",
      () => this.scene.start("StageSelectScene", { perfil: this.perfil }),
      { width: 260, height: 54, fontSize: "19px" }
    );
    criarBotao(
      this,
      770,
      585,
      "MENU PRINCIPAL",
      () => this.scene.start("MainMenuScene"),
      { width: 260, height: 54, fontSize: "19px", color: 0x287d5b }
    );
  }
}

export default EndingScene;
