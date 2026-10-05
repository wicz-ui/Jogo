import BaseStageScene from "./BaseStageScene.js";
import { FASE1_CONFIG } from "../data/stagesData.js";

// Exportado para manter compatibilidade com consumidores do Marco 2.
export const INTERACOES_OBRIGATORIAS = FASE1_CONFIG.interacoesObrigatorias;

export class Stage1Scene extends BaseStageScene {
  constructor() {
    super("Stage1Scene");
  }

  getStageConfig() {
    return FASE1_CONFIG;
  }
}

export default Stage1Scene;
