import Phaser from "phaser";
import { carregarPerfilAtivo } from "../data/ProfileRepository.js";
import { LISTA_FASES } from "../data/stagesData.js";
import { EndingService } from "../services/EndingService.js";
import { ProgressionService } from "../services/ProgressionService.js";
import { criarBotao } from "../ui/GameButton.js";

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
      .text(640, 65, "SELEÇÃO DE FASES", {
        color: "#f4ffff",
        fontFamily: "Arial, sans-serif",
        fontSize: "40px",
        fontStyle: "bold"
      })
      .setOrigin(0.5);
    this.add
      .text(640, 112, `Perfil: ${this.perfil.nome}`, {
        color: "#9fe6e5",
        fontFamily: "Arial, sans-serif",
        fontSize: "20px"
      })
      .setOrigin(0.5);

    if (this.perfil.progresso?.campanhaConcluida) {
      const desfecho = EndingService.obterDesfecho(this.perfil.desfecho);
      this.add
        .text(
          640,
          153,
          `CAMPANHA CONCLUÍDA${desfecho ? `  •  FINAL: ${desfecho.titulo}` : ""}`,
          {
            color: "#9ff5b5",
            fontFamily: "Arial, sans-serif",
            fontSize: "18px",
            fontStyle: "bold",
            align: "center",
            wordWrap: { width: 1000 }
          }
        )
        .setOrigin(0.5);
    }

    LISTA_FASES.forEach((fase, index) => this.criarCard(fase, index));

    if (this.perfil.progresso?.campanhaConcluida) {
      this.finalButton = criarBotao(
        this,
        640,
        575,
        "VER RESULTADO FINAL",
        () => this.scene.start("EndingScene", { perfil: this.perfil }),
        { width: 330, height: 52, fontSize: "19px", color: 0x287d5b }
      );
    }

    this.feedbackText = this.add
      .text(
        640,
        630,
        this.aviso || (this.perfil.progresso?.campanhaConcluida
          ? "Você pode rever seu desfecho a qualquer momento."
          : "Escolha uma fase para continuar."),
        {
          color: this.aviso ? "#ffcf9f" : "#c6e9ee",
          fontFamily: "Arial, sans-serif",
          fontSize: "18px",
          align: "center",
          wordWrap: { width: 960 }
        }
      )
      .setOrigin(0.5);

    criarBotao(
      this,
      640,
      684,
      "MENU PRINCIPAL",
      () => this.scene.start("MainMenuScene"),
      { width: 270, height: 44, fontSize: "18px", color: 0x287d5b }
    );

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.limparBotoes, this);
  }

  criarCard(fase, index) {
    const x = 260 + index * 380;
    const statusId = ProgressionService.obterStatusFase(this.perfil, fase.numeroFase);
    const status = STATUS[statusId] || STATUS.em_desenvolvimento;
    const acessivel = statusId === "disponivel" || statusId === "concluida";

    this.add
      .rectangle(x, 350, 330, 345, 0x0b2034, 1)
      .setStrokeStyle(2, acessivel ? 0x7ed6df : 0x315572, 1);
    this.add
      .text(x, 212, fase.titulo || `FASE ${fase.numeroFase}`, {
        color: "#f4ffff",
        fontFamily: "Arial, sans-serif",
        fontSize: "29px",
        fontStyle: "bold"
      })
      .setOrigin(0.5);
    this.add
      .text(x, 265, fase.nome, {
        color: "#c6e9ee",
        fontFamily: "Arial, sans-serif",
        fontSize: "19px",
        align: "center",
        wordWrap: { width: 280 }
      })
      .setOrigin(0.5);
    this.add
      .text(x, 325, status.texto, {
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
      420,
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

    const etapasAnteriores = Array.from(
      { length: Math.max(0, fase.numeroFase - 1) },
      (_, i) => `Fase ${i + 1}`
    );
    const detalhe = statusId === "bloqueada"
      ? `Conclua ${etapasAnteriores.join(" e ")} para desbloquear.`
      : statusId === "em_desenvolvimento"
        ? "Disponível em uma próxima etapa."
        : statusId === "concluida"
          ? "O progresso desta fase já está salvo."
          : "Fase liberada para jogar.";

    this.add
      .text(x, 490, detalhe, {
        color: "#8ab7c5",
        fontFamily: "Arial, sans-serif",
        fontSize: "16px",
        align: "center",
        wordWrap: { width: 270 }
      })
      .setOrigin(0.5);
  }

  selecionarFase(fase, statusId) {
    if (!fase.sceneKey || (statusId !== "disponivel" && statusId !== "concluida")) {
      return;
    }

    this.scene.start(fase.sceneKey, { perfil: this.perfil });
  }

  limparBotoes() {
    this.cardButtons = [];
  }
}

export default StageSelectScene;
