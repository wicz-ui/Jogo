export const CHOICES = {
  // ==========================================
  // FASE 1 — Laboratório
  // ==========================================
  desligar_computador: {
    id: "desligar_computador",
    interacaoId: "computador_01",
    tipo: "positiva",
    cuidado: 10,
    conduta: 8,
    danos: 0,
    mensagem: "Você desligou corretamente o equipamento."
  },
  ignorar_computador: {
    id: "ignorar_computador",
    interacaoId: "computador_01",
    tipo: "negativa",
    cuidado: 0,
    conduta: -5,
    danos: 0,
    mensagem: "O equipamento continuou ligado consumindo energia sem necessidade."
  },
  recolher_lixo: {
    id: "recolher_lixo",
    interacaoId: "lixo_01",
    tipo: "positiva",
    cuidado: 10,
    conduta: 8,
    danos: 0,
    mensagem: "Você recolheu o lixo e manteve o ambiente limpo."
  },
  deixar_lixo: {
    id: "deixar_lixo",
    interacaoId: "lixo_01",
    tipo: "negativa",
    cuidado: 0,
    conduta: -5,
    danos: 0,
    mensagem: "O lixo foi deixado no chão do laboratório."
  },
  guardar_equipamento: {
    id: "guardar_equipamento",
    interacaoId: "equipamento_01",
    tipo: "positiva",
    cuidado: 10,
    conduta: 8,
    danos: 0,
    mensagem: "Você guardou o equipamento no local adequado."
  },
  usar_equipamento_incorretamente: {
    id: "usar_equipamento_incorretamente",
    interacaoId: "equipamento_01",
    tipo: "negativa",
    cuidado: 0,
    conduta: -8,
    danos: 0,
    mensagem: "O equipamento foi utilizado de forma inadequada."
  },

  // ==========================================
  // FASE 2 — Corredor
  // ==========================================
  fase2_recolher_lixo: {
    id: "fase2_recolher_lixo",
    interacaoId: "fase2_lixo_01",
    tipo: "positiva",
    cuidado: 10,
    conduta: 8,
    danos: 0,
    mensagem: "Você recolheu o lixo e ajudou a manter o corredor seguro."
  },
  fase2_ignorar_lixo: {
    id: "fase2_ignorar_lixo",
    interacaoId: "fase2_lixo_01",
    tipo: "negativa",
    cuidado: 0,
    conduta: -5,
    danos: 0,
    mensagem: "O lixo continuou no corredor, aumentando o risco de acidentes."
  },
  fase2_sinalizar_liquido: {
    id: "fase2_sinalizar_liquido",
    interacaoId: "fase2_liquido_01",
    tipo: "positiva",
    cuidado: 8,
    conduta: 10,
    danos: 0,
    mensagem: "Você sinalizou o risco e buscou ajuda para evitar um acidente."
  },
  fase2_ignorar_liquido: {
    id: "fase2_ignorar_liquido",
    interacaoId: "fase2_liquido_01",
    tipo: "negativa",
    cuidado: 0,
    conduta: -6,
    danos: 0,
    mensagem: "O líquido permaneceu no chão sem qualquer sinalização."
  },
  fase2_ajudar_colega: {
    id: "fase2_ajudar_colega",
    interacaoId: "fase2_respeito_01",
    tipo: "positiva",
    cuidado: 8,
    conduta: 10,
    danos: 0,
    mensagem: "Você buscou ajuda e agiu de forma responsável com os colegas."
  },
  fase2_ignorar_desrespeito: {
    id: "fase2_ignorar_desrespeito",
    interacaoId: "fase2_respeito_01",
    tipo: "negativa",
    cuidado: 0,
    conduta: -8,
    danos: 0,
    mensagem: "A situação de desrespeito foi ignorada e continuou sem apoio."
  },

  // ==========================================
  // FASE 3 — Máquina e responsabilidade
  // ==========================================
  fase3_seguir_procedimento: {
    id: "fase3_seguir_procedimento",
    interacaoId: "fase3_maquina_01",
    tipo: "positiva",
    cuidado: 10,
    conduta: 8,
    danos: 0,
    mensagem: "Você seguiu o procedimento correto de operação da máquina."
  },
  fase3_usar_maquina_incorretamente: {
    id: "fase3_usar_maquina_incorretamente",
    interacaoId: "fase3_maquina_01",
    tipo: "negativa",
    cuidado: 0,
    conduta: -15,
    danos: 1,
    mensagem: "O uso incorreto causou um desgaste severo no equipamento."
  },
  fase3_recusar_risco: {
    id: "fase3_recusar_risco",
    interacaoId: "fase3_risco_01",
    tipo: "positiva",
    cuidado: 8,
    conduta: 10,
    danos: 0,
    mensagem: "Você recusou a proposta arriscada e alertou sobre a segurança."
  },
  fase3_aceitar_risco: {
    id: "fase3_aceitar_risco",
    interacaoId: "fase3_risco_01",
    tipo: "negativa",
    cuidado: 0,
    conduta: -15,
    danos: 1,
    mensagem: "A ação arriscada provocou danos ao patrimônio da escola."
  },
  fase3_respeitar_orientacao: {
    id: "fase3_respeitar_orientacao",
    interacaoId: "fase3_professor_01",
    tipo: "positiva",
    cuidado: 8,
    conduta: 10,
    danos: 0,
    mensagem: "Você respeitou as orientações do responsável pela atividade."
  },
  fase3_desrespeitar_orientacao: {
    id: "fase3_desrespeitar_orientacao",
    interacaoId: "fase3_professor_01",
    tipo: "negativa",
    cuidado: 0,
    conduta: -10,
    danos: 0,
    mensagem: "Você ignorou as instruções de segurança passadas pelo professor."
  }
};