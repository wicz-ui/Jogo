import Phaser from "phaser";
import {
  carregarPerfilAtivo,
  salvarPerfil
} from "../data/ProfileRepository.js";
import { ChoiceService } from "../services/ChoiceService.js";
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

const COMPUTADOR = {
  x: 925,
  y: 380,
  raioInteracao: 135
};

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

    this.desenharSala();
    this.hud = new HUD(this, this.perfil);
    this.criarComputador();

    this.player = new Player(this, 230, 380);
    this.physics.world.setBounds(SALA.x, SALA.y, SALA.width, SALA.height);
    this.player.body.setCollideWorldBounds(true);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys("W,A,S,D");
    this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.escapeKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

    this.interactionPrompt = new InteractionPrompt(this, COMPUTADOR.x, COMPUTADOR.y - 100);
    this.choiceDialog = new ChoiceDialog(this);
    this.computadorResolvido = this.interacaoResolvida();

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
      1100,
      100,
      "MENU",
      () => this.scene.start("MainMenuScene"),
      { width: 140, height: 46, fontSize: "17px" }
    ).setDepth(22);

    this.atualizarEstadoComputador();
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

  criarComputador() {
    const mesa = this.add
      .rectangle(COMPUTADOR.x, COMPUTADOR.y + 72, 330, 105, 0x7b533d, 1)
      .setStrokeStyle(4, 0xd29b65, 1)
      .setDepth(2);
    this.add.rectangle(COMPUTADOR.x, COMPUTADOR.y + 23, 24, 55, 0xd29b65, 1).setDepth(3);
    this.add
      .rectangle(COMPUTADOR.x, COMPUTADOR.y - 25, 170, 112, 0x0b1728, 1)
      .setStrokeStyle(5, 0x9fe6e5, 1)
      .setDepth(4);
    this.computerScreen = this.add
      .rectangle(COMPUTADOR.x, COMPUTADOR.y - 25, 146, 88, 0x206f83, 1)
      .setStrokeStyle(2, 0xc6f5ef, 1)
      .setDepth(5);
    this.computerStatusText = this.add
      .text(COMPUTADOR.x, COMPUTADOR.y - 25, "ON", {
        color: "#e9fff8",
        fontFamily: "Arial, sans-serif",
        fontSize: "28px",
        fontStyle: "bold"
      })
      .setOrigin(0.5)
      .setDepth(6);
    this.add.rectangle(COMPUTADOR.x, COMPUTADOR.y + 45, 95, 10, 0x0b1728, 1).setDepth(4);
    this.add
      .text(COMPUTADOR.x, COMPUTADOR.y + 112, "COMPUTADOR", {
        color: "#ffffff",
        fontFamily: "Arial, sans-serif",
        fontSize: "20px",
        fontStyle: "bold"
      })
      .setOrigin(0.5)
      .setDepth(6);

    this.computerLight = this.add
      .circle(COMPUTADOR.x + 70, COMPUTADOR.y - 70, 7, 0x86f7a5, 1)
      .setDepth(7);
    this.computerMesa = mesa;
  }

  interacaoResolvida() {
    return ChoiceService.interacaoConcluida(this.perfil, "computador_01");
  }

  atualizarEstadoComputador() {
    this.computadorResolvido = this.interacaoResolvida();

    if (this.computadorResolvido) {
      this.interactionPrompt.hide();
      const escolhaRealizada = this.perfil.escolhasRealizadas.find((choiceId) =>
        choiceId === "desligar_computador" || choiceId === "ignorar_computador"
      );
      const computadorDesligado = escolhaRealizada === "desligar_computador";
      this.computerLight.setFillStyle(computadorDesligado ? 0x9ca7ad : 0xffb85c);
      this.computerScreen.setFillStyle(computadorDesligado ? 0x344c58 : 0x206f83);
      this.computerStatusText.setText(computadorDesligado ? "OFF" : "ON");
      this.statusText.setText("Computador já verificado. Explore a sala ou volte ao menu.");
    } else {
      this.computerLight.setFillStyle(0x86f7a5);
    }
  }

  jogadorEstaPerto() {
    return Phaser.Math.Distance.Between(this.player.x, this.player.y, COMPUTADOR.x, COMPUTADOR.y) <= COMPUTADOR.raioInteracao;
  }

  abrirEscolha() {
    if (this.computadorResolvido || this.choiceDialog.isOpen) {
      return;
    }

    this.choiceDialog.show((choiceId) => this.registrarEscolha(choiceId));
  }

  registrarEscolha(choiceId) {
    const resultado = ChoiceService.registrarEscolha(this.perfil, choiceId);

    if (!resultado.sucesso) {
      this.statusText.setText(resultado.erro);
      this.atualizarEstadoComputador();
      return;
    }

    // A cena só encaminha a alteração para o repositório; a regra de pontos
    // pertence ao ChoiceService.
    this.perfil = salvarPerfil(resultado.perfil);
    this.hud.update(this.perfil);
    this.atualizarEstadoComputador();

    const impacto = resultado.impacto;
    const cuidado = impacto.cuidado >= 0 ? `+${impacto.cuidado}` : `${impacto.cuidado}`;
    const conduta = impacto.conduta >= 0 ? `+${impacto.conduta}` : `${impacto.conduta}`;
    this.statusText.setText(
      `${resultado.mensagem}\n${cuidado} cuidado  •  ${conduta} conduta\n` +
      `Agora: Cuidado ${this.perfil.pontuacao.cuidado}  •  Conduta ${this.perfil.pontuacao.conduta}`
    );
  }

  update() {
    if (!this.player || !this.choiceDialog) {
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

    const perto = this.jogadorEstaPerto();
    if (perto && !this.computadorResolvido) {
      this.interactionPrompt.show();
      if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
        this.abrirEscolha();
      }
    } else {
      this.interactionPrompt.hide();
    }
  }

  limparRecursos() {
    this.choiceDialog?.destroy();
    this.interactionPrompt?.destroy();
    this.hud?.destroy();
  }
}

export default Stage1Scene;
