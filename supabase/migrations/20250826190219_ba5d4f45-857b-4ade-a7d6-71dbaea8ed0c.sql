-- Populate initial data from MockAdapter

-- Insert categories
INSERT INTO public.categories (id, name, slug, description, icon_url, position, is_active) VALUES
('cat_1', 'Configurações da Conta', 'configuracoes-conta', 'Como configurar e gerenciar sua conta no modoPAG', '/api/placeholder/24/24', 1, true),
('cat_2', 'Pagamentos e Transações', 'pagamentos-transacoes', 'Processar pagamentos e gerenciar suas transações', '/api/placeholder/24/24', 2, true),
('cat_3', 'API e Integrações', 'api-integracoes', 'Integrar o modoPAG em seu sistema usando nossa API', '/api/placeholder/24/24', 3, true),
('cat_4', 'Relatórios e Análises', 'relatorios-analises', 'Gerar relatórios e análises de suas transações', '/api/placeholder/24/24', 4, true),
('cat_5', 'Suporte e Ajuda', 'suporte-ajuda', 'Obtenha ajuda e entre em contato conosco', '/api/placeholder/24/24', 5, true);

-- Insert tags
INSERT INTO public.tags (id, name, slug) VALUES
('tag_1', 'PIX', 'pix'),
('tag_2', 'Cartão de Crédito', 'cartao-credito'),
('tag_3', 'Boleto', 'boleto'),
('tag_4', 'API', 'api'),
('tag_5', 'Webhook', 'webhook'),
('tag_6', 'Dashboard', 'dashboard'),
('tag_7', 'Integração', 'integracao'),
('tag_8', 'Configuração', 'configuracao');

-- Insert sample articles
INSERT INTO public.articles (id, title, slug, category_id, content, status, published_at, author, meta_title, meta_description, reading_time_minutes, type, first_paragraph) VALUES
('art_1', 'Como criar sua conta no modoPAG', 'como-criar-conta-modopag', 'cat_1', 
 '<h2>Criando sua conta</h2><p>Para começar a usar o modoPAG, você precisa criar uma conta. Este processo é simples e leva apenas alguns minutos.</p><p>Acesse nosso site e clique em "Criar Conta" no canto superior direito.</p>',
 'published', NOW(), 'Admin modoPAG', 'Como criar conta no modoPAG - Guia completo', 'Aprenda como criar sua conta no modoPAG em poucos passos simples. Guia completo para começar a usar nossa plataforma de pagamentos.', 3, 'tutorial', 'Para começar a usar o modoPAG, você precisa criar uma conta. Este processo é simples e leva apenas alguns minutos.'),

('art_2', 'Configurando PIX na sua conta', 'configurando-pix-conta', 'cat_2',
 '<h2>Configuração do PIX</h2><p>O PIX é o método de pagamento instantâneo do Banco Central do Brasil. Configurar o PIX em sua conta modoPAG é essencial para receber pagamentos instantâneos.</p><p>Acesse suas configurações de pagamento no dashboard.</p>',
 'published', NOW(), 'Admin modoPAG', 'Como configurar PIX no modoPAG', 'Configure o PIX em sua conta modoPAG e comece a receber pagamentos instantâneos dos seus clientes.', 5, 'tutorial', 'O PIX é o método de pagamento instantâneo do Banco Central do Brasil. Configurar o PIX em sua conta modoPAG é essencial para receber pagamentos instantâneos.'),

('art_3', 'Integração via API REST', 'integracao-api-rest', 'cat_3',
 '<h2>API REST do modoPAG</h2><p>Nossa API REST permite integrar facilmente o modoPAG em qualquer sistema. Com poucos endpoints, você pode processar pagamentos e consultar transações.</p><p>A documentação completa está disponível em nosso portal de desenvolvedores.</p>',
 'published', NOW(), 'Admin modoPAG', 'Integração API REST modoPAG', 'Integre o modoPAG em seu sistema usando nossa API REST. Documentação completa e exemplos práticos.', 8, 'tutorial', 'Nossa API REST permite integrar facilmente o modoPAG em qualquer sistema. Com poucos endpoints, você pode processar pagamentos e consultar transações.');

-- Insert article tags relationships
INSERT INTO public.article_tags (article_id, tag_id) VALUES
('art_1', 'tag_8'),
('art_2', 'tag_1'),
('art_2', 'tag_8'),
('art_3', 'tag_4'),
('art_3', 'tag_7');

-- Insert sample settings
INSERT INTO public.settings (key, value, type) VALUES
('site_title', 'Central de Ajuda modoPAG', 'text'),
('site_description', 'Central de ajuda e documentação do modoPAG - sua plataforma de pagamentos completa', 'text'),
('contact_email', 'suporte@modopag.com.br', 'text'),
('whatsapp_number', '+5511999999999', 'text'),
('google_analytics_id', '', 'text'),
('brand_logo_black', '/modopag-logo-black.webp', 'text'),
('brand_logo_yellow', '/modopag-logo-yellow.webp', 'text');