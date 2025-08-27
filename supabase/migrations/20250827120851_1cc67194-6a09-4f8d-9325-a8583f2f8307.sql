-- Create FAQs table for dynamic FAQ management
CREATE TABLE public.faqs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'geral',
  position INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

-- Create policies for FAQ access
CREATE POLICY "Admin full access to faqs" 
ON public.faqs 
FOR ALL 
USING (is_current_user_admin())
WITH CHECK (is_current_user_admin());

CREATE POLICY "Public read access for faqs" 
ON public.faqs 
FOR SELECT 
USING (is_active = true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_faqs_updated_at
BEFORE UPDATE ON public.faqs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert existing hardcoded FAQs
INSERT INTO public.faqs (question, answer, category, position) VALUES
('Como posso usar o modoPAG para receber pagamentos?', 'O modoPAG oferece várias formas de receber pagamentos: através da maquininha, conta digital, Modo Link para vendas online, e muito mais. Você pode configurar sua conta e começar a receber pagamentos de forma rápida e segura.', 'geral', 1),
('Quais são as taxas do modoPAG?', 'O modoPAG oferece taxas competitivas no mercado. As taxas variam de acordo com o tipo de transação e plano escolhido. Consulte nossa página de preços ou entre em contato com nosso suporte para informações detalhadas sobre as taxas aplicáveis ao seu negócio.', 'taxas', 2),
('Como funciona a maquininha do modoPAG?', 'A maquininha modoPAG é fácil de usar e aceita diversos tipos de pagamento: cartão de débito, crédito, PIX e aproximação. Ela se conecta via Wi-Fi ou chip e oferece recebimento instantâneo com tarifas competitivas.', 'maquininha', 3),
('O modoPAG é seguro?', 'Sim! O modoPAG utiliza tecnologia de ponta em segurança, com criptografia avançada e conformidade com as normas do Banco Central. Seus dados e transações estão protegidos pelos mais altos padrões de segurança do mercado financeiro.', 'seguranca', 4),
('Como abrir uma conta digital no modoPAG?', 'Abrir sua conta digital modoPAG é simples e rápido! Baixe o app, faça seu cadastro com seus dados pessoais, envie os documentos necessários e pronto. Em poucos minutos você terá acesso a todos os recursos da conta digital.', 'conta-digital', 5),
('Posso receber suporte quando precisar?', 'Claro! O modoPAG oferece suporte completo através de diversos canais: chat no app, WhatsApp, telefone e email. Nossa equipe está pronta para ajudar você a resolver qualquer dúvida ou problema rapidamente.', 'suporte', 6);