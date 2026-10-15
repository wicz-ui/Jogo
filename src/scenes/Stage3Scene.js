import BaseStageScene from "./BaseStageScene.js";
import { FASE3_CONFIG } from "../data/stagesData.js";

export const INTERACOES_OBRIGATORIAS = FASE3_CONFIG.interacoesObrigatorias;

export class Stage3Scene extends BaseStageScene {
  constructor() {
    super("Stage3Scene");
  }

  getStageConfig() {
    return FASE3_CONFIG;
  }
}

export default Stage3Scene;
