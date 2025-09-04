import { Helmet } from 'react-helmet-async';

interface SEOHelmetProps {
  title: string;
  description?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogImageWidth?: number;
  ogImageHeight?: number;
  ogType?: 'website' | 'article';
  noindex?: boolean;
  jsonLd?: object;
}

export const SEOHelmet = ({
  title,
  description,
  canonicalUrl,
  ogTitle,
  ogDescription,
  ogImage,
  ogImageWidth,
  ogImageHeight,
  ogType = 'website',
  noindex = false,
  jsonLd
}: SEOHelmetProps) => {
  const defaultOgImage = 'https://ajuda.modopag.com.br/og-default.jpg';
  const defaultDescription = 'Central de Ajuda modoPAG - Encontre respostas para suas dúvidas sobre pagamentos digitais, cartões e soluções financeiras.';

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description || defaultDescription} />
      
      {/* Open Graph */}
      <meta property="og:title" content={ogTitle || title} />
      <meta property="og:description" content={ogDescription || description || defaultDescription} />
      <meta property="og:image" content={ogImage || defaultOgImage} />
      {ogImageWidth && <meta property="og:image:width" content={ogImageWidth.toString()} />}
      {ogImageHeight && <meta property="og:image:height" content={ogImageHeight.toString()} />}
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content="modoPAG Central de Ajuda" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={ogTitle || title} />
      <meta name="twitter:description" content={ogDescription || description || defaultDescription} />
      <meta name="twitter:image" content={ogImage || defaultOgImage} />
      
      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {/* Robots */}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* JSON-LD */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
};
