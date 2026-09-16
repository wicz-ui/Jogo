import Phaser from "phaser";
import { carregarPerfilAtivo } from "../data/ProfileRepository.js";
import { criarBotao } from "../ui/GameButton.js";

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super("MainMenuScene");
  }

  create() {
    this.add
      .rectangle(640, 360, 1280, 720, 0x081a2d, 1)
      .setDepth(-2);
    this.add
      .rectangle(640, 360, 920, 620, 0x102b43, 1)
      .setStrokeStyle(3, 0x2f6b83, 1)
      .setDepth(-1);

    this.add
      .text(640, 130, "GUARDIÕES DA ESCOLA", {
        color: "#f4ffff",
        fontFamily: "Arial, sans-serif",
        fontSize: "48px",
        fontStyle: "bold",
        align: "center"
      })
      .setOrigin(0.5);
    this.add
      .text(640, 185, "Cuidar da escola também é uma escolha.", {
        color: "#9fe6e5",
        fontFamily: "Arial, sans-serif",
        fontSize: "22px"
      })
      .setOrigin(0.5);

    const botoes = [
      ["NOVO JOGO", 270, () => this.scene.start("ProfileScene", { mode: "new" })],
      ["CONTINUAR", 345, () => this.continuarJogo()],
      ["INSTRUÇÕES", 420, () => this.mostrarAviso()],
      ["CONFIGURAÇÕES", 495, () => this.mostrarAviso()],
      ["CRÉDITOS", 570, () => this.mostrarAviso()]
    ];

    botoes.forEach(([label, y, onClick]) => {
      criarBotao(this, 640, y, label, onClick, { width: 420, height: 58 });
    });

    const perfilAtivo = carregarPerfilAtivo();
    this.feedbackText = this.add
      .text(
        640,
        645,
        perfilAtivo
          ? `Perfil ativo: ${perfilAtivo.nome}`
          : "Crie um perfil local para começar.",
        {
          color: "#c6e9ee",
          fontFamily: "Arial, sans-serif",
          fontSize: "19px",
          align: "center",
          wordWrap: { width: 800 }
        }
      )
      .setOrigin(0.5);
  }

  continuarJogo() {
    const perfil = carregarPerfilAtivo();

    if (!perfil) {
      this.feedbackText.setText("Nenhum perfil salvo encontrado.");
      return;
    }

    this.scene.start("Stage1Scene", { perfil });
  }

  mostrarAviso() {
    this.feedbackText.setText("Funcionalidade prevista para uma próxima etapa.");
  }
}

export default MainMenuScene;
