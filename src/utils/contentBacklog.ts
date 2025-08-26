// Content backlog with common customer support questions for modoPAG

export interface ContentSuggestion {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  keywords: string[];
  estimatedReadingTime: number;
  relatedTopics: string[];
}

/**
 * Real customer support questions that should be added as articles
 * Based on common modoPAG user inquiries
 */
export const contentBacklog: ContentSuggestion[] = [
  {
    id: 'maquininha-nao-conecta-wifi',
    title: 'Minha maquininha não conecta no Wi-Fi - Como resolver?',
    description: 'Guia completo para solucionar problemas de conexão Wi-Fi na maquininha modoPAG',
    category: 'Maquininhas',
    priority: 'high',
    keywords: ['maquininha', 'wifi', 'conexão', 'internet', 'problema'],
    estimatedReadingTime: 3,
    relatedTopics: ['configuracao-inicial', 'internet-movel', 'suporte-tecnico']
  },
  {
    id: 'taxa-pix-quanto-cobra',
    title: 'Qual a taxa do PIX na modoPAG?',
    description: 'Valores e condições das taxas PIX para diferentes tipos de conta',
    category: 'Taxas e Tarifas',
    priority: 'high',
    keywords: ['pix', 'taxa', 'tarifa', 'cobrança', 'preço'],
    estimatedReadingTime: 2,
    relatedTopics: ['planos-modopag', 'cartao-credito-taxa', 'debito-taxa']
  },
  {
    id: 'modolink-como-criar',
    title: 'Como criar um link de pagamento (modoLINK)?',
    description: 'Passo a passo para criar e compartilhar links de pagamento',
    category: 'modoLINK',
    priority: 'high',
    keywords: ['modolink', 'link', 'pagamento', 'criar', 'compartilhar'],
    estimatedReadingTime: 4,
    relatedTopics: ['vendas-online', 'whatsapp-vendas', 'gestao-vendas']
  },
  {
    id: 'comprovante-pagamento-cliente',
    title: 'Como enviar comprovante de pagamento para o cliente?',
    description: 'Diferentes formas de enviar comprovantes via SMS, email e WhatsApp',
    category: 'Vendas',
    priority: 'medium',
    keywords: ['comprovante', 'recibo', 'sms', 'email', 'whatsapp'],
    estimatedReadingTime: 3,
    relatedTopics: ['atendimento-cliente', 'vendas-app', 'gestao-vendas']
  },
  {
    id: 'antecipacao-receivables',
    title: 'Como antecipar minhas vendas (recebíveis)?',
    description: 'Guia para solicitar antecipação de valores e entender as condições',
    category: 'Financeiro',
    priority: 'medium',
    keywords: ['antecipação', 'recebíveis', 'dinheiro', 'prazo', 'taxa'],
    estimatedReadingTime: 5,
    relatedTopics: ['fluxo-caixa', 'taxas-antecipacao', 'conta-modopag']
  },
  {
    id: 'maquininha-nao-imprime',
    title: 'Maquininha não está imprimindo - O que fazer?',
    description: 'Soluções para problemas de impressão e troca de bobina',
    category: 'Maquininhas',
    priority: 'medium',
    keywords: ['impressão', 'bobina', 'papel', 'comprovante', 'impressora'],
    estimatedReadingTime: 3,
    relatedTopics: ['manutencao-maquininha', 'troca-equipamento', 'suporte-tecnico']
  },
  {
    id: 'conta-modopag-como-abrir',
    title: 'Como abrir uma conta modoPAG?',
    description: 'Processo completo de cadastro e documentos necessários',
    category: 'Conta',
    priority: 'high',
    keywords: ['conta', 'cadastro', 'abrir', 'documentos', 'aprovação'],
    estimatedReadingTime: 4,
    relatedTopics: ['documentos-necessarios', 'aprovacao-conta', 'primeiros-passos']
  },
  {
    id: 'estorno-pagamento-como-fazer',
    title: 'Como fazer estorno de uma venda?',
    description: 'Procedimentos para estornar vendas no cartão e PIX',
    category: 'Vendas',
    priority: 'medium',
    keywords: ['estorno', 'cancelamento', 'desfazer', 'venda', 'reembolso'],
    estimatedReadingTime: 3,
    relatedTopics: ['gestao-vendas', 'atendimento-cliente', 'financeiro']
  },
  {
    id: 'vendas-parceladas-taxas',
    title: 'Quais as taxas para vendas parceladas?',
    description: 'Tabela completa de taxas por parcela e tipo de cartão',
    category: 'Taxas e Tarifas',
    priority: 'high',
    keywords: ['parcelado', 'taxa', 'parcela', 'cartão', 'juros'],
    estimatedReadingTime: 3,
    relatedTopics: ['cartao-credito', 'planos-modopag', 'calculadora-taxas']
  },
  {
    id: 'app-modopag-funcionalidades',
    title: 'Quais funcionalidades do app modoPAG?',
    description: 'Tour completo pelas principais funcionalidades do aplicativo',
    category: 'Aplicativo',
    priority: 'medium',
    keywords: ['app', 'aplicativo', 'funcionalidades', 'recursos', 'como-usar'],
    estimatedReadingTime: 5,
    relatedTopics: ['vendas-app', 'gestao-vendas', 'relatórios']
  },
  {
    id: 'limite-pix-diario',
    title: 'Qual o limite diário para PIX?',
    description: 'Limites de PIX por tipo de conta e como aumentar',
    category: 'PIX',
    priority: 'medium',
    keywords: ['pix', 'limite', 'diário', 'aumentar', 'valor'],
    estimatedReadingTime: 2,
    relatedTopics: ['conta-modopag', 'pix-configuracao', 'limites-transacao']
  },
  {
    id: 'maquininha-bateria-duracao',
    title: 'Quanto tempo dura a bateria da maquininha?',
    description: 'Informações sobre autonomia da bateria e dicas de economia',
    category: 'Maquininhas',
    priority: 'low',
    keywords: ['bateria', 'duração', 'autonomia', 'carregar', 'economia'],
    estimatedReadingTime: 2,
    relatedTopics: ['cuidados-maquininha', 'manutencao', 'uso-diario']
  },
  {
    id: 'vendas-credito-vista',
    title: 'Diferença entre crédito à vista e parcelado?',
    description: 'Quando usar cada modalidade e impacto nas taxas',
    category: 'Vendas',
    priority: 'medium',
    keywords: ['crédito', 'vista', 'parcelado', 'diferença', 'modalidade'],
    estimatedReadingTime: 3,
    relatedTopics: ['taxas-cartao', 'tipos-pagamento', 'estrategia-vendas']
  },
  {
    id: 'relatorio-vendas-app',
    title: 'Como ver relatório de vendas no app?',
    description: 'Navegação pelos relatórios e análise de vendas',
    category: 'Relatórios',
    priority: 'medium',
    keywords: ['relatório', 'vendas', 'análise', 'dashboard', 'métricas'],
    estimatedReadingTime: 4,
    relatedTopics: ['app-modopag', 'gestao-vendas', 'financeiro']
  },
  {
    id: 'segundo-usuario-conta',
    title: 'Posso adicionar outro usuário na minha conta?',
    description: 'Como gerenciar múltiplos usuários e permissões',
    category: 'Conta',
    priority: 'low',
    keywords: ['usuário', 'adicionar', 'permissão', 'acesso', 'colaborador'],
    estimatedReadingTime: 3,
    relatedTopics: ['gestao-conta', 'seguranca', 'equipe-vendas']
  },
  {
    id: 'maquininha-offline-funciona',
    title: 'A maquininha funciona sem internet?',
    description: 'Limitações e funcionalidades disponíveis offline',
    category: 'Maquininhas', 
    priority: 'medium',
    keywords: ['offline', 'sem internet', 'funciona', 'limitações', 'conexão'],
    estimatedReadingTime: 2,
    relatedTopics: ['conexao-internet', 'wifi-configuracao', 'vendas']
  },
  {
    id: 'cancelar-conta-modopag',
    title: 'Como cancelar minha conta modoPAG?',
    description: 'Processo de cancelamento e o que acontece com os dados',
    category: 'Conta',
    priority: 'low',
    keywords: ['cancelar', 'encerrar', 'conta', 'processo', 'dados'],
    estimatedReadingTime: 3,
    relatedTopics: ['gestao-conta', 'suporte', 'dados-pessoais']
  },
  {
    id: 'taxa-saque-conta',
    title: 'Qual a taxa para sacar da conta modoPAG?',
    description: 'Custos e limites para saque e transferência',
    category: 'Taxas e Tarifas',
    priority: 'medium',
    keywords: ['saque', 'taxa', 'transferência', 'limite', 'custo'],
    estimatedReadingTime: 2,
    relatedTopics: ['conta-modopag', 'financeiro', 'movimentacao']
  },
  {
    id: 'problema-pagamento-aprovado',
    title: 'Pagamento foi aprovado mas não apareceu na conta?',
    description: 'O que fazer quando há divergência entre aprovação e crédito',
    category: 'Suporte',
    priority: 'high',
    keywords: ['pagamento', 'aprovado', 'não apareceu', 'conta', 'divergência'],
    estimatedReadingTime: 3,
    relatedTopics: ['problemas-pagamento', 'conciliacao', 'suporte-tecnico']
  },
  {
    id: 'maquininha-trava-frecuente',
    title: 'Maquininha trava com frequência - Como resolver?',
    description: 'Soluções para travamentos e quando solicitar troca',
    category: 'Maquininhas',
    priority: 'medium',
    keywords: ['trava', 'travamento', 'frequente', 'resolver', 'troca'],
    estimatedReadingTime: 3,
    relatedTopics: ['problemas-tecnicos', 'troca-equipamento', 'manutencao']
  }
];

/**
 * Get content suggestions by priority
 */
export const getContentByPriority = (priority: 'high' | 'medium' | 'low') => {
  return contentBacklog.filter(item => item.priority === priority);
};

/**
 * Get content suggestions by category
 */
export const getContentByCategory = (category: string) => {
  return contentBacklog.filter(item => item.category === category);
};

/**
 * Search content suggestions by keyword
 */
export const searchContentSuggestions = (query: string) => {
  const lowerQuery = query.toLowerCase();
  return contentBacklog.filter(item => 
    item.title.toLowerCase().includes(lowerQuery) ||
    item.description.toLowerCase().includes(lowerQuery) ||
    item.keywords.some(keyword => keyword.toLowerCase().includes(lowerQuery))
  );
};

/**
 * Get high priority content that should be created first
 */
export const getHighPriorityContent = () => {
  return getContentByPriority('high').slice(0, 5);
};

/**
 * Generate content creation roadmap
 */
export const generateContentRoadmap = () => {
  const highPriority = getContentByPriority('high');
  const mediumPriority = getContentByPriority('medium');
  const lowPriority = getContentByPriority('low');
  
  return {
    week1: highPriority.slice(0, 3),
    week2: highPriority.slice(3).concat(mediumPriority.slice(0, 2)),
    week3: mediumPriority.slice(2, 5),
    week4: mediumPriority.slice(5).concat(lowPriority.slice(0, 2)),
    backlog: lowPriority.slice(2)
  };
};