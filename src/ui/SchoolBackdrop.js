const FUNDOS_ESCOLARES = [
  { key: "menu-fundo-frente", path: "/assets/images/FrentePixel" },
  { key: "menu-fundo-interno-1", path: "/assets/images/Interno1" },
  { key: "menu-fundo-interno-2", path: "/assets/images/Interno2" },
  { key: "menu-fundo-interno-3", path: "/assets/images/Interno3" },
  { key: "menu-fundo-interno-4", path: "/assets/images/Interno4" }
];

const TEMPO_FUNDO_VISIVEL = 6500;
const DURACAO_TRANSICAO = 2200;

export function preloadSchoolBackdrop(scene) {
  FUNDOS_ESCOLARES.forEach(({ key, path }) => {
    if (!scene.textures.exists(key)) scene.load.image(key, path);
  });
}

/** Fundo escolar sem filtro, com o mesmo fade usado nas telas de navegação. */
export function iniciarSchoolBackdrop(scene) {
  const { width, height } = scene.cameras.main;
  const criarFundo = (key) => {
    const imagem = scene.add.image(width / 2, height / 2, key);
    const escala = Math.max(width / imagem.width, height / imagem.height);
    imagem.setScale(escala).setAlpha(0).setDepth(-10);
    return imagem;
  };

  let indiceFundo = 0;
  let fundoAtivo = criarFundo(FUNDOS_ESCOLARES[0].key).setAlpha(1);
  let proximoFundo = criarFundo(FUNDOS_ESCOLARES[1].key);
  let timer;

  const agendarTransicao = () => {
    timer = scene.time.delayedCall(TEMPO_FUNDO_VISIVEL, () => {
      const proximoIndice = (indiceFundo + 1) % FUNDOS_ESCOLARES.length;
      proximoFundo.setTexture(FUNDOS_ESCOLARES[proximoIndice].key).setAlpha(0);

      scene.tweens.add({
        targets: fundoAtivo,
        alpha: 0,
        duration: DURACAO_TRANSICAO,
        ease: "Sine.InOut"
      });
      scene.tweens.add({
        targets: proximoFundo,
        alpha: 1,
        duration: DURACAO_TRANSICAO,
        ease: "Sine.InOut",
        onComplete: () => {
          const anterior = fundoAtivo;
          fundoAtivo = proximoFundo;
          proximoFundo = anterior.setAlpha(0);
          indiceFundo = proximoIndice;
          agendarTransicao();
        }
      });
    });
  };

  agendarTransicao();
  scene.events.once("shutdown", () => timer?.remove(false));
  return { get fundoAtivo() { return fundoAtivo; } };
}
