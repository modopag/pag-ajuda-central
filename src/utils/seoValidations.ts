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

  // Validação da meta descrição
  if (!data.metaDescription?.trim()) {
    validations.push({
      field: 'metaDescription',
      message: 'Meta descrição é recomendada',
      type: 'warning'
    });
  } else if (data.metaDescription.length < 120) {
    validations.push({
      field: 'metaDescription',
      message: `Meta descrição curta (${data.metaDescription.length}/160 caracteres)`,
      type: 'warning'
    });
  } else if (data.metaDescription.length > 160) {
    validations.push({
      field: 'metaDescription',
      message: `Meta descrição muito longa (${data.metaDescription.length}/160 caracteres)`,
      type: 'error'
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

  // Validação do conteúdo
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

  return validations;
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