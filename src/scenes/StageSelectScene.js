import Phaser from "phaser";
import { carregarPerfilAtivo } from "../data/ProfileRepository.js";
import { LISTA_FASES } from "../data/stagesData.js";
import { EndingService } from "../services/EndingService.js";
import { ProgressionService } from "../services/ProgressionService.js";
import { CharacterService } from "../services/CharacterService.js";
import { criarBotaoGiz, preloadChalkAssets } from "../ui/ChalkButton.js";
import { criarBotaoImagem } from "../ui/ImageButton.js";
import { pixelTextStyle } from "../ui/TextStyles.js";

const STATUS = {
  concluida: { texto: "✓ CONCLUÍDA", cor: "#9ff5b5" },
  disponivel: { texto: "DISPONÍVEL", cor: "#ffe7a3" },
  bloqueada: { texto: "BLOQUEADA", cor: "#ffb8a6" },
  em_desenvolvimento: {
    texto: "EM DESENVOLVIMENTO",
    cor: "#c6e9ee"
  }
};

const IMAGENS_SELECAO = {
  quadro: { key: "stage-select-quadro", path: "/assets/images/Quadro.png" },
  botaoJogar: { key: "stage-select-jogar", path: "/assets/images/BotaoJogarFase" },
  botaoBloqueada: { key: "stage-select-bloqueada", path: "/assets/images/BotaoBloqueada" },
  botaoConcluida: { key: "stage-select-concluida", path: "/assets/images/BotaoConcluida" },
  botaoMenu: { key: "stage-select-menu", path: "/assets/images/BotaoMenuPrincipal" },
  fundos: [
    { key: "menu-fundo-frente", path: "/assets/images/FrentePixel" },
    { key: "menu-fundo-interno-1", path: "/assets/images/Interno1" },
    { key: "menu-fundo-interno-2", path: "/assets/images/Interno2" },
    { key: "menu-fundo-interno-3", path: "/assets/images/Interno3" },
    { key: "menu-fundo-interno-4", path: "/assets/images/Interno4" }
  ]
};

const TEMPO_FUNDO_VISIVEL = 6500;
const DURACAO_TRANSICAO = 2200;
const LARGURA_CARD = 350;
const ALTURA_CARD_MAXIMA = 330;
const LARGURA_BOTAO_FASE = 230;

export class StageSelectScene extends Phaser.Scene {
  constructor() {
    super("StageSelectScene");
    this.cardButtons = [];
  }

  init(data) {
    this.perfil = data?.perfil || carregarPerfilAtivo();
    this.aviso = data?.aviso || "";
  }

  preload() {
    preloadChalkAssets(this, { colors: ["pink"] });

    [
      IMAGENS_SELECAO.quadro,
      IMAGENS_SELECAO.botaoJogar,
      IMAGENS_SELECAO.botaoBloqueada,
      IMAGENS_SELECAO.botaoConcluida,
      IMAGENS_SELECAO.botaoMenu
    ].forEach(({ key, path }) => {
      if (!this.textures.exists(key)) this.load.image(key, path);
    });

    IMAGENS_SELECAO.fundos.forEach(({ key, path }) => {
      if (!this.textures.exists(key)) this.load.image(key, path);
    });
  }

  create() {
    if (!this.perfil) {
      this.scene.start("MainMenuScene");
      return;
    }

    if (!CharacterService.isPlayableCharacterId(this.perfil.personagemId)) {
      this.scene.start("ProfileScene", {
        perfil: this.perfil,
        aviso: "Escolha um personagem para continuar."
      });
      return;
    }

    const { width, height } = this.cameras.main;
    this.iniciarSlideshow(width, height);

    this.add
      .text(width / 2, 58, "SELEÇÃO DE FASES", pixelTextStyle({
        fontSize: "40px"
      }))
      .setOrigin(0.5);
    this.add
      .text(width / 2, 105, `Perfil: ${this.perfil.nome}`, pixelTextStyle({
        fontSize: "20px"
      }))
      .setOrigin(0.5);

    if (this.perfil.progresso?.campanhaConcluida) {
      const desfecho = EndingService.obterDesfecho(this.perfil.desfecho);
      this.add
        .text(
          width / 2,
          148,
          `CAMPANHA CONCLUÍDA${desfecho ? `  •  FINAL: ${desfecho.titulo}` : ""}`,
          pixelTextStyle({
            color: "#9ff5b5",
            fontSize: "18px",
            align: "center",
            wordWrap: { width: 1000 }
          }, { preservarCor: true })
        )
        .setOrigin(0.5);
    }

    LISTA_FASES.forEach((fase, index) => this.criarCard(fase, index));

    if (this.perfil.progresso?.campanhaConcluida) {
      this.finalButton = criarBotaoGiz(this, {
        x: width / 2,
        y: 546,
        label: "VER RESULTADO FINAL",
        color: "pink",
        width: 370,
        fontSize: "19px",
        onClick: () => this.scene.start("EndingScene", { perfil: this.perfil })
      });
    }

    this.feedbackText = this.add
      .text(
        width / 2,
        592,
        this.aviso || (this.perfil.progresso?.campanhaConcluida
          ? "Você pode rever seu desfecho a qualquer momento."
          : "Escolha uma fase para continuar."),
        pixelTextStyle({
          color: this.aviso ? "#ffcf9f" : "#c6e9ee",
          fontSize: "18px",
          align: "center",
          wordWrap: { width: 960 }
        }, { preservarCor: Boolean(this.aviso) })
      )
      .setOrigin(0.5);

    criarBotaoImagem(
      this,
      width / 2,
      height - 56,
      IMAGENS_SELECAO.botaoMenu.key,
      250,
      () => this.scene.start("MainMenuScene")
    );

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.limparBotoes, this);
  }

  iniciarSlideshow(width, height) {
    const criarFundo = (key) => {
      const imagem = this.add.image(width / 2, height / 2, key);
      const escala = Math.max(width / imagem.width, height / imagem.height);
      imagem.setScale(escala).setAlpha(0).setDepth(-1);
      return imagem;
    };

    this.fundoAtivo = criarFundo(IMAGENS_SELECAO.fundos[0].key).setAlpha(1);
    this.proximoFundo = criarFundo(IMAGENS_SELECAO.fundos[1].key);
    this.indiceFundo = 0;
    this.time.delayedCall(TEMPO_FUNDO_VISIVEL, () => this.transicionarFundo());
  }

  transicionarFundo() {
    const fundos = IMAGENS_SELECAO.fundos;
    const proximoIndice = (this.indiceFundo + 1) % fundos.length;
    this.proximoFundo.setTexture(fundos[proximoIndice].key).setAlpha(0);

    this.tweens.add({
      targets: this.fundoAtivo,
      alpha: 0,
      duration: DURACAO_TRANSICAO,
      ease: "Sine.InOut"
    });
    this.tweens.add({
      targets: this.proximoFundo,
      alpha: 1,
      duration: DURACAO_TRANSICAO,
      ease: "Sine.InOut",
      onComplete: () => {
        const fundoAnterior = this.fundoAtivo;
        this.fundoAtivo = this.proximoFundo;
        this.proximoFundo = fundoAnterior.setAlpha(0);
        this.indiceFundo = proximoIndice;
        this.time.delayedCall(TEMPO_FUNDO_VISIVEL, () => this.transicionarFundo());
      }
    });
  }

  criarCard(fase, index) {
    const { width } = this.cameras.main;
    const x = width / 2 + (index - (LISTA_FASES.length - 1) / 2) * 405;
    const y = 350;
    const imagemQuadro = this.add.image(x, y, IMAGENS_SELECAO.quadro.key);
    const escala = Math.min(
      LARGURA_CARD / imagemQuadro.width,
      ALTURA_CARD_MAXIMA / imagemQuadro.height
    );
    imagemQuadro.setScale(escala);

    const statusId = ProgressionService.obterStatusFase(this.perfil, fase.numeroFase);
    const status = STATUS[statusId] || STATUS.em_desenvolvimento;
    const acessivel = statusId === "disponivel" || statusId === "concluida";

    this.add
      .text(x, 220, fase.titulo || `FASE ${fase.numeroFase}`, pixelTextStyle({
        fontSize: "27px",
        align: "center"
      }))
      .setOrigin(0.5);
    this.add
      .text(x, 263, fase.nome, pixelTextStyle({
        fontSize: "18px",
        align: "center",
        wordWrap: { width: 280 }
      }))
      .setOrigin(0.5);
    this.add
      .text(x, 311, status.texto, pixelTextStyle({
        color: status.cor,
        fontSize: "17px",
        align: "center",
        wordWrap: { width: 280 }
      }, { preservarCor: true }))
      .setOrigin(0.5);

    const texturaBotao = statusId === "concluida"
      ? IMAGENS_SELECAO.botaoConcluida.key
      : acessivel
        ? IMAGENS_SELECAO.botaoJogar.key
        : IMAGENS_SELECAO.botaoBloqueada.key;
    const botao = criarBotaoImagem(
      this,
      x,
      372,
      texturaBotao,
      LARGURA_BOTAO_FASE,
      () => this.selecionarFase(fase, statusId)
    );

    if (!acessivel) botao.disableInteractive();
    this.cardButtons.push(botao);

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
      .text(x, 429, detalhe, pixelTextStyle({
        fontSize: "15px",
        align: "center",
        wordWrap: { width: 278 }
      }))
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
