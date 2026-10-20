import { InfoSceneBase } from "./InfoSceneBase.js";

export class CreditsScene extends InfoSceneBase {
  constructor() {
    super({
      key: "CreditsScene",
      title: "CRÉDITOS",
      sections: [
        { heading: "PROJETO", body: "Guardiões da Escola\nProjeto acadêmico — MVP." },
        { heading: "EQUIPE", body: "Equipe acadêmica do projeto." },
        { heading: "DESENVOLVIDO COM", body: "Phaser 3 • JavaScript • Vite" },
        { heading: "ARTE", body: "Ambientes e elementos em pixel art." }
      ]
    });
  }
}

export default CreditsScene;
