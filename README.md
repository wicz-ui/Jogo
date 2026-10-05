# Guardiões da Escola

## Marco 3 — Progressão e Fase 2

Este repositório contém o terceiro marco do jogo educativo 2D
**Guardiões da Escola**. A campanha agora conecta a Fase 1 — Laboratório à
Fase 2 — Corredor depois do intervalo, com seleção de fases, progressão,
conclusão e persistência local. O projeto usa JavaScript, Phaser 3, Vite e
`localStorage`.

### Instalação e execução

```bash
npm install
npm run dev
```

Para gerar a versão de produção:

```bash
npm run build
npm run preview
```

Para executar os testes simples dos serviços:

```bash
npm run test:backend
```

### O que está implementado no Marco 3

- Menu principal com Novo Jogo e Continuar funcionais.
- Criação, seleção e recuperação de perfis locais.
- Tela de seleção com Fase 1 disponível, Fase 2 bloqueada ou disponível e
  Fase 3 marcada como em desenvolvimento.
- Fase 1 — Laboratório com personagem e movimentação por WASD/setas.
- Fase 2 — Corredor depois do intervalo, liberada após concluir a Fase 1.
- Três interações alcançáveis em cada fase, com IDs e escolhas exclusivos.
- ChoiceDialog reutilizável com duas alternativas por situação.
- ChoiceService aplicando consequências e bloqueando repetição ou alternativa oposta.
- HUD reutilizável com objetivo, perfil, cuidado, conduta e progresso de `0/3` a `3/3`.
- Indicador textual `✓ RESOLVIDO` nos objetos já analisados.
- Modal de conclusão após resolver as três situações de cada fase.
- `BaseStageScene` compartilhada por `Stage1Scene` e `Stage2Scene`.
- `ProgressionService` controlando acesso, fases concluídas e `faseAtual`.
- `StageResultScene` generalizada para exibir o resultado da fase concluída.
- Salvamento após cada escolha e após a conclusão da fase.
- Recuperação, após recarregar, das escolhas, pontuação e progresso (`faseAtual = 2` ou `3`).
- Rejogar uma fase concluída não duplica pontos nem a lista de fases concluídas.

Fase 3 aparece apenas como **Em desenvolvimento** e não possui gameplay neste
marco. Servidor, SQL, autenticação, encerramento final e outras fases não fazem
parte desta entrega.

### Estrutura principal do Marco 3

- `src/main.js`: configuração e inicialização do Phaser 3.
- `src/data/`: perfis, catálogo de escolhas e configurações das fases.
- `src/services/`: regras de escolhas e progressão.
- `src/entities/`: personagem placeholder.
- `src/scenes/`: menu, perfis, seleção, fases jogáveis e resultados.
- `src/ui/`: botões, HUD, prompt e diálogo de escolha reutilizável.

### Fluxo manual

1. Abra o endereço informado pelo Vite e clique em **NOVO JOGO**.
2. Digite um nome, clique em **CRIAR PERFIL** e depois em **INICIAR JOGO**.
3. Na **SELEÇÃO DE FASES**, confirme que a Fase 1 está disponível, a Fase 2
   bloqueada e a Fase 3 em desenvolvimento.
4. Na Fase 1, mova o personagem com WASD ou as setas até o computador, o lixo
   e o equipamento.
5. Quando aparecer `[E] Interagir`, pressione `E`, escolha uma alternativa e
   confira a mensagem, o impacto e o progresso no HUD.
6. Resolva as três situações, clique em **FINALIZAR FASE** e confira o resumo.
7. Na seleção, confirme que a Fase 2 foi liberada e jogue suas três situações:
   lixo, líquido derramado e respeito entre colegas.
8. Finalize a Fase 2, confira `faseAtual = 3` e que a Fase 3 continua marcada
   como **Em desenvolvimento**.
9. Recarregue a página, clique em **CONTINUAR** e confirme que a seleção,
   pontuação, escolhas e fases concluídas permanecem salvas.
10. Crie ou selecione outro perfil e confirme que o progresso dele começa em
    `0/3`, sem compartilhar dados com o primeiro perfil.

### Testes

```bash
npm install
npm run test:backend
npm run build
```

Os 25 testes cobrem as escolhas das duas fases, alternativas mutuamente
exclusivas, acesso e bloqueio, progresso `0/3` → `3/3`, conclusão e persistência
da campanha, compatibilidade com save do Marco 2, replay sem pontuação duplicada
e independência entre perfis.

## Objetivo final da estrutura

guardioes-da-escola/

├── public/

│   └── assets/

│       ├── images/               # Sprites de personagens, cenários e ícones (.png)

│       ├── audio/                # Trilhas sonoras e efeitos cortados no Audacity (.mp3/.ogg)

│       ├── maps/                 # Arquivos de mapas de azulejos (Tilemaps JSON)

│       └── fonts/                # Fontes personalizadas para o projeto

├── src/

│   ├── main.js                   # Ponto de entrada, orquestrador e inicializador do Phaser

│   ├── config/

│   │   ├── gameConfig.js         # Configurações globais do motor Phaser (física, escala)

│   │   └── constants.js          # Chaves de armazenamento, resoluções e metadados

│   ├── events/

│   │   └── GameEventBus.js       # Barramento centralizado para eventos do jogo (Event Emitter)

│   ├── data/

│   │   ├── ProfileRepository.js  # Classe base/contrato para persistência

│   │   ├── LocalStorageProfileRepository.js # Implementação do salvamento local em texto

│   │   ├── validators.js         # Validação de integridade de dados e nomes de perfil

│   │   └── migrations.js         # Scripts sequenciais de atualização de schema (ex: v0 -> v1)

│   ├── domain/

│   │   ├── GameSessionService.js # Gerenciador do estado e sessões ativas em memória

│   │   ├── ChoiceService.js      # Validador de regras de escolha e suas consequências

│   │   ├── ScoreService.js       # Tratamento de pontos positivos/negativos e conduta

│   │   ├── ProgressionService.js # Controle de fases desbloqueadas e checkpoints

│   │   ├── EndingService.js      # Máquina de regras para cálculo do desfecho final

│   │   └── interactionCatalog.js # Tabela/Catálogo oficial com os pesos de cada ação

│   ├── scenes/

│   │   ├── BootScene.js          # Inicialização rápida de sistemas e plugins

│   │   ├── PreloadScene.js       # Carregamento de assets com barra de progresso visual

│   │   ├── MainMenuScene.js      # Menu inicial (Novo jogo, Continuar, Opções, Créditos)

│   │   ├── ProfileScene.js       # Tela para criação e seleção de perfis locais

│   │   ├── StageSelectScene.js   # Menu de seleção de fases bloqueadas/desbloqueadas

│   │   ├── Stage1Scene.js        # Gameplay da Fase 1 (ex: Laboratório)

│   │   ├── Stage2Scene.js        # Gameplay da Fase 2

│   │   ├── Stage3Scene.js        # Gameplay da Fase 3

│   │   ├── StageResultScene.js   # Resumo de pontos e escolhas ao fim de um nível

│   │   └── EndingScene.js        # Tela de encerramento com a mensagem educativa baseada na conduta

│   └── ui/

│       ├── GameButton.js         # Componente reutilizável com estados de foco e teclado

│       ├── DialogueBox.js        # Caixa de diálogo com controle de velocidade do texto

│       ├── HUD.js                # Painel fixo na tela exibindo pontuação e objetivos atuais

│       └── ConfirmDialog.js      # Janela pop-up para confirmações destrutivas (ex: apagar perfil)

├── tests/

│   ├── unit/                     # Testes das regras puras da lógica de domínio (Jest/Vitest)

│   ├── integration/              # Testes do ciclo salvar-carregar integrado com a sessão

│   └── fixtures/                 # Amostras de dados controlados (saves limpos, corrompidos, antigos)

├── docs/

│   ├── architecture.md           # Desenho do fluxo entre cenas e serviços

│   ├── data-model.md             # Especificação dos campos do arquivo JSON

│   └── testing.md                # Roteiro manual para testes de regressão escolar

├── .gitignore                    # Filtro para ignorar pastas como node_modules/ e arquivos locais

├── package.json                  # Manifesto de dependências do Node.js e scripts de execução/build

└── README.md                     # Manual de instalação e instruções para rodar o projeto localmente
