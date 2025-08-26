import { useEffect } from 'react';
import { useSettings } from '@/hooks/useSettings';

export default function RobotsTxt() {
  const { seo } = useSettings();

  useEffect(() => {
    // Set appropriate headers for robots.txt response
    const meta = document.createElement('meta');
    meta.httpEquiv = 'content-type';
    meta.content = 'text/plain; charset=UTF-8';
    document.head.appendChild(meta);
    
    return () => {
      document.head.removeChild(meta);
    };
  }, []);

  const robotsContent = seo.robots_txt || `User-agent: *
Allow: /
Disallow: /admin/

Sitemap: ${seo.site_url}sitemap.xml`;

  return (
    <pre style={{ 
      fontFamily: 'monospace', 
      margin: 0, 
      padding: '10px',
      whiteSpace: 'pre-wrap' 
    }}>
      {robotsContent}
    </pre>
  );
}