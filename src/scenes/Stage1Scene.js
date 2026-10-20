import BaseStageScene from "./BaseStageScene.js";
import { FASE1_CONFIG } from "../data/stagesData.js";
import {
  DEBUG_COLLISIONS,
  FASE1_COLISOES_FIXAS,
  FASE1_COLISOES_LIXO,
  mapearRetanguloColisaoFase1
} from "../data/stage1Collisions.js";
import { pixelTextStyle } from "../ui/TextStyles.js";
import {
  lixoRecolhidoNaFase1,
  obterImagemSalaFase1
} from "../services/Stage1RoomService.js";
import { GAMEPLAY_AREA } from "../data/gameplayLayout.js";

const IMAGENS_SALA = {
  Fase1Desarrumada: "/assets/images/Fase1Desarrumada.png",
  Fase1ArrumadaLixo: "/assets/images/Fase1ArrumadaLixo.png",
  Fase1ArrumadaComputador: "/assets/images/Fase1ArrumadaComputador.png",
  Fase1ArrumadaEquipamentos: "/assets/images/Fase1ArrumadaEquipamentos.png",
  Fase1ArrumadaLixoComputador: "/assets/images/Fase1ArrumadaLixoComputador.png",
  Fase1ArrumadaLixoEquipamentos: "/assets/images/Fase1ArrumadaLixoEquipamentos.png",
  Fase1ArrumadaEquipamentosComputador: "/assets/images/Fase1ArrumadaEquipamentosComputador.png",
  Fase1Arrumada: "/assets/images/Fase1Arrumada.png"
};

const SALA_IMAGEM = GAMEPLAY_AREA;

// Exportado para manter compatibilidade com consumidores do Marco 2.
export const INTERACOES_OBRIGATORIAS = FASE1_CONFIG.interacoesObrigatorias;

export class Stage1Scene extends BaseStageScene {
  constructor() {
    super("Stage1Scene");
  }

  getStageConfig() {
    return FASE1_CONFIG;
  }

  create() {
    super.create();
    if (!this.player || !this.imagemSala) {
      return;
    }

    this.criarColisoesFase1();
    this.atualizarColisoesFase1(this.perfil);
  }

  preload() {
    super.preload();
    Object.entries(IMAGENS_SALA).forEach(([chave, caminho]) => {
      this.load.image(chave, caminho);
    });
  }

  desenharSala() {
    this.imagemSala = this.add
      .image(SALA_IMAGEM.x, SALA_IMAGEM.y, obterImagemSalaFase1(this.perfil))
      .setOrigin(0, 0)
      .setDepth(-3);

    const escala = SALA_IMAGEM.width / this.imagemSala.width;
    this.imagemSala.setScale(escala);

    this.add
      .text(80, 127, this.stageConfig.cabecalho, pixelTextStyle({
        fontSize: "25px",
        fontStyle: "bold"
      }))
      .setDepth(10);
  }

  // Os elementos já fazem parte da arte. A interação continua sendo detectada
  // pela distância até as coordenadas configuradas, sem sprites duplicados.
  criarVisualInteracao() {
    return null;
  }

  atualizarVisualInteracao() {
    // A imagem completa da sala representa o estado físico de cada elemento.
  }

  criarColisoesFase1() {
    this.colisoresFase1 = this.physics.add.staticGroup();
    this.colisoresFixos = FASE1_COLISOES_FIXAS.map((retangulo) =>
      this.criarColisorRetangular(retangulo)
    );
    this.colisoresLixo = FASE1_COLISOES_LIXO.map((retangulo) =>
      this.criarColisorRetangular(retangulo)
    );

    this.physics.add.collider(this.player, this.colisoresFase1);
    this.desenharDepuracaoInteracoes();
  }

  criarColisorRetangular(retangulo) {
    const posicao = mapearRetanguloColisaoFase1(retangulo, this.imagemSala);
    const colisor = this.add
      .rectangle(posicao.x, posicao.y, posicao.width, posicao.height, 0xff3434, 0.2)
      .setOrigin(0.5)
      .setStrokeStyle(2, 0xff3434, 0.9)
      .setDepth(-1)
      .setVisible(DEBUG_COLLISIONS);

    this.colisoresFase1.add(colisor);
    colisor.colisaoId = retangulo.id;
    return colisor;
  }

  desenharDepuracaoInteracoes() {
    if (!DEBUG_COLLISIONS) {
      return;
    }

    const debug = this.add.graphics().setDepth(-1.5);
    this.stageConfig.interacoes.forEach((interacao) => {
      debug.lineStyle(2, 0xffd84d, 0.9);
      debug.strokeCircle(interacao.x, interacao.y, interacao.raioInteracao);
      debug.fillStyle(0xffd84d, 0.9);
      debug.fillCircle(interacao.x, interacao.y, 4);
    });
    this.debugInteracoes = debug;
  }

  atualizarColisoesFase1(perfil = this.perfil) {
    if (!this.colisoresLixo) {
      return;
    }

    const lixoPresente = !lixoRecolhidoNaFase1(perfil);
    this.colisoresLixo.forEach((colisor) => {
      colisor.body.enable = lixoPresente;
      colisor.setVisible(DEBUG_COLLISIONS && lixoPresente);
    });
  }

  registrarEscolha(choiceId) {
    super.registrarEscolha(choiceId);
    this.atualizarImagemSala();
  }

  atualizarImagemSala() {
    this.imagemSala?.setTexture(obterImagemSalaFase1(this.perfil));
    this.atualizarColisoesFase1(this.perfil);
  }
}

export default Stage1Scene;
