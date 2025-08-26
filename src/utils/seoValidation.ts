// SEO validation utilities for modoPAG Central de Ajuda

/**
 * Validate page SEO elements
 */
export const validatePageSEO = () => {
  const issues: string[] = [];
  const warnings: string[] = [];

  // Check title tag
  const title = document.querySelector('title')?.textContent;
  if (!title) {
    issues.push('Missing title tag');
  } else if (title.length > 60) {
    warnings.push(`Title too long (${title.length} chars, recommended < 60)`);
  } else if (title.length < 30) {
    warnings.push(`Title too short (${title.length} chars, recommended > 30)`);
  }

  // Check meta description
  const metaDescription = document.querySelector('meta[name="description"]')?.getAttribute('content');
  if (!metaDescription) {
    issues.push('Missing meta description');
  } else if (metaDescription.length > 160) {
    warnings.push(`Meta description too long (${metaDescription.length} chars, recommended < 160)`);
  } else if (metaDescription.length < 120) {
    warnings.push(`Meta description too short (${metaDescription.length} chars, recommended > 120)`);
  }

  // Check canonical URL
  const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute('href');
  if (!canonical) {
    warnings.push('Missing canonical URL');
  }

  // Check H1 tag
  const h1Tags = document.querySelectorAll('h1');
  if (h1Tags.length === 0) {
    issues.push('Missing H1 tag');
  } else if (h1Tags.length > 1) {
    issues.push(`Multiple H1 tags found (${h1Tags.length})`);
  }

  // Check heading structure
  const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
  let lastLevel = 0;
  headings.forEach((heading, index) => {
    const level = parseInt(heading.tagName.substring(1));
    if (index > 0 && level > lastLevel + 1) {
      warnings.push(`Heading structure issue: ${heading.tagName} follows H${lastLevel}`);
    }
    lastLevel = level;
  });

  // Check images alt text
  const images = document.querySelectorAll('img');
  let imagesWithoutAlt = 0;
  images.forEach(img => {
    if (!img.alt || img.alt.trim() === '') {
      imagesWithoutAlt++;
    }
  });
  if (imagesWithoutAlt > 0) {
    issues.push(`${imagesWithoutAlt} images missing alt text`);
  }

  // Check internal links
  const internalLinks = document.querySelectorAll('a[href^="/"], a[href^="#"]');
  let brokenLinks = 0;
  internalLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === '#' || href === '') {
      brokenLinks++;
    }
  });
  if (brokenLinks > 0) {
    warnings.push(`${brokenLinks} links with empty or # href`);
  }

  // Check structured data
  const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]');
  if (jsonLdScripts.length === 0) {
    warnings.push('No structured data found');
  } else {
    jsonLdScripts.forEach((script, index) => {
      try {
        JSON.parse(script.textContent || '');
      } catch (e) {
        issues.push(`Invalid JSON-LD in script ${index + 1}`);
      }
    });
  }

  return { issues, warnings };
};

/**
 * Validate Core Web Vitals thresholds
 */
export const validateWebVitals = (vitals: { lcp?: number; fid?: number; cls?: number; ttfb?: number }) => {
  const results = {
    lcp: { value: vitals.lcp, status: 'unknown' as 'good' | 'needs-improvement' | 'poor' | 'unknown' },
    fid: { value: vitals.fid, status: 'unknown' as 'good' | 'needs-improvement' | 'poor' | 'unknown' },
    cls: { value: vitals.cls, status: 'unknown' as 'good' | 'needs-improvement' | 'poor' | 'unknown' },
    ttfb: { value: vitals.ttfb, status: 'unknown' as 'good' | 'needs-improvement' | 'poor' | 'unknown' }
  };

  // LCP thresholds
  if (vitals.lcp !== undefined) {
    if (vitals.lcp <= 2500) results.lcp.status = 'good';
    else if (vitals.lcp <= 4000) results.lcp.status = 'needs-improvement';
    else results.lcp.status = 'poor';
  }

  // FID thresholds
  if (vitals.fid !== undefined) {
    if (vitals.fid <= 100) results.fid.status = 'good';
    else if (vitals.fid <= 300) results.fid.status = 'needs-improvement';
    else results.fid.status = 'poor';
  }

  // CLS thresholds
  if (vitals.cls !== undefined) {
    if (vitals.cls <= 0.1) results.cls.status = 'good';
    else if (vitals.cls <= 0.25) results.cls.status = 'needs-improvement';
    else results.cls.status = 'poor';
  }

  // TTFB thresholds
  if (vitals.ttfb !== undefined) {
    if (vitals.ttfb <= 800) results.ttfb.status = 'good';
    else if (vitals.ttfb <= 1800) results.ttfb.status = 'needs-improvement';
    else results.ttfb.status = 'poor';
  }

  return results;
};

/**
 * Generate SEO audit report
 */
export const generateSEOReport = () => {
  const seoValidation = validatePageSEO();
  const url = window.location.href;
  const timestamp = new Date().toISOString();

  const report = {
    url,
    timestamp,
    seo: seoValidation,
    metadata: {
      title: document.title,
      description: document.querySelector('meta[name="description"]')?.getAttribute('content'),
      canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href'),
      ogTitle: document.querySelector('meta[property="og:title"]')?.getAttribute('content'),
      ogDescription: document.querySelector('meta[property="og:description"]')?.getAttribute('content'),
      ogImage: document.querySelector('meta[property="og:image"]')?.getAttribute('content'),
    },
    performance: {
      // Will be populated by performance observer
      navigationTiming: performance.getEntriesByType('navigation')[0],
      resourceCount: performance.getEntriesByType('resource').length
    }
  };

  if (import.meta.env.DEV) {
    console.group('🔍 SEO Audit Report');
    console.log('URL:', url);
    console.log('Timestamp:', timestamp);
    
    if (seoValidation.issues.length > 0) {
      console.error('❌ Issues:', seoValidation.issues);
    }
    
    if (seoValidation.warnings.length > 0) {
      console.warn('⚠️ Warnings:', seoValidation.warnings);
    }
    
    if (seoValidation.issues.length === 0 && seoValidation.warnings.length === 0) {
      console.log('✅ No SEO issues found!');
    }
    
    console.log('📊 Metadata:', report.metadata);
    console.groupEnd();
  }

  return report;
};

// Auto-generate report in development
if (import.meta.env.DEV && typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(generateSEOReport, 2000); // Wait for page to fully load
  });
}