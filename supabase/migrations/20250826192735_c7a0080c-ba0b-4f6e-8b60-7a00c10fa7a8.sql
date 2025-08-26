-- Fase B: Categorias Reais modoPAG
-- Limpar categorias existentes (dummy data)
TRUNCATE TABLE public.categories RESTART IDENTITY CASCADE;

-- Inserir as 9 categorias reais da modoPAG
INSERT INTO public.categories (name, slug, description, icon_url, position, is_active, created_at, updated_at) VALUES
(
  'Conta Digital PagBank',
  'conta-digital-pagbank',
  'Tudo sobre sua conta digital PagBank, transferências, cartões e serviços bancários',
  '/icons/conta-digital-pagbank.svg',
  1,
  true,
  now(),
  now()
),
(
  'Dúvidas Iniciais',
  'duvidas-iniciais',
  'Primeiros passos com a modoPAG, cadastro, ativação e configurações básicas',
  '/icons/duvidas-iniciais.svg',
  2,
  true,
  now(),
  now()
),
(
  'Entrega e Status do Pedido',
  'entrega-e-status-do-pedido',
  'Acompanhe sua entrega, prazos, rastreamento e status do seu pedido',
  '/icons/entrega-status.svg',
  3,
  true,
  now(),
  now()
),
(
  'Link de Pagamento ModoLINK',
  'link-de-pagamento-modolink',
  'Como criar, personalizar e gerenciar seus links de pagamento ModoLINK',
  '/icons/modolink.svg',
  4,
  true,
  now(),
  now()
),
(
  'Maquininhas modoPAG',
  'maquininhas-modopag',
  'Guias completos sobre nossas maquininhas, configuração, uso e manutenção',
  '/icons/maquininha.svg',
  5,
  true,
  now(),
  now()
),
(
  'Segurança e Prevenção de Fraudes',
  'seguranca-e-prevencao-de-fraudes',
  'Mantenha suas transações seguras e aprenda sobre prevenção de fraudes',
  '/icons/seguranca.svg',
  6,
  true,
  now(),
  now()
),
(
  'Suporte e Contato',
  'suporte-e-contato',
  'Como entrar em contato conosco, canais de atendimento e suporte técnico',
  '/icons/suporte.svg',
  7,
  true,
  now(),
  now()
),
(
  'Taxas e Recebimentos',
  'taxas-e-recebimentos',
  'Entenda nossas taxas, prazos de recebimento e formas de pagamento',
  '/icons/taxas.svg',
  8,
  true,
  now(),
  now()
),
(
  'Termos, Políticas e Contratos',
  'termos-politicas-e-contratos',
  'Contratos, termos de uso, políticas de privacidade e documentos legais',
  '/icons/termos.svg',
  9,
  true,
  now(),
  now()
);