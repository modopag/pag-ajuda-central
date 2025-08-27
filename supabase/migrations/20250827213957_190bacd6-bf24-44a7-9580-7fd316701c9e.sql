-- Create article_faqs table for per-article FAQs
CREATE TABLE public.article_faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  question text NOT NULL,
  answer text NOT NULL,
  position integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.article_faqs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admin full access to article_faqs" 
ON public.article_faqs 
FOR ALL 
USING (is_current_user_admin())
WITH CHECK (is_current_user_admin());

CREATE POLICY "Public read access for article_faqs" 
ON public.article_faqs 
FOR SELECT 
USING (is_active = true);

-- Create indexes for performance
CREATE INDEX idx_article_faqs_article_id ON public.article_faqs(article_id);
CREATE INDEX idx_article_faqs_position ON public.article_faqs(article_id, position);

-- Create trigger for updated_at
CREATE TRIGGER update_article_faqs_updated_at
  BEFORE UPDATE ON public.article_faqs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();