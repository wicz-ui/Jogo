/** Cria um botão clicável usando um asset que já contém seu próprio texto. */
export function criarBotaoImagem(scene, x, y, textura, largura, onClick) {
  const imagemBase = scene.add.image(0, 0, textura).setOrigin(0.5);
  const escala = largura / imagemBase.width;
  imagemBase.setScale(escala);

  const brilho = scene.add
    .image(0, 0, textura)
    .setOrigin(0.5)
    .setScale(escala)
    .setTintFill(0xffffff)
    .setAlpha(0);

  const botao = scene.add.container(x, y, [imagemBase, brilho]);
  const altura = imagemBase.height * escala;
  const escalaHover = 1.035;
  const escalaPressionada = 0.98;
  const duracaoMinimaPressao = 55;
  let emHover = false;
  let pressionado = false;
  let acaoPendente = false;
  let inicioPressionamento = 0;

  const pararAnimacoes = () => {
    scene.tweens.killTweensOf(botao);
    scene.tweens.killTweensOf(brilho);
  };

  botao.setSize(largura, altura);
  botao.setInteractive({ useHandCursor: true });

  const animarRepouso = (ativarAcao = false) => {
    pararAnimacoes();
    imagemBase.clearTint();

    scene.tweens.add({
      targets: botao,
      y,
      scaleX: emHover ? escalaHover : 1,
      scaleY: emHover ? escalaHover : 1,
      duration: 85,
      ease: "Sine.Out",
      onComplete: () => {
        if (ativarAcao) {
          acaoPendente = false;
          onClick();
        }
      }
    });

    scene.tweens.add({
      targets: brilho,
      alpha: emHover ? 0.16 : 0,
      duration: 85,
      ease: "Sine.Out"
    });
  };

  botao.on("pointerover", () => {
    emHover = true;
    if (pressionado || acaoPendente) return;
    pararAnimacoes();

    scene.tweens.add({
      targets: botao,
      scaleX: escalaHover,
      scaleY: escalaHover,
      duration: 120,
      ease: "Sine.Out"
    });
    scene.tweens.add({
      targets: brilho,
      alpha: 0.16,
      duration: 120,
      ease: "Sine.Out"
    });
  });

  botao.on("pointerout", () => {
    emHover = false;
    if (pressionado || acaoPendente) return;
    pararAnimacoes();

    scene.tweens.add({
      targets: botao,
      scaleX: 1,
      scaleY: 1,
      duration: 120,
      ease: "Sine.Out"
    });
    scene.tweens.add({
      targets: brilho,
      alpha: 0,
      duration: 120,
      ease: "Sine.Out"
    });
  });

  botao.on("pointerdown", () => {
    if (pressionado || acaoPendente) return;
    pressionado = true;
    inicioPressionamento = scene.time.now;
    pararAnimacoes();
    imagemBase.setTint(0xd8d8d8);
    brilho.setAlpha(0);

    scene.tweens.add({
      targets: botao,
      y: y + 3,
      scaleX: escalaPressionada,
      scaleY: escalaPressionada,
      duration: 55,
      ease: "Sine.Out"
    });
    scene.tweens.add({
      targets: brilho,
      alpha: 0,
      duration: 45,
      ease: "Sine.Out"
    });
  });

  botao.on("pointerup", () => {
    if (!pressionado) return;
    pressionado = false;
    acaoPendente = true;
    const tempoRestante = Math.max(
      0,
      duracaoMinimaPressao - (scene.time.now - inicioPressionamento)
    );
    scene.time.delayedCall(tempoRestante, () => animarRepouso(true));
  });

  botao.on("pointerupoutside", () => {
    if (!pressionado) return;
    pressionado = false;
    animarRepouso();
  });

  return botao;
}
