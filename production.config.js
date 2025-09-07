/**
 * Production Configuration for Carmen de Areco Transparency Portal
 * Weekend Deployment Configuration
 */

module.exports = {
  // Environment configuration
  environment: 'production',
  
  // API endpoints for production
  api: {
    baseUrl: process.env.PROD_API_URL || 'https://api.carmendeareco-transparencia.com',
    backupUrl: process.env.BACKUP_API_URL || 'https://backup-api.carmendeareco-transparencia.com',
    timeout: 30000,
    retryAttempts: 3
  },
  
  // Database configuration
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    name: process.env.DB_NAME || 'transparency_portal',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    ssl: true,
    connectionPool: {
      min: 5,
      max: 20,
      idle: 10000
    }
  },
  
  // Static file serving
  static: {
    documentsPath: '/data/documents',
    archivePath: '/data/archive_materials/source_materials_20250826_161623',
    livePath: '/data/live_scrape',
    maxFileSize: '50MB',
    allowedExtensions: ['.pdf', '.xlsx', '.csv', '.json']
  },
  
  // Security configuration
  security: {
    corsOrigins: [
      'https://carmendeareco-transparencia.com',
      'https://www.carmendeareco-transparencia.com',
      'https://transparencia.carmendeareco.gob.ar'
    ],
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000 // limit each IP to 1000 requests per windowMs
    },
    helmet: true,
    compression: true
  },
  
  // Performance optimization
  performance: {
    enableCaching: true,
    cacheTimeout: 3600, // 1 hour
    compression: true,
    minify: true,
    bundleAnalyzer: false,
    lazy: true
  },
  
  // Monitoring and logging
  monitoring: {
    enableAnalytics: true,
    logLevel: 'info',
    errorTracking: true,
    performanceMonitoring: true,
    uptimeChecks: [
      'https://carmendeareco-transparencia.com/api/health',
      'https://carmendeareco-transparencia.com/audit'
    ]
  },
  
  // Real-time data integration
  dataIntegration: {
    scraperEndpoint: 'https://api.carmendeareco-transparencia.com/scraper',
    updateInterval: 3600000, // 1 hour
    powerBiUrl: 'https://app.powerbi.com/view?r=eyJrIjoiYzhjNWNhNmItOWY5Zi00OWExLTliMzAtMjYxZTM0NjM1Y2Y2IiwidCI6Ijk3MDQwMmVmLWNhZGMtNDcyOC05MjI2LTk3ZGRlODY4ZDg2ZCIsImMiOjR9&pageName=ReportSection',
    officialSources: [
      'https://carmendeareco.gob.ar/transparencia/',
      'https://carmendeareco.gob.ar/transparencia/finanzas/',
      'https://carmendeareco.gob.ar/transparencia/licitaciones/'
    ]
  },
  
  // Deployment configuration
  deployment: {
    buildCommand: 'npm run build',
    startCommand: 'npm start',
    port: process.env.PORT || 3000,
    publicUrl: process.env.PUBLIC_URL || 'https://carmendeareco-transparencia.com',
    healthCheck: '/api/health',
    readinessCheck: '/api/ready'
  }
};