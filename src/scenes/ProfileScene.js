import Phaser from "phaser";
import {
  carregarPerfil,
  criarNovoPerfil,
  listarPerfis,
  selecionarPerfil
} from "../data/ProfileRepository.js";
import { criarBotaoImagem } from "../ui/ImageButton.js";
import { pixelTextStyle } from "../ui/TextStyles.js";

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
  quadroNormal: {
    key: "profile-quadro-normal",
    path: "/assets/images/QuadroNormal"
  },
  quadroDourado: {
    key: "profile-quadro-dourado",
    path: "/assets/images/QuadroDourado"
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
const LARGURA_CARTAO_PERFIL = 430;
const ESPACO_CARTOES_PERFIL = 10;
const AREA_LISTA_PERFIS = {
  topo: 165,
  base: 620,
  esquerda: 640,
  direita: 1260
};

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
      IMAGENS_PERFIL.voltarMenu,
      IMAGENS_PERFIL.quadroNormal,
      IMAGENS_PERFIL.quadroDourado
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
      .text(width / 2, 62, "PERFIL DO GUARDIÃO", pixelTextStyle({
        fontSize: "36px",
      }))
      .setOrigin(0.5);

    this.adicionarTituloColuna(width * 0.25, 145, "Crie um novo perfil local");
    this.adicionarTituloColuna(width * 0.72, 145, "Perfis existentes");

    this.profileListViewport = {
      x: AREA_LISTA_PERFIS.esquerda,
      y: AREA_LISTA_PERFIS.topo,
      width: AREA_LISTA_PERFIS.direita - AREA_LISTA_PERFIS.esquerda,
      height: AREA_LISTA_PERFIS.base - AREA_LISTA_PERFIS.topo
    };
    this.profileListMaskGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    this.profileListMaskGraphics.fillStyle(0xffffff);
    this.profileListMaskGraphics.fillRect(
      this.profileListViewport.x,
      this.profileListViewport.y,
      this.profileListViewport.width,
      this.profileListViewport.height
    );
    this.profileListMask = this.profileListMaskGraphics.createGeometryMask();
    this.profileListScrollOffset = 0;
    this.input.on("wheel", this.rolarListaPerfis, this);

    this.gameContainer = document.getElementById("game-container");
    this.nameInput = document.createElement("input");
    this.nameInput.id = "profile-name-input";
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
      fontFamily: '"Pixelify Sans"',
      fontWeight: "700",
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
      .text(width * 0.25, 510, "Selecione um perfil ou crie um novo.", pixelTextStyle({
        fontSize: "18px",
        align: "center",
        wordWrap: { width: 480 }
      }))
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
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.off("wheel", this.rolarListaPerfis, this);
      this.profileListMask?.destroy();
      this.profileListMaskGraphics?.destroy();
    });
  }

  adicionarTituloColuna(x, y, texto) {
    return this.add
      .text(x, y, texto, pixelTextStyle({
        fontSize: "23px",
      }))
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
    this.profileListScrollOffset = 0;
    this.emptyProfilesText?.destroy();
    this.emptyProfilesText = null;

    const perfis = listarPerfis();
    if (perfis.length === 0) {
      this.emptyProfilesText = this.add
        .text(0.72 * this.cameras.main.width, 380, "Nenhum perfil salvo ainda.", pixelTextStyle({
          fontSize: "20px",
          align: "center",
        }))
        .setOrigin(0.5);
      return;
    }

    const altura = (LARGURA_CARTAO_PERFIL / 3);
    const passo = altura + ESPACO_CARTOES_PERFIL;
    const alturaConteudo = perfis.length * altura + (perfis.length - 1) * ESPACO_CARTOES_PERFIL;
    this.profileListMaxScroll = Math.max(0, alturaConteudo - this.profileListViewport.height);
    const topoConteudo = this.profileListViewport.y + Math.max(
      0,
      (this.profileListViewport.height - alturaConteudo) / 2
    );
    const centroX = this.cameras.main.width * 0.72;

    perfis.forEach((perfil, index) => {
      const centroY = topoConteudo + altura / 2 + index * passo;
      this.criarBotaoPerfil(perfil, centroX, centroY, altura);
    });
    this.atualizarSelecaoPerfis();
    this.atualizarPosicoesPerfis();
  }

  criarBotaoPerfil(perfil, x, y, altura) {
    const largura = LARGURA_CARTAO_PERFIL;
    const fundo = this.add
      .image(0, 0, IMAGENS_PERFIL.quadroNormal.key)
      .setOrigin(0.5);
    fundo.setScale(largura / fundo.width);
    const texto = this.add
      .text(
        0,
        0,
        `${perfil.nome}\nCuidado ${perfil.pontuacao.cuidado}  •  Conduta ${perfil.pontuacao.conduta}`,
        pixelTextStyle({
          fontSize: "16px",
          align: "center",
          wordWrap: { width: largura - 28 }
        })
      )
      .setOrigin(0.5);
    const botao = this.add.container(x, y, [fundo, texto]);

    botao.perfilId = perfil.id;
    botao.alturaPerfil = altura;
    botao.posicaoYBase = y;
    botao.setSize(largura, altura).setInteractive({ useHandCursor: true });
    botao.setMask(this.profileListMask);
    botao.atualizarVisual = (selecionado) => {
      fundo.setTexture(
        selecionado
          ? IMAGENS_PERFIL.quadroDourado.key
          : IMAGENS_PERFIL.quadroNormal.key
      );
    };

    botao.on("pointerover", () => {
      this.tweens.add({ targets: botao, scale: 1.02, duration: 100, ease: "Sine.Out" });
    });
    botao.on("pointerout", () => {
      this.tweens.add({ targets: botao, scale: 1, duration: 100, ease: "Sine.Out" });
    });
    botao.on("pointerdown", () => this.selecionar(perfil.id));

    this.profileButtons.push(botao);
  }

  rolarListaPerfis(pointer, _gameObjects, _deltaX, deltaY) {
    const viewport = this.profileListViewport;
    if (
      !viewport ||
      pointer.x < viewport.x ||
      pointer.x > viewport.x + viewport.width ||
      pointer.y < viewport.y ||
      pointer.y > viewport.y + viewport.height
    ) {
      return;
    }

    this.profileListScrollOffset = Phaser.Math.Clamp(
      this.profileListScrollOffset + deltaY * 0.7,
      0,
      this.profileListMaxScroll || 0
    );
    this.atualizarPosicoesPerfis();
  }

  atualizarPosicoesPerfis() {
    const viewport = this.profileListViewport;
    if (!viewport) return;

    this.profileButtons.forEach((button) => {
      button.y = button.posicaoYBase - this.profileListScrollOffset;
      const topo = button.y - button.alturaPerfil / 2;
      const base = button.y + button.alturaPerfil / 2;
      const visivel = base > viewport.y && topo < viewport.y + viewport.height;
      if (button.input) button.input.enabled = visivel;
    });
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
