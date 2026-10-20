import Phaser from "phaser";
import { PLAYABLE_CHARACTERS } from "../data/charactersData.js";

const FRAME_WIDTH = 112;
const FRAME_HEIGHT = 184;
const FRAME_COLUMNS = 3;
const FRAME_ROWS = 4;
const TARGET_HEIGHT = 70;
const BODY_WIDTH = 30;
const BODY_HEIGHT = 18;
const WALK_FRAME_RATE = 8;
const IDLE_FRAME_BY_DIRECTION = Object.freeze({
  down: 0,
  left: 3,
  right: 6,
  up: 9
});
const DIRECTION_ROWS = Object.freeze({
  down: 0,
  left: 1,
  right: 2,
  up: 3
});

function encontrarFaixasAtivas(contagens) {
  const faixas = [];
  let inicio = null;

  for (let indice = 0; indice <= contagens.length; indice += 1) {
    const ativo = indice < contagens.length && contagens[indice] > 0;

    if (ativo && inicio === null) {
      inicio = indice;
    } else if (!ativo && inicio !== null) {
      faixas.push({ inicio, fim: indice });
      inicio = null;
    }
  }

  return faixas;
}

function medirQuadros(sourceImage) {
  const largura = sourceImage.naturalWidth || sourceImage.width;
  const altura = sourceImage.naturalHeight || sourceImage.height;
  const canvas = document.createElement("canvas");
  canvas.width = largura;
  canvas.height = altura;

  const context = canvas.getContext("2d", { willReadFrequently: true });
  context.drawImage(sourceImage, 0, 0);
  const pixels = context.getImageData(0, 0, largura, altura).data;
  const pixelsPorLinha = new Uint32Array(altura);
  const pixelsPorColuna = new Uint32Array(largura);

  for (let y = 0; y < altura; y += 1) {
    for (let x = 0; x < largura; x += 1) {
      if (pixels[(y * largura + x) * 4 + 3] > 0) {
        pixelsPorLinha[y] += 1;
        pixelsPorColuna[x] += 1;
      }
    }
  }

  const faixasVerticais = encontrarFaixasAtivas(pixelsPorLinha);
  const faixasHorizontais = encontrarFaixasAtivas(pixelsPorColuna);

  if (faixasVerticais.length !== FRAME_ROWS || faixasHorizontais.length !== FRAME_COLUMNS) {
    throw new Error(
      `Spritesheet ${largura}×${altura} deveria conter ${FRAME_COLUMNS} colunas e ` +
      `${FRAME_ROWS} linhas separadas por transparência; foram encontradas ` +
      `${faixasHorizontais.length} colunas e ${faixasVerticais.length} linhas.`
    );
  }

  const quadros = [];

  faixasVerticais.forEach((faixaY) => {
    faixasHorizontais.forEach((faixaX) => {
      let esquerda = faixaX.fim;
      let direita = faixaX.inicio - 1;
      let topo = faixaY.fim;
      let base = faixaY.inicio - 1;

      for (let y = faixaY.inicio; y < faixaY.fim; y += 1) {
        for (let x = faixaX.inicio; x < faixaX.fim; x += 1) {
          if (pixels[(y * largura + x) * 4 + 3] > 0) {
            esquerda = Math.min(esquerda, x);
            direita = Math.max(direita, x);
            topo = Math.min(topo, y);
            base = Math.max(base, y);
          }
        }
      }

      if (direita < esquerda || base < topo) {
        throw new Error("A spritesheet contém uma célula sem personagem visível.");
      }

      quadros.push({
        x: esquerda,
        y: topo,
        width: direita - esquerda + 1,
        height: base - topo + 1
      });
    });
  });

  return quadros;
}

function criarSpritesheetNormalizada(scene, personagem) {
  const sourceTexture = scene.textures.get(personagem.sourceTexture);
  const sourceImage = sourceTexture?.getSourceImage();

  if (!sourceImage) {
    throw new Error(`Imagem do personagem ${personagem.nome} não foi carregada.`);
  }

  const quadros = medirQuadros(sourceImage);
  const alturaMaxima = Math.max(...quadros.map((quadro) => quadro.height));
  const texture = scene.textures.createCanvas(
    personagem.texture,
    FRAME_WIDTH * FRAME_COLUMNS,
    FRAME_HEIGHT * FRAME_ROWS
  );

  if (!texture) {
    throw new Error(`Não foi possível preparar os quadros de ${personagem.nome}.`);
  }

  texture.context.imageSmoothingEnabled = false;
  quadros.forEach((quadro, indice) => {
    if (quadro.width > FRAME_WIDTH || quadro.height > FRAME_HEIGHT) {
      throw new Error(`O quadro ${indice} de ${personagem.nome} excede a célula normalizada.`);
    }

    const coluna = indice % FRAME_COLUMNS;
    const linha = Math.floor(indice / FRAME_COLUMNS);
    const destinoX = coluna * FRAME_WIDTH + Math.floor((FRAME_WIDTH - quadro.width) / 2);
    const destinoY = linha * FRAME_HEIGHT + FRAME_HEIGHT - quadro.height;

    texture.context.drawImage(
      sourceImage,
      quadro.x,
      quadro.y,
      quadro.width,
      quadro.height,
      destinoX,
      destinoY,
      quadro.width,
      quadro.height
    );
  });

  texture.refresh();
  texture.setFilter(Phaser.Textures.FilterMode.NEAREST);

  for (let indice = 0; indice < FRAME_COLUMNS * FRAME_ROWS; indice += 1) {
    texture.add(
      indice,
      0,
      (indice % FRAME_COLUMNS) * FRAME_WIDTH,
      Math.floor(indice / FRAME_COLUMNS) * FRAME_HEIGHT,
      FRAME_WIDTH,
      FRAME_HEIGHT
    );
  }

  texture.customData = {
    ...texture.customData,
    alturaMaximaPersonagem: alturaMaxima
  };
}

function registrarAnimacoes(scene, personagem) {
  Object.entries(DIRECTION_ROWS).forEach(([direcao, linha]) => {
    const chave = `${personagem.id}-${direcao}`;

    if (scene.anims.exists(chave)) {
      return;
    }

    const primeiroQuadroDePasso = linha * FRAME_COLUMNS + 1;
    scene.anims.create({
      key: chave,
      frames: [
        { key: personagem.texture, frame: primeiroQuadroDePasso },
        { key: personagem.texture, frame: primeiroQuadroDePasso + 1 }
      ],
      frameRate: WALK_FRAME_RATE,
      repeat: -1
    });
  });
}

export function prepararPersonagens(scene) {
  Object.values(PLAYABLE_CHARACTERS).forEach((personagem) => {
    if (!scene.textures.exists(personagem.texture)) {
      criarSpritesheetNormalizada(scene, personagem);
    }

    registrarAnimacoes(scene, personagem);
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

    const texture = scene.textures.get(personagem.texture);
    const alturaMaxima = texture?.customData?.alturaMaximaPersonagem;

    if (!alturaMaxima) {
      throw new Error(`Os quadros de ${personagem.nome} ainda não foram preparados.`);
    }

    const escala = TARGET_HEIGHT / alturaMaxima;
    super(scene, x, y + TARGET_HEIGHT / 2, personagem.texture, 0);

    this.personagemId = personagemId;
    this.direcaoAtual = "down";
    this.emMovimento = false;
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
      (FRAME_WIDTH - larguraLocalHitbox) / 2,
      FRAME_HEIGHT - alturaLocalHitbox
    );
    this.speed = 230;
  }

  getInteractionPosition() {
    return {
      x: this.x,
      y: this.y - TARGET_HEIGHT / 2
    };
  }

  update(cursors, keys) {
    if (!this.body) {
      return;
    }

    let eixoX = 0;
    let eixoY = 0;

    if (cursors.left.isDown || keys.A.isDown) eixoX -= 1;
    if (cursors.right.isDown || keys.D.isDown) eixoX += 1;
    if (cursors.up.isDown || keys.W.isDown) eixoY -= 1;
    if (cursors.down.isDown || keys.S.isDown) eixoY += 1;

    if (eixoX !== 0 || eixoY !== 0) {
      const vetor = new Phaser.Math.Vector2(eixoX, eixoY).normalize();
      this.body.setVelocity(vetor.x * this.speed, vetor.y * this.speed);
      this.direcaoAtual = Math.abs(eixoX) > Math.abs(eixoY)
        ? (eixoX < 0 ? "left" : "right")
        : (eixoY < 0 ? "up" : "down");

      const animacao = `${this.personagemId}-${this.direcaoAtual}`;
      if (!this.emMovimento || this.anims.currentAnim?.key !== animacao) {
        this.anims.play(animacao);
      }
      this.emMovimento = true;
    } else {
      this.parar();
    }
  }

  parar() {
    this.body?.setVelocity(0, 0);

    if (this.emMovimento) {
      this.anims.stop();
      this.setFrame(IDLE_FRAME_BY_DIRECTION[this.direcaoAtual]);
      this.emMovimento = false;
    }
  }
}

export default Player;
