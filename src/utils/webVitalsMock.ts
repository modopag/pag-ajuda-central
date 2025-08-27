// Mock Web Vitals endpoint for development and testing
// This provides a fallback when the real /api/vitals endpoint is not available

export const mockWebVitalsEndpoint = (vitalsData: any) => {
  // In development, log to console for debugging
  if (import.meta.env.DEV) {
    console.group(`🚀 [Web Vitals] ${vitalsData.name}`);
    console.log('Value:', `${vitalsData.value}ms`);
    console.log('Page:', vitalsData.path);
    console.log('Timestamp:', new Date(vitalsData.timestamp).toLocaleString());
    console.log('Rating:', getVitalRating(vitalsData.name, vitalsData.value));
    console.groupEnd();
  }

  // Return a resolved promise to match real endpoint behavior
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ 
      success: true, 
      message: 'Mock endpoint - data logged to console',
      received: vitalsData.name 
    })
  });
};

// Helper to provide feedback on Web Vitals performance
const getVitalRating = (name: string, value: number): string => {
  const thresholds = {
    CLS: { good: 0.1, needsImprovement: 0.25 },
    FCP: { good: 1800, needsImprovement: 3000 },
    INP: { good: 200, needsImprovement: 500 },
    LCP: { good: 2500, needsImprovement: 4000 },
    TTFB: { good: 800, needsImprovement: 1800 }
  };

  const threshold = thresholds[name as keyof typeof thresholds];
  if (!threshold) return 'unknown';

  if (value <= threshold.good) return '✅ Good';
  if (value <= threshold.needsImprovement) return '⚠️ Needs Improvement';
  return '❌ Poor';
};