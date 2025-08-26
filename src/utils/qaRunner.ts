// QA Test Runner for modoPAG Central de Ajuda

import { generateSEOReport } from './seoValidation';
import { measureCoreWebVitals } from './lighthouse';
import { trackPerformanceMetrics } from './ga4Events';

export interface QAResults {
  timestamp: string;
  url: string;
  seo: {
    issues: string[];
    warnings: string[];
    score: number;
  };
  performance: {
    lcp?: number;
    fid?: number;
    cls?: number;
    ttfb?: number;
    score: number;
  };
  accessibility: {
    issues: string[];
    score: number;
  };
  ga4: {
    configured: boolean;
    eventsTracked: string[];
  };
  jsonLd: {
    valid: boolean;
    schemas: string[];
  };
  overall: {
    score: number;
    status: 'excellent' | 'good' | 'needs-improvement' | 'poor';
  };
}

/**
 * Run comprehensive QA tests
 */
export const runQATests = async (): Promise<QAResults> => {
  console.log('🚀 Starting QA Tests for modoPAG Central de Ajuda');

  const timestamp = new Date().toISOString();
  const url = window.location.href;

  // SEO Tests
  console.log('📊 Running SEO tests...');
  const seoReport = generateSEOReport();
  const seoScore = calculateSEOScore(seoReport.seo);

  // Performance Tests
  console.log('⚡ Running Performance tests...');
  const vitals = measureCoreWebVitals();
  const performanceScore = calculatePerformanceScore(vitals);

  // Accessibility Tests
  console.log('♿ Running Accessibility tests...');
  const accessibilityResults = runAccessibilityTests();

  // GA4 Tests
  console.log('📈 Running GA4 tests...');
  const ga4Results = testGA4Configuration();

  // JSON-LD Tests
  console.log('🔍 Running JSON-LD tests...');
  const jsonLdResults = validateJsonLd();

  // Calculate overall score
  const overallScore = Math.round(
    (seoScore + performanceScore + accessibilityResults.score + 
     (ga4Results.configured ? 100 : 50) + (jsonLdResults.valid ? 100 : 50)) / 5
  );

  const results: QAResults = {
    timestamp,
    url,
    seo: {
      issues: seoReport.seo.issues,
      warnings: seoReport.seo.warnings,
      score: seoScore
    },
    performance: {
      ...vitals,
      score: performanceScore
    },
    accessibility: accessibilityResults,
    ga4: ga4Results,
    jsonLd: jsonLdResults,
    overall: {
      score: overallScore,
      status: overallScore >= 90 ? 'excellent' : 
              overallScore >= 75 ? 'good' : 
              overallScore >= 50 ? 'needs-improvement' : 'poor'
    }
  };

  // Send performance metrics to GA4
  if (ga4Results.configured) {
    trackPerformanceMetrics(vitals);
  }

  // Log results
  logQAResults(results);

  return results;
};

/**
 * Calculate SEO score based on issues and warnings
 */
const calculateSEOScore = (seo: { issues: string[]; warnings: string[] }): number => {
  const issuesPenalty = seo.issues.length * 15;
  const warningsPenalty = seo.warnings.length * 5;
  return Math.max(0, 100 - issuesPenalty - warningsPenalty);
};

/**
 * Calculate performance score based on Core Web Vitals
 */
const calculatePerformanceScore = (vitals: { lcp?: number; fid?: number; cls?: number; ttfb?: number }): number => {
  let score = 100;

  if (vitals.lcp !== undefined) {
    if (vitals.lcp > 4000) score -= 30;
    else if (vitals.lcp > 2500) score -= 15;
  }

  if (vitals.fid !== undefined) {
    if (vitals.fid > 300) score -= 25;
    else if (vitals.fid > 100) score -= 10;
  }

  if (vitals.cls !== undefined) {
    if (vitals.cls > 0.25) score -= 25;
    else if (vitals.cls > 0.1) score -= 10;
  }

  if (vitals.ttfb !== undefined) {
    if (vitals.ttfb > 1800) score -= 20;
    else if (vitals.ttfb > 800) score -= 10;
  }

  return Math.max(0, score);
};

/**
 * Run accessibility tests
 */
const runAccessibilityTests = () => {
  const issues: string[] = [];

  // Check for skip links
  const skipLinks = document.querySelectorAll('a[href^="#"]:first-child');
  if (skipLinks.length === 0) {
    issues.push('Missing skip navigation links');
  }

  // Check for alt attributes on images
  const imagesWithoutAlt = document.querySelectorAll('img:not([alt])');
  if (imagesWithoutAlt.length > 0) {
    issues.push(`${imagesWithoutAlt.length} images missing alt attributes`);
  }

  // Check for form labels
  const inputsWithoutLabels = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])');
  const unlabeledInputs = Array.from(inputsWithoutLabels).filter(input => {
    const id = input.getAttribute('id');
    return !id || !document.querySelector(`label[for="${id}"]`);
  });
  if (unlabeledInputs.length > 0) {
    issues.push(`${unlabeledInputs.length} form inputs missing proper labels`);
  }

  // Check color contrast (basic check)
  const lowContrastElements = document.querySelectorAll('.text-gray-400, .text-gray-500');
  if (lowContrastElements.length > 0) {
    issues.push('Potential color contrast issues detected');
  }

  // Check for ARIA landmarks
  const landmarks = document.querySelectorAll('main, nav, header, footer, aside, section[aria-label]');
  if (landmarks.length < 3) {
    issues.push('Insufficient ARIA landmarks for screen readers');
  }

  const score = Math.max(0, 100 - (issues.length * 15));
  return { issues, score };
};

/**
 * Test GA4 configuration
 */
const testGA4Configuration = () => {
  const configured = !!(window.gtag || window.dataLayer);
  const eventsTracked = [
    'page_view',
    'search',
    'article_engagement', 
    'feedback_submission',
    'whatsapp_contact',
    'web_vitals'
  ];

  return {
    configured,
    eventsTracked: configured ? eventsTracked : []
  };
};

/**
 * Validate JSON-LD structured data
 */
const validateJsonLd = () => {
  const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]');
  let valid = true;
  const schemas: string[] = [];

  jsonLdScripts.forEach(script => {
    try {
      const data = JSON.parse(script.textContent || '');
      if (data['@type']) {
        schemas.push(data['@type']);
      } else if (Array.isArray(data)) {
        data.forEach(item => {
          if (item['@type']) schemas.push(item['@type']);
        });
      }
    } catch (e) {
      valid = false;
    }
  });

  return { valid, schemas };
};

/**
 * Log QA results to console
 */
const logQAResults = (results: QAResults) => {
  console.group('🎯 QA Test Results');
  
  console.log(`📊 Overall Score: ${results.overall.score}/100 (${results.overall.status})`);
  
  console.group('🔍 SEO Results');
  console.log(`Score: ${results.seo.score}/100`);
  if (results.seo.issues.length > 0) console.error('Issues:', results.seo.issues);
  if (results.seo.warnings.length > 0) console.warn('Warnings:', results.seo.warnings);
  console.groupEnd();
  
  console.group('⚡ Performance Results');
  console.log(`Score: ${results.performance.score}/100`);
  console.log('Core Web Vitals:', {
    LCP: results.performance.lcp ? `${results.performance.lcp}ms` : 'Not measured',
    FID: results.performance.fid ? `${results.performance.fid}ms` : 'Not measured',
    CLS: results.performance.cls ? results.performance.cls.toFixed(3) : 'Not measured',
    TTFB: results.performance.ttfb ? `${results.performance.ttfb}ms` : 'Not measured'
  });
  console.groupEnd();
  
  console.group('♿ Accessibility Results');
  console.log(`Score: ${results.accessibility.score}/100`);
  if (results.accessibility.issues.length > 0) {
    console.warn('Issues:', results.accessibility.issues);
  }
  console.groupEnd();
  
  console.group('📈 GA4 Results');
  console.log(`Configured: ${results.ga4.configured ? '✅' : '❌'}`);
  console.log('Tracked Events:', results.ga4.eventsTracked);
  console.groupEnd();
  
  console.group('🔍 JSON-LD Results');
  console.log(`Valid: ${results.jsonLd.valid ? '✅' : '❌'}`);
  console.log('Schemas:', results.jsonLd.schemas);
  console.groupEnd();
  
  console.groupEnd();
};

// Auto-run QA tests in development mode
if (import.meta.env.DEV && typeof window !== 'undefined') {
  let qaTestsRun = false;
  
  const runQAWhenReady = () => {
    if (!qaTestsRun && document.readyState === 'complete') {
      qaTestsRun = true;
      setTimeout(runQATests, 5000); // Wait 5 seconds after page load
    }
  };

  if (document.readyState === 'complete') {
    runQAWhenReady();
  } else {
    window.addEventListener('load', runQAWhenReady);
  }
}