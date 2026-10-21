import Phaser from "phaser";
import {
  CHARACTER_FRAME_ASSETS,
  CHARACTER_FRAMES,
  PLAYABLE_CHARACTERS
} from "../data/charactersData.js";
import {
  obterVetorMovimento,
  PLAYER_MOVEMENT_SPEED,
  PLAYER_WALK_FRAME_RATE,
  resolverDirecaoPrioritaria
} from "./playerMovement.js";

const TARGET_HEIGHT = 70;
const BODY_WIDTH = 30;
const BODY_HEIGHT = 18;
const WALK_FRAME_INTERVAL = 1000 / PLAYER_WALK_FRAME_RATE;

const DIRECAO_POR_CODIGO = Object.freeze({
  37: "left",
  65: "left",
  38: "up",
  87: "up",
  39: "right",
  68: "right",
  40: "down",
  83: "down"
});

const CODIGO_POR_EVENTO_CODE = Object.freeze({
  ArrowLeft: 37,
  KeyA: 65,
  ArrowUp: 38,
  KeyW: 87,
  ArrowRight: 39,
  KeyD: 68,
  ArrowDown: 40,
  KeyS: 83
});

const CODIGO_POR_EVENTO_KEY = Object.freeze({
  arrowleft: 37,
  a: 65,
  arrowup: 38,
  w: 87,
  arrowright: 39,
  d: 68,
  arrowdown: 40,
  s: 83
});

function obterCodigoDirecional(event) {
  const keyCode = Number(event?.keyCode || event?.which);
  if (Object.hasOwn(DIRECAO_POR_CODIGO, keyCode)) {
    return keyCode;
  }

  if (Object.hasOwn(CODIGO_POR_EVENTO_CODE, event?.code)) {
    return CODIGO_POR_EVENTO_CODE[event.code];
  }

  const key = String(event?.key || "").toLowerCase();
  return Object.hasOwn(CODIGO_POR_EVENTO_KEY, key)
    ? CODIGO_POR_EVENTO_KEY[key]
    : null;
}

function prepararQuadrosIndividuais(scene, personagem) {
  const descritores = CHARACTER_FRAME_ASSETS[personagem.id];
  const imagens = descritores.map((descritor) => {
    const { textureKey, sourceKey } = descritor;
    const sourceImage = scene.textures.get(sourceKey)?.getSourceImage();

    if (!sourceImage) {
      throw new Error(`Imagem individual ${textureKey} de ${personagem.nome} não foi carregada.`);
    }

    return { textureKey, sourceImage };
  });
  const larguraQuadro = Math.max(...imagens.map(({ sourceImage }) => (
    sourceImage.naturalWidth || sourceImage.width
  )));
  const alturaQuadro = Math.max(...imagens.map(({ sourceImage }) => (
    sourceImage.naturalHeight || sourceImage.height
  )));

  imagens.forEach(({ textureKey, sourceImage }) => {
    if (scene.textures.exists(textureKey)) {
      return;
    }

    const texture = scene.textures.createCanvas(textureKey, larguraQuadro, alturaQuadro);

    if (!texture) {
      throw new Error(`Não foi possível normalizar o quadro ${textureKey}.`);
    }

    const larguraImagem = sourceImage.naturalWidth || sourceImage.width;
    const alturaImagem = sourceImage.naturalHeight || sourceImage.height;
    const destinoX = Math.floor((larguraQuadro - larguraImagem) / 2);
    const destinoY = alturaQuadro - alturaImagem;

    texture.context.imageSmoothingEnabled = false;
    texture.context.drawImage(sourceImage, destinoX, destinoY);
    texture.refresh();
    texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
    texture.customData = {
      ...texture.customData,
      alturaMaximaPersonagem: alturaQuadro,
      larguraQuadro,
      alturaQuadro
    };
  });
}

export function prepararPersonagens(scene, personagemId) {
  const personagens = personagemId
    ? [PLAYABLE_CHARACTERS[personagemId]]
    : Object.values(PLAYABLE_CHARACTERS);

  personagens.forEach((personagem) => {
    if (!personagem) {
      throw new Error(`Personagem jogável inválido: ${personagemId || "ausente"}.`);
    }

    prepararQuadrosIndividuais(scene, personagem);
  });
}

export class Player extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, personagemId) {
    const personagem = Object.hasOwn(PLAYABLE_CHARACTERS, personagemId)
      ? PLAYABLE_CHARACTERS[personagemId]
      : null;

    if (!personagem) {
      throw new Error(`Personagem jogável inválido: ${personagemId || "ausente"}.`);
    }

    const quadrosIndividuais = CHARACTER_FRAMES[personagemId] || null;
    const textureInicial = quadrosIndividuais.down[0];
    const texture = scene.textures.get(textureInicial);
    const alturaMaxima = texture?.customData?.alturaMaximaPersonagem;
    const larguraQuadro = texture?.customData?.larguraQuadro;
    const alturaQuadro = texture?.customData?.alturaQuadro;

    if (!alturaMaxima || !larguraQuadro || !alturaQuadro) {
      throw new Error(`Os quadros de ${personagem.nome} ainda não foram preparados.`);
    }

    const escala = TARGET_HEIGHT / alturaMaxima;
    super(
      scene,
      x,
      y + TARGET_HEIGHT / 2,
      textureInicial
    );

    this.personagemId = personagemId;
    this.quadrosIndividuais = quadrosIndividuais;
    this.lastDirection = "down";
    this.emMovimento = false;
    this.quadroCaminhada = 0;
    this.tempoQuadro = 0;
    this.speed = PLAYER_MOVEMENT_SPEED;
    this.pressedDirectionalKeys = new Map();
    this.keyboard = scene.input.keyboard;
    this.onDirectionalKeyDown = this.onDirectionalKeyDown.bind(this);
    this.onDirectionalKeyUp = this.onDirectionalKeyUp.bind(this);
    this.releaseInputListeners = this.releaseInputListeners.bind(this);
    this.keyboard?.on("keydown", this.onDirectionalKeyDown);
    this.keyboard?.on("keyup", this.onDirectionalKeyUp);
    scene.events.once(
      Phaser.Scenes.Events.SHUTDOWN,
      this.releaseInputListeners
    );
    this.setOrigin(0.5, 1);
    this.setScale(escala);
    this.setDepth(6);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.setCollideWorldBounds(true);
    const larguraLocalHitbox = BODY_WIDTH / escala;
    const alturaLocalHitbox = BODY_HEIGHT / escala;
    this.body.setSize(larguraLocalHitbox, alturaLocalHitbox, false);
    this.body.setOffset(
      (larguraQuadro - larguraLocalHitbox) / 2,
      alturaQuadro - alturaLocalHitbox
    );
  }

  getInteractionPosition() {
    return {
      x: this.x,
      y: this.y - TARGET_HEIGHT / 2
    };
  }

  onDirectionalKeyDown(event) {
    const keyCode = obterCodigoDirecional(event);
    const direction = DIRECAO_POR_CODIGO[keyCode];

    if (direction && !this.pressedDirectionalKeys.has(keyCode)) {
      this.pressedDirectionalKeys.set(keyCode, { direction });
    }
  }

  onDirectionalKeyUp(event) {
    const keyCode = obterCodigoDirecional(event);
    if (keyCode !== null) {
      this.pressedDirectionalKeys.delete(keyCode);
    }
  }

  releaseInputListeners() {
    this.keyboard?.off("keydown", this.onDirectionalKeyDown);
    this.keyboard?.off("keyup", this.onDirectionalKeyUp);
    this.pressedDirectionalKeys.clear();
  }

  update(delta = 0) {
    if (!this.body) {
      return;
    }

    const direction = resolverDirecaoPrioritaria(
      Array.from(this.pressedDirectionalKeys.values())
    );

    if (direction) {
      const vector = obterVetorMovimento(direction);
      this.body.setVelocity(vector.x * this.speed, vector.y * this.speed);
      const direcaoAnterior = this.lastDirection;
      this.lastDirection = direction;
      this.atualizarQuadroIndividual(
        delta,
        !this.emMovimento || direcaoAnterior !== direction
      );
      this.emMovimento = true;
    } else {
      this.parar();
    }
  }

  parar() {
    this.body?.setVelocity(0, 0);

    if (this.emMovimento) {
      this.setTexture(this.quadrosIndividuais[this.lastDirection][0]);

      this.quadroCaminhada = 0;
      this.tempoQuadro = 0;
      this.emMovimento = false;
    }
  }

  atualizarQuadroIndividual(delta, reiniciar) {
    const quadros = this.quadrosIndividuais[this.lastDirection];

    if (reiniciar) {
      this.quadroCaminhada = 0;
      this.tempoQuadro = 0;
      if (this.texture.key !== quadros[0]) {
        this.setTexture(quadros[0]);
      }
      return;
    }

    this.tempoQuadro += Math.max(0, Number(delta) || 0);

    while (this.tempoQuadro >= WALK_FRAME_INTERVAL) {
      this.tempoQuadro -= WALK_FRAME_INTERVAL;
      this.quadroCaminhada = (this.quadroCaminhada + 1) % quadros.length;
    }

    const textureKey = quadros[this.quadroCaminhada];
    if (this.texture.key !== textureKey) {
      this.setTexture(textureKey);
    }
  }
}

export default Player;
