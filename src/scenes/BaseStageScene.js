import Phaser from "phaser";
import {
  carregarPerfilAtivo,
  salvarPerfil
} from "../data/ProfileRepository.js";
import { ChoiceService } from "../services/ChoiceService.js";
import { ProgressionService } from "../services/ProgressionService.js";
import Player from "../entities/Player.js";
import { ChoiceDialog } from "../ui/ChoiceDialog.js";
import { HUD } from "../ui/HUD.js";
import { InteractionPrompt } from "../ui/InteractionPrompt.js";
import { criarBotao } from "../ui/GameButton.js";

const SALA_PADRAO = {
  x: 80,
  y: 175,
  width: 1120,
  height: 475
};

/**
 * Infraestrutura compartilhada pelas fases jogáveis do Marco 3.
 * As subclasses fornecem somente a configuração e o tema da fase.
 */
export class BaseStageScene extends Phaser.Scene {
  constructor(chaveCena) {
    super(chaveCena);
  }

  getStageConfig() {
    throw new Error("A cena precisa fornecer getStageConfig().");
  }

  init(data) {
    this.perfil = data?.perfil || carregarPerfilAtivo();
    this.stageConfig = this.getStageConfig();
  }

  create() {
    if (!this.perfil) {
      this.scene.start("MainMenuScene");
      return;
    }

    if (!this.stageConfig || !ProgressionService.podeAcessarFase(
      this.perfil,
      this.stageConfig.numeroFase
    )) {
      this.scene.start("StageSelectScene", {
        perfil: this.perfil,
        aviso: `A Fase ${this.stageConfig?.numeroFase || "selecionada"} está bloqueada.`
      });
      return;
    }

    this.interacaoVisuais = new Map();
    this.conclusaoAberta = false;
    this.finalizacaoEmAndamento = false;

    this.desenharSala();
    this.hud = new HUD(
      this,
      this.perfil,
      this.stageConfig.interacoesObrigatorias,
      this.stageConfig.objetivo
    );
    this.criarObjetosInterativos();

    const inicio = this.stageConfig.jogadorInicial || { x: 230, y: 380 };
    this.player = new Player(this, inicio.x, inicio.y);
    const sala = { ...SALA_PADRAO, ...(this.stageConfig.sala || {}) };
    this.physics.world.setBounds(sala.x, sala.y, sala.width, sala.height);
    this.player.body.setCollideWorldBounds(true);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys("W,A,S,D");
    this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.escapeKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

    this.interactionPrompt = new InteractionPrompt(this, 0, 0);
    this.choiceDialog = new ChoiceDialog(this);

    this.statusText = this.add
      .text(640, 685, "Use WASD ou as setas para se movimentar.", {
        color: "#c6e9ee",
        fontFamily: "Arial, sans-serif",
        fontSize: "18px",
        align: "center",
        wordWrap: { width: 1000 }
      })
      .setOrigin(0.5)
      .setDepth(20);

    criarBotao(
      this,
      1125,
      55,
      "FASES",
      () => this.scene.start("StageSelectScene", { perfil: this.perfil }),
      { width: 130, height: 42, fontSize: "17px" }
    ).setDepth(22);

    this.criarModalConclusao();
    this.atualizarEstadoInteracoes();

    if (this.progressoFase.faseConcluida) {
      this.mostrarConclusao();
    }

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.limparRecursos, this);
  }

  desenharSala() {
    const salaConfig = { ...SALA_PADRAO, ...(this.stageConfig.sala || {}) };
    this.add.rectangle(640, 360, 1280, 720, 0x081a2d, 1).setDepth(-3);

    const sala = this.add.graphics().setDepth(-2);
    sala.fillStyle(salaConfig.backgroundColor || 0x163b4d, 1);
    sala.fillRect(salaConfig.x, salaConfig.y, salaConfig.width, salaConfig.height);
    sala.lineStyle(5, salaConfig.borderColor || 0x7ed6df, 1);
    sala.strokeRect(salaConfig.x, salaConfig.y, salaConfig.width, salaConfig.height);
    sala.lineStyle(1, salaConfig.gridColor || 0x2b5f70, 1);

    if (salaConfig.linhasHorizontais) {
      for (let y = salaConfig.y + 45; y < salaConfig.y + salaConfig.height; y += 55) {
        sala.lineBetween(salaConfig.x, y, salaConfig.x + salaConfig.width, y);
      }
      for (let x = salaConfig.x + 120; x < salaConfig.x + salaConfig.width; x += 160) {
        sala.lineBetween(x, salaConfig.y, x, salaConfig.y + salaConfig.height);
      }
    } else {
      for (let x = salaConfig.x + 40; x < salaConfig.x + salaConfig.width; x += 80) {
        sala.lineBetween(x, salaConfig.y, x, salaConfig.y + salaConfig.height);
      }
      for (let y = salaConfig.y + 40; y < salaConfig.y + salaConfig.height; y += 80) {
        sala.lineBetween(salaConfig.x, y, salaConfig.x + salaConfig.width, y);
      }
    }

    this.add
      .text(80, 145, this.stageConfig.cabecalho, {
        color: "#f4ffff",
        fontFamily: "Arial, sans-serif",
        fontSize: this.stageConfig.numeroFase === 2 ? "23px" : "25px",
        fontStyle: "bold"
      })
      .setDepth(10);

    this.add
      .text(salaConfig.destaqueX || 180, salaConfig.destaqueY || 255, salaConfig.destaque || "", {
        color: "#8ab7c5",
        fontFamily: "Arial, sans-serif",
        fontSize: "18px",
        align: "center",
        fontStyle: "bold"
      })
      .setOrigin(0.5)
      .setDepth(1);
  }

  criarObjetosInterativos() {
    this.stageConfig.interacoes.forEach((interacao) => {
      this.interacaoVisuais.set(interacao.id, this.criarVisualInteracao(interacao));
    });
  }

  criarVisualInteracao(interacao) {
    const grupo = this.add
      .container(interacao.x, interacao.y)
      .setDepth(4);
    const visual = { grupo, tipo: interacao.visual };

    if (interacao.visual === "computador") {
      const mesa = this.add
        .rectangle(0, 72, 330, 105, 0x7b533d, 1)
        .setStrokeStyle(4, 0xd29b65, 1);
      const suporte = this.add.rectangle(0, 23, 24, 55, 0xd29b65, 1);
      const moldura = this.add
        .rectangle(0, -25, 170, 112, 0x0b1728, 1)
        .setStrokeStyle(5, 0x9fe6e5, 1);
      const tela = this.add
        .rectangle(0, -25, 146, 88, 0x206f83, 1)
        .setStrokeStyle(2, 0xc6f5ef, 1);
      const estado = this.add
        .text(0, -25, "ON", {
          color: "#e9fff8",
          fontFamily: "Arial, sans-serif",
          fontSize: "28px",
          fontStyle: "bold"
        })
        .setOrigin(0.5);
      const base = this.add.rectangle(0, 45, 95, 10, 0x0b1728, 1);
      const luz = this.add.circle(70, -70, 7, 0x86f7a5, 1);

      grupo.add([mesa, suporte, moldura, tela, estado, base, luz]);
      visual.tela = tela;
      visual.estado = estado;
      visual.luz = luz;
      visual.rotuloY = 112;
      visual.statusY = 145;
    } else if (interacao.visual === "lixo") {
      const sombra = this.add.ellipse(0, 34, 125, 28, 0x071522, 0.5);
      const saco = this.add
        .ellipse(0, 0, 112, 95, 0x5e6870, 1)
        .setStrokeStyle(3, 0xb7c4c9, 1);
      const abertura = this.add.rectangle(0, -35, 78, 13, 0x303a42, 1);
      const papelUm = this.add.rectangle(-37, 5, 24, 16, 0xf1e4bc, 1).setAngle(-18);
      const papelDois = this.add.rectangle(40, -2, 20, 14, 0xe8d7a4, 1).setAngle(22);

      grupo.add([sombra, saco, abertura, papelUm, papelDois]);
      visual.base = saco;
      visual.acento = abertura;
      visual.rotuloY = 78;
      visual.statusY = 110;
    } else if (interacao.visual === "equipamento") {
      const sombra = this.add.ellipse(0, 45, 175, 28, 0x071522, 0.5);
      const caixa = this.add
        .rectangle(0, 12, 145, 82, 0xc28545, 1)
        .setStrokeStyle(4, 0xf1c27d, 1);
      const tampa = this.add
        .rectangle(0, -38, 168, 25, 0xe1a15d, 1)
        .setStrokeStyle(3, 0xf8d39a, 1);
      const faixa = this.add.rectangle(0, 12, 16, 82, 0x8b552f, 1);
      const etiqueta = this.add
        .text(0, 12, "MATERIAL", {
          color: "#301b10",
          fontFamily: "Arial, sans-serif",
          fontSize: "15px",
          fontStyle: "bold"
        })
        .setOrigin(0.5);

      grupo.add([sombra, caixa, tampa, faixa, etiqueta]);
      visual.base = caixa;
      visual.acento = tampa;
      visual.rotuloY = 80;
      visual.statusY = 112;
    } else if (interacao.visual === "liquido") {
      const sombra = this.add.ellipse(0, 35, 180, 28, 0x071522, 0.5);
      const poça = this.add
        .ellipse(0, 8, 170, 76, 0x42b7c8, 0.95)
        .setStrokeStyle(3, 0x9ce9e8, 1);
      const sinal = this.add
        .rectangle(0, -50, 86, 24, 0xe1ad4c, 1)
        .setStrokeStyle(2, 0xffe7a3, 1);
      const alerta = this.add
        .text(0, -50, "ATENÇÃO", {
          color: "#31210b",
          fontFamily: "Arial, sans-serif",
          fontSize: "12px",
          fontStyle: "bold"
        })
        .setOrigin(0.5);

      grupo.add([sombra, poça, sinal, alerta]);
      visual.base = poça;
      visual.acento = sinal;
      visual.extra = alerta;
      visual.rotuloY = 70;
      visual.statusY = 102;
    } else {
      const sombra = this.add.ellipse(0, 45, 180, 28, 0x071522, 0.5);
      const colegaUm = this.add
        .rectangle(-42, 12, 34, 76, 0xc86a68, 1)
        .setStrokeStyle(3, 0xffc4b5, 1);
      const colegaDois = this.add
        .rectangle(42, 12, 34, 76, 0x68a9d4, 1)
        .setStrokeStyle(3, 0xc4e6ff, 1);
      const cabecaUm = this.add.circle(-42, -35, 22, 0xf0b44d, 1);
      const cabecaDois = this.add.circle(42, -35, 22, 0xe0a477, 1);
      const dialogo = this.add
        .rectangle(0, -76, 104, 24, 0xf4ffff, 1)
        .setStrokeStyle(2, 0x9fe6e5, 1);

      grupo.add([sombra, colegaUm, colegaDois, cabecaUm, cabecaDois, dialogo]);
      visual.base = colegaUm;
      visual.acento = colegaDois;
      visual.rotuloY = 78;
      visual.statusY = 110;
    }

    const rotulo = this.add
      .text(0, visual.rotuloY, interacao.label || interacao.visual.toUpperCase(), {
        color: "#ffffff",
        fontFamily: "Arial, sans-serif",
        fontSize: "19px",
        fontStyle: "bold"
      })
      .setOrigin(0.5);
    const status = this.add
      .text(0, visual.statusY, "✓ RESOLVIDO", {
        color: "#9ff5b5",
        fontFamily: "Arial, sans-serif",
        fontSize: "16px",
        fontStyle: "bold"
      })
      .setOrigin(0.5)
      .setVisible(false);

    grupo.add([rotulo, status]);
    visual.status = status;
    return visual;
  }

  criarModalConclusao() {
    this.conclusaoOverlay = this.add
      .rectangle(640, 360, 1280, 720, 0x000000, 0.72)
      .setDepth(60)
      .setInteractive();
    this.conclusaoPanel = this.add
      .rectangle(640, 360, 720, 350, 0x102b43, 1)
      .setStrokeStyle(3, 0x9ff5b5, 1)
      .setDepth(61);
    this.conclusaoTitulo = this.add
      .text(640, 255, "FASE CONCLUÍDA", {
        color: "#9ff5b5",
        fontFamily: "Arial, sans-serif",
        fontSize: "38px",
        fontStyle: "bold"
      })
      .setOrigin(0.5)
      .setDepth(62);
    this.conclusaoMensagem = this.add
      .text(640, 335, this.stageConfig.mensagemConclusao, {
        color: "#ffffff",
        fontFamily: "Arial, sans-serif",
        fontSize: "22px",
        align: "center",
        wordWrap: { width: 590 }
      })
      .setOrigin(0.5)
      .setDepth(62);
    this.finalizarButton = criarBotao(
      this,
      640,
      450,
      "FINALIZAR FASE",
      () => this.finalizarFase(),
      { width: 310, height: 60, fontSize: "21px", color: 0x287d5b }
    ).setDepth(62);

    this.conclusaoElements = [
      this.conclusaoOverlay,
      this.conclusaoPanel,
      this.conclusaoTitulo,
      this.conclusaoMensagem,
      this.finalizarButton
    ];
    this.ocultarConclusao();
  }

  ocultarConclusao() {
    this.conclusaoElements?.forEach((element) => element.setVisible(false));
    this.finalizarButton?.setButtonVisible(false);
  }

  mostrarConclusao() {
    if (this.conclusaoAberta || this.finalizacaoEmAndamento) {
      return;
    }

    if (!this.progressoFase?.faseConcluida) {
      return;
    }

    this.conclusaoAberta = true;
    this.player?.parar();
    this.interactionPrompt?.hide();
    this.conclusaoElements.forEach((element) => element.setVisible(true));
    this.finalizarButton.setButtonVisible(true);
  }

  finalizarFase() {
    if (!this.conclusaoAberta || this.finalizacaoEmAndamento) {
      return;
    }

    this.finalizacaoEmAndamento = true;
    const resultado = ProgressionService.concluirFase(
      this.perfil,
      this.stageConfig.numeroFase
    );

    if (resultado?.sucesso === false) {
      this.finalizacaoEmAndamento = false;
      this.statusText.setText(resultado.erro || "Não foi possível concluir a fase.");
      return;
    }

    this.perfil = salvarPerfil(resultado);
    this.scene.start("StageResultScene", {
      perfil: this.perfil,
      stageNumber: this.stageConfig.numeroFase
    });
  }

  obterEscolhaDaInteracao(interacao) {
    const escolhas = Array.isArray(this.perfil?.escolhasRealizadas)
      ? this.perfil.escolhasRealizadas
      : [];

    return escolhas
      .map((registro) => typeof registro === "string" ? registro : registro?.choiceId)
      .find((choiceId) => interacao.opcoes.some((opcao) => opcao.choiceId === choiceId));
  }

  atualizarVisualInteracao(interacao) {
    const visual = this.interacaoVisuais.get(interacao.id);
    const resolvida = ChoiceService.interacaoConcluida(this.perfil, interacao.id);
    const escolha = this.obterEscolhaDaInteracao(interacao);
    const escolhaPositiva = escolha === interacao.opcoes[0].choiceId;

    visual.status.setVisible(resolvida);

    if (interacao.visual === "computador") {
      visual.luz.setFillStyle(!resolvida ? 0x86f7a5 : escolhaPositiva ? 0x9ca7ad : 0xffb85c);
      visual.tela.setFillStyle(!resolvida ? 0x206f83 : escolhaPositiva ? 0x344c58 : 0x206f83);
      visual.estado.setText(!resolvida ? "ON" : escolhaPositiva ? "OFF" : "ON");
      return;
    }

    if (resolvida) {
      visual.base?.setFillStyle(escolhaPositiva ? 0x287d5b : 0x80533b);
      visual.acento?.setFillStyle(escolhaPositiva ? 0x52b87e : 0x9e6846);
      visual.extra?.setAlpha(0.45);
    } else {
      const cores = {
        lixo: [0x5e6870, 0x303a42],
        equipamento: [0xc28545, 0xe1a15d],
        liquido: [0x42b7c8, 0xe1ad4c],
        respeito: [0xc86a68, 0x68a9d4]
      }[interacao.visual] || [0x5e6870, 0x303a42];
      visual.base?.setFillStyle(cores[0]);
      visual.acento?.setFillStyle(cores[1]);
      visual.extra?.setAlpha(1);
    }
  }

  atualizarEstadoInteracoes() {
    this.stageConfig.interacoes.forEach((interacao) => {
      this.atualizarVisualInteracao(interacao);
    });
    this.progressoFase = ChoiceService.obterProgressoFase(
      this.perfil,
      this.stageConfig.interacoesObrigatorias
    );
    this.hud.update(this.perfil);
  }

  obterInteracaoAtiva() {
    return this.stageConfig.interacoes.find((interacao) => {
      if (ChoiceService.interacaoConcluida(this.perfil, interacao.id)) {
        return false;
      }

      return Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        interacao.x,
        interacao.y
      ) <= interacao.raioInteracao;
    });
  }

  abrirEscolha(interacao) {
    if (!interacao || this.choiceDialog.isOpen) {
      return;
    }

    if (ChoiceService.interacaoConcluida(this.perfil, interacao.id)) {
      return;
    }

    this.choiceDialog.show({
      titulo: interacao.titulo,
      mensagem: interacao.mensagem,
      opcoes: interacao.opcoes,
      onChoice: (choiceId) => this.registrarEscolha(choiceId)
    });
  }

  registrarEscolha(choiceId) {
    const resultado = ChoiceService.registrarEscolha(this.perfil, choiceId);

    if (!resultado.sucesso) {
      this.statusText.setText(resultado.erro);
      this.atualizarEstadoInteracoes();
      return;
    }

    this.perfil = salvarPerfil(resultado.perfil);
    this.atualizarEstadoInteracoes();

    const impacto = resultado.impacto;
    const cuidado = impacto.cuidado >= 0 ? `+${impacto.cuidado}` : `${impacto.cuidado}`;
    const conduta = impacto.conduta >= 0 ? `+${impacto.conduta}` : `${impacto.conduta}`;
    this.statusText.setText(
      `${resultado.mensagem}\n${cuidado} cuidado  •  ${conduta} conduta\n` +
      `Agora: Cuidado ${this.perfil.pontuacao.cuidado}  •  Conduta ${this.perfil.pontuacao.conduta}`
    );

    if (this.progressoFase.faseConcluida) {
      this.mostrarConclusao();
    }
  }

  update() {
    if (!this.player || !this.choiceDialog) {
      return;
    }

    if (this.conclusaoAberta) {
      this.player.parar();
      this.interactionPrompt.hide();
      return;
    }

    if (this.choiceDialog.isOpen) {
      this.player.parar();
      this.interactionPrompt.hide();

      if (Phaser.Input.Keyboard.JustDown(this.escapeKey)) {
        this.choiceDialog.close();
      }
      return;
    }

    this.player.update(this.cursors, this.keys);

    const interacao = this.obterInteracaoAtiva();
    if (interacao) {
      this.interactionPrompt.setPosition(interacao.x, interacao.y - 100);
      this.interactionPrompt.show();
      if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
        this.abrirEscolha(interacao);
      }
    } else {
      this.interactionPrompt.hide();
    }
  }

  limparRecursos() {
    this.choiceDialog?.destroy();
    this.interactionPrompt?.destroy();
    this.hud?.destroy();
    this.conclusaoElements?.forEach((element) => element.destroy(true));
    this.conclusaoElements = [];
  }
}

export default BaseStageScene;
