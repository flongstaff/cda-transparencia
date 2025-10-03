/**
 * API Configuration for Carmen de Areco Transparency Portal
 * Handles different environments and API endpoint configuration
 */

// Default configuration for development
const defaultConfig = {
  API_BASE_URL: 'http://localhost:3001',
  CHARTS_DATA_URL: '/data/charts',
  USE_API: false,
};

// Production configuration for cda-transparencia.org
const productionConfig = {
  API_BASE_URL: 'https://cda-transparencia-api.franco-longstaff.workers.dev',
  CHARTS_DATA_URL: '/data/charts',
  USE_API: true,
};

// Configuration for GitHub Pages deployment
const githubConfig = {
  API_BASE_URL: 'https://api.cda-transparencia.org',
  CHARTS_DATA_URL: 'https://api.cda-transparencia.org/data/charts',
  USE_API: true,
};

// Detect environment and return appropriate config
function getAPIConfig() {
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  
  // Safely access environment variables
  const viteApiUrl = typeof process !== 'undefined' && process.env ? process.env.VITE_API_URL : undefined;
  const viteChartsDataUrl = typeof process !== 'undefined' && process.env ? process.env.VITE_CHARTS_DATA_URL : undefined;
  const viteUseApi = typeof process !== 'undefined' && process.env ? process.env.VITE_USE_API : undefined;
  
  if (hostname.includes('cda-transparencia.org') || hostname.includes('github.io')) {
    // For production and GitHub Pages deployment
    return {
      API_BASE_URL: (viteApiUrl ? viteApiUrl.replace('/api', '') : undefined) || githubConfig.API_BASE_URL,
      CHARTS_DATA_URL: viteChartsDataUrl || githubConfig.CHARTS_DATA_URL,
      USE_API: viteUseApi === 'true' || githubConfig.USE_API,
    };
  } else {
    // For development
    return {
      API_BASE_URL: (viteApiUrl ? viteApiUrl.replace('/api', '') : undefined) || defaultConfig.API_BASE_URL,
      CHARTS_DATA_URL: viteChartsDataUrl || defaultConfig.CHARTS_DATA_URL,
      USE_API: viteUseApi === 'true' || defaultConfig.USE_API,
    };
  }
}

export const API_CONFIG = getAPIConfig();

// Helper function to build API URLs
export function buildApiUrl(endpoint: string): string {
  let baseUrl = API_CONFIG.API_BASE_URL;
  
  // Ensure baseUrl ends with a slash
  if (!baseUrl.endsWith('/')) {
    baseUrl += '/';
  }
  
  // Ensure endpoint starts with 'api/' if it doesn't already
  if (!endpoint.startsWith('api/')) {
    endpoint = `api/${endpoint}`;
  }
  
  return baseUrl + endpoint;
}

// Helper function to build data URLs (for charts, CSV files, etc.)
export function buildDataUrl(path: string): string {
  let baseUrl = API_CONFIG.CHARTS_DATA_URL;
  
  // Ensure baseUrl ends with a slash
  if (baseUrl && !baseUrl.endsWith('/')) {
    baseUrl += '/';
  }
  
  return (baseUrl || '') + path;
}