-- Add SEO image structure to articles table
ALTER TABLE articles ADD COLUMN seo_image JSONB DEFAULT NULL;

-- Create storage bucket for post assets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'post-assets',
  'post-assets', 
  true,
  524288, -- 512 KB limit
  ARRAY['image/jpeg', 'image/webp', 'image/png']
);

-- Storage policies for post assets
CREATE POLICY "Public read access for post assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'post-assets');

CREATE POLICY "Admin upload access for post assets"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'post-assets' AND is_current_user_admin());

CREATE POLICY "Admin delete access for post assets"
ON storage.objects FOR DELETE
USING (bucket_id = 'post-assets' AND is_current_user_admin());

-- Create index for SEO image queries
CREATE INDEX idx_articles_seo_image ON articles USING GIN (seo_image);

-- Add comment for documentation
COMMENT ON COLUMN articles.seo_image IS 'Structured SEO image data: {url, alt, width, height, caption}';