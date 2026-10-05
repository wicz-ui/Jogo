import BaseStageScene from "./BaseStageScene.js";
import { FASE2_CONFIG } from "../data/stagesData.js";

export const INTERACOES_OBRIGATORIAS = FASE2_CONFIG.interacoesObrigatorias;

export class Stage2Scene extends BaseStageScene {
  constructor() {
    super("Stage2Scene");
  }

  getStageConfig() {
    return FASE2_CONFIG;
  }
}

export default Stage2Scene;
