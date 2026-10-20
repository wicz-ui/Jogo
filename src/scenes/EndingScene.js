import Phaser from "phaser";
import { carregarPerfilAtivo, salvarPerfil } from "../data/ProfileRepository.js";
import { EndingService } from "../services/EndingService.js";
import { criarBotaoGiz, CHALK_TEXTURES, preloadChalkAssets } from "../ui/ChalkButton.js";
import { iniciarSchoolBackdrop, preloadSchoolBackdrop } from "../ui/SchoolBackdrop.js";
import { pixelTextStyle } from "../ui/TextStyles.js";

export class EndingScene extends Phaser.Scene {
  constructor() {
    super("EndingScene");
  }

  init(data) {
    this.perfil = data?.perfil || carregarPerfilAtivo();
  }

  preload() {
    preloadSchoolBackdrop(this);
    preloadChalkAssets(this, { board: true, colors: ["blue", "pink"] });
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

    iniciarSchoolBackdrop(this);

    const { width, height } = this.cameras.main;
    const quadroTextura = this.textures.get(CHALK_TEXTURES.board).getSourceImage();
    const escalaQuadro = Math.min(
      (width - 48) / quadroTextura.width,
      (height - 36) / quadroTextura.height
    );
    const larguraQuadro = quadroTextura.width * escalaQuadro;
    const escalaLayout = larguraQuadro / 1177;
    const areaTexto = larguraQuadro * 0.82;
    const pontuacao = this.perfil.pontuacao || {};

    this.add
      .image(width / 2, height / 2, CHALK_TEXTURES.board)
      .setDisplaySize(larguraQuadro, quadroTextura.height * escalaQuadro)
      .setDepth(0);

    this.add
      .text(width / 2, height * 0.25, desfecho.titulo, pixelTextStyle({
        fontSize: `${38 * escalaLayout}px`,
        align: "center",
        wordWrap: { width: areaTexto, useAdvancedWrap: true }
      }))
      .setOrigin(0.5)
      .setDepth(1);

    this.add
      .text(width / 2, height * 0.36, desfecho.mensagem, pixelTextStyle({
        fontSize: `${22 * escalaLayout}px`,
        align: "center",
        lineSpacing: 6 * escalaLayout,
        wordWrap: { width: areaTexto, useAdvancedWrap: true }
      }))
      .setOrigin(0.5)
      .setDepth(1);

    this.add
      .text(width / 2, height * 0.49, `Perfil: ${this.perfil.nome || "Jogador"}`, pixelTextStyle({
        fontSize: `${24 * escalaLayout}px`,
        align: "center",
        wordWrap: { width: areaTexto, useAdvancedWrap: true }
      }))
      .setOrigin(0.5)
      .setDepth(1);

    this.add
      .text(
        width / 2,
        height * 0.60,
        `Cuidado: ${Number(pontuacao.cuidado) || 0}   •   Conduta: ${Number(pontuacao.conduta) || 0}\nDanos: ${Number(pontuacao.danos) || 0}`,
        pixelTextStyle({
          fontSize: `${21 * escalaLayout}px`,
          align: "center",
          lineSpacing: 5 * escalaLayout,
          wordWrap: { width: areaTexto, useAdvancedWrap: true }
        })
      )
      .setOrigin(0.5)
      .setDepth(1);

    const larguraBotao = Math.min(360 * escalaLayout, areaTexto * 0.37);
    const distanciaBotoes = larguraQuadro * 0.19;
    const yBotoes = height * 0.765;

    criarBotaoGiz(this, {
      x: width / 2 - distanciaBotoes,
      y: yBotoes,
      label: "VER FASES",
      color: "blue",
      width: larguraBotao,
      fontSize: `${22 * escalaLayout}px`,
      onClick: () => this.scene.start("StageSelectScene", { perfil: this.perfil })
    }).setDepth(2);

    criarBotaoGiz(this, {
      x: width / 2 + distanciaBotoes,
      y: yBotoes,
      label: "MENU PRINCIPAL",
      color: "pink",
      width: larguraBotao,
      fontSize: `${22 * escalaLayout}px`,
      onClick: () => this.scene.start("MainMenuScene")
    }).setDepth(2);
  }
}

export default EndingScene;
