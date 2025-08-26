import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Import bundle analyzer for development performance monitoring
if (import.meta.env.DEV) {
  import('./utils/bundleAnalyzer');
}

createRoot(document.getElementById("root")!).render(<App />);
