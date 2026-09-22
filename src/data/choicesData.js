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
};

