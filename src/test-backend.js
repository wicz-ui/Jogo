import assert from "node:assert/strict";
import {
  carregarPerfil,
  criarNovoPerfil,
  salvarPerfil
} from "./data/ProfileRepository.js";
import { ChoiceService } from "./services/ChoiceService.js";
import { ProgressionService } from "./services/ProgressionService.js";

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

console.log("\nTodos os testes de lógica do Marco 2 passaram.");
