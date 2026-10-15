import Phaser from "phaser";
import {
  carregarPerfil,
  criarNovoPerfil,
  listarPerfis,
  selecionarPerfil
} from "../data/ProfileRepository.js";
import { criarBotaoImagem } from "../ui/ImageButton.js";

const IMAGENS_PERFIL = {
  criarPerfil: {
    key: "profile-botao-criar",
    path: "/assets/images/BotaoCriarPerfil"
  },
  iniciarJogo: {
    key: "profile-botao-iniciar",
    path: "/assets/images/BotaoIniciarJogo.png"
  },
  voltarMenu: {
    key: "profile-botao-voltar",
    path: "/assets/images/BotaoVoltarAoMenu.png"
  },
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

export class ProfileScene extends Phaser.Scene {
  constructor() {
    super("ProfileScene");
    this.perfilSelecionado = null;
    this.profileButtons = [];
    this.emptyProfilesText = null;
  }

  preload() {
    [
      IMAGENS_PERFIL.criarPerfil,
      IMAGENS_PERFIL.iniciarJogo,
      IMAGENS_PERFIL.voltarMenu
    ].forEach(({ key, path }) => {
      if (!this.textures.exists(key)) this.load.image(key, path);
    });

    IMAGENS_PERFIL.fundos.forEach(({ key, path }) => {
      if (!this.textures.exists(key)) this.load.image(key, path);
    });
  }

  create() {
    this.ancorarInput = this.ancorarInput.bind(this);
    const { width, height } = this.cameras.main;
    this.layout = {
      inputX: width * 0.25,
      inputY: 225
    };

    this.iniciarSlideshow(width, height);

    this.add
      .text(width / 2, 62, "PERFIL DO GUARDIÃO", {
        color: "#ffffff",
        fontFamily: "Arial, sans-serif",
        fontSize: "36px",
        fontStyle: "bold",
        stroke: "#111111",
        strokeThickness: 5
      })
      .setOrigin(0.5);

    this.adicionarTituloColuna(width * 0.25, 145, "Crie um novo perfil local");
    this.adicionarTituloColuna(width * 0.72, 145, "Perfis existentes");

    this.gameContainer = document.getElementById("game-container");
    this.nameInput = document.createElement("input");
    this.nameInput.type = "text";
    this.nameInput.placeholder = "Digite seu nome";
    this.nameInput.maxLength = 28;
    this.nameInput.setAttribute("aria-label", "Nome do perfil");
    Object.assign(this.nameInput.style, {
      position: "absolute",
      zIndex: "10",
      padding: "0 14px",
      border: "2px solid #333333",
      borderRadius: "9px",
      background: "#ffffff",
      color: "#1b1b1b",
      fontFamily: "Arial, sans-serif",
      boxSizing: "border-box",
      outline: "none",
      boxShadow: "0 3px 12px rgba(0, 0, 0, 0.4)",
      transform: "translate(-50%, -50%)"
    });
    this.gameContainer.appendChild(this.nameInput);
    this.ancorarInput();

    criarBotaoImagem(
      this,
      width * 0.25,
      320,
      IMAGENS_PERFIL.criarPerfil.key,
      250,
      () => this.criarPerfil()
    );
    criarBotaoImagem(
      this,
      width * 0.25,
      420,
      IMAGENS_PERFIL.iniciarJogo.key,
      250,
      () => this.iniciarJogo()
    );

    this.statusText = this.add
      .text(width * 0.25, 510, "Selecione um perfil ou crie um novo.", {
        color: "#ffffff",
        fontFamily: "Arial, sans-serif",
        fontSize: "18px",
        align: "center",
        stroke: "#111111",
        strokeThickness: 4,
        wordWrap: { width: 480 }
      })
      .setOrigin(0.5);

    this.refreshProfiles();

    criarBotaoImagem(
      this,
      width / 2,
      height - 65,
      IMAGENS_PERFIL.voltarMenu.key,
      255,
      () => this.scene.start("MainMenuScene")
    );

    this.scale.on(Phaser.Scale.Events.RESIZE, this.ancorarInput, this);
    window.addEventListener("resize", this.ancorarInput);
    window.addEventListener("scroll", this.ancorarInput, true);
    window.visualViewport?.addEventListener("resize", this.ancorarInput);
    if (typeof ResizeObserver !== "undefined") {
      this.inputResizeObserver = new ResizeObserver(this.ancorarInput);
      this.inputResizeObserver.observe(this.game.canvas);
      this.inputResizeObserver.observe(this.gameContainer);
    }
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.limparInput, this);
  }

  adicionarTituloColuna(x, y, texto) {
    return this.add
      .text(x, y, texto, {
        color: "#ffffff",
        fontFamily: "Arial, sans-serif",
        fontSize: "23px",
        fontStyle: "bold",
        stroke: "#111111",
        strokeThickness: 5
      })
      .setOrigin(0.5);
  }

  iniciarSlideshow(width, height) {
    const fundos = IMAGENS_PERFIL.fundos;
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
    const fundos = IMAGENS_PERFIL.fundos;
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

  ancorarInput() {
    if (!this.nameInput || !this.layout || !this.gameContainer || !this.game.canvas) return;

    // Converte as coordenadas da cena para o contêiner que acompanha o canvas,
    // incluindo letterbox, resize e zoom CSS aplicado por elementos ancestrais.
    const canvasBounds = this.game.canvas.getBoundingClientRect();
    const containerBounds = this.gameContainer.getBoundingClientRect();
    if (!canvasBounds.width || !canvasBounds.height) return;

    let escalaZoomCSS = 1;
    for (let elemento = this.gameContainer; elemento; elemento = elemento.parentElement) {
      const zoom = Number.parseFloat(getComputedStyle(elemento).zoom);
      if (Number.isFinite(zoom) && zoom > 0) escalaZoomCSS *= zoom;
    }

    const escalaX = canvasBounds.width / (this.game.config.width * escalaZoomCSS);
    const escalaY = canvasBounds.height / (this.game.config.height * escalaZoomCSS);
    const deslocamentoX = (canvasBounds.left - containerBounds.left) / escalaZoomCSS;
    const deslocamentoY = (canvasBounds.top - containerBounds.top) / escalaZoomCSS;
    const centroX = deslocamentoX + this.layout.inputX * escalaX;
    const centroY = deslocamentoY + this.layout.inputY * escalaY;

    Object.assign(this.nameInput.style, {
      left: `${centroX}px`,
      top: `${centroY}px`,
      width: `${430 * escalaX}px`,
      height: `${50 * escalaY}px`,
      fontSize: `${20 * escalaY}px`
    });
  }

  limparInput() {
    this.scale.off(Phaser.Scale.Events.RESIZE, this.ancorarInput, this);
    window.removeEventListener("resize", this.ancorarInput);
    window.removeEventListener("scroll", this.ancorarInput, true);
    window.visualViewport?.removeEventListener("resize", this.ancorarInput);
    this.inputResizeObserver?.disconnect();
    this.nameInput?.remove();
    this.nameInput = null;
    this.gameContainer = null;
  }

  refreshProfiles() {
    this.profileButtons.forEach((button) => button.destroy(true));
    this.profileButtons = [];
    this.emptyProfilesText?.destroy();
    this.emptyProfilesText = null;

    const perfis = listarPerfis();
    if (perfis.length === 0) {
      this.emptyProfilesText = this.add
        .text(0.72 * this.cameras.main.width, 380, "Nenhum perfil salvo ainda.", {
          color: "#ffffff",
          fontFamily: "Arial, sans-serif",
          fontSize: "20px",
          align: "center",
          stroke: "#111111",
          strokeThickness: 4
        })
        .setOrigin(0.5);
      return;
    }

    perfis.forEach((perfil, index) => this.criarBotaoPerfil(perfil, index));
    this.atualizarSelecaoPerfis();
  }

  criarBotaoPerfil(perfil, index) {
    const x = this.cameras.main.width * 0.72;
    const y = 220 + index * 78;
    const largura = 450;
    const altura = 64;
    const fundo = this.add
      .rectangle(0, 0, largura, altura, 0x111111, 0.62)
      .setStrokeStyle(2, 0xe5e5e5, 0.62);
    const texto = this.add
      .text(
        0,
        0,
        `${perfil.nome}\nCuidado ${perfil.pontuacao.cuidado}  •  Conduta ${perfil.pontuacao.conduta}`,
        {
          color: "#ffffff",
          fontFamily: "Arial, sans-serif",
          fontSize: "16px",
          align: "center",
          stroke: "#111111",
          strokeThickness: 3,
          wordWrap: { width: largura - 28 }
        }
      )
      .setOrigin(0.5);
    const botao = this.add.container(x, y, [fundo, texto]);
    let emHover = false;

    botao.perfilId = perfil.id;
    botao.setSize(largura, altura).setInteractive({ useHandCursor: true });
    botao.atualizarVisual = (selecionado) => {
      fundo.setFillStyle(
        selecionado ? 0x554626 : 0x111111,
        selecionado ? 0.82 : emHover ? 0.78 : 0.62
      );
      fundo.setStrokeStyle(
        2,
        selecionado ? 0xffd166 : emHover ? 0xffffff : 0xe5e5e5,
        selecionado || emHover ? 1 : 0.62
      );
    };

    botao.on("pointerover", () => {
      emHover = true;
      botao.atualizarVisual(botao.perfilId === this.perfilSelecionado?.id);
      this.tweens.add({ targets: botao, scale: 1.02, duration: 100, ease: "Sine.Out" });
    });
    botao.on("pointerout", () => {
      emHover = false;
      botao.atualizarVisual(botao.perfilId === this.perfilSelecionado?.id);
      this.tweens.add({ targets: botao, scale: 1, duration: 100, ease: "Sine.Out" });
    });
    botao.on("pointerdown", () => this.selecionar(perfil.id));

    this.profileButtons.push(botao);
  }

  atualizarSelecaoPerfis() {
    this.profileButtons.forEach((button) => {
      button.atualizarVisual(button.perfilId === this.perfilSelecionado?.id);
    });
  }

  criarPerfil() {
    try {
      const perfil = criarNovoPerfil(this.nameInput.value);
      this.perfilSelecionado = perfil;
      this.nameInput.value = "";
      this.statusText.setText(`Perfil ${perfil.nome} criado e selecionado.`);
      this.refreshProfiles();
    } catch (erro) {
      this.statusText.setText(erro.message);
    }
  }

  selecionar(id) {
    const perfil = selecionarPerfil(id);

    if (!perfil) {
      this.statusText.setText("Não foi possível selecionar esse perfil.");
      return;
    }

    this.perfilSelecionado = perfil;
    this.statusText.setText(`Perfil selecionado: ${perfil.nome}.`);
    this.atualizarSelecaoPerfis();
  }

  iniciarJogo() {
    if (!this.perfilSelecionado) {
      this.statusText.setText("Crie ou selecione um perfil antes de iniciar.");
      return;
    }

    const perfilAtualizado = carregarPerfil(this.perfilSelecionado.id) || this.perfilSelecionado;
    this.scene.start("StageSelectScene", { perfil: perfilAtualizado });
  }
}

export default ProfileScene;
