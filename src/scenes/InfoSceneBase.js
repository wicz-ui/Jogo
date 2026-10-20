import Phaser from "phaser";
import { criarBotaoImagem } from "../ui/ImageButton.js";
import { iniciarSchoolBackdrop, preloadSchoolBackdrop } from "../ui/SchoolBackdrop.js";
import { pixelTextStyle } from "../ui/TextStyles.js";

const TEXTURA_QUADRO = "telas-info-quadro";
const TEXTURA_BOTAO_MENU = "telas-info-voltar-menu";
const ASSET_QUADRO = "/assets/images/QuadroInteracoes.png";
const ASSET_BOTAO_MENU = "/assets/images/BotaoVoltarAoMenu.png";

/** Estrutura comum para as telas informativas, sem estado nem opções editáveis. */
export class InfoSceneBase extends Phaser.Scene {
  constructor({ key, title, sections }) {
    super({ key });
    this.info = { title, sections };
  }

  preload() {
    preloadSchoolBackdrop(this);
    if (!this.textures.exists(TEXTURA_QUADRO)) {
      this.load.image(TEXTURA_QUADRO, ASSET_QUADRO);
    }
    if (!this.textures.exists(TEXTURA_BOTAO_MENU)) {
      this.load.image(TEXTURA_BOTAO_MENU, ASSET_BOTAO_MENU);
    }
  }

  create() {
    iniciarSchoolBackdrop(this);

    const { width, height } = this.cameras.main;
    const imagemQuadro = this.textures.get(TEXTURA_QUADRO).getSourceImage();
    const escalaQuadro = Math.min(
      (width - 64) / imagemQuadro.width,
      (height - 132) / imagemQuadro.height
    );
    const larguraQuadro = imagemQuadro.width * escalaQuadro;
    const alturaQuadro = imagemQuadro.height * escalaQuadro;
    const topoQuadro = height * 0.43 - alturaQuadro / 2;
    const escalaLayout = larguraQuadro / 1046;
    const larguraTexto = larguraQuadro * 0.84;

    this.add
      .image(width / 2, height * 0.43, TEXTURA_QUADRO)
      .setDisplaySize(larguraQuadro, alturaQuadro)
      .setDepth(0);

    this.add
      .text(width / 2, topoQuadro + alturaQuadro * 0.17, this.info.title, pixelTextStyle({
        fontSize: `${34 * escalaLayout}px`,
        align: "center",
        wordWrap: { width: larguraTexto, useAdvancedWrap: true }
      }))
      .setOrigin(0.5)
      .setDepth(1);

    this.adicionarSecoes({
      centerX: width / 2,
      top: topoQuadro + alturaQuadro * 0.24,
      height: alturaQuadro * 0.62,
      width: larguraTexto,
      escala: escalaLayout
    });

    const larguraBotao = Math.min(320, larguraQuadro * 0.33, width - 48);
    criarBotaoImagem(
      this,
      width / 2,
      height - 58,
      TEXTURA_BOTAO_MENU,
      larguraBotao,
      () => this.scene.start("MainMenuScene")
    ).setDepth(2);
  }

  adicionarSecoes({ centerX, top, height, width, escala }) {
    const espacamentoSecoes = 8 * escala;
    const espacamentoTexto = 2 * escala;
    const secoes = this.info.sections.map(({ heading, body }) => {
      const titulo = this.add
        .text(centerX, 0, heading, pixelTextStyle({
          fontSize: `${20 * escala}px`,
          align: "center",
          wordWrap: { width, useAdvancedWrap: true }
        }))
        .setOrigin(0.5, 0)
        .setDepth(1);
      const texto = this.add
        .text(centerX, 0, body, pixelTextStyle({
          fontSize: `${17 * escala}px`,
          align: "center",
          lineSpacing: 2 * escala,
          wordWrap: { width, useAdvancedWrap: true }
        }))
        .setOrigin(0.5, 0)
        .setDepth(1);

      return { titulo, texto };
    });

    const alturaConteudo = secoes.reduce(
      (total, secao) => total + secao.titulo.height + espacamentoTexto +
        secao.texto.height + espacamentoSecoes,
      -espacamentoSecoes
    );
    let y = top + Math.max(0, (height - alturaConteudo) / 2);

    secoes.forEach(({ titulo, texto }) => {
      titulo.setY(y);
      texto.setY(y + titulo.height + espacamentoTexto);
      y = texto.y + texto.height + espacamentoSecoes;
    });
  }
}

export default InfoSceneBase;
