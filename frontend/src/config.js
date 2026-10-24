// MnVisionAI API Base Configuration
// Dynamically routes to localhost in local development and relative URL in production (e.g. Render)
export const API_BASE = import.meta.env.VITE_API_BASE !== undefined
  ? import.meta.env.VITE_API_BASE
  : (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? 'http://127.0.0.1:8000'
      : '');
