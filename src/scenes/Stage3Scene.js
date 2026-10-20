import BaseStageScene from "./BaseStageScene.js";
import { FASE3_CONFIG } from "../data/stagesData.js";
import { GAMEPLAY_AREA } from "../data/gameplayLayout.js";
import {
  DEBUG_COLLISIONS_FASE3,
  FASE3_AREA_CAMINHAVEL,
  FASE3_COLISOES_FIXAS,
  mapearPontoImagemFase3,
  mapearRaioImagemFase3,
  mapearRetanguloColisaoFase3
} from "../data/stage3Collisions.js";
import { obterTexturaFase3 } from "../services/Stage3RoomService.js";
import { pixelTextStyle } from "../ui/TextStyles.js";

const IMAGENS_SALA = {
  Fase3Desarrumada: "/assets/images/Fase3Desarrumada.png",
  Fase3ArrumadaMaquina: "/assets/images/Fase3ArrumadaMaquina.png",
  Fase3ArrumadaProfessor: "/assets/images/Fase3ArrumadaProfessor.png",
  Fase3ArrumadaColegas: "/assets/images/Fase3ArrumadaColegas.png",
  Fase3ArrumadaMaquinaProfessor: "/assets/images/Fase3ArrumadaMaquinaProfessor.png",
  Fase3ArrumadaMaquinaColegas: "/assets/images/Fase3ArrumadaMaquinaColegas.png",
  Fase3ArrumadaProfessorColegas: "/assets/images/Fase3ArrumadaProfessorColegas.png",
  Fase3ArrumadaMaquinaProfessorColegas: "/assets/images/Fase3ArrumadaMaquinaProfessorColegas.png"
};

export const INTERACOES_OBRIGATORIAS = FASE3_CONFIG.interacoesObrigatorias;

export class Stage3Scene extends BaseStageScene {
  constructor() {
    super("Stage3Scene");
  }

  getStageConfig() {
    return FASE3_CONFIG;
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

  preload() {
    super.preload();
    Object.entries(IMAGENS_SALA).forEach(([chave, caminho]) => {
      if (!this.textures.exists(chave)) this.load.image(chave, caminho);
    });
  }

  create() {
    super.create();
    if (!this.player || !this.stageBackground) return;

    this.criarColisoesFase3();
  }

  desenharSala() {
    this.stageBackground = this.add
      .image(GAMEPLAY_AREA.x, GAMEPLAY_AREA.y, obterTexturaFase3(this.perfil))
      .setOrigin(0, 0)
      .setDepth(-3);
    this.stageBackground.setScale(GAMEPLAY_AREA.width / this.stageBackground.width);

    const salaMapeada = mapearRetanguloColisaoFase3(
      FASE3_AREA_CAMINHAVEL,
      this.stageBackground
    );
    const jogadorInicial = mapearPontoImagemFase3(
      this.stageConfig.jogadorInicial.x,
      this.stageConfig.jogadorInicial.y,
      this.stageBackground
    );
    const interacoes = this.stageConfig.interacoes.map((interacao) => ({
      ...interacao,
      ...mapearPontoImagemFase3(interacao.x, interacao.y, this.stageBackground),
      raioInteracao: mapearRaioImagemFase3(interacao.raioInteracao, this.stageBackground)
    }));

    this.stageConfig = {
      ...this.stageConfig,
      sala: {
        ...this.stageConfig.sala,
        x: salaMapeada.x - salaMapeada.width / 2,
        y: salaMapeada.y - salaMapeada.height / 2,
        width: salaMapeada.width,
        height: salaMapeada.height
      },
      jogadorInicial,
      interacoes
    };

    this.add
      .text(80, 127, this.stageConfig.cabecalho, pixelTextStyle({
        fontSize: "25px",
        fontStyle: "bold"
      }))
      .setDepth(10);
  }

  // A arte completa já contém os três alvos; não desenha protótipos por cima.
  criarVisualInteracao() {
    return null;
  }

  atualizarVisualInteracao() {
    // O estado visual é representado unicamente pela textura do cenário.
  }

  criarColisoesFase3() {
    this.colisoresFase3 = this.physics.add.staticGroup();
    this.colisoresFase3Lista = FASE3_COLISOES_FIXAS.map((retangulo) => {
      const posicao = mapearRetanguloColisaoFase3(retangulo, this.stageBackground);
      const colisor = this.add
        .rectangle(posicao.x, posicao.y, posicao.width, posicao.height, 0xff3434, 0.22)
        .setStrokeStyle(2, 0xff3434, 0.9)
        .setDepth(-1)
        .setVisible(DEBUG_COLLISIONS_FASE3);

      this.colisoresFase3.add(colisor);
      colisor.colisaoId = retangulo.id;
      return colisor;
    });

    this.physics.add.collider(this.player, this.colisoresFase3);
    this.desenharDepuracaoColisoesFase3();
  }

  desenharDepuracaoColisoesFase3() {
    if (!DEBUG_COLLISIONS_FASE3) return;

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
    this.debugColisoesFase3 = debug;
  }

  registrarEscolha(choiceId) {
    super.registrarEscolha(choiceId);
    this.atualizarImagemSala();
  }

  atualizarImagemSala() {
    this.stageBackground?.setTexture(obterTexturaFase3(this.perfil));
  }
}

export default Stage3Scene;
