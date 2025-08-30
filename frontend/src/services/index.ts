// Central Services Index for Carmen de Areco Transparency Portal
// This file organizes all service classes and provides typed exports

// Core API Services
export { default as ApiService } from './ApiService';
export { EnhancedApiService } from './EnhancedApiService';
export { default as RealDataService } from './RealDataService';
export { default as LocalDataService } from './LocalDataService';

// Data Processing Services
export { default as ComprehensiveDataService } from './ComprehensiveDataService';
export { default as FinancialDataService } from './FinancialDataService';
export { default as YearlyDataService } from './YearlyDataService';
export { default as OfficialDataService } from './OfficialDataService';

// PowerBI Integration Services
export { default as PowerBIDataService } from './PowerBIDataService';
export { default as PowerBIIntegrationService } from './PowerBIIntegrationService';
export { default as CarmenArecoPowerBIService } from './CarmenArecoPowerBIService';

// Data Quality and Validation Services
export { default as DataValidationService } from './DataValidationService';
export { default as CrossValidationService } from './CrossValidationService';
export { default as OSINTComplianceService } from './OSINTComplianceService';
export { default as DataAnonymizationService } from './DataAnonymizationService';

// Web Scraping and External Data
export { default as CarmenArecoWebScraper } from './CarmenAreco_WebScraper';
export { default as MarkdownDataService } from './MarkdownDataService';

// Service Registry - Maps service type to implementation
export const SERVICE_REGISTRY = {
  // Primary data sources
  primary: {
    api: 'ApiService',
    enhanced: 'EnhancedApiService', 
    real: 'RealDataService',
    local: 'LocalDataService'
  },
  
  // Specialized data services
  specialized: {
    comprehensive: 'ComprehensiveDataService',
    financial: 'FinancialDataService',
    yearly: 'YearlyDataService',
    official: 'OfficialDataService'
  },
  
  // PowerBI integration
  powerbi: {
    data: 'PowerBIDataService',
    integration: 'PowerBIIntegrationService',
    carmenAreco: 'CarmenArecoPowerBIService'
  },
  
  // Data quality and validation
  validation: {
    validation: 'DataValidationService',
    crossValidation: 'CrossValidationService',
    osint: 'OSINTComplianceService',
    anonymization: 'DataAnonymizationService'
  },
  
  // External data acquisition
  external: {
    scraper: 'CarmenArecoWebScraper',
    markdown: 'MarkdownDataService'
  }
} as const;

// Service capabilities mapping
export const SERVICE_CAPABILITIES = {
  ApiService: {
    description: 'Core API service for municipal data',
    capabilities: ['budgets', 'expenses', 'revenues', 'tenders', 'employees'],
    dataTypes: ['financial', 'personnel', 'contracts'],
    realTime: true,
    caching: false
  },
  
  EnhancedApiService: {
    description: 'Enhanced API with additional processing',
    capabilities: ['budgets', 'expenses', 'revenues', 'analytics', 'reporting'],
    dataTypes: ['financial', 'analytics', 'reports'],
    realTime: true,
    caching: true
  },
  
  RealDataService: {
    description: 'Service for real municipal data processing',
    capabilities: ['documents', 'validation', 'processing'],
    dataTypes: ['documents', 'official', 'validated'],
    realTime: false,
    caching: true
  },
  
  LocalDataService: {
    description: 'Local data storage and retrieval',
    capabilities: ['storage', 'retrieval', 'backup'],
    dataTypes: ['all'],
    realTime: false,
    caching: true
  },
  
  ComprehensiveDataService: {
    description: 'Comprehensive data aggregation service',
    capabilities: ['aggregation', 'analysis', 'reporting'],
    dataTypes: ['all'],
    realTime: false,
    caching: true
  },
  
  FinancialDataService: {
    description: 'Specialized financial data processing',
    capabilities: ['budgets', 'expenses', 'revenues', 'analysis'],
    dataTypes: ['financial'],
    realTime: true,
    caching: true
  },
  
  YearlyDataService: {
    description: 'Yearly data aggregation and comparison',
    capabilities: ['yearly-aggregation', 'comparison', 'trends'],
    dataTypes: ['yearly'],
    realTime: false,
    caching: true
  },
  
  OfficialDataService: {
    description: 'Official municipal data from authoritative sources',
    capabilities: ['official-data', 'authentication', 'verification'],
    dataTypes: ['official', 'verified'],
    realTime: true,
    caching: false
  },
  
  PowerBIDataService: {
    description: 'PowerBI data integration service',
    capabilities: ['powerbi-integration', 'dashboards', 'reporting'],
    dataTypes: ['powerbi', 'dashboards'],
    realTime: true,
    caching: false
  },
  
  PowerBIIntegrationService: {
    description: 'PowerBI integration and embedding',
    capabilities: ['embed', 'authentication', 'reports'],
    dataTypes: ['powerbi'],
    realTime: true,
    caching: false
  },
  
  CarmenArecoPowerBIService: {
    description: 'Carmen de Areco specific PowerBI service',
    capabilities: ['municipal-dashboards', 'local-integration'],
    dataTypes: ['municipal', 'powerbi'],
    realTime: true,
    caching: false
  },
  
  DataValidationService: {
    description: 'Data validation and quality assurance',
    capabilities: ['validation', 'quality-check', 'error-detection'],
    dataTypes: ['all'],
    realTime: false,
    caching: false
  },
  
  CrossValidationService: {
    description: 'Cross-validation between data sources',
    capabilities: ['cross-validation', 'source-verification', 'consistency'],
    dataTypes: ['all'],
    realTime: false,
    caching: true
  },
  
  OSINTComplianceService: {
    description: 'OSINT compliance and verification service',
    capabilities: ['osint', 'compliance', 'verification'],
    dataTypes: ['osint', 'compliance'],
    realTime: false,
    caching: true
  },
  
  DataAnonymizationService: {
    description: 'Data anonymization for privacy protection',
    capabilities: ['anonymization', 'privacy', 'gdpr'],
    dataTypes: ['sensitive'],
    realTime: false,
    caching: false
  },
  
  CarmenArecoWebScraper: {
    description: 'Web scraper for Carmen de Areco official sites',
    capabilities: ['scraping', 'document-extraction', 'updates'],
    dataTypes: ['web', 'documents'],
    realTime: false,
    caching: true
  },
  
  MarkdownDataService: {
    description: 'Markdown file processing service',
    capabilities: ['markdown', 'documentation', 'processing'],
    dataTypes: ['documentation'],
    realTime: false,
    caching: true
  }
} as const;

// Service Factory - Get the right service for a task
export const getServiceForTask = (taskType: string, year?: number) => {
  const taskMap: Record<string, any> = {
    'pdf_viewing': ComprehensiveDataService,
    'powerbi_data': PowerBIDataService,
    'markdown_docs': MarkdownDataService,
    'financial_data': FinancialDataService,
    'yearly_data': YearlyDataService,
    'official_data': OfficialDataService,
    'validation': DataValidationService,
    'cross_validation': CrossValidationService,
    'web_scraping': CarmenArecoWebScraper
  };

  const ServiceClass = taskMap[taskType] || ComprehensiveDataService;
  return new ServiceClass();
};

// Unified data loading helper
export const loadAllDataForDocument = async (documentTitle: string, year?: number, category?: string) => {
  const results: any = {
    timestamp: new Date().toISOString(),
    document: { title: documentTitle, year, category },
    sources: {}
  };

  try {
    // Load comprehensive data
    const comprehensiveService = new ComprehensiveDataService();
    results.sources.comprehensive = await comprehensiveService.getAllSourcesData();

    // Load PowerBI data
    const powerbiService = new PowerBIDataService();
    results.sources.powerbi = await powerbiService.getAllData();

    // Load markdown documentation
    const markdownService = new MarkdownDataService();
    results.sources.markdown = await markdownService.getAllDocuments();

    // Load yearly index if year provided
    if (year) {
      const response = await fetch(`/src/data/data_index_${year}.json`);
      if (response.ok) {
        results.sources.yearly_index = await response.json();
      }
    }

    // Load comprehensive index
    const compResponse = await fetch('/src/data/comprehensive_data_index.json');
    if (compResponse.ok) {
      results.sources.comprehensive_index = await compResponse.json();
    }

  } catch (error) {
    console.error('Error loading document data:', error);
    results.error = error instanceof Error ? error.message : 'Unknown error';
  }

  return results;
};

// Helper functions for service management
export const getServicesByCapability = (capability: string) => {
  return Object.entries(SERVICE_CAPABILITIES)
    .filter(([_, config]) => config.capabilities.includes(capability))
    .map(([serviceName, _]) => serviceName);
};

export const getServicesByDataType = (dataType: string) => {
  return Object.entries(SERVICE_CAPABILITIES)
    .filter(([_, config]) => config.dataTypes.includes(dataType) || config.dataTypes.includes('all'))
    .map(([serviceName, _]) => serviceName);
};

export const getRealTimeServices = () => {
  return Object.entries(SERVICE_CAPABILITIES)
    .filter(([_, config]) => config.realTime)
    .map(([serviceName, _]) => serviceName);
};

export const getCachedServices = () => {
  return Object.entries(SERVICE_CAPABILITIES)
    .filter(([_, config]) => config.caching)
    .map(([serviceName, _]) => serviceName);
};

export const getServiceInfo = (serviceName: string) => {
  return SERVICE_CAPABILITIES[serviceName as keyof typeof SERVICE_CAPABILITIES];
};

// Export service registry as default
export { SERVICE_REGISTRY as default };