import { ChoiceService } from './services/ChoiceService.js';

// Perfil de teste mockado
let perfilTeste = {
  id: "perfil-001",
  nome: "João",
  pontuacao: { cuidado: 0, conduta: 0 },
  progresso: { faseAtual: 1, fasesConcluidas: [] },
  escolhasRealizadas: []
};

console.log("=== Teste 1: Executando Primeira Escolha ===");
let resultado = ChoiceService.registrarEscolha(perfilTeste, "desligar_computador");
console.log(resultado);

console.log("\n=== Teste 2: Tentando Duplicar a Escolha ===");
let resultadoDuplicado = ChoiceService.registrarEscolha(perfilTeste, "desligar_computador");
console.log(resultadoDuplicado);