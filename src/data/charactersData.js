const DIRECTIONS = Object.freeze(["down", "left", "right", "up"]);

const CHARACTER_DEFINITIONS = Object.freeze([
  { id: "abner", nome: "Abner", assetPrefix: "Abner" },
  { id: "dorival", nome: "Dorival", assetPrefix: "Dorival" },
  { id: "edson", nome: "Edson", assetPrefix: "Edson" },
  { id: "lucas", nome: "Lucas", assetPrefix: "Lucas" },
  { id: "matheus", nome: "Matheus", assetPrefix: "Matheus" },
  { id: "rosy", nome: "Rosy", assetPrefix: "Rosy" }
]);

const DIRECTION_FILE_NAMES = Object.freeze({
  down: "Down",
  left: "Left",
  right: "Right",
  up: "Top"
});

function criarDescricaoPersonagem({ id, nome, assetPrefix }) {
  const assets = DIRECTIONS.flatMap((direction) => [1, 2].map((frame) => {
    const textureKey = `${id}-${direction}-${frame}`;
    const filename = `${assetPrefix}${DIRECTION_FILE_NAMES[direction]}${frame}.png`;

    return Object.freeze({
      direction,
      frame,
      textureKey,
      sourceKey: `${textureKey}-source`,
      path: `/assets/images/${filename}`
    });
  }));
  const frames = Object.freeze(Object.fromEntries(
    DIRECTIONS.map((direction) => [
      direction,
      Object.freeze(
        assets
          .filter((asset) => asset.direction === direction)
          .map((asset) => asset.textureKey)
      )
    ])
  ));

  return Object.freeze({
    character: Object.freeze({ id, nome }),
    frames,
    assets: Object.freeze(assets)
  });
}

const CHARACTER_DESCRIPTIONS = Object.freeze(
  CHARACTER_DEFINITIONS.map(criarDescricaoPersonagem)
);

export const PLAYABLE_CHARACTERS = Object.freeze(Object.fromEntries(
  CHARACTER_DESCRIPTIONS.map(({ character }) => [character.id, character])
));

export const CHARACTER_FRAMES = Object.freeze(Object.fromEntries(
  CHARACTER_DESCRIPTIONS.map(({ character, frames }) => [character.id, frames])
));

export const CHARACTER_FRAME_ASSETS = Object.freeze(Object.fromEntries(
  CHARACTER_DESCRIPTIONS.map(({ character, assets }) => [character.id, assets])
));

export const PLAYABLE_CHARACTER_IDS = Object.freeze(Object.keys(PLAYABLE_CHARACTERS));
