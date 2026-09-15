# Jogo

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