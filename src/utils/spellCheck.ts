// Spell checking and content validation utilities

interface SpellCheckResult {
  hasErrors: boolean;
  suggestions: SpellCheckSuggestion[];
  score: number; // 0-100
}

interface SpellCheckSuggestion {
  type: 'spelling' | 'grammar' | 'style' | 'seo';
  severity: 'error' | 'warning' | 'suggestion';
  text: string;
  position: { start: number; end: number };
  suggestions: string[];
  rule: string;
}

/**
 * Common spelling errors specific to modoPAG content
 */
const modoPagTerms: Record<string, string> = {
  'modopag': 'modoPAG',
  'modo pag': 'modoPAG',
  'ModoPag': 'modoPAG',
  'modolink': 'modoLINK',
  'modo link': 'modoLINK',
  'ModoLink': 'modoLINK',
  'pix': 'PIX',
  'Pix': 'PIX',
  'whatsapp': 'WhatsApp',
  'Whatsapp': 'WhatsApp',
  'wifi': 'Wi-Fi',
  'Wifi': 'Wi-Fi',
  'email': 'e-mail',
  'Email': 'E-mail',
  'maquininha': 'maquininha', // correct
  'maquinhinha': 'maquininha',
  'recebivel': 'recebível',
  'recebiveis': 'recebíveis'
};

/**
 * Common grammar mistakes in Brazilian Portuguese
 */
const grammarRules: Record<string, string> = {
  'a nível de': 'em nível de',
  'ao nível de': 'em nível de',
  'através de': 'por meio de',
  'atravéz de': 'por meio de',
  'vem de encontro': 'vai de encontro' // or "vem ao encontro"
};

/**
 * SEO optimization suggestions
 */
const seoRules = {
  titleLength: { min: 30, max: 60 },
  metaDescLength: { min: 120, max: 160 },
  headingStructure: true,
  keywordDensity: { min: 0.5, max: 3.0 }
};

/**
 * Validates and corrects modoPAG-specific terminology
 */
export const validateModoPagTerms = (text: string): SpellCheckResult => {
  const suggestions: SpellCheckSuggestion[] = [];
  let correctedText = text;
  
  // Check brand terms
  Object.entries(modoPagTerms).forEach(([incorrect, correct]) => {
    const regex = new RegExp(`\\b${incorrect}\\b`, 'gi');
    const matches = [...text.matchAll(regex)];
    
    matches.forEach(match => {
      if (match.index !== undefined) {
        suggestions.push({
          type: 'spelling',
          severity: 'error',
          text: match[0],
          position: { start: match.index, end: match.index + match[0].length },
          suggestions: [correct],
          rule: 'brand-terminology'
        });
      }
    });
    
    correctedText = correctedText.replace(regex, correct);
  });

  // Check grammar
  Object.entries(grammarRules).forEach(([incorrect, correct]) => {
    const regex = new RegExp(incorrect, 'gi');
    const matches = [...text.matchAll(regex)];
    
    matches.forEach(match => {
      if (match.index !== undefined) {
        suggestions.push({
          type: 'grammar',
          severity: 'warning',
          text: match[0],
          position: { start: match.index, end: match.index + match[0].length },
          suggestions: [correct],
          rule: 'grammar-correction'
        });
      }
    });
  });

  return {
    hasErrors: suggestions.filter(s => s.severity === 'error').length > 0,
    suggestions,
    score: Math.max(0, 100 - (suggestions.length * 5))
  };
};

/**
 * Validates SEO elements (titles, meta descriptions, headings)
 */
export const validateSEOContent = (content: {
  title?: string;
  metaDescription?: string;
  headings?: string[];
  body?: string;
}): SpellCheckResult => {
  const suggestions: SpellCheckSuggestion[] = [];

  // Title validation
  if (content.title) {
    const titleLength = content.title.length;
    if (titleLength < seoRules.titleLength.min) {
      suggestions.push({
        type: 'seo',
        severity: 'warning',
        text: content.title,
        position: { start: 0, end: titleLength },
        suggestions: [`Título muito curto. Recomendado: ${seoRules.titleLength.min}-${seoRules.titleLength.max} caracteres`],
        rule: 'title-length'
      });
    } else if (titleLength > seoRules.titleLength.max) {
      suggestions.push({
        type: 'seo',
        severity: 'error',
        text: content.title,
        position: { start: 0, end: titleLength },
        suggestions: [`Título muito longo. Máximo recomendado: ${seoRules.titleLength.max} caracteres`],
        rule: 'title-length'
      });
    }

    // Check if title includes brand
    if (!content.title.toLowerCase().includes('modopag')) {
      suggestions.push({
        type: 'seo',
        severity: 'suggestion',
        text: content.title,
        position: { start: 0, end: titleLength },
        suggestions: ['Considere incluir "modoPAG" no título para melhor SEO'],
        rule: 'brand-in-title'
      });
    }
  }

  // Meta description validation
  if (content.metaDescription) {
    const metaLength = content.metaDescription.length;
    if (metaLength < seoRules.metaDescLength.min) {
      suggestions.push({
        type: 'seo',
        severity: 'warning',
        text: content.metaDescription,
        position: { start: 0, end: metaLength },
        suggestions: [`Meta description muito curta. Recomendado: ${seoRules.metaDescLength.min}-${seoRules.metaDescLength.max} caracteres`],
        rule: 'meta-length'
      });
    } else if (metaLength > seoRules.metaDescLength.max) {
      suggestions.push({
        type: 'seo',
        severity: 'error',
        text: content.metaDescription,
        position: { start: 0, end: metaLength },
        suggestions: [`Meta description muito longa. Máximo: ${seoRules.metaDescLength.max} caracteres`],
        rule: 'meta-length'
      });
    }
  }

  // Heading structure validation
  if (content.headings && content.headings.length > 0) {
    const h1Count = content.headings.filter(h => h.startsWith('#') && !h.startsWith('##')).length;
    if (h1Count === 0) {
      suggestions.push({
        type: 'seo',
        severity: 'error',
        text: 'Missing H1',
        position: { start: 0, end: 0 },
        suggestions: ['Adicione um cabeçalho H1 principal'],
        rule: 'missing-h1'
      });
    } else if (h1Count > 1) {
      suggestions.push({
        type: 'seo',
        severity: 'error',
        text: 'Multiple H1s',
        position: { start: 0, end: 0 },
        suggestions: ['Use apenas um H1 por página'],
        rule: 'multiple-h1'
      });
    }
  }

  return {
    hasErrors: suggestions.filter(s => s.severity === 'error').length > 0,
    suggestions,
    score: Math.max(0, 100 - (suggestions.length * 8))
  };
};

/**
 * Comprehensive content validation
 */
export const validateContent = (content: {
  title?: string;
  metaDescription?: string;
  body: string;
  headings?: string[];
}): SpellCheckResult => {
  const brandValidation = validateModoPagTerms(content.body);
  const seoValidation = validateSEOContent(content);
  
  const allSuggestions = [...brandValidation.suggestions, ...seoValidation.suggestions];
  
  return {
    hasErrors: allSuggestions.filter(s => s.severity === 'error').length > 0,
    suggestions: allSuggestions,
    score: Math.round((brandValidation.score + seoValidation.score) / 2)
  };
};

/**
 * Generate content quality report
 */
export const generateQualityReport = (validation: SpellCheckResult) => {
  const errorCount = validation.suggestions.filter(s => s.severity === 'error').length;
  const warningCount = validation.suggestions.filter(s => s.severity === 'warning').length;
  const suggestionCount = validation.suggestions.filter(s => s.severity === 'suggestion').length;
  
  let grade = 'A';
  let message = 'Excelente qualidade de conteúdo!';
  
  if (validation.score < 70) {
    grade = 'D';
    message = 'Conteúdo precisa de revisão significativa';
  } else if (validation.score < 80) {
    grade = 'C';
    message = 'Conteúdo precisa de algumas correções';
  } else if (validation.score < 90) {
    grade = 'B';
    message = 'Boa qualidade, poucas melhorias necessárias';
  }
  
  return {
    grade,
    score: validation.score,
    message,
    summary: {
      errors: errorCount,
      warnings: warningCount,
      suggestions: suggestionCount,
      total: validation.suggestions.length
    }
  };
};