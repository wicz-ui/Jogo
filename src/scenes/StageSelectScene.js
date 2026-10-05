import Phaser from "phaser";
import { carregarPerfilAtivo } from "../data/ProfileRepository.js";
import { ProgressionService } from "../services/ProgressionService.js";
import { criarBotao } from "../ui/GameButton.js";

const FASES = [
  { numero: 1, titulo: "FASE 1", nome: "Laboratório", cena: "Stage1Scene" },
  { numero: 2, titulo: "FASE 2", nome: "Corredor depois do intervalo", cena: "Stage2Scene" },
  { numero: 3, titulo: "FASE 3", nome: "Próxima etapa", cena: null }
];

const STATUS = {
  concluida: { texto: "✓ CONCLUÍDA", cor: "#9ff5b5", botao: "JOGAR NOVAMENTE" },
  disponivel: { texto: "DISPONÍVEL", cor: "#ffe7a3", botao: "JOGAR FASE" },
  bloqueada: { texto: "BLOQUEADA", cor: "#ffb8a6", botao: "BLOQUEADA" },
  em_desenvolvimento: {
    texto: "EM DESENVOLVIMENTO",
    cor: "#c6e9ee",
    botao: "EM BREVE"
  }
};

export class StageSelectScene extends Phaser.Scene {
  constructor() {
    super("StageSelectScene");
    this.cardButtons = [];
  }

  init(data) {
    this.perfil = data?.perfil || carregarPerfilAtivo();
    this.aviso = data?.aviso || "";
  }

  create() {
    if (!this.perfil) {
      this.scene.start("MainMenuScene");
      return;
    }

    this.add.rectangle(640, 360, 1280, 720, 0x081a2d, 1);
    this.add
      .rectangle(640, 360, 1120, 610, 0x102b43, 1)
      .setStrokeStyle(3, 0x2f6b83, 1);

    this.add
      .text(640, 78, "SELEÇÃO DE FASES", {
        color: "#f4ffff",
        fontFamily: "Arial, sans-serif",
        fontSize: "40px",
        fontStyle: "bold"
      })
      .setOrigin(0.5);
    this.add
      .text(640, 125, `Perfil: ${this.perfil.nome}`, {
        color: "#9fe6e5",
        fontFamily: "Arial, sans-serif",
        fontSize: "20px"
      })
      .setOrigin(0.5);

    this.feedbackText = this.add
      .text(640, 615, this.aviso || "Escolha uma fase para continuar.", {
        color: this.aviso ? "#ffcf9f" : "#c6e9ee",
        fontFamily: "Arial, sans-serif",
        fontSize: "18px",
        align: "center",
        wordWrap: { width: 960 }
      })
      .setOrigin(0.5);

    FASES.forEach((fase, index) => this.criarCard(fase, index));

    criarBotao(
      this,
      640,
      680,
      "MENU PRINCIPAL",
      () => this.scene.start("MainMenuScene"),
      { width: 270, height: 46, fontSize: "18px", color: 0x287d5b }
    );

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.limparBotoes, this);
  }

  criarCard(fase, index) {
    const x = 260 + index * 380;
    const statusId = ProgressionService.obterStatusFase(this.perfil, fase.numero);
    const status = STATUS[statusId];
    const acessivel = statusId === "disponivel" || statusId === "concluida";

    this.add
      .rectangle(x, 355, 330, 350, 0x0b2034, 1)
      .setStrokeStyle(2, acessivel ? 0x7ed6df : 0x315572, 1);
    this.add
      .text(x, 225, fase.titulo, {
        color: "#f4ffff",
        fontFamily: "Arial, sans-serif",
        fontSize: "29px",
        fontStyle: "bold"
      })
      .setOrigin(0.5);
    this.add
      .text(x, 275, fase.nome, {
        color: "#c6e9ee",
        fontFamily: "Arial, sans-serif",
        fontSize: "19px",
        align: "center",
        wordWrap: { width: 280 }
      })
      .setOrigin(0.5);
    this.add
      .text(x, 335, status.texto, {
        color: status.cor,
        fontFamily: "Arial, sans-serif",
        fontSize: "19px",
        fontStyle: "bold",
        align: "center",
        wordWrap: { width: 290 }
      })
      .setOrigin(0.5);

    const button = criarBotao(
      this,
      x,
      455,
      status.botao,
      () => this.selecionarFase(fase, statusId),
      {
        width: 270,
        height: 58,
        fontSize: "18px",
        color: acessivel ? 0x176b87 : 0x3b4e5d,
        borderColor: acessivel ? 0x7ed6df : 0x536b78
      }
    );

    if (!acessivel) {
      button.disableInteractive();
    }

    this.cardButtons.push(button);

    const detalhe = statusId === "bloqueada"
      ? "Conclua a Fase 1 para desbloquear."
      : statusId === "em_desenvolvimento"
        ? "Disponível em uma próxima etapa."
        : statusId === "concluida"
          ? "O progresso desta fase já está salvo."
          : "Fase liberada para jogar.";

    this.add
      .text(x, 540, detalhe, {
        color: "#8ab7c5",
        fontFamily: "Arial, sans-serif",
        fontSize: "16px",
        align: "center",
        wordWrap: { width: 270 }
      })
      .setOrigin(0.5);
  }

  selecionarFase(fase, statusId) {
    if (!fase.cena || (statusId !== "disponivel" && statusId !== "concluida")) {
      return;
    }

    this.scene.start(fase.cena, { perfil: this.perfil });
  }

  limparBotoes() {
    this.cardButtons = [];
  }
}

export default StageSelectScene;
