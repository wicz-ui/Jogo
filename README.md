# Guardiões da Escola

## Marco 4 — Fase 3 e conclusão da campanha

O MVP agora contém três fases jogáveis, progressão em sequência e três finais
calculados a partir da conduta e dos danos acumulados. O projeto usa
JavaScript, Phaser 3, Vite e `localStorage`.

### Instalação e execução

```bash
npm install
npm run dev
```

Para gerar a versão de produção e executar os testes de lógica:

```bash
npm run build
npm run test:backend
```

### O que está implementado

- Menu, perfis locais, seleção de fases e recuperação do perfil ativo.
- Fase 1 — Laboratório; Fase 2 — Corredor depois do intervalo; e Fase 3 —
  Máquina e responsabilidade.
- `BaseStageScene` compartilhada pelas três fases, com movimentação, HUD,
  proximidade, diálogo, escolhas, salvamento e conclusão.
- `stagesData.js` como catálogo central de nomes, objetivos, cenas e interações.
- `ProgressionService` valida acesso e conclusão na ordem 1 → 2 → 3.
- `ChoiceService` aplica cuidado, conduta e danos, e impede resolver uma
  interação mais de uma vez.
- A Fase 3 apresenta máquina e procedimento, proposta arriscada de um colega e
  orientação do professor/laboratorista.
- Ao concluir a Fase 3, `EndingService` calcula e persiste o desfecho; a tela
  `EndingScene` pode ser reaberta pela seleção após recarregar o jogo.
- Os finais são **Guardião da Escola**, **Aprendeu e Reparou** e
  **Responsabilização**. A mensagem de responsabilização é educativa e não
  humilhante.
- Saves do Marco 3 sem `campanhaConcluida` são normalizados para
  `campanhaConcluida: false`; pontuação, danos, escolhas e desfecho são mantidos
  por perfil.
- Fases concluídas podem ser revisitadas, mas escolhas resolvidas não concedem
  pontos ou danos novamente.

### Regra dos desfechos

As regras são avaliadas nesta ordem:

1. `danos >= 2` ou `conduta < -20` → **Responsabilização**.
2. `conduta >= 60` e `danos <= 1` → **Guardião da Escola**.
3. Qualquer outro resultado → **Aprendeu e Reparou**.

### Estrutura principal

- `src/data/ProfileRepository.js`: perfis locais e normalização de saves antigos.
- `src/data/choicesData.js`: consequências das escolhas.
- `src/data/stagesData.js`: configurações centralizadas das três fases.
- `src/services/ChoiceService.js`: validação das interações e pontuação.
- `src/services/ProgressionService.js`: acesso e conclusão sequencial.
- `src/services/EndingService.js`: cálculo dos finais.
- `src/scenes/BaseStageScene.js`: gameplay compartilhado.
- `src/scenes/Stage1Scene.js`, `Stage2Scene.js`, `Stage3Scene.js`: cenas de fase
  configuradas sobre a base.
- `src/scenes/StageSelectScene.js`: fases, bloqueios e acesso ao final salvo.
- `src/scenes/EndingScene.js`: desfecho e resumo da campanha.
- `src/ui/HUD.js`: objetivo, perfil, progresso e pontuação; mostra danos na
  Fase 3.

### Fluxo manual

1. Inicie um perfil e confirme que apenas a Fase 1 está disponível.
2. Conclua as três interações da Fase 1 para liberar a Fase 2.
3. Conclua a Fase 2 para liberar **Máquina e responsabilidade**.
4. Na Fase 3, resolva máquina, proposta arriscada e orientação. O progresso
   deve avançar de `0/3` a `3/3`; confira Cuidado, Conduta e Danos no HUD.
5. Finalize a campanha e confira a tela correspondente ao resultado das escolhas.
6. Recarregue a página, clique em **CONTINUAR** e use **VER RESULTADO FINAL**
   para reabrir o desfecho persistido.
7. Crie outro perfil e confirme que progresso, escolhas, pontuação e final são
   independentes.

### Testes

```bash
npm run test:backend
npm run build
```

A suíte contém 44 testes dos Marcos 2, 3 e 4, cobrindo escolhas, sequência,
danos, progresso, persistência, compatibilidade com saves anteriores, finais e
independência entre perfis.

Este marco usa formas e personagens placeholder. Arte final, áudio completo,
servidor, autenticação, nuvem, multiplayer e conteúdo adicional ficam para uma
etapa posterior.
