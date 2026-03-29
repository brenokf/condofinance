export const CHART_OF_ACCOUNTS = {
  INCOME: [
    { id: '0', name: 'Saldo Anterior' },
    { id: '1', name: '1. Cota condominial', subcategories: [
      { id: '1.1', name: '1.1 Salão' },
      { id: '1.2', name: '1.2 Aquisições de tags' },
      { id: '1.3', name: '1.3 Multas' }
    ]},
  ],
  EXPENSE: [
    { id: '2', name: '2. AJUDA DE CUSTO (síndica)' },
    { id: '3', name: '3. CONCESSIONÁRIAS', subcategories: [
      { id: '3.1.1', name: '3.1.1 Água' },
      { id: '3.1.2', name: '3.1.2 Energia (área comum e halls)' },
      { id: '3.1.3', name: '3.1.3 Internet' },
      { id: '3.1.4', name: '3.1.4 Gás' },
      { id: '3.1.5', name: '3.1.5 ETE' }
    ]},
    { id: '4', name: '4. CONSERVAÇÃO, MANUTENÇÃO E CONTRATOS', subcategories: [
      { id: '4.1', name: '4.1 Portaria (5 AGPs)' },
      { id: '4.2', name: '4.2 Serviços Gerais (3 ASG)' },
      { id: '4.3', name: '4.3 Artífice (1)' },
      { id: '4.4', name: '4.4 Assistente Administrativo (1)' },
      { id: '4.5', name: '4.5 Limpeza, higienização e laudo (Cisterna e Torre D\'água)' },
      { id: '4.6', name: '4.6 Manutenção de ar split' },
      { id: '4.7', name: '4.7 Manutenção de bombas (8 unid)' },
      { id: '4.8', name: '4.8 Manutenção de controle de acesso, cerca elétrica, interfone' },
      { id: '4.9', name: '4.9 Manutenções de portões e cancelas' },
      { id: '4.10', name: '4.10 Manutenção de câmeras' },
      { id: '4.11', name: '4.11 Manutenção de piscina' },
      { id: '4.12', name: '4.12 Manutenção de jardim e roçagem' },
      { id: '4.13', name: '4.13 Manutenção de AVCB' },
      { id: '4.14', name: '4.14 Manutenção Sistema Communy' },
      { id: '4.15', name: '4.15 Manutenção SPDA' }
    ]},
    { id: '5', name: '5. SERVIÇOS AUXILIARES À ADMINISTRAÇÃO', subcategories: [
      { id: '5.1', name: '5.1 Administradora Contábil' },
      { id: '5.2', name: '5.2 Assessoria Jurídica' }
    ]},
    { id: '6', name: '6. REPAROS, REPOSIÇÕES, MATERIAIS DE CONSUMO', subcategories: [
      { id: '6.1', name: '6.1 Materiais elétricos/hidráulicos' },
      { id: '6.2', name: '6.2 Materiais de obras e reparos' },
      { id: '6.3', name: '6.3 Materiais de Higiene' }
    ]},
    { id: '7', name: '7. DESPESAS FINANCEIRAS/ADMINISTRATIVAS', subcategories: [
      { id: '7.1', name: '7.1 Tarifas bancárias' },
      { id: '7.2', name: '7.2 Reprodução de documentos' },
      { id: '7.3', name: '7.3 Custas Cartoriais' },
      { id: '7.4', name: '7.4 Certificado Digital' }
    ]},
    { id: '8', name: '8. ENCARGOS, TRIBUTOS E RETENÇÕES', subcategories: [
      { id: '8.1', name: '8.1 Receita Federal, ISS, outros' }
    ]},
    { id: '9', name: '9. SEGUROS', subcategories: [
      { id: '9.1', name: '9.1 Seguro Predial (Tokio)' }
    ]},
    { id: '10', name: '10. FUNDO DE RESERVA' }
  ]
};
