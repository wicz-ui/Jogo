export const CHOICES = {

  // Interação 1: Computador
  
  desligar_computador: {
    id: "desligar_computador",
    interacaoId: "computador_01",
    tipo: "positiva",
    cuidado: 10,
    conduta: 8,
    mensagem: "Você desligou corretamente o equipamento."
  },
  ignorar_computador: {
    id: "ignorar_computador",
    interacaoId: "computador_01",
    tipo: "negativa",
    cuidado: 0,
    conduta: -5,
    mensagem: "O equipamento continuou ligado consumindo energia sem necessidade."
  },
   
   // Interação 2: Lixo

  recolher_lixo: {
    id: "recolher_lixo",
    interacaoId: "lixo_01",
    tipo: "positiva",
    cuidado: 10,
    conduta: 8,
    mensagem: "Você recolheu o lixo e manteve o ambiente limpo."
  },
  deixar_lixo: {
    id: "deixar_lixo",
    interacaoId: "lixo_01",
    tipo: "negativa",
    cuidado: 0,
    conduta: -5,
    mensagem: "O lixo foi deixado no chão do laboratório."
  },

  // Interação 3: Equipamento

  guardar_equipamento: {
    id: "guardar_equipamento",
    interacaoId: "equipamento_01",
    tipo: "positiva",
    cuidado: 10,
    conduta: 8,
    mensagem: "Você guardou o equipamento no local adequado."
  },
  usar_equipamento_incorretamente: {
    id: "usar_equipamento_incorretamente",
    interacaoId: "equipamento_01",
    tipo: "negativa",
    cuidado: 0,
    conduta: -8,
    mensagem: "O equipamento foi utilizado de forma inadequada."
  },

  // Interação 4: Lixo no corredor da Fase 2

  fase2_recolher_lixo: {
    id: "fase2_recolher_lixo",
    interacaoId: "fase2_lixo_01",
    tipo: "positiva",
    cuidado: 10,
    conduta: 8,
    mensagem: "Você recolheu o lixo e ajudou a manter o corredor seguro."
  },
  fase2_ignorar_lixo: {
    id: "fase2_ignorar_lixo",
    interacaoId: "fase2_lixo_01",
    tipo: "negativa",
    cuidado: 0,
    conduta: -5,
    mensagem: "O lixo continuou no corredor, aumentando o risco de acidentes."
  },

  // Interação 5: Líquido derramado na Fase 2

  fase2_sinalizar_liquido: {
    id: "fase2_sinalizar_liquido",
    interacaoId: "fase2_liquido_01",
    tipo: "positiva",
    cuidado: 8,
    conduta: 10,
    mensagem: "Você sinalizou o risco e buscou ajuda para evitar um acidente."
  },
  fase2_ignorar_liquido: {
    id: "fase2_ignorar_liquido",
    interacaoId: "fase2_liquido_01",
    tipo: "negativa",
    cuidado: 0,
    conduta: -6,
    mensagem: "O líquido permaneceu no chão sem qualquer sinalização."
  },

  // Interação 6: Respeito entre colegas na Fase 2

  fase2_ajudar_colega: {
    id: "fase2_ajudar_colega",
    interacaoId: "fase2_respeito_01",
    tipo: "positiva",
    cuidado: 8,
    conduta: 10,
    mensagem: "Você buscou ajuda e agiu de forma responsável com os colegas."
  },
  fase2_ignorar_desrespeito: {
    id: "fase2_ignorar_desrespeito",
    interacaoId: "fase2_respeito_01",
    tipo: "negativa",
    cuidado: 0,
    conduta: -8,
    mensagem: "A situação de desrespeito foi ignorada e continuou sem apoio."
  },
};
