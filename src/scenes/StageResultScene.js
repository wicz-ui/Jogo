import Phaser from "phaser";
import { carregarPerfilAtivo } from "../data/ProfileRepository.js";
import { ChoiceService } from "../services/ChoiceService.js";
import { obterConfiguracaoFase } from "../data/stagesData.js";
import { criarBotaoGiz, CHALK_TEXTURES, preloadChalkAssets } from "../ui/ChalkButton.js";
import { iniciarSchoolBackdrop, preloadSchoolBackdrop } from "../ui/SchoolBackdrop.js";
import { pixelTextStyle } from "../ui/TextStyles.js";

export class StageResultScene extends Phaser.Scene {
  constructor() {
    super("StageResultScene");
  }

  init(data) {
    this.perfil = data?.perfil || carregarPerfilAtivo();
    this.stageNumber = Number(data?.stageNumber) || 1;
    this.stageConfig = obterConfiguracaoFase(this.stageNumber) || obterConfiguracaoFase(1);
  }

  preload() {
    preloadSchoolBackdrop(this);
    preloadChalkAssets(this, { board: true, colors: ["blue", "pink"] });
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

    this.add
      .image(width / 2, height / 2, CHALK_TEXTURES.board)
      .setDisplaySize(larguraQuadro, quadroTextura.height * escalaQuadro)
      .setDepth(0);

    this.add
      .text(width / 2, height * 0.245, `FASE ${this.stageConfig.numeroFase} CONCLUÍDA`, pixelTextStyle({
        fontSize: `${40 * escalaLayout}px`,
        align: "center",
        wordWrap: { width: areaTexto, useAdvancedWrap: true }
      }))
      .setOrigin(0.5)
      .setDepth(1);

    this.add
      .text(width / 2, height * 0.34, this.stageConfig.mensagemConclusao, pixelTextStyle({
        fontSize: `${22 * escalaLayout}px`,
        align: "center",
        lineSpacing: 5 * escalaLayout,
        wordWrap: { width: areaTexto, useAdvancedWrap: true }
      }))
      .setOrigin(0.5)
      .setDepth(1);

    this.add
      .text(width / 2, height * 0.455, `Perfil: ${this.perfil.nome || "Jogador"}`, pixelTextStyle({
        fontSize: `${24 * escalaLayout}px`,
        align: "center",
        wordWrap: { width: areaTexto, useAdvancedWrap: true }
      }))
      .setOrigin(0.5)
      .setDepth(1);

    this.add
      .text(
        width / 2,
        height * 0.535,
        `Cuidado: ${Number(pontuacao.cuidado) || 0}   •   Conduta: ${Number(pontuacao.conduta) || 0}\nSituações analisadas: ${progresso.texto}`,
        pixelTextStyle({
          fontSize: `${21 * escalaLayout}px`,
          align: "center",
          lineSpacing: 5 * escalaLayout,
          wordWrap: { width: areaTexto, useAdvancedWrap: true }
        })
      )
      .setOrigin(0.5)
      .setDepth(1);

    this.feedbackText = this.add
      .text(width / 2, height * 0.655, "Seu progresso foi salvo. Escolha a próxima etapa.", pixelTextStyle({
        fontSize: `${18 * escalaLayout}px`,
        align: "center",
        wordWrap: { width: areaTexto, useAdvancedWrap: true }
      }))
      .setOrigin(0.5)
      .setDepth(1);

    const larguraBotao = Math.min(390 * escalaLayout, areaTexto * 0.39);
    const distanciaBotoes = larguraQuadro * 0.20;
    const yBotoes = height * 0.765;

    criarBotaoGiz(this, {
      x: width / 2 - distanciaBotoes,
      y: yBotoes,
      label: "SELEÇÃO DE FASES",
      color: "blue",
      width: larguraBotao,
      fontSize: `${20 * escalaLayout}px`,
      onClick: () => this.scene.start("StageSelectScene", { perfil: this.perfil })
    }).setDepth(2);
    criarBotaoGiz(this, {
      x: width / 2 + distanciaBotoes,
      y: yBotoes,
      label: "MENU PRINCIPAL",
      color: "pink",
      width: larguraBotao,
      fontSize: `${20 * escalaLayout}px`,
      onClick: () => this.scene.start("MainMenuScene")
    }).setDepth(2);
  }
}

export default StageResultScene;
