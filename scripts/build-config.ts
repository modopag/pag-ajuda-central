/**
 * Build configuration for SSG
 */

export const BUILD_CONFIG = {
  // Maximum number of articles to pre-render
  MAX_ARTICLES: 100,
  
  // Site URL for canonical URLs and sitemaps
  SITE_URL: 'https://ajuda.modopag.com.br',
  
  // Batch size for rendering to prevent memory issues
  RENDER_BATCH_SIZE: 10,
  
  // Default meta description
  DEFAULT_DESCRIPTION: 'Central de Ajuda modoPAG - Encontre respostas para suas dúvidas sobre pagamentos digitais, cartões e soluções financeiras.',
  
  // Default OG image
  DEFAULT_OG_IMAGE: 'https://ajuda.modopag.com.br/og-default.jpg',
  
  // Routes to exclude from pre-rendering
  EXCLUDED_ROUTES: [
    '/admin',
    '/auth',
    '/login',
    '/dashboard',
  ],
  
  // Enable/disable features
  FEATURES: {
    generateSitemap: true,
    generateRobotsTxt: true,
    optimizeImages: true,
    validateSEO: true,
  },
} as const;