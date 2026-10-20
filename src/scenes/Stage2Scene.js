import BaseStageScene from "./BaseStageScene.js";
import { FASE2_CONFIG } from "../data/stagesData.js";
import {
  lixoRecolhidoNaFase2,
  obterTexturaFase2
} from "../services/Stage2RoomService.js";
import { pixelTextStyle } from "../ui/TextStyles.js";
import { GAMEPLAY_AREA } from "../data/gameplayLayout.js";
import {
  DEBUG_COLLISIONS_FASE2,
  FASE2_AREA_CAMINHAVEL,
  FASE2_COLISOES_FIXAS,
  FASE2_COLISOES_LIXO,
  mapearPontoImagemFase2,
  mapearRaioImagemFase2,
  mapearRetanguloColisaoFase2
} from "../data/stage2Collisions.js";

const IMAGENS_SALA = {
  Fase2Desarrumada: "/assets/images/Fase2Desarrumada.png",
  Fase2ArrumadaLixo: "/assets/images/Fase2ArrumadaLixo.png",
  Fase2ArrumadaLiquido: "/assets/images/Fase2ArrumadaLiquido.png",
  Fase2ArrumadaConversa: "/assets/images/Fase2ArrumadaConversa.png",
  Fase2ArrumadaLixoLiquido: "/assets/images/Fase2ArrumadaLixoLiquido.png",
  Fase2ArrumadaLixoConversa: "/assets/images/Fase2ArrumadaLixoConversa.png",
  Fase2ArrumadaLiquidoConversa: "/assets/images/Fase2ArrumadaLiquidoConversa.png",
  Fase2ArrumadaLixoLiquidoConversa: "/assets/images/Fase2ArrumadaLixoLiquidoConversa.png"
};

export const INTERACOES_OBRIGATORIAS = FASE2_CONFIG.interacoesObrigatorias;

export class Stage2Scene extends BaseStageScene {
  constructor() {
    super("Stage2Scene");
  }

  getStageConfig() {
    return FASE2_CONFIG;
  }

  init(data) {
    super.init(data);
    this.stageConfig = {
      ...this.stageConfig,
      sala: { ...this.stageConfig.sala },
      jogadorInicial: { ...this.stageConfig.jogadorInicial },
      interacoes: this.stageConfig.interacoes.map((interacao) => ({ ...interacao }))
    };
  }

  create() {
    super.create();
    if (!this.player || !this.imagemSala) return;

    this.criarColisoesFase2();
    this.atualizarColisoesFase2(this.perfil);
  }

  preload() {
    super.preload();
    Object.entries(IMAGENS_SALA).forEach(([chave, caminho]) => {
      if (!this.textures.exists(chave)) this.load.image(chave, caminho);
    });
  }

  desenharSala() {
    this.imagemSala = this.add
      .image(0, 0, obterTexturaFase2(this.perfil))
      .setOrigin(0, 0)
      .setDepth(-3);

    const escala = Math.min(
      GAMEPLAY_AREA.width / this.imagemSala.width,
      GAMEPLAY_AREA.height / this.imagemSala.height
    );
    const largura = this.imagemSala.width * escala;
    const altura = this.imagemSala.height * escala;
    const x = GAMEPLAY_AREA.x + (GAMEPLAY_AREA.width - largura) / 2;
    const y = GAMEPLAY_AREA.y + (GAMEPLAY_AREA.height - altura) / 2;

    this.imagemSala.setPosition(x, y).setScale(escala);
    this.transformarConfiguracaoDaFase();

    this.add
      .text(80, 127, this.stageConfig.cabecalho, pixelTextStyle({
        fontSize: "25px",
        fontStyle: "bold"
      }))
      .setDepth(10);
  }

  transformarConfiguracaoDaFase() {
    const salaMapeada = mapearRetanguloColisaoFase2(FASE2_AREA_CAMINHAVEL, this.imagemSala);
    const sala = {
      ...salaMapeada,
      x: salaMapeada.x - salaMapeada.width / 2,
      y: salaMapeada.y - salaMapeada.height / 2
    };
    const jogadorInicial = mapearPontoImagemFase2(
      this.stageConfig.jogadorInicial.x,
      this.stageConfig.jogadorInicial.y,
      this.imagemSala
    );
    const interacoes = this.stageConfig.interacoes.map((interacao) => ({
      ...interacao,
      ...mapearPontoImagemFase2(interacao.x, interacao.y, this.imagemSala),
      raioInteracao: mapearRaioImagemFase2(interacao.raioInteracao, this.imagemSala)
    }));

    this.stageConfig = {
      ...this.stageConfig,
      sala: { ...this.stageConfig.sala, ...sala },
      jogadorInicial,
      interacoes
    };
  }

  // Os objetos já estão desenhados na arte completa do corredor.
  criarVisualInteracao() {
    return null;
  }

  atualizarVisualInteracao() {
    // A arte de fundo representa a mudança física dos itens da fase.
  }

  criarColisoesFase2() {
    this.colisoresFase2 = this.physics.add.staticGroup();
    this.colisoresFixosFase2 = FASE2_COLISOES_FIXAS.map((retangulo) =>
      this.criarColisorFase2(retangulo)
    );
    this.colisoresLixoFase2 = FASE2_COLISOES_LIXO.map((retangulo) =>
      this.criarColisorFase2(retangulo)
    );

    this.physics.add.collider(this.player, this.colisoresFase2);
    this.desenharDepuracaoColisoes();
  }

  criarColisorFase2(retangulo) {
    const posicao = mapearRetanguloColisaoFase2(retangulo, this.imagemSala);
    const colisor = this.add
      .rectangle(posicao.x, posicao.y, posicao.width, posicao.height, 0xff3434, 0.22)
      .setStrokeStyle(2, 0xff3434, 0.9)
      .setDepth(-1)
      .setVisible(DEBUG_COLLISIONS_FASE2);

    this.colisoresFase2.add(colisor);
    colisor.colisaoId = retangulo.id;
    colisor.colisaoDinamica = retangulo.dinamica === true;
    return colisor;
  }

  desenharDepuracaoColisoes() {
    if (!DEBUG_COLLISIONS_FASE2) return;

    const debug = this.add.graphics().setDepth(30);
    debug.lineStyle(2, 0x57f287, 0.95);
    debug.strokeRect(
      this.stageConfig.sala.x,
      this.stageConfig.sala.y,
      this.stageConfig.sala.width,
      this.stageConfig.sala.height
    );
    this.stageConfig.interacoes.forEach((interacao) => {
      debug.lineStyle(2, 0xffd84d, 0.9);
      debug.strokeCircle(interacao.x, interacao.y, interacao.raioInteracao);
    });
    this.debugColisoesFase2 = debug;
  }

  atualizarColisoesFase2(perfil = this.perfil) {
    if (!this.colisoresLixoFase2) return;

    const lixoPresente = !lixoRecolhidoNaFase2(perfil);
    this.colisoresLixoFase2.forEach((colisor) => {
      colisor.body.enable = lixoPresente;
      colisor.setVisible(DEBUG_COLLISIONS_FASE2 && lixoPresente);
    });
  }

  registrarEscolha(choiceId) {
    super.registrarEscolha(choiceId);
    this.atualizarImagemSala();
    this.atualizarColisoesFase2(this.perfil);
  }

  atualizarImagemSala() {
    this.imagemSala?.setTexture(obterTexturaFase2(this.perfil));
  }
}

export default Stage2Scene;
