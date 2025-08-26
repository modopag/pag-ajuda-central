export interface SEOValidation {
  field: string;
  message: string;
  type: 'error' | 'warning' | 'success';
}

export interface SEOData {
  title: string;
  metaTitle?: string;
  metaDescription?: string;
  slug: string;
  content: string;
}

export const validateSEO = (data: SEOData): SEOValidation[] => {
  const validations: SEOValidation[] = [];

  // Validação do título
  if (!data.title.trim()) {
    validations.push({
      field: 'title',
      message: 'Título é obrigatório',
      type: 'error'
    });
  } else if (data.title.length < 10) {
    validations.push({
      field: 'title',
      message: 'Título muito curto (mínimo 10 caracteres)',
      type: 'warning'
    });
  } else if (data.title.length > 70) {
    validations.push({
      field: 'title',
      message: 'Título muito longo (máximo 70 caracteres)',
      type: 'warning'
    });
  }

  // Validação do meta título
  const metaTitle = data.metaTitle || data.title;
  if (metaTitle.length > 60) {
    validations.push({
      field: 'metaTitle',
      message: `Meta título muito longo (${metaTitle.length}/60 caracteres)`,
      type: 'error'
    });
  } else if (metaTitle.length < 30) {
    validations.push({
      field: 'metaTitle',
      message: `Meta título curto (${metaTitle.length}/60 caracteres)`,
      type: 'warning'
    });
  } else {
    validations.push({
      field: 'metaTitle',
      message: `Meta título otimizado (${metaTitle.length}/60 caracteres)`,
      type: 'success'
    });
  }

  // Validação da meta descrição (OBRIGATÓRIO para publicação)
  if (!data.metaDescription?.trim()) {
    validations.push({
      field: 'metaDescription',
      message: 'Meta descrição é obrigatória para publicação',
      type: 'error'
    });
  } else if (data.metaDescription.length > 160) {
    validations.push({
      field: 'metaDescription',
      message: `Meta descrição muito longa (${data.metaDescription.length}/160 caracteres) - BLOQUEIA PUBLICAÇÃO`,
      type: 'error'
    });
  } else if (data.metaDescription.length < 120) {
    validations.push({
      field: 'metaDescription',
      message: `Meta descrição curta (${data.metaDescription.length}/160 caracteres)`,
      type: 'warning'
    });
  } else {
    validations.push({
      field: 'metaDescription',
      message: `Meta descrição otimizada (${data.metaDescription.length}/160 caracteres)`,
      type: 'success'
    });
  }

  // Validação do slug
  if (!data.slug.trim()) {
    validations.push({
      field: 'slug',
      message: 'Slug é obrigatório',
      type: 'error'
    });
  } else if (!/^[a-z0-9-]+$/.test(data.slug)) {
    validations.push({
      field: 'slug',
      message: 'Slug deve conter apenas letras minúsculas, números e hífens',
      type: 'error'
    });
  } else if (data.slug.length > 100) {
    validations.push({
      field: 'slug',
      message: 'Slug muito longo (máximo 100 caracteres)',
      type: 'warning'
    });
  }

  // Validação do conteúdo e 1º parágrafo
  const contentLength = data.content.replace(/<[^>]*>/g, '').trim().length;
  if (contentLength < 300) {
    validations.push({
      field: 'content',
      message: `Conteúdo muito curto (${contentLength} caracteres, recomendado mínimo 300)`,
      type: 'warning'
    });
  } else {
    validations.push({
      field: 'content',
      message: `Conteúdo com boa extensão (${contentLength} caracteres)`,
      type: 'success'
    });
  }

  // Validação do primeiro parágrafo (OBRIGATÓRIO para publicação)
  const firstParagraph = extractFirstParagraph(data.content);
  if (!firstParagraph.trim()) {
    validations.push({
      field: 'firstParagraph',
      message: 'Primeiro parágrafo é obrigatório - deve responder diretamente à pergunta - BLOQUEIA PUBLICAÇÃO',
      type: 'error'
    });
  } else if (firstParagraph.length < 50) {
    validations.push({
      field: 'firstParagraph',
      message: 'Primeiro parágrafo muito curto - deve responder à pergunta de forma clara',
      type: 'warning'
    });
  } else {
    validations.push({
      field: 'firstParagraph',
      message: 'Primeiro parágrafo adequado',
      type: 'success'
    });
  }

  return validations;
};

// Nova função para extrair o primeiro parágrafo
export const extractFirstParagraph = (content: string): string => {
  // Remove tags HTML e pega o primeiro parágrafo
  const text = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const paragraphs = text.split('\n').filter(p => p.trim().length > 0);
  return paragraphs[0] || '';
};

// Nova função para validar se pode publicar
export const canPublish = (data: SEOData): { canPublish: boolean; blockingErrors: string[] } => {
  const validations = validateSEO(data);
  const blockingErrors: string[] = [];
  
  // Campos obrigatórios para publicação
  if (!data.title.trim()) {
    blockingErrors.push('Título é obrigatório');
  }
  
  if (!data.metaDescription?.trim()) {
    blockingErrors.push('Meta descrição é obrigatória');
  } else if (data.metaDescription.length > 160) {
    blockingErrors.push('Meta descrição excede 160 caracteres');
  }
  
  const firstParagraph = extractFirstParagraph(data.content);
  if (!firstParagraph.trim()) {
    blockingErrors.push('Primeiro parágrafo é obrigatório');
  }
  
  if (!data.slug.trim()) {
    blockingErrors.push('Slug é obrigatório');
  }
  
  return {
    canPublish: blockingErrors.length === 0,
    blockingErrors
  };
};

export const calculateReadingTime = (content: string): number => {
  const wordsPerMinute = 200;
  const text = content.replace(/<[^>]*>/g, '');
  const wordCount = text.trim().split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
};

export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .replace(/-+/g, '-') // Remove hífens duplos
    .replace(/^-|-$/g, ''); // Remove hífens do início e fim
};