import { CHOICES } from '../data/choicesData.js';

export class ChoiceService {
  /**
   * Processa a escolha feita pelo jogador e atualiza os dados do perfil.
   * @param {Object} perfil Objeto do perfil atual
   * @param {string} choiceId Identificador da escolha feita
   * @returns {Object} Resultado do processamento
   */
  static registrarEscolha(perfil, choiceId) {
    const escolha = CHOICES[choiceId];

    if (!escolha) {
      return { sucesso: false, erro: "Escolha inválida ou não encontrada." };
    }

    // Inicializa a lista de escolhas no perfil se ainda não existir
    if (!perfil.escolhasRealizadas) {
      perfil.escolhasRealizadas = [];
    }

    // Regra de Negócio: Impedir escolhas duplicadas
    if (perfil.escolhasRealizadas.includes(choiceId)) {
      return { 
        sucesso: false, 
        erro: "Esta ação já foi realizada anteriormente.",
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