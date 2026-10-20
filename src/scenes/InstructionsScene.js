import { InfoSceneBase } from "./InfoSceneBase.js";

export class InstructionsScene extends InfoSceneBase {
  constructor() {
    super({
      key: "InstructionsScene",
      title: "INSTRUÇÕES",
      sections: [
        { heading: "MOVIMENTAÇÃO", body: "WASD ou SETAS para andar." },
        {
          heading: "INTERAÇÃO",
          body: "Aproxime-se dos objetos e pressione E quando\naparecer a placa “[E] Interagir”."
        },
        {
          heading: "ESCOLHAS",
          body: "Cada situação tem duas alternativas. Suas decisões\nalteram Cuidado, Conduta e podem causar Danos."
        },
        {
          heading: "OBJETIVO",
          body: "Resolva as três situações de cada fase e avance pela escola."
        },
        {
          heading: "PROGRESSÃO",
          body: "As decisões ficam salvas no perfil local. Ações responsáveis\nconservam a escola e melhoram seu resultado final."
        }
      ]
    });
  }
}

export default InstructionsScene;
