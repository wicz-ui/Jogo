import { InfoSceneBase } from "./InfoSceneBase.js";

export class SettingsScene extends InfoSceneBase {
  constructor() {
    super({
      key: "SettingsScene",
      title: "CONFIGURAÇÕES",
      sections: [
        { heading: "CONTROLES", body: "WASD / SETAS — movimentação\nE — interagir" },
        { heading: "ÁUDIO", body: "Não disponível nesta versão." },
        {
          heading: "EXIBIÇÃO",
          body: "A escala se ajusta à janela; o formato do jogo\npermanece em 16:9."
        },
        { heading: "PERFIL", body: "O progresso é salvo localmente neste dispositivo." },
        { heading: "VERSÃO", body: "Protótipo / MVP acadêmico — Guardiões da Escola." }
      ]
    });
  }
}

export default SettingsScene;
