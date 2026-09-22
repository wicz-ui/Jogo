import { CHOICES } from '../data/choicesData.js';

export class ChoiceService {
  /**
   * Verifica se uma interação específica já foi concluída no perfil.
   */
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
   * Retorna o progresso atual das interações obrigatorias da fase (ex: "1/3", "3/3")
   * e indica se todas foram resolvidas.
   */
  static obterProgressoFase(perfil, listaInteracoesObrigatorias = []) {
    if (!perfil || !Array.isArray(listaInteracoesObrigatorias) || listaInteracoesObrigatorias.length === 0) {
      return { resolvidas: 0, total: 0, texto: "0/0", faseConcluida: false };
    }

    const resolvidas = listaInteracoesObrigatorias.filter((interacaoId) =>
      this.interacaoConcluida(perfil, interacaoId)
    ).length;

    const total = listaInteracoesObrigatorias.length;

    return {
      resolvidas,
      total,
      texto: `${resolvidas}/${total}`,
      faseConcluida: resolvidas === total
    };
  }

  /**
   * Processa a escolha feita pelo jogador e atualiza os dados do perfil.
   */
  static registrarEscolha(perfil, choiceId) {
    const escolha = CHOICES[choiceId];

    if (!escolha || !perfil || typeof perfil !== "object") {
      return { sucesso: false, erro: "Escolha inválida ou não encontrada." };
    }

    if (!Array.isArray(perfil.escolhasRealizadas)) {
      perfil.escolhasRealizadas = [];
    }

    if (!perfil.pontuacao) {
      perfil.pontuacao = { cuidado: 0, conduta: 0 };
    }

    // Impede a mesma escolha exata duas vezes
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

    // Impede responder a mesma interação mais de uma vez
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