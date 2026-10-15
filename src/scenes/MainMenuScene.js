import Phaser from "phaser";
import { carregarPerfilAtivo } from "../data/ProfileRepository.js";
import { criarBotaoImagem } from "../ui/ImageButton.js";

const IMAGENS_MENU = {
  logo: "/assets/images/BannerLogo.png",
  novoJogo: "/assets/images/BotaoNovoJogo",
  continuar: "/assets/images/BotaoContinuar",
  instrucoes: "/assets/images/BotaoInstrucoes",
  configuracoes: "/assets/images/BotaoConfiguracoes",
  creditos: "/assets/images/BotaoCreditos",
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

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super("MainMenuScene");
  }

  preload() {
    this.load.image("menu-logo", IMAGENS_MENU.logo);
    this.load.image("menu-botao-novo-jogo", IMAGENS_MENU.novoJogo);
    this.load.image("menu-botao-continuar", IMAGENS_MENU.continuar);
    this.load.image("menu-botao-instrucoes", IMAGENS_MENU.instrucoes);
    this.load.image("menu-botao-configuracoes", IMAGENS_MENU.configuracoes);
    this.load.image("menu-botao-creditos", IMAGENS_MENU.creditos);

    IMAGENS_MENU.fundos.forEach(({ key, path }) => {
      this.load.image(key, path);
    });
  }

  create() {
    const { width, height } = this.cameras.main;

    this.iniciarSlideshow(width, height);

    const logo = this.add.image(width / 2, 112, "menu-logo");
    this.ajustarImagem(logo, 660, 224);
    logo.setDepth(1);

    const botoes = [
      ["menu-botao-novo-jogo", 280, () => this.scene.start("ProfileScene", { mode: "new" })],
      ["menu-botao-continuar", 364, () => this.continuarJogo()],
      ["menu-botao-instrucoes", 448, () => this.mostrarAviso()],
      ["menu-botao-configuracoes", 532, () => this.mostrarAviso()],
      ["menu-botao-creditos", 616, () => this.mostrarAviso()]
    ];

    botoes.forEach(([texture, y, onClick]) => {
      criarBotaoImagem(this, width / 2, y, texture, 286, onClick).setDepth(2);
    });
  }

  ajustarImagem(imagem, larguraMaxima, alturaMaxima) {
    const escala = Math.min(
      larguraMaxima / imagem.width,
      alturaMaxima / imagem.height
    );
    imagem.setScale(escala);
    return imagem;
  }

  iniciarSlideshow(width, height) {
    const fundos = IMAGENS_MENU.fundos;
    const criarFundo = (key) => {
      const imagem = this.add.image(width / 2, height / 2, key);
      const escala = Math.max(width / imagem.width, height / imagem.height);
      imagem.setScale(escala).setAlpha(0).setDepth(-1);
      return imagem;
    };

    this.fundoAtivo = criarFundo(fundos[0].key).setAlpha(1);
    this.proximoFundo = criarFundo(fundos[1].key);
    this.indiceFundo = 0;
    this.time.delayedCall(TEMPO_FUNDO_VISIVEL, () => this.transicionarFundo());
  }

  transicionarFundo() {
    const fundos = IMAGENS_MENU.fundos;
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

  continuarJogo() {
    const perfil = carregarPerfilAtivo();

    if (!perfil) {
      this.mostrarAviso("Nenhum perfil salvo encontrado.");
      return;
    }

    this.scene.start("StageSelectScene", { perfil });
  }

  mostrarAviso(mensagem = "Funcionalidade prevista para uma próxima etapa.") {
    if (this.feedbackTimer) {
      this.feedbackTimer.remove(false);
      this.feedbackTimer = null;
    }

    if (this.feedbackText) {
      this.tweens.killTweensOf(this.feedbackText);
      this.feedbackText.destroy();
    }

    const { width, height } = this.cameras.main;
    const aviso = this.add
      .text(width / 2, height - 28, mensagem, {
        color: "#ffffff",
        fontFamily: "Arial, sans-serif",
        fontSize: "16px",
        align: "center",
        stroke: "#101010",
        strokeThickness: 4
      })
      .setOrigin(0.5)
      .setAlpha(0)
      .setDepth(3);

    this.feedbackText = aviso;
    this.tweens.add({
      targets: aviso,
      alpha: 1,
      duration: 120,
      ease: "Sine.Out",
      onComplete: () => {
        this.feedbackTimer = this.time.delayedCall(1800, () => {
          this.tweens.add({
            targets: aviso,
            alpha: 0,
            duration: 250,
            ease: "Sine.In",
            onComplete: () => {
              aviso.destroy();
              if (this.feedbackText === aviso) this.feedbackText = null;
              this.feedbackTimer = null;
            }
          });
        });
      }
    });
  }
}

export default MainMenuScene;
