import { ChoiceService } from './services/ChoiceService.js';
import { ProgressionService } from './services/ProgressionService.js';
import { criarNovoPerfil } from './data/ProfileRepository.js';
import assert from 'node:assert/strict';

function criarPerfilTeste() {
  return {
    id: "perfil-teste",
    nome: "João",
    pontuacao: { cuidado: 0, conduta: 0, danos: 0 },
    progresso: { faseAtual: 1, fasesConcluidas: [] },
    escolhasRealizadas: []
  };
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
const perfilNegativo = criarPerfilTeste();
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

console.log("\nTodos os testes de lógica passaram.");
