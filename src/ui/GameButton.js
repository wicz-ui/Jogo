const CORES = {
  normal: 0x176b87,
  hover: 0x218eaa,
  pressionado: 0x0f526a,
  borda: 0x7ed6df,
  texto: "#f4ffff"
};

/** Cria um botão visual simples e reutilizável para as cenas. */
export function criarBotao(scene, x, y, label, onClick, opcoes = {}) {
  const largura = opcoes.width || 320;
  const altura = opcoes.height || 62;
  const fundo = scene.add
    .rectangle(0, 0, largura, altura, opcoes.color || CORES.normal, 1)
    .setStrokeStyle(2, opcoes.borderColor || CORES.borda, 1);
  const texto = scene.add
    .text(0, 0, label, {
      color: opcoes.textColor || CORES.texto,
      fontFamily: "Arial, sans-serif",
      fontSize: opcoes.fontSize || "22px",
      fontStyle: opcoes.bold === false ? "normal" : "bold",
      align: "center",
      wordWrap: { width: largura - 28 }
    })
    .setOrigin(0.5);
  const botao = scene.add.container(x, y, [fundo, texto]);

  botao.setSize(largura, altura);
  botao.setInteractive({ useHandCursor: true });
  botao.on("pointerover", () => fundo.setFillStyle(CORES.hover));
  botao.on("pointerout", () => fundo.setFillStyle(opcoes.color || CORES.normal));
  botao.on("pointerdown", () => {
    fundo.setFillStyle(CORES.pressionado);
    onClick();
  });

  botao.setLabel = (novoLabel) => texto.setText(novoLabel);
  botao.setButtonVisible = (visivel) => {
    botao.setVisible(visivel);
    if (visivel) {
      botao.setInteractive({ useHandCursor: true });
    } else {
      botao.disableInteractive();
    }
  };

  return botao;
}
