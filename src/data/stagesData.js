const FASE1_INTERACOES = [
  {
    id: "computador_01",
    visual: "computador",
    label: "COMPUTADOR",
    x: 950,
    y: 380,
    raioInteracao: 135,
    titulo: "Computador",
    mensagem: "O computador está ligado sem necessidade.\nO que deseja fazer?",
    opcoes: [
      { texto: "Desligar corretamente", choiceId: "desligar_computador" },
      { texto: "Ignorar", choiceId: "ignorar_computador" }
    ]
  },
  {
    id: "lixo_01",
    visual: "lixo",
    label: "LIXO",
    x: 430,
    y: 530,
    raioInteracao: 120,
    titulo: "Lixo no laboratório",
    mensagem: "Há lixo no chão do laboratório.\nO que deseja fazer?",
    opcoes: [
      { texto: "Colocar na lixeira", choiceId: "recolher_lixo" },
      { texto: "Deixar onde está", choiceId: "deixar_lixo" }
    ]
  },
  {
    id: "equipamento_01",
    visual: "equipamento",
    label: "EQUIPAMENTO",
    x: 760,
    y: 265,
    raioInteracao: 120,
    titulo: "Equipamento fora do lugar",
    mensagem: "Um equipamento foi deixado fora do lugar.\nO que deseja fazer?",
    opcoes: [
      { texto: "Guardar corretamente", choiceId: "guardar_equipamento" },
      { texto: "Usar/deixar de forma inadequada", choiceId: "usar_equipamento_incorretamente" }
    ]
  }
];

const FASE2_INTERACOES = [
  {
    id: "fase2_lixo_01",
    visual: "lixo",
    label: "LIXO",
    x: 330,
    y: 285,
    raioInteracao: 120,
    titulo: "Lixo no corredor",
    mensagem: "Há lixo no corredor.\nO que deseja fazer?",
    opcoes: [
      { texto: "Recolher e descartar corretamente", choiceId: "fase2_recolher_lixo" },
      { texto: "Ignorar", choiceId: "fase2_ignorar_lixo" }
    ]
  },
  {
    id: "fase2_liquido_01",
    visual: "liquido",
    label: "LÍQUIDO",
    x: 660,
    y: 520,
    raioInteracao: 125,
    titulo: "Líquido derramado",
    mensagem: "Há líquido derramado no chão.\nIsso pode causar um acidente.",
    opcoes: [
      { texto: "Sinalizar e pedir ajuda", choiceId: "fase2_sinalizar_liquido" },
      { texto: "Ignorar", choiceId: "fase2_ignorar_liquido" }
    ]
  },
  {
    id: "fase2_respeito_01",
    visual: "respeito",
    label: "COLEGAS",
    x: 1000,
    y: 335,
    raioInteracao: 135,
    titulo: "Respeito entre colegas",
    mensagem: "Você percebe uma situação de desrespeito entre colegas.",
    opcoes: [
      { texto: "Buscar ajuda / agir de forma responsável", choiceId: "fase2_ajudar_colega" },
      { texto: "Ignorar", choiceId: "fase2_ignorar_desrespeito" }
    ]
  }
];

export const FASE1_CONFIG = {
  numeroFase: 1,
  nome: "Laboratório",
  cabecalho: "FASE 1  •  LABORATÓRIO",
  objetivo: "cuide do laboratório",
  mensagemConclusao: "Você analisou todas as situações do laboratório.",
  jogadorInicial: { x: 230, y: 380 },
  sala: {
    backgroundColor: 0x163b4d,
    gridColor: 0x2b5f70,
    borderColor: 0x7ed6df,
    destaque: "ÁREA DE\nTRABALHO",
    destaqueX: 180,
    destaqueY: 255
  },
  interacoesObrigatorias: ["computador_01", "lixo_01", "equipamento_01"],
  interacoes: FASE1_INTERACOES
};

export const FASE2_CONFIG = {
  numeroFase: 2,
  nome: "Corredor depois do intervalo",
  cabecalho: "FASE 2  •  CORREDOR DEPOIS DO INTERVALO",
  objetivo: "ajude a tornar o corredor seguro",
  mensagemConclusao: "Você analisou todas as situações do corredor.",
  jogadorInicial: { x: 230, y: 430 },
  sala: {
    backgroundColor: 0x254052,
    gridColor: 0x3a6371,
    borderColor: 0x8ad9cf,
    destaque: "CORREDOR\nSEGURO",
    destaqueX: 180,
    destaqueY: 255,
    linhasHorizontais: true
  },
  interacoesObrigatorias: [
    "fase2_lixo_01",
    "fase2_liquido_01",
    "fase2_respeito_01"
  ],
  interacoes: FASE2_INTERACOES
};

export const STAGE_CONFIGS = {
  1: FASE1_CONFIG,
  2: FASE2_CONFIG
};

export function obterConfiguracaoFase(numeroFase) {
  return STAGE_CONFIGS[numeroFase] || null;
}
