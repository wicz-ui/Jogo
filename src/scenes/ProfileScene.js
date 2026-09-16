import Phaser from "phaser";
import {
  carregarPerfil,
  criarNovoPerfil,
  listarPerfis,
  selecionarPerfil
} from "../data/ProfileRepository.js";
import { criarBotao } from "../ui/GameButton.js";

export class ProfileScene extends Phaser.Scene {
  constructor() {
    super("ProfileScene");
    this.perfilSelecionado = null;
    this.profileButtons = [];
    this.emptyProfilesText = null;
  }

  create() {
    this.add.rectangle(640, 360, 1280, 720, 0x081a2d, 1);
    this.add
      .rectangle(640, 360, 1160, 620, 0x102b43, 1)
      .setStrokeStyle(3, 0x2f6b83, 1);

    this.add
      .text(640, 75, "PERFIL DO GUARDIÃO", {
        color: "#f4ffff",
        fontFamily: "Arial, sans-serif",
        fontSize: "38px",
        fontStyle: "bold"
      })
      .setOrigin(0.5);
    this.add
      .text(320, 145, "Crie um novo perfil local", {
        color: "#9fe6e5",
        fontFamily: "Arial, sans-serif",
        fontSize: "24px",
        fontStyle: "bold"
      })
      .setOrigin(0.5);
    this.add
      .text(920, 145, "Perfis existentes", {
        color: "#9fe6e5",
        fontFamily: "Arial, sans-serif",
        fontSize: "24px",
        fontStyle: "bold"
      })
      .setOrigin(0.5);

    this.nameInput = this.add.dom(320, 220, "input", {
      width: "430px",
      height: "50px",
      padding: "0 14px",
      border: "2px solid #7ed6df",
      borderRadius: "8px",
      background: "#f4ffff",
      color: "#102b43",
      fontSize: "21px",
      boxSizing: "border-box",
      outline: "none"
    });
    this.nameInput.node.placeholder = "Digite seu nome";
    this.nameInput.node.maxLength = 28;
    this.nameInput.node.setAttribute("aria-label", "Nome do perfil");

    criarBotao(
      this,
      320,
      305,
      "CRIAR PERFIL",
      () => this.criarPerfil(),
      { width: 300, height: 58 }
    );
    criarBotao(
      this,
      320,
      390,
      "INICIAR JOGO",
      () => this.iniciarJogo(),
      { width: 300, height: 58, color: 0x287d5b }
    );

    this.statusText = this.add
      .text(320, 485, "Selecione um perfil ou crie um novo.", {
        color: "#ffffff",
        fontFamily: "Arial, sans-serif",
        fontSize: "18px",
        align: "center",
        wordWrap: { width: 500 }
      })
      .setOrigin(0.5);

    this.add
      .rectangle(920, 370, 480, 390, 0x0b2034, 1)
      .setStrokeStyle(2, 0x315572, 1);
    this.refreshProfiles();

    criarBotao(
      this,
      640,
      650,
      "VOLTAR AO MENU",
      () => this.scene.start("MainMenuScene"),
      { width: 260, height: 52, fontSize: "19px" }
    );

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.limparInput, this);
    this.nameInput.node.focus();
  }

  limparInput() {
    this.nameInput?.destroy();
  }

  refreshProfiles() {
    this.profileButtons.forEach((button) => button.destroy(true));
    this.profileButtons = [];
    this.emptyProfilesText?.destroy();
    this.emptyProfilesText = null;

    const perfis = listarPerfis();
    if (perfis.length === 0) {
      this.emptyProfilesText = this.add
        .text(920, 370, "Nenhum perfil salvo ainda.", {
          color: "#c6e9ee",
          fontFamily: "Arial, sans-serif",
          fontSize: "20px",
          align: "center"
        })
        .setOrigin(0.5);
      return;
    }

    perfis.forEach((perfil, index) => {
      const button = criarBotao(
        this,
        920,
        210 + index * 82,
        `${perfil.nome}\nCuidado ${perfil.pontuacao.cuidado}  •  Conduta ${perfil.pontuacao.conduta}`,
        () => this.selecionar(perfil.id),
        { width: 390, height: 66, fontSize: "17px", color: 0x24536e }
      );
      this.profileButtons.push(button);
    });
  }

  criarPerfil() {
    try {
      const perfil = criarNovoPerfil(this.nameInput.node.value);
      this.perfilSelecionado = perfil;
      this.nameInput.node.value = "";
      this.statusText.setText(`Perfil ${perfil.nome} criado e selecionado.`);
      this.refreshProfiles();
    } catch (erro) {
      this.statusText.setText(erro.message);
    }
  }

  selecionar(id) {
    const perfil = selecionarPerfil(id);

    if (!perfil) {
      this.statusText.setText("Não foi possível selecionar esse perfil.");
      return;
    }

    this.perfilSelecionado = perfil;
    this.statusText.setText(`Perfil selecionado: ${perfil.nome}.`);
  }

  iniciarJogo() {
    if (!this.perfilSelecionado) {
      this.statusText.setText("Crie ou selecione um perfil antes de iniciar.");
      return;
    }

    const perfilAtualizado = carregarPerfil(this.perfilSelecionado.id) || this.perfilSelecionado;
    this.scene.start("Stage1Scene", { perfil: perfilAtualizado });
  }
}

export default ProfileScene;
