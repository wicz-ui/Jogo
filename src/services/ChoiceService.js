import { CHOICES } from '../data/choicesData.js';

export class ChoiceService {
  static interacaoConcluida(perfil, interacaoId) {
    if (!perfil || !Array.isArray(perfil.escolhasRealizadas)) {
      return false;
    }

    return perfil.escolhasRealizadas.some((registro) => {
      const choiceId = typeof registro === "string" ? registro : registro?.choiceId;
      return CHOICES[choiceId]?.interacaoId === interacaoId;
    });
  }

  /**
   * Processa a escolha feita pelo jogador e atualiza os dados do perfil.
   * @param {Object} perfil Objeto do perfil atual
   * @param {string} choiceId Identificador da escolha feita
   * @returns {Object} Resultado do processamento
   */
  static registrarEscolha(perfil, choiceId) {
    const escolha = CHOICES[choiceId];

    if (!escolha || !perfil || typeof perfil !== "object") {
      return { sucesso: false, erro: "Escolha inválida ou não encontrada." };
    }

    // Inicializa a lista de escolhas no perfil se ainda não existir
    if (!Array.isArray(perfil.escolhasRealizadas)) {
      perfil.escolhasRealizadas = [];
    }

    if (!perfil.pontuacao) {
      perfil.pontuacao = {};
    }

    // Regra de Negócio: Impedir escolhas duplicadas
    const escolhaJaRegistrada = perfil.escolhasRealizadas.some((registro) => {
      const idRegistrado = typeof registro === "string" ? registro : registro?.choiceId;
      return idRegistrado === choiceId;
    });

    if (escolhaJaRegistrada) {
      return { 
        sucesso: false, 
        erro: "Esta ação já foi realizada anteriormente.",
        perfil 
      };
    }

    // As alternativas do computador pertencem à mesma interação.
    if (escolha.interacaoId && this.interacaoConcluida(perfil, escolha.interacaoId)) {
      return {
        sucesso: false,
        erro: "Esta interação já foi resolvida anteriormente.",
        interacaoConcluida: true,
        perfil
      };
    }

    // Aplicação das consequências na pontuação
    perfil.pontuacao.cuidado = (perfil.pontuacao.cuidado || 0) + escolha.cuidado;
    perfil.pontuacao.conduta = (perfil.pontuacao.conduta || 0) + escolha.conduta;

    // Registrar ação concluída
    perfil.escolhasRealizadas.push(choiceId);

    return {
      sucesso: true,
      mensagem: escolha.mensagem,
      impacto: { cuidado: escolha.cuidado, conduta: escolha.conduta },
      perfil
    };
  }
}
