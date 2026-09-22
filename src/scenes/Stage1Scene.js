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

const SALA = {
  x: 80,
  y: 175,
  width: 1120,
  height: 475
};

export const INTERACOES_OBRIGATORIAS = [
  "computador_01",
  "lixo_01",
  "equipamento_01"
];

const INTERACOES = [
  {
    id: "computador_01",
    tipo: "computador",
    x: 950,
    y: 380,
    raioInteracao: 135,
    titulo: "Computador",
    mensagem: "O computador está ligado sem necessidade.\nO que deseja fazer?",
    opcoes: [
      { texto: "Desligar corretamente", choiceId: "desligar_computador" },
      { texto: "Ignorar", choiceId: "ignorar_computador" }
    ]
  },
  {
    id: "lixo_01",
    tipo: "lixo",
    x: 430,
    y: 530,
    raioInteracao: 120,
    titulo: "Lixo no laboratório",
    mensagem: "Há lixo no chão do laboratório.\nO que deseja fazer?",
    opcoes: [
      { texto: "Colocar na lixeira", choiceId: "recolher_lixo" },
      { texto: "Deixar onde está", choiceId: "deixar_lixo" }
    ]
  },
  {
    id: "equipamento_01",
    tipo: "equipamento",
    x: 760,
    y: 265,
    raioInteracao: 120,
    titulo: "Equipamento fora do lugar",
    mensagem: "Um equipamento foi deixado fora do lugar.\nO que deseja fazer?",
    opcoes: [
      { texto: "Guardar corretamente", choiceId: "guardar_equipamento" },
      { texto: "Usar/deixar de forma inadequada", choiceId: "usar_equipamento_incorretamente" }
    ]
  }
];

export class Stage1Scene extends Phaser.Scene {
  constructor() {
    super("Stage1Scene");
  }

  init(data) {
    this.perfil = data?.perfil || carregarPerfilAtivo();
  }

  create() {
    if (!this.perfil) {
      this.scene.start("MainMenuScene");
      return;
    }

    this.interacaoVisuais = new Map();
    this.conclusaoAberta = false;
    this.finalizacaoEmAndamento = false;

    this.desenharSala();
    this.hud = new HUD(this, this.perfil, INTERACOES_OBRIGATORIAS);
    this.criarObjetosInterativos();

    this.player = new Player(this, 230, 380);
    this.physics.world.setBounds(SALA.x, SALA.y, SALA.width, SALA.height);
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
      "MENU",
      () => this.scene.start("MainMenuScene"),
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
    this.add.rectangle(640, 360, 1280, 720, 0x081a2d, 1).setDepth(-3);

    const sala = this.add.graphics().setDepth(-2);
    sala.fillStyle(0x163b4d, 1);
    sala.fillRect(SALA.x, SALA.y, SALA.width, SALA.height);
    sala.lineStyle(5, 0x7ed6df, 1);
    sala.strokeRect(SALA.x, SALA.y, SALA.width, SALA.height);
    sala.lineStyle(1, 0x2b5f70, 1);

    for (let x = SALA.x + 40; x < SALA.x + SALA.width; x += 80) {
      sala.lineBetween(x, SALA.y, x, SALA.y + SALA.height);
    }
    for (let y = SALA.y + 40; y < SALA.y + SALA.height; y += 80) {
      sala.lineBetween(SALA.x, y, SALA.x + SALA.width, y);
    }

    this.add
      .text(80, 145, "FASE 1  •  LABORATÓRIO", {
        color: "#f4ffff",
        fontFamily: "Arial, sans-serif",
        fontSize: "25px",
        fontStyle: "bold"
      })
      .setDepth(10);

    this.add
      .text(180, 255, "ÁREA DE\nTRABALHO", {
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
    INTERACOES.forEach((interacao) => {
      this.interacaoVisuais.set(interacao.id, this.criarVisualInteracao(interacao));
    });
  }

  criarVisualInteracao(interacao) {
    const grupo = this.add
      .container(interacao.x, interacao.y)
      .setDepth(4);
    const visual = { grupo, tipo: interacao.tipo };

    if (interacao.tipo === "computador") {
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
    } else if (interacao.tipo === "lixo") {
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
    } else {
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
    }

    const rotulo = this.add
      .text(0, visual.rotuloY, interacao.tipo.toUpperCase(), {
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
      .text(640, 335, "Você analisou todas as situações do laboratório.", {
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
    const resultado = ProgressionService.concluirFase(this.perfil, 1);

    if (resultado?.sucesso === false) {
      this.finalizacaoEmAndamento = false;
      this.statusText.setText(resultado.erro || "Não foi possível concluir a fase.");
      return;
    }

    this.perfil = salvarPerfil(resultado);
    this.scene.start("StageResultScene", { perfil: this.perfil });
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

    if (interacao.tipo === "computador") {
      visual.luz.setFillStyle(!resolvida ? 0x86f7a5 : escolhaPositiva ? 0x9ca7ad : 0xffb85c);
      visual.tela.setFillStyle(!resolvida ? 0x206f83 : escolhaPositiva ? 0x344c58 : 0x206f83);
      visual.estado.setText(!resolvida ? "ON" : escolhaPositiva ? "OFF" : "ON");
    } else if (resolvida) {
      visual.base.setFillStyle(escolhaPositiva ? 0x287d5b : 0x80533b);
      visual.acento.setFillStyle(escolhaPositiva ? 0x52b87e : 0x9e6846);
    } else {
      visual.base.setFillStyle(interacao.tipo === "lixo" ? 0x5e6870 : 0xc28545);
      visual.acento.setFillStyle(interacao.tipo === "lixo" ? 0x303a42 : 0xe1a15d);
    }
  }

  atualizarEstadoInteracoes() {
    INTERACOES.forEach((interacao) => this.atualizarVisualInteracao(interacao));
    this.progressoFase = ChoiceService.obterProgressoFase(
      this.perfil,
      INTERACOES_OBRIGATORIAS
    );
    this.hud.update(this.perfil);
  }

  obterInteracaoAtiva() {
    return INTERACOES.find((interacao) => {
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

export default Stage1Scene;
