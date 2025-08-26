-- Populate initial data with proper UUIDs

-- Insert categories (let database generate UUIDs)
INSERT INTO public.categories (name, slug, description, icon_url, position, is_active) VALUES
('Configurações da Conta', 'configuracoes-conta', 'Como configurar e gerenciar sua conta no modoPAG', '/api/placeholder/24/24', 1, true),
('Pagamentos e Transações', 'pagamentos-transacoes', 'Processar pagamentos e gerenciar suas transações', '/api/placeholder/24/24', 2, true),
('API e Integrações', 'api-integracoes', 'Integrar o modoPAG em seu sistema usando nossa API', '/api/placeholder/24/24', 3, true),
('Relatórios e Análises', 'relatorios-analises', 'Gerar relatórios e análises de suas transações', '/api/placeholder/24/24', 4, true),
('Suporte e Ajuda', 'suporte-ajuda', 'Obtenha ajuda e entre em contato conosco', '/api/placeholder/24/24', 5, true);

-- Insert tags
INSERT INTO public.tags (name, slug) VALUES
('PIX', 'pix'),
('Cartão de Crédito', 'cartao-credito'),
('Boleto', 'boleto'),
('API', 'api'),
('Webhook', 'webhook'),
('Dashboard', 'dashboard'),
('Integração', 'integracao'),
('Configuração', 'configuracao');

-- Insert sample articles (using category references)
WITH cat_ids AS (
  SELECT id, slug FROM public.categories
)
INSERT INTO public.articles (title, slug, category_id, content, status, published_at, author, meta_title, meta_description, reading_time_minutes, type, first_paragraph)
SELECT 
  'Como criar sua conta no modoPAG',
  'como-criar-conta-modopag',
  cat_ids.id,
  '<h2>Criando sua conta</h2><p>Para começar a usar o modoPAG, você precisa criar uma conta. Este processo é simples e leva apenas alguns minutos.</p><p>Acesse nosso site e clique em "Criar Conta" no canto superior direito.</p>',
  'published',
  NOW(),
  'Admin modoPAG',
  'Como criar conta no modoPAG - Guia completo',
  'Aprenda como criar sua conta no modoPAG em poucos passos simples. Guia completo para começar a usar nossa plataforma de pagamentos.',
  3,
  'tutorial',
  'Para começar a usar o modoPAG, você precisa criar uma conta. Este processo é simples e leva apenas alguns minutos.'
FROM cat_ids WHERE cat_ids.slug = 'configuracoes-conta'

UNION ALL

SELECT 
  'Configurando PIX na sua conta',
  'configurando-pix-conta',
  cat_ids.id,
  '<h2>Configuração do PIX</h2><p>O PIX é o método de pagamento instantâneo do Banco Central do Brasil. Configurar o PIX em sua conta modoPAG é essencial para receber pagamentos instantâneos.</p><p>Acesse suas configurações de pagamento no dashboard.</p>',
  'published',
  NOW(),
  'Admin modoPAG',
  'Como configurar PIX no modoPAG',
  'Configure o PIX em sua conta modoPAG e comece a receber pagamentos instantâneos dos seus clientes.',
  5,
  'tutorial',
  'O PIX é o método de pagamento instantâneo do Banco Central do Brasil. Configurar o PIX em sua conta modoPAG é essencial para receber pagamentos instantâneos.'
FROM cat_ids WHERE cat_ids.slug = 'pagamentos-transacoes'

UNION ALL

SELECT 
  'Integração via API REST',
  'integracao-api-rest',
  cat_ids.id,
  '<h2>API REST do modoPAG</h2><p>Nossa API REST permite integrar facilmente o modoPAG em qualquer sistema. Com poucos endpoints, você pode processar pagamentos e consultar transações.</p><p>A documentação completa está disponível em nosso portal de desenvolvedores.</p>',
  'published',
  NOW(),
  'Admin modoPAG',
  'Integração API REST modoPAG',
  'Integre o modoPAG em seu sistema usando nossa API REST. Documentação completa e exemplos práticos.',
  8,
  'tutorial',
  'Nossa API REST permite integrar facilmente o modoPAG em qualquer sistema. Com poucos endpoints, você pode processar pagamentos e consultar transações.'
FROM cat_ids WHERE cat_ids.slug = 'api-integracoes';

-- Create relationships between articles and tags
WITH article_data AS (
  SELECT id, slug FROM public.articles
), tag_data AS (
  SELECT id, slug FROM public.tags
)
INSERT INTO public.article_tags (article_id, tag_id)
SELECT article_data.id, tag_data.id
FROM article_data, tag_data
WHERE (article_data.slug = 'como-criar-conta-modopag' AND tag_data.slug = 'configuracao')
   OR (article_data.slug = 'configurando-pix-conta' AND tag_data.slug IN ('pix', 'configuracao'))
   OR (article_data.slug = 'integracao-api-rest' AND tag_data.slug IN ('api', 'integracao'));

-- Insert sample settings
INSERT INTO public.settings (key, value, type) VALUES
('site_title', 'Central de Ajuda modoPAG', 'text'),
('site_description', 'Central de ajuda e documentação do modoPAG - sua plataforma de pagamentos completa', 'text'),
('contact_email', 'suporte@modopag.com.br', 'text'),
('whatsapp_number', '+5511999999999', 'text'),
('google_analytics_id', '', 'text'),
('brand_logo_black', '/modopag-logo-black.webp', 'text'),
('brand_logo_yellow', '/modopag-logo-yellow.webp', 'text');