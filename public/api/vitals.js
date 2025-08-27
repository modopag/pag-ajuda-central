// Mock endpoint for Web Vitals metrics in development/demo
// In production, this would be handled by a real backend

export default function handler(req, res) {
  // Enable CORS for development
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const vitalsData = JSON.parse(req.body);
    
    // Log Web Vitals data (in production, store in database/analytics service)
    console.log('[Web Vitals Mock Endpoint]', {
      metric: vitalsData.name,
      value: vitalsData.value,
      path: vitalsData.path,
      timestamp: new Date(vitalsData.timestamp).toISOString()
    });

    // Mock successful response
    res.status(200).json({ 
      success: true, 
      message: 'Web Vitals data received',
      received: vitalsData.name 
    });
    
  } catch (error) {
    console.error('[Web Vitals Mock Endpoint] Error:', error);
    res.status(400).json({ error: 'Invalid data format' });
  }
}