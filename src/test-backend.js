import assert from "node:assert/strict";
import {
  carregarPerfil,
  criarNovoPerfil,
  salvarPerfil
} from "./data/ProfileRepository.js";
import { ChoiceService } from "./services/ChoiceService.js";
import { ProgressionService } from "./services/ProgressionService.js";
import { EndingService } from "./services/EndingService.js";
import { LISTA_FASES } from "./data/stagesData.js";

const INTERACOES_OBRIGATORIAS = [
  "computador_01",
  "lixo_01",
  "equipamento_01"
];

function criarPerfilTeste(nome = "João") {
  return {
    id: `perfil-teste-${nome}`,
    nome,
    pontuacao: { cuidado: 0, conduta: 0, danos: 0 },
    progresso: { faseAtual: 1, fasesConcluidas: [] },
    escolhasRealizadas: []
  };
}

function registrarTodasAsEscolhas(perfil) {
  [
    "desligar_computador",
    "recolher_lixo",
    "guardar_equipamento"
  ].forEach((choiceId) => {
    const resultado = ChoiceService.registrarEscolha(perfil, choiceId);
    assert.equal(resultado.sucesso, true);
  });
}

const perfilTeste = criarPerfilTeste();

console.log("=== Teste 1: escolha positiva ===");
const resultado = ChoiceService.registrarEscolha(perfilTeste, "desligar_computador");
assert.equal(resultado.sucesso, true);
assert.equal(perfilTeste.pontuacao.cuidado, 10);
assert.equal(perfilTeste.pontuacao.conduta, 8);
console.log("OK: +10 cuidado e +8 conduta.");

console.log("=== Teste 2: repetir a mesma escolha ===");
const resultadoDuplicado = ChoiceService.registrarEscolha(perfilTeste, "desligar_computador");
assert.equal(resultadoDuplicado.sucesso, false);
assert.equal(perfilTeste.pontuacao.cuidado, 10);
assert.equal(perfilTeste.pontuacao.conduta, 8);
console.log("OK: repetição rejeitada sem alterar a pontuação.");

console.log("=== Teste 3: alternativa da mesma interação ===");
const resultadoAlternativo = ChoiceService.registrarEscolha(perfilTeste, "ignorar_computador");
assert.equal(resultadoAlternativo.sucesso, false);
assert.equal(resultadoAlternativo.interacaoConcluida, true);
assert.equal(perfilTeste.pontuacao.conduta, 8);
console.log("OK: alternativa mutuamente exclusiva rejeitada.");

console.log("=== Teste 4: ProgressionService sem duplicar fase ===");
ProgressionService.concluirFase(perfilTeste, 1);
ProgressionService.concluirFase(perfilTeste, 1);
assert.deepEqual(perfilTeste.progresso.fasesConcluidas, [1]);
assert.equal(perfilTeste.progresso.faseAtual, 2);
console.log("OK: fase concluída aparece uma única vez.");

console.log("=== Teste 5: escolha negativa ===");
const perfilNegativo = criarPerfilTeste("Perfil negativo");
const resultadoNegativo = ChoiceService.registrarEscolha(perfilNegativo, "ignorar_computador");
assert.equal(resultadoNegativo.sucesso, true);
assert.equal(perfilNegativo.pontuacao.cuidado, 0);
assert.equal(perfilNegativo.pontuacao.conduta, -5);
console.log("OK: 0 cuidado e -5 conduta.");

console.log("=== Teste 6: novos perfis sem referências compartilhadas ===");
const primeiroPerfil = criarNovoPerfil("Primeiro");
const segundoPerfil = criarNovoPerfil("Segundo");
assert.notStrictEqual(primeiroPerfil.pontuacao, segundoPerfil.pontuacao);
assert.notStrictEqual(primeiroPerfil.progresso, segundoPerfil.progresso);
assert.notStrictEqual(primeiroPerfil.escolhasRealizadas, segundoPerfil.escolhasRealizadas);
console.log("OK: pontuação, progresso e escolhas são independentes.");

console.log("=== Teste 7: recolher lixo ===");
const perfilLixo = criarPerfilTeste("Lixo positivo");
const resultadoLixo = ChoiceService.registrarEscolha(perfilLixo, "recolher_lixo");
assert.equal(resultadoLixo.sucesso, true);
assert.equal(perfilLixo.pontuacao.cuidado, 10);
assert.equal(perfilLixo.pontuacao.conduta, 8);
console.log("OK: recolher lixo gera +10 cuidado e +8 conduta.");

console.log("=== Teste 8: alternativa do lixo bloqueada ===");
const resultadoLixoAlternativo = ChoiceService.registrarEscolha(perfilLixo, "deixar_lixo");
assert.equal(resultadoLixoAlternativo.sucesso, false);
assert.equal(resultadoLixoAlternativo.interacaoConcluida, true);
assert.equal(perfilLixo.pontuacao.conduta, 8);
console.log("OK: deixar lixo foi bloqueado após resolver a interação.");

console.log("=== Teste 9: guardar equipamento ===");
const perfilEquipamento = criarPerfilTeste("Equipamento positivo");
const resultadoEquipamento = ChoiceService.registrarEscolha(
  perfilEquipamento,
  "guardar_equipamento"
);
assert.equal(resultadoEquipamento.sucesso, true);
assert.equal(perfilEquipamento.pontuacao.cuidado, 10);
assert.equal(perfilEquipamento.pontuacao.conduta, 8);
console.log("OK: guardar equipamento gera +10 cuidado e +8 conduta.");

console.log("=== Teste 10: alternativa do equipamento bloqueada ===");
const resultadoEquipamentoAlternativo = ChoiceService.registrarEscolha(
  perfilEquipamento,
  "usar_equipamento_incorretamente"
);
assert.equal(resultadoEquipamentoAlternativo.sucesso, false);
assert.equal(resultadoEquipamentoAlternativo.interacaoConcluida, true);
assert.equal(perfilEquipamento.pontuacao.conduta, 8);
console.log("OK: uso inadequado foi bloqueado após resolver a interação.");

console.log("=== Teste 11: progresso 0/3, 1/3, 2/3 e 3/3 ===");
const perfilProgresso = criarPerfilTeste("Progresso");
let progresso = ChoiceService.obterProgressoFase(perfilProgresso, INTERACOES_OBRIGATORIAS);
assert.deepEqual(progresso, { resolvidas: 0, total: 3, texto: "0/3", faseConcluida: false });

ChoiceService.registrarEscolha(perfilProgresso, "desligar_computador");
progresso = ChoiceService.obterProgressoFase(perfilProgresso, INTERACOES_OBRIGATORIAS);
assert.equal(progresso.texto, "1/3");
assert.equal(progresso.faseConcluida, false);

ChoiceService.registrarEscolha(perfilProgresso, "recolher_lixo");
progresso = ChoiceService.obterProgressoFase(perfilProgresso, INTERACOES_OBRIGATORIAS);
assert.equal(progresso.texto, "2/3");
assert.equal(progresso.faseConcluida, false);

ChoiceService.registrarEscolha(perfilProgresso, "guardar_equipamento");
progresso = ChoiceService.obterProgressoFase(perfilProgresso, INTERACOES_OBRIGATORIAS);
assert.equal(progresso.texto, "3/3");
console.log("OK: progresso evolui corretamente de 0/3 até 3/3.");

console.log("=== Teste 12: 3/3 conclui a fase ===");
assert.equal(progresso.resolvidas, 3);
assert.equal(progresso.total, 3);
assert.equal(progresso.faseConcluida, true);
console.log("OK: 3/3 retorna faseConcluida = true.");

console.log("=== Teste 13: ProgressionService libera a fase seguinte ===");
const perfilProgressao = criarPerfilTeste("Progressão");
ProgressionService.concluirFase(perfilProgressao, 1);
assert.equal(perfilProgressao.progresso.faseAtual, 2);
assert.deepEqual(perfilProgressao.progresso.fasesConcluidas, [1]);
console.log("OK: faseAtual = 2 e fasesConcluidas = [1].");

console.log("=== Teste 14: persistência após concluir a fase ===");
const perfilPersistido = criarNovoPerfil("Persistido");
registrarTodasAsEscolhas(perfilPersistido);
ProgressionService.concluirFase(perfilPersistido, 1);
const salvo = salvarPerfil(perfilPersistido);
const recarregado = carregarPerfil(salvo.id);
assert.equal(recarregado.progresso.faseAtual, 2);
assert.deepEqual(recarregado.progresso.fasesConcluidas, [1]);
assert.equal(recarregado.pontuacao.cuidado, 30);
assert.equal(recarregado.pontuacao.conduta, 24);
assert.deepEqual(recarregado.escolhasRealizadas, [
  "desligar_computador",
  "recolher_lixo",
  "guardar_equipamento"
]);
console.log("OK: conclusão, pontuação e escolhas permanecem após salvar/carregar.");

console.log("=== Teste 15: perfis João e Maria têm progresso independente ===");
const joao = criarNovoPerfil("João Marco 2");
const maria = criarNovoPerfil("Maria Marco 2");
registrarTodasAsEscolhas(joao);
salvarPerfil(joao);

const progressoJoao = ChoiceService.obterProgressoFase(joao, INTERACOES_OBRIGATORIAS);
const progressoMaria = ChoiceService.obterProgressoFase(maria, INTERACOES_OBRIGATORIAS);
assert.equal(progressoJoao.texto, "3/3");
assert.equal(progressoMaria.texto, "0/3");
assert.equal(joao.pontuacao.cuidado, 30);
assert.equal(joao.pontuacao.conduta, 24);
assert.equal(maria.pontuacao.cuidado, 0);
assert.equal(maria.pontuacao.conduta, 0);
assert.deepEqual(maria.escolhasRealizadas, []);
console.log("OK: João tem 3/3 e Maria permanece em 0/3 sem compartilhar pontuação.");

console.log("=== Teste 16: acesso inicial às fases ===");
const perfilNovoMarco3 = criarPerfilTeste("Novo Marco 3");
assert.equal(ProgressionService.podeAcessarFase(perfilNovoMarco3, 1), true);
assert.equal(ProgressionService.podeAcessarFase(perfilNovoMarco3, 2), false);
assert.equal(ProgressionService.podeAcessarFase(perfilNovoMarco3, 3), false);
assert.equal(ProgressionService.obterStatusFase(perfilNovoMarco3, 1), "disponivel");
assert.equal(ProgressionService.obterStatusFase(perfilNovoMarco3, 2), "bloqueada");
assert.equal(
  ProgressionService.obterStatusFase(perfilNovoMarco3, 3),
  "bloqueada"
);
console.log("OK: Fase 1 disponível; Fases 2 e 3 bloqueadas.");

console.log("=== Teste 17: conclusão da Fase 1 libera a Fase 2 ===");
const perfilFase2Liberada = criarPerfilTeste("Fase 2 liberada");
ProgressionService.concluirFase(perfilFase2Liberada, 1);
assert.equal(ProgressionService.podeAcessarFase(perfilFase2Liberada, 2), true);
assert.equal(
  ProgressionService.obterStatusFase(perfilFase2Liberada, 1),
  "concluida"
);
assert.equal(
  ProgressionService.obterStatusFase(perfilFase2Liberada, 2),
  "disponivel"
);
assert.equal(
  ProgressionService.obterStatusFase(perfilFase2Liberada, 3),
  "bloqueada"
);
console.log("OK: Fase 2 fica disponível somente após a Fase 1.");

console.log("=== Teste 18: escolhas positivas da Fase 2 ===");
const perfilFase2Positivo = criarPerfilTeste("Fase 2 positiva");
[
  "fase2_recolher_lixo",
  "fase2_sinalizar_liquido",
  "fase2_ajudar_colega"
].forEach((choiceId) => {
  assert.equal(ChoiceService.registrarEscolha(perfilFase2Positivo, choiceId).sucesso, true);
});
assert.equal(perfilFase2Positivo.pontuacao.cuidado, 26);
assert.equal(perfilFase2Positivo.pontuacao.conduta, 28);
console.log("OK: Fase 2 positiva gera +26 cuidado e +28 conduta.");

console.log("=== Teste 19: escolhas negativas da Fase 2 ===");
const perfilFase2Negativo = criarPerfilTeste("Fase 2 negativa");
[
  "fase2_ignorar_lixo",
  "fase2_ignorar_liquido",
  "fase2_ignorar_desrespeito"
].forEach((choiceId) => {
  assert.equal(ChoiceService.registrarEscolha(perfilFase2Negativo, choiceId).sucesso, true);
});
assert.equal(perfilFase2Negativo.pontuacao.cuidado, 0);
assert.equal(perfilFase2Negativo.pontuacao.conduta, -19);
console.log("OK: Fase 2 negativa gera 0 cuidado e -19 conduta.");

console.log("=== Teste 20: progresso independente da Fase 2 ===");
const perfilProgressoFase2 = criarPerfilTeste("Progresso Fase 2");
const interacoesFase2 = [
  "fase2_lixo_01",
  "fase2_liquido_01",
  "fase2_respeito_01"
];
let progressoFase2 = ChoiceService.obterProgressoFase(
  perfilProgressoFase2,
  interacoesFase2
);
assert.equal(progressoFase2.texto, "0/3");
ChoiceService.registrarEscolha(perfilProgressoFase2, "fase2_recolher_lixo");
assert.equal(
  ChoiceService.obterProgressoFase(perfilProgressoFase2, interacoesFase2).texto,
  "1/3"
);
ChoiceService.registrarEscolha(perfilProgressoFase2, "fase2_sinalizar_liquido");
assert.equal(
  ChoiceService.obterProgressoFase(perfilProgressoFase2, interacoesFase2).texto,
  "2/3"
);
ChoiceService.registrarEscolha(perfilProgressoFase2, "fase2_ajudar_colega");
progressoFase2 = ChoiceService.obterProgressoFase(perfilProgressoFase2, interacoesFase2);
assert.deepEqual(progressoFase2, {
  resolvidas: 3,
  total: 3,
  texto: "3/3",
  faseConcluida: true
});
console.log("OK: Fase 2 evolui de 0/3 até 3/3.");

console.log("=== Teste 21: concluir a Fase 2 atualiza a progressão ===");
const perfilCampanha = criarPerfilTeste("Campanha Marco 3");
ProgressionService.concluirFase(perfilCampanha, 1);
ProgressionService.concluirFase(perfilCampanha, 2);
assert.equal(perfilCampanha.progresso.faseAtual, 3);
assert.deepEqual(perfilCampanha.progresso.fasesConcluidas, [1, 2]);
assert.equal(ProgressionService.obterStatusFase(perfilCampanha, 2), "concluida");
assert.equal(ProgressionService.obterStatusFase(perfilCampanha, 3), "disponivel");
console.log("OK: faseAtual = 3 e fasesConcluidas = [1, 2].");

console.log("=== Teste 22: persistência da campanha até a Fase 2 ===");
const perfilCampanhaSalva = criarPerfilTeste("Campanha salva");
registrarTodasAsEscolhas(perfilCampanhaSalva);
ProgressionService.concluirFase(perfilCampanhaSalva, 1);
[
  "fase2_recolher_lixo",
  "fase2_sinalizar_liquido",
  "fase2_ajudar_colega"
].forEach((choiceId) => ChoiceService.registrarEscolha(perfilCampanhaSalva, choiceId));
ProgressionService.concluirFase(perfilCampanhaSalva, 2);
const campanhaSalva = salvarPerfil(perfilCampanhaSalva);
const campanhaRecarregada = carregarPerfil(campanhaSalva.id);
assert.equal(campanhaRecarregada.progresso.faseAtual, 3);
assert.deepEqual(campanhaRecarregada.progresso.fasesConcluidas, [1, 2]);
assert.equal(campanhaRecarregada.pontuacao.cuidado, 56);
assert.equal(campanhaRecarregada.pontuacao.conduta, 52);
assert.equal(campanhaRecarregada.escolhasRealizadas.length, 6);
console.log("OK: escolhas, pontuação e conclusão das duas fases permanecem salvas.");

console.log("=== Teste 23: compatibilidade com save do Marco 2 ===");
const saveMarco2 = {
  id: "save-compatibilidade-marco-2",
  nome: "Save antigo",
  pontuacao: { cuidado: 30, conduta: 24, danos: 0 },
  progresso: { faseAtual: 2, fasesConcluidas: [1] },
  escolhasRealizadas: [
    "desligar_computador",
    "recolher_lixo",
    "guardar_equipamento"
  ]
};
salvarPerfil(saveMarco2);
const saveMarco2Recarregado = carregarPerfil(saveMarco2.id);
assert.equal(ChoiceService.interacaoConcluida(saveMarco2Recarregado, "computador_01"), true);
assert.equal(ChoiceService.obterProgressoFase(
  saveMarco2Recarregado,
  INTERACOES_OBRIGATORIAS
).texto, "3/3");
assert.equal(ProgressionService.podeAcessarFase(saveMarco2Recarregado, 2), true);
assert.deepEqual(saveMarco2Recarregado.progresso.fasesConcluidas, [1]);
console.log("OK: save do Marco 2 continua legível e libera a Fase 2.");

console.log("=== Teste 24: perfis independentes também na Fase 2 ===");
const perfilA = criarPerfilTeste("Perfil A Marco 3");
const perfilB = criarPerfilTeste("Perfil B Marco 3");
ProgressionService.concluirFase(perfilA, 1);
ProgressionService.concluirFase(perfilB, 1);
[
  "fase2_recolher_lixo",
  "fase2_sinalizar_liquido",
  "fase2_ajudar_colega"
].forEach((choiceId) => ChoiceService.registrarEscolha(perfilA, choiceId));
assert.equal(ChoiceService.obterProgressoFase(perfilA, interacoesFase2).texto, "3/3");
assert.equal(ChoiceService.obterProgressoFase(perfilB, interacoesFase2).texto, "0/3");
assert.equal(perfilA.pontuacao.cuidado, 26);
assert.equal(perfilB.pontuacao.cuidado, 0);
console.log("OK: o progresso da Fase 2 não é compartilhado entre perfis.");

console.log("=== Teste 25: replay não duplica pontos nem fases concluídas ===");
const perfilReplay = criarPerfilTeste("Replay Marco 3");
ProgressionService.concluirFase(perfilReplay, 1);
[
  "fase2_recolher_lixo",
  "fase2_sinalizar_liquido",
  "fase2_ajudar_colega"
].forEach((choiceId) => ChoiceService.registrarEscolha(perfilReplay, choiceId));
ProgressionService.concluirFase(perfilReplay, 2);
const pontuacaoAntesReplay = { ...perfilReplay.pontuacao };
const escolhaRepetida = ChoiceService.registrarEscolha(perfilReplay, "fase2_recolher_lixo");
ProgressionService.concluirFase(perfilReplay, 2);
assert.equal(escolhaRepetida.sucesso, false);
assert.deepEqual(perfilReplay.pontuacao, pontuacaoAntesReplay);
assert.deepEqual(perfilReplay.progresso.fasesConcluidas, [1, 2]);
console.log("OK: repetir a Fase 2 não altera pontuação nem duplica a conclusão.");

console.log("=== Teste 26: acesso sequencial à Fase 3 ===");
const perfilAcessoFase3 = criarPerfilTeste("Acesso Fase 3");
assert.equal(ProgressionService.obterStatusFase(perfilAcessoFase3, 3), "bloqueada");
ProgressionService.concluirFase(perfilAcessoFase3, 1);
assert.equal(ProgressionService.obterStatusFase(perfilAcessoFase3, 3), "bloqueada");
ProgressionService.concluirFase(perfilAcessoFase3, 2);
assert.equal(ProgressionService.obterStatusFase(perfilAcessoFase3, 3), "disponivel");
console.log("OK: Fase 3 só libera depois de concluir Fases 1 e 2.");

console.log("=== Teste 27: impedir conclusão fora de ordem ===");
const perfilForaDeOrdem = criarPerfilTeste("Fora de ordem");
assert.equal(ProgressionService.concluirFase(perfilForaDeOrdem, 2).sucesso, false);
assert.equal(ProgressionService.concluirFase(perfilForaDeOrdem, 3).sucesso, false);
assert.deepEqual(perfilForaDeOrdem.progresso.fasesConcluidas, []);
ProgressionService.concluirFase(perfilForaDeOrdem, 1);
assert.equal(ProgressionService.concluirFase(perfilForaDeOrdem, 3).sucesso, false);
assert.deepEqual(perfilForaDeOrdem.progresso.fasesConcluidas, [1]);
console.log("OK: o serviço recusa concluir fase sem completar as anteriores.");

console.log("=== Teste 28: máquina positiva ===");
const maquinaPositiva = criarPerfilTeste("Máquina positiva");
const resultadoMaquinaPositiva = ChoiceService.registrarEscolha(
  maquinaPositiva,
  "fase3_seguir_procedimento"
);
assert.equal(resultadoMaquinaPositiva.sucesso, true);
assert.deepEqual(maquinaPositiva.pontuacao, { cuidado: 10, conduta: 8, danos: 0 });
assert.equal(resultadoMaquinaPositiva.impacto.danos, 0);
console.log("OK: +10 cuidado, +8 conduta e 0 danos.");

console.log("=== Teste 29: máquina negativa ===");
const maquinaNegativa = criarPerfilTeste("Máquina negativa");
assert.equal(
  ChoiceService.registrarEscolha(
    maquinaNegativa,
    "fase3_usar_maquina_incorretamente"
  ).sucesso,
  true
);
assert.deepEqual(maquinaNegativa.pontuacao, { cuidado: 0, conduta: -15, danos: 1 });
console.log("OK: 0 cuidado, -15 conduta e +1 dano.");

console.log("=== Teste 30: recusar proposta arriscada ===");
const riscoPositivo = criarPerfilTeste("Risco positivo");
assert.equal(ChoiceService.registrarEscolha(riscoPositivo, "fase3_recusar_risco").sucesso, true);
assert.deepEqual(riscoPositivo.pontuacao, { cuidado: 8, conduta: 10, danos: 0 });
console.log("OK: +8 cuidado, +10 conduta e 0 danos.");

console.log("=== Teste 31: aceitar proposta arriscada ===");
const riscoNegativo = criarPerfilTeste("Risco negativo");
assert.equal(ChoiceService.registrarEscolha(riscoNegativo, "fase3_aceitar_risco").sucesso, true);
assert.deepEqual(riscoNegativo.pontuacao, { cuidado: 0, conduta: -15, danos: 1 });
console.log("OK: 0 cuidado, -15 conduta e +1 dano.");

console.log("=== Teste 32: orientação do professor e exclusão mútua ===");
const respeitaOrientacao = criarPerfilTeste("Respeita orientação");
assert.equal(
  ChoiceService.registrarEscolha(respeitaOrientacao, "fase3_respeitar_orientacao").sucesso,
  true
);
assert.deepEqual(respeitaOrientacao.pontuacao, { cuidado: 8, conduta: 10, danos: 0 });
const alternativaOrientacao = ChoiceService.registrarEscolha(
  respeitaOrientacao,
  "fase3_desrespeitar_orientacao"
);
assert.equal(alternativaOrientacao.sucesso, false);
assert.equal(alternativaOrientacao.interacaoConcluida, true);
const desrespeitaOrientacao = criarPerfilTeste("Desrespeita orientação");
assert.equal(
  ChoiceService.registrarEscolha(
    desrespeitaOrientacao,
    "fase3_desrespeitar_orientacao"
  ).sucesso,
  true
);
assert.deepEqual(desrespeitaOrientacao.pontuacao, { cuidado: 0, conduta: -10, danos: 0 });
console.log("OK: as duas consequências funcionam e a alternativa oposta é bloqueada.");

console.log("=== Teste 33: progresso 0/3 até 3/3 e escolhas únicas ===");
const interacoesFase3 = [
  "fase3_maquina_01",
  "fase3_risco_01",
  "fase3_professor_01"
];
const perfilProgressoFase3 = criarPerfilTeste("Progresso Fase 3");
let progressoFase3 = ChoiceService.obterProgressoFase(
  perfilProgressoFase3,
  interacoesFase3
);
assert.equal(progressoFase3.texto, "0/3");
ChoiceService.registrarEscolha(perfilProgressoFase3, "fase3_seguir_procedimento");
assert.equal(
  ChoiceService.obterProgressoFase(perfilProgressoFase3, interacoesFase3).texto,
  "1/3"
);
ChoiceService.registrarEscolha(perfilProgressoFase3, "fase3_recusar_risco");
assert.equal(
  ChoiceService.obterProgressoFase(perfilProgressoFase3, interacoesFase3).texto,
  "2/3"
);
ChoiceService.registrarEscolha(perfilProgressoFase3, "fase3_respeitar_orientacao");
progressoFase3 = ChoiceService.obterProgressoFase(perfilProgressoFase3, interacoesFase3);
assert.equal(progressoFase3.texto, "3/3");
assert.equal(progressoFase3.faseConcluida, true);
assert.equal(
  ChoiceService.registrarEscolha(perfilProgressoFase3, "fase3_desrespeitar_orientacao").sucesso,
  false
);
assert.equal(
  ChoiceService.obterProgressoFase(perfilProgressoFase3, interacoesFase3).texto,
  "3/3"
);
console.log("OK: progresso chega a 3/3 e interações resolvidas não aceitam outra resposta.");

console.log("=== Teste 34: conclusão da campanha ===");
const perfilCampanhaCompleta = criarPerfilTeste("Campanha completa");
assert.equal(ProgressionService.concluirFase(perfilCampanhaCompleta, 1), perfilCampanhaCompleta);
assert.equal(ProgressionService.concluirFase(perfilCampanhaCompleta, 2), perfilCampanhaCompleta);
assert.equal(ProgressionService.concluirFase(perfilCampanhaCompleta, 3), perfilCampanhaCompleta);
assert.equal(perfilCampanhaCompleta.progresso.faseAtual, 4);
assert.deepEqual(perfilCampanhaCompleta.progresso.fasesConcluidas, [1, 2, 3]);
assert.equal(perfilCampanhaCompleta.progresso.campanhaConcluida, true);
assert.equal(ProgressionService.obterStatusFase(perfilCampanhaCompleta, 3), "concluida");
console.log("OK: faseAtual = 4, fasesConcluidas = [1, 2, 3] e campanha concluída.");

console.log("=== Teste 35: desfecho Guardião ===");
assert.equal(
  EndingService.calcularDesfecho({ pontuacao: { conduta: 80, danos: 0 } }).id,
  "guardiao"
);
console.log("OK: conduta 80 e danos 0 resultam em Guardião.");

console.log("=== Teste 36: desfecho Aprendeu e Reparou ===");
assert.equal(
  EndingService.calcularDesfecho({ pontuacao: { conduta: 20, danos: 1 } }).id,
  "reparacao"
);
console.log("OK: conduta 20 e danos 1 resultam em Aprendeu e Reparou.");

console.log("=== Teste 37: desfecho Responsabilização por conduta ===");
assert.equal(
  EndingService.calcularDesfecho({ pontuacao: { conduta: -30, danos: 0 } }).id,
  "responsabilizacao"
);
console.log("OK: conduta abaixo de -20 resulta em Responsabilização.");

console.log("=== Teste 38: desfecho Responsabilização por danos ===");
assert.equal(
  EndingService.calcularDesfecho({ pontuacao: { conduta: 30, danos: 2 } }).id,
  "responsabilizacao"
);
console.log("OK: dois ou mais danos resultam em Responsabilização.");

console.log("=== Teste 39: campanha completa positiva ===");
const joaoMarco4 = criarPerfilTeste("João Marco 4");
registrarTodasAsEscolhas(joaoMarco4);
ProgressionService.concluirFase(joaoMarco4, 1);
[
  "fase2_recolher_lixo",
  "fase2_sinalizar_liquido",
  "fase2_ajudar_colega"
].forEach((choiceId) => ChoiceService.registrarEscolha(joaoMarco4, choiceId));
ProgressionService.concluirFase(joaoMarco4, 2);
[
  "fase3_seguir_procedimento",
  "fase3_recusar_risco",
  "fase3_respeitar_orientacao"
].forEach((choiceId) => ChoiceService.registrarEscolha(joaoMarco4, choiceId));
ProgressionService.concluirFase(joaoMarco4, 3);
joaoMarco4.desfecho = EndingService.calcularDesfecho(joaoMarco4).id;
assert.equal(joaoMarco4.pontuacao.cuidado, 82);
assert.equal(joaoMarco4.pontuacao.conduta, 80);
assert.equal(joaoMarco4.pontuacao.danos, 0);
assert.equal(joaoMarco4.desfecho, "guardiao");
assert.equal(joaoMarco4.progresso.campanhaConcluida, true);
console.log("OK: João termina com 82/80/0 e o final Guardião.");

console.log("=== Teste 40: campanha mista conclui e calcula reparação ===");
const perfilMisto = criarPerfilTeste("Campanha mista");
registrarTodasAsEscolhas(perfilMisto);
ProgressionService.concluirFase(perfilMisto, 1);
[
  "fase2_recolher_lixo",
  "fase2_ignorar_liquido",
  "fase2_ajudar_colega"
].forEach((choiceId) => ChoiceService.registrarEscolha(perfilMisto, choiceId));
ProgressionService.concluirFase(perfilMisto, 2);
[
  "fase3_seguir_procedimento",
  "fase3_aceitar_risco",
  "fase3_respeitar_orientacao"
].forEach((choiceId) => ChoiceService.registrarEscolha(perfilMisto, choiceId));
assert.equal(
  ChoiceService.obterProgressoFase(perfilMisto, interacoesFase3).texto,
  "3/3"
);
assert.equal(
  ChoiceService.obterProgressoFase(perfilMisto, INTERACOES_OBRIGATORIAS).texto,
  "3/3"
);
assert.equal(
  ChoiceService.obterProgressoFase(perfilMisto, interacoesFase2).texto,
  "3/3"
);
ProgressionService.concluirFase(perfilMisto, 3);
assert.equal(perfilMisto.progresso.campanhaConcluida, true);
assert.equal(EndingService.calcularDesfecho(perfilMisto).id, "reparacao");
console.log("OK: escolhas mistas completam 3/3 nas fases e produzem final de reparação.");

console.log("=== Teste 41: danos acumulados levam à responsabilização ===");
const perfilDanos = criarPerfilTeste("Campanha com danos");
registrarTodasAsEscolhas(perfilDanos);
ProgressionService.concluirFase(perfilDanos, 1);
[
  "fase2_recolher_lixo",
  "fase2_sinalizar_liquido",
  "fase2_ajudar_colega"
].forEach((choiceId) => ChoiceService.registrarEscolha(perfilDanos, choiceId));
ProgressionService.concluirFase(perfilDanos, 2);
[
  "fase3_usar_maquina_incorretamente",
  "fase3_aceitar_risco",
  "fase3_desrespeitar_orientacao"
].forEach((choiceId) => ChoiceService.registrarEscolha(perfilDanos, choiceId));
assert.equal(perfilDanos.pontuacao.danos, 2);
assert.equal(EndingService.calcularDesfecho(perfilDanos).id, "responsabilizacao");
console.log("OK: a campanha com 2 danos termina em Responsabilização.");

console.log("=== Teste 42: compatibilidade e persistência do save do Marco 3 ===");
const saveMarco3 = {
  id: "save-compatibilidade-marco-3",
  nome: "Save Marco 3",
  pontuacao: { cuidado: 56, conduta: 52, danos: 0 },
  progresso: { faseAtual: 3, fasesConcluidas: [1, 2] },
  escolhasRealizadas: [
    "desligar_computador",
    "recolher_lixo",
    "guardar_equipamento",
    "fase2_recolher_lixo",
    "fase2_sinalizar_liquido",
    "fase2_ajudar_colega"
  ]
};
const saveMarco3Persistido = salvarPerfil(saveMarco3);
const saveMarco3Recarregado = carregarPerfil(saveMarco3Persistido.id);
assert.equal(saveMarco3Recarregado.progresso.campanhaConcluida, false);
assert.equal(ProgressionService.obterStatusFase(saveMarco3Recarregado, 3), "disponivel");
assert.equal(saveMarco3Recarregado.pontuacao.danos, 0);
assert.deepEqual(saveMarco3Recarregado.progresso.fasesConcluidas, [1, 2]);
[
  "fase3_usar_maquina_incorretamente",
  "fase3_recusar_risco",
  "fase3_respeitar_orientacao"
].forEach((choiceId) => ChoiceService.registrarEscolha(saveMarco3Recarregado, choiceId));
assert.equal(
  ChoiceService.obterProgressoFase(saveMarco3Recarregado, interacoesFase3).texto,
  "3/3"
);
ProgressionService.concluirFase(saveMarco3Recarregado, 3);
saveMarco3Recarregado.desfecho = EndingService.calcularDesfecho(saveMarco3Recarregado).id;
salvarPerfil(saveMarco3Recarregado);
const finalRecarregado = carregarPerfil(saveMarco3Persistido.id);
assert.equal(finalRecarregado.progresso.campanhaConcluida, true);
assert.equal(finalRecarregado.desfecho, "reparacao");
assert.deepEqual(finalRecarregado.progresso.fasesConcluidas, [1, 2, 3]);
assert.equal(finalRecarregado.pontuacao.conduta, 57);
assert.equal(finalRecarregado.pontuacao.danos, 1);
console.log("OK: save Marco 3 ganha campanhaConcluida=false e mantém final após reload.");

console.log("=== Teste 43: perfis independentes podem ter finais diferentes ===");
const finaisPerfis = [
  { nome: "João Guardião", conduta: 80, danos: 0, esperado: "guardiao" },
  { nome: "Maria Reparação", conduta: 20, danos: 1, esperado: "reparacao" },
  { nome: "Carlos Responsabilização", conduta: 30, danos: 2, esperado: "responsabilizacao" }
].map((dados) => {
  const perfil = criarNovoPerfil(dados.nome);
  perfil.pontuacao.conduta = dados.conduta;
  perfil.pontuacao.danos = dados.danos;
  perfil.progresso = {
    faseAtual: 4,
    fasesConcluidas: [1, 2, 3],
    campanhaConcluida: true
  };
  perfil.desfecho = EndingService.calcularDesfecho(perfil).id;
  const recarregado = carregarPerfil(salvarPerfil(perfil).id);
  assert.equal(recarregado.desfecho, dados.esperado);
  return recarregado;
});
assert.deepEqual(finaisPerfis.map((perfil) => perfil.desfecho), [
  "guardiao",
  "reparacao",
  "responsabilizacao"
]);
assert.notEqual(finaisPerfis[0].id, finaisPerfis[1].id);
assert.notEqual(finaisPerfis[1].id, finaisPerfis[2].id);
console.log("OK: João, Maria e Carlos mantêm finais distintos e persistidos.");

console.log("=== Teste 44: catálogo central contém as três fases e IDs únicos ===");
assert.deepEqual(LISTA_FASES.map((fase) => fase.sceneKey), [
  "Stage1Scene",
  "Stage2Scene",
  "Stage3Scene"
]);
assert.equal(LISTA_FASES[2].nome, "Máquina e responsabilidade");
assert.equal(LISTA_FASES[2].objetivo, "use os equipamentos com responsabilidade");
const idsFase3 = LISTA_FASES[2].interacoes.map((interacao) => interacao.id);
assert.deepEqual(idsFase3, [
  "fase3_maquina_01",
  "fase3_risco_01",
  "fase3_professor_01"
]);
console.log("OK: três fases e IDs da Fase 3 estão centralizados em stagesData.js.");

console.log("\nTodos os 44 testes de lógica dos Marcos 2, 3 e 4 passaram.");
