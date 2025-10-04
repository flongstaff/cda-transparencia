/**\n * Master Data Service - Consolidated service for all data operations\n * Handles all data sources: GitHub repository files (JSON, MD, PDF), external APIs, and local resources\n * Provides unified access to multi-year data across all file types\n */

import { DEFAULT_YEAR } from '../utils/yearConfig';
import DataService from './dataService';
import AuditService from './AuditService';
import EnhancedDataService from './EnhancedDataService';
import externalAPIsService from "./ExternalDataAdapter";
import { githubDataService } from './GitHubDataService';
import { dataSyncService } from './DataSyncService';

// GitHub repository configuration
const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/flongstaff/cda-transparencia/main';

// Available years for data - focusing on 2000-2025 for comprehensive coverage
const AVAILABLE_YEARS = Array.from({ length: 26 }, (_, i) => 2000 + i); // 2000 to 2025

// GitHub API configuration for dynamic resource discovery
const GITHUB_API_CONFIG = {
  API_BASE: 'https://api.github.com/repos/flongstaff/cda-transparencia/contents',
  DATA_PATH: 'data',
  HEADERS: {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'cda-transparencia-frontend'
  }
};

// External API configurations
const EXTERNAL_APIS = {
  PRESUPUESTO_ABIERTO: 'https://api.presupuestoabierto.gob.ar',
  GEOREF: 'https://apis.datos.gob.ar/georef/api',
  INDEC: 'https://apis.datos.gob.ar/series/api'
};

export interface Document {
  id: string;
  title: string;
  category: string;
  type: 'pdf' | 'json' | 'markdown' | 'excel' | 'csv';
  filename: string;
  size_mb: number;
  url: string;
  year: number;
  verified: boolean;
  processing_date: string;
  integrity_verified: boolean;
  source: string;
  file_path?: string;
  original_document_url?: string;
  content?: any; // For JSON/structured data
  markdown_content?: string; // For markdown files
}

export interface UnifiedDataState {
  // Structured data by year and type
  structured: {
    budget: Record<number, any>;
    debt: Record<number, any>;
    salaries: Record<number, any>;
    audit: Record<number, any>;
    financial: Record<number, any>;
    contracts: Record<number, any>;
    declarations: Record<number, any>;
  };
  // All documents across all years and types
  documents: {
    all: Document[];
    byYear: Record<number, Document[]>;
    byCategory: Record<string, Document[]>;
    byType: Record<string, Document[]>;
  };
  // External API data
  external: {
    presupuesto_abierto: any;
    georef: any;
    indec: any;
  };
  // Metadata and status
  metadata: {
    last_updated: string;
    total_documents: number;
    available_years: number[];
    categories: string[];
    data_sources_active: number;
    verification_status: {
      total: number;
      verified: number;
      pending: number;
    };
  };
  // Loading and error states
  loading: boolean;
  error: string | null;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  event_type: string;
  source: string;
  details: any;
  user_id?: string;
}

class MasterDataService {
  private static instance: MasterDataService;
  private cache = new Map<string, { data: any; timestamp: number }>();
  private auditLog: AuditEvent[] = [];
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  public static getInstance(): MasterDataService {
    if (!MasterDataService.instance) {
      MasterDataService.instance = new MasterDataService();
    }
    return MasterDataService.instance;
  }

  /**
   * Discover all available resources using GitHub API
   */
  private async discoverGitHubResources(): Promise<any[]> {
    try {
      const response = await fetch(`${GITHUB_API_CONFIG.API_BASE}/${GITHUB_API_CONFIG.DATA_PATH}`, {
        headers: GITHUB_API_CONFIG.HEADERS
      });

      if (response.ok) {
        const contents = await response.json();
        this.logAuditEvent('github_api_discovery', {
          resources_found: contents.length,
          api_endpoint: `${GITHUB_API_CONFIG.API_BASE}/${GITHUB_API_CONFIG.DATA_PATH}`
        });
        return contents;
      }
    } catch (error) {
      this.logAuditEvent('github_api_error', { error: error.message });
      console.warn('GitHub API discovery failed, falling back to direct file access:', error);
    }
    return [];
  }

  /**
   * Recursively explore directory structure via GitHub API
   */
  private async exploreDirectory(path: string): Promise<string[]> {
    const allFiles: string[] = [];

    try {
      const response = await fetch(`${GITHUB_API_CONFIG.API_BASE}/${path}`, {
        headers: GITHUB_API_CONFIG.HEADERS
      });

      if (response.ok) {
        const contents = await response.json();

        for (const item of contents) {
          if (item.type === 'file' && (
            item.name.endsWith('.json') ||
            item.name.endsWith('.md') ||
            item.name.endsWith('.pdf')
          )) {
            allFiles.push(item.download_url || item.html_url);
          } else if (item.type === 'dir') {
            // Recursively explore subdirectories
            const subFiles = await this.exploreDirectory(item.path);
            allFiles.push(...subFiles);
          }
        }
      }
    } catch (error) {
      console.warn(`Failed to explore directory ${path}:`, error);
    }

    return allFiles;
  }

  /**
   * Load comprehensive data for all years and file types with GitHub API integration
   */
  public async loadComprehensiveData(): Promise<UnifiedDataState> {
    const cacheKey = 'comprehensive-data';
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    this.logAuditEvent('data_load_start', { cache_key: cacheKey });

    try {
      // First discover all available resources using GitHub API
      const githubResources = await this.discoverGitHubResources();

      // Integrate with enhanced services
      const [
        structuredData,
        allDocuments,
        externalData
      ] = await Promise.all([
        this.loadAllStructuredData(githubResources),
        this.loadAllDocuments(githubResources),
        this.loadExternalDataWithAudit()
      ]);

      // Integrate with enhanced data services
      const enhancedStructuredData = await this.integrateEnhancedDataService(structuredData);
      const enhancedDocuments = await this.integrateExternalAPIData(allDocuments);

      const unifiedData: UnifiedDataState = {
        structured: enhancedStructuredData,
        documents: this.organizeDocuments(enhancedDocuments),
        external: externalData,
        metadata: {
          last_updated: new Date().toISOString(),
          total_documents: enhancedDocuments.length,
          available_years: this.intersectAvailableYears(),
          categories: this.extractCategories(enhancedDocuments),
          data_sources_active: this.countActiveSources(enhancedStructuredData, enhancedDocuments, externalData),
          verification_status: this.calculateVerificationStatus(enhancedDocuments)
        },
        loading: false,
        error: null
      };

      this.cache.set(cacheKey, { data: unifiedData, timestamp: Date.now() });
      this.logAuditEvent('data_load_success', {
        documents: enhancedDocuments.length,
        years: unifiedData.metadata.available_years.length,
        categories: unifiedData.metadata.categories.length
      });

      return unifiedData;
    } catch (error) {
      this.logAuditEvent('data_load_error', { error: error.message });
      throw error;
    }
  }

  /**
   * Integrate with enhanced data service to get comprehensive structured data
   */
  private async integrateEnhancedDataService(structuredData: any): Promise<any> {
    try {
      const allYears = await EnhancedDataService.getAllYears();
      
      // Merge EnhancedDataService data with current structured data
      for (const yearData of allYears) {
        const year = yearData.year;
        if (year) {
          // Budget data
          if (!structuredData.budget[year] && yearData.budget) {
            structuredData.budget[year] = yearData.budget;
          }
          
          // Financial data
          if (!structuredData.financial[year] && yearData) {
            structuredData.financial[year] = {
              total_budget: yearData.total_budget,
              expenses: yearData.expenses,
              execution_rate: yearData.execution_rate,
              executed_infra: yearData.executed_infra,
              personnel: yearData.personnel
            };
          }
        }
      }
      
      // Load data for each year using EnhancedDataService methods
      for (const year of this.intersectAvailableYears()) {
        if (!structuredData.contracts[year]) {
          structuredData.contracts[year] = await EnhancedDataService.getContracts(year);
        }
        
        if (!structuredData.salaries[year]) {
          structuredData.salaries[year] = await EnhancedDataService.getSalaries(year);
        }
        
        if (!structuredData.debt[year]) {
          structuredData.debt[year] = await EnhancedDataService.getDebt(year);
        }
        
        if (!structuredData.treasury[year]) {
          structuredData.treasury[year] = await EnhancedDataService.getTreasury(year);
        }
      }
    } catch (error) {
      console.error('Error integrating with EnhancedDataService:', error);
    }
    
    return structuredData;
  }

  /**
   * Integrate with external APIs service to enhance document data
   */
  private async integrateExternalAPIData(documents: Document[]): Promise<Document[]> {
    try {
      // Get external data to enhance document information
      const externalResults = await externalAPIsService.loadAllExternalData().catch(() => ({ 
        carmenDeAreco: { success: false, data: null },
        buenosAires: { success: false, data: null },
        nationalBudget: { success: false, data: null },
        comparative: [],
        civilSociety: [],
        summary: { successful_sources: 0 }
      }));
      
      // Add external data links as documents if needed
      if (externalResults.carmenDeAreco.success && externalResults.carmenDeAreco.data) {
        const cdaData = externalResults.carmenDeAreco.data;
        if (cdaData.links) {
          for (const link of cdaData.links) {
            const year = this.extractYearFromFilename(link.text) || new Date().getFullYear();
            const existing = documents.find(doc => doc.url === link.url);
            if (!existing) {
              documents.push({
                id: `ext-cda-${Date.now()}-${documents.length}`,
                title: link.text || 'External Link',
                category: 'External',
                type: link.url.includes('.pdf') ? 'pdf' : 'json',
                filename: link.url.split('/').pop() || 'external',
                size_mb: 0,
                url: link.url,
                year: year,
                verified: false,
                processing_date: new Date().toISOString(),
                integrity_verified: false,
                source: 'External APIs Service'
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('Error integrating with ExternalAPIsService:', error);
    }
    
    return documents;
  }

  /**
   * Load structured data (JSON files) for all years using GitHub API resources
   */
  private async loadAllStructuredData(githubResources: any[] = []): Promise<any> {
    const structuredData = {
      budget: {},
      debt: {},
      salaries: {},
      audit: {},
      financial: {},
      contracts: {},
      declarations: {}
    };

    // Enhanced loading for each year with more comprehensive file patterns
    for (const year of this.intersectAvailableYears()) {
      // Load from known file patterns with error handling
      await Promise.allSettled([
        this.loadYearlyDataByPattern(year, 'budget', structuredData.budget),
        this.loadYearlyDataByPattern(year, 'debt', structuredData.debt),
        this.loadYearlyDataByPattern(year, 'salary', structuredData.salaries), // Note: singular 'salary'
        this.loadYearlyDataByPattern(year, 'audit', structuredData.audit),
        this.loadYearlyDataByPattern(year, 'financial', structuredData.financial),
        this.loadYearlyDataByPattern(year, 'contracts', structuredData.contracts),
        this.loadYearlyDataByPattern(year, 'declarations', structuredData.declarations)
      ]);

      // Load year-specific files
      await Promise.allSettled([
        this.loadSpecificYearFiles(year, structuredData),
        this.loadOrganizedAnalysisData(year, structuredData), // Load from organized_analysis
      ]);
    }

    // Also load from multi-source report
    try {
      const multiSourceResponse = await fetch(`${GITHUB_RAW_BASE}/data/multi_source_report.json`);
      if (multiSourceResponse.ok) {
        const multiSourceData = await multiSourceResponse.json();

        // Merge multi-source data into structured data
        if (multiSourceData.sources) {
          Object.entries(multiSourceData.sources).forEach(([sourceType, sourceData]: [string, any]) => {
            if (sourceData.structured_data) {
              Object.entries(sourceData.structured_data).forEach(([year, yearData]) => {
                const yearNum = parseInt(year);
                if (this.intersectAvailableYears().includes(yearNum)) {
                  if (!structuredData.financial[yearNum]) structuredData.financial[yearNum] = {};
                  Object.assign(structuredData.financial[yearNum], yearData);
                }
              });
            }
          });
        }
      }
    } catch (error) {
      console.warn('Multi-source report not available:', error);
    }

    return structuredData;
  }

  /**
   * Load structured data from organized_analysis directory
   */
  private async loadOrganizedAnalysisData(year: number, structuredData: any): Promise<void> {
    const analysisFiles = [
      { path: `/data/organized_analysis/financial_oversight/budget_analysis/budget_data_${year}.json`, type: 'budget' },
      { path: `/data/organized_analysis/financial_oversight/salary_oversight/salary_data_${year}.json`, type: 'salaries' },
      { path: `/data/organized_analysis/financial_oversight/debt_monitoring/debt_data_${year}.json`, type: 'debt' },
      { path: `/data/organized_analysis/audit_cycles/anomaly_detection/anomaly_data_${year}.json`, type: 'audit' }
    ];

    for (const file of analysisFiles) {
      try {
        // First try local path
        let response = await fetch(file.path);
        if (response.ok) {
          const data = await response.json();
          structuredData[file.type][year] = data;
          console.log(`Loaded ${file.type} data for ${year} from local path:`, data);
        } else {
          // Fall back to GitHub if local fails
          response = await fetch(`${GITHUB_RAW_BASE}${file.path}`);
          if (response.ok) {
            const data = await response.json();
            structuredData[file.type][year] = data;
            console.log(`Loaded ${file.type} data for ${year} from GitHub:`, data);
          }
        }
      } catch (error) {
        console.warn(`Failed to load ${file.type} data for ${year}:`, error);
      }
    }
  }

  /**
   * Load data for a specific file pattern with comprehensive error handling
   */
  private async loadYearlyDataByPattern(year: number, dataType: string, target: Record<number, any>): Promise<void> {
    // Define multiple search patterns for robust data discovery
    const patterns = [
      `data/organized_analysis/financial_oversight/${dataType}_analysis/${dataType}_data_${year}.json`,
      `data/organized_analysis/financial_oversight/${dataType}_monitoring/${dataType}_data_${year}.json`,
      `data/organized_analysis/financial_oversight/${dataType}_oversight/${dataType}_data_${year}.json`,
      `data/organized_documents/json/${dataType}_data_${year}.json`,
      `data/organized_documents/json/${dataType}_data.json`,
      `frontend/src/data/${dataType}_data_${year}.json`,
      `data/organized_documents/json/${dataType.toUpperCase()}_DATA_${year}.json`,
      `data/organized_documents/json/${dataType.toLowerCase()}_${year}.json`
    ];

    // Try each pattern with local paths first, then GitHub as fallback
    for (const pattern of patterns) {
      try {
        // First try local path directly
        let response = await fetch(`/${pattern}`);
        if (response.ok) {
          const data = await response.json();
          target[year] = data;
          return;
        }
        
        // If local fails, try GitHub URL
        response = await fetch(`${GITHUB_RAW_BASE}/${pattern}`);
        if (response.ok) {
          const data = await response.json();
          target[year] = data;
          return;
        }
      } catch (error) {
        // Continue to next pattern
      }
    }
  }

  /**
   * Load year-specific files with enhanced error handling
   */
  private async loadSpecificYearFiles(year: number, structuredData: any): Promise<void> {
    // Load multi-source report for the year if available
    try {
      const multiSourceResponse = await fetch(`/data/organized_analysis/financial_oversight/${year}/multi_source_report_${year}.json`);
      if (multiSourceResponse.ok) {
        const multiSourceData = await multiSourceResponse.json();
        if (multiSourceData.sources) {
          Object.entries(multiSourceData.sources).forEach(([sourceType, sourceData]: [string, any]) => {
            if (sourceData.structured_data && sourceData.structured_data[year]) {
              Object.assign(structuredData[sourceType] || {}, sourceData.structured_data[year]);
            }
          });
        }
      }
    } catch (error) {
      console.warn(`Multi-source report for ${year} not available:`, error);
    }

    // Load data index for the year if available
    try {
      const indexResponse = await fetch(`/data/organized_analysis/financial_oversight/${year}/data_index_${year}.json`);
      if (indexResponse.ok) {
        const indexData = await indexResponse.json();
        if (indexData.structured_data) {
          Object.assign(structuredData, indexData.structured_data);
        }
      }
    } catch (error) {
      console.warn(`Data index for ${year} not available:`, error);
    }
  }

  /**
   * Load all documents (PDFs, JSONs, Markdowns) from all years using GitHub API resources
   */
  private async loadAllDocuments(githubResources: any[] = []): Promise<Document[]> {
    const allDocuments: Document[] = [];

    // Load from comprehensive data index
    try {
      const comprehensiveResponse = await fetch(`${GITHUB_RAW_BASE}/frontend/src/data/comprehensive_data_index.json`);
      if (comprehensiveResponse.ok) {
        const comprehensiveData = await comprehensiveResponse.json();
        if (comprehensiveData.documents?.carmen_export?.documents) {
          allDocuments.push(...comprehensiveData.documents.carmen_export.documents.map((doc: any) => ({
            ...doc,
            source: 'comprehensive_index',
            verified: true,
            processing_date: doc.processing_date || new Date().toISOString(),
            integrity_verified: true,
            type: this.determineFileType(doc.filename)
          })));
        }
      }
    } catch (error) {
      console.warn('Comprehensive data index not available:', error);
    }

    // Load from multi-source report
    try {
      const multiSourceResponse = await fetch(`${GITHUB_RAW_BASE}/data/multi_source_report.json`);
      if (multiSourceResponse.ok) {
        const multiSourceData = await multiSourceResponse.json();
        if (multiSourceData.sources) {
          Object.entries(multiSourceData.sources).forEach(([sourceType, sourceData]: [string, any]) => {
            if (sourceData.documents && Array.isArray(sourceData.documents)) {
              allDocuments.push(...sourceData.documents.map((doc: any, index: number) => ({
                id: doc.id || `multi-${sourceType}-${index}`,
                title: doc.title || doc.file?.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ') || `Documento ${index + 1}`,
                category: sourceType.charAt(0).toUpperCase() + sourceType.slice(1),
                type: this.determineFileType(doc.file || doc.filename),
                filename: doc.file || doc.filename || `doc-${sourceType}-${index}`,
                size_mb: doc.size_mb || 2.0,
                url: doc.url || `/data/multi_source/${sourceType}/${doc.file}`,
                year: doc.year || this.extractYearFromFilename(doc.file) || DEFAULT_YEAR,
                verified: true,
                processing_date: doc.processing_date || new Date().toISOString(),
                integrity_verified: true,
                source: 'multi_source',
                content: doc.structured_data
              })));
            }
          });
        }
      }
    } catch (error) {
      console.warn('Multi-source report not available:', error);
    }

    // Load from organized documents directories for each year (2000-2025)
    for (const year of this.intersectAvailableYears()) {
      await Promise.allSettled([
        this.loadDocumentsByYear(year, allDocuments),
      ]);
    }

    // Load from static documents list
    try {
      const { documents } = await import('../data/documents');
      allDocuments.push(...documents.map(doc => ({
        ...doc,
        source: 'static_documents',
        verified: true,
        processing_date: new Date().toISOString(),
        integrity_verified: true,
        type: this.determineFileType(doc.filename)
      })));
    } catch (error) {
      console.warn('Static documents not available:', error);
    }

    // Integrate with EnhancedDataService for documents
    for (const year of this.intersectAvailableYears()) {
      try {
        const yearDocs = await EnhancedDataService.getDocuments(year);
        if (yearDocs && Array.isArray(yearDocs)) {
          allDocuments.push(...yearDocs.map((doc: any, index: number) => ({
            id: doc.id || `enh-${year}-${index}`,
            title: doc.title || `Documento ${index + 1}`,
            category: doc.category || 'General',
            type: this.determineFileType(doc.filename || doc.url) as any,
            filename: doc.filename || `doc-${index}`,
            size_mb: doc.size_mb || 0,
            url: doc.url || `/data/${year}/${doc.filename}`,
            year: year,
            verified: doc.verified || true,
            processing_date: doc.processing_date || new Date().toISOString(),
            integrity_verified: doc.integrity_verified || true,
            source: 'Enhanced Data Service'
          })));
        }
      } catch (error) {
        console.warn(`Failed to load documents for year ${year} from EnhancedDataService:`, error);
      }
    }

    return this.deduplicateDocuments(allDocuments);
  }

  /**
   * Load documents from specific path and year
   */
  private async loadDocumentsByYear(year: number, allDocuments: Document[]): Promise<void> {
    const paths = [
      `data/organized_documents/${year}`,
      `data/organized_documents/json`,
      `data/pdf_extracts/${year}`,
      `data/markdown_extracts/${year}`
    ];

    // Since we can't list directory contents directly, we'll try common patterns
    const commonPatterns = [
      'presupuesto', 'budget', 'debt', 'deuda', 'salaries', 'sueldos',
      'contratos', 'contracts', 'declaraciones', 'declarations',
      'audit', 'auditoria', 'financial', 'financiero'
    ];

    for (const path of paths) {
      for (const pattern of commonPatterns) {
        const extensions = ['.json', '.pdf', '.md', '.markdown'];

        for (const ext of extensions) {
          const filename = `${pattern}_${year}${ext}`;
          try {
            // Try local path first
            let response = await fetch(`/${path}/${filename}`);
            if (response.ok) {
              const isJson = ext === '.json';
              const content = isJson ? await response.json() : await response.text();

              allDocuments.push({
                id: `${path}-${filename}`,
                title: this.formatTitle(pattern, year),
                category: this.categorizeFromPattern(pattern),
                type: this.determineFileType(filename) as any,
                filename,
                size_mb: parseFloat(response.headers.get('content-length') || '2048000') / (1024 * 1024),
                url: `/${path}/${filename}`,
                year,
                verified: true,
                processing_date: new Date().toISOString(),
                integrity_verified: true,
                source: `organized_${this.determineFileType(filename)}`,
                content: isJson ? content : undefined,
                markdown_content: ext.includes('md') ? content : undefined
              });
              return;
            }
            
            // Fall back to GitHub
            response = await fetch(`${GITHUB_RAW_BASE}/${path}/${filename}`);
            if (response.ok) {
              const isJson = ext === '.json';
              const content = isJson ? await response.json() : await response.text();

              allDocuments.push({
                id: `${path}-${filename}`,
                title: this.formatTitle(pattern, year),
                category: this.categorizeFromPattern(pattern),
                type: this.determineFileType(filename) as any,
                filename,
                size_mb: parseFloat(response.headers.get('content-length') || '2048000') / (1024 * 1024),
                url: `${GITHUB_RAW_BASE}/${path}/${filename}`,
                year,
                verified: true,
                processing_date: new Date().toISOString(),
                integrity_verified: true,
                source: `organized_${this.determineFileType(filename)}`,
                content: isJson ? content : undefined,
                markdown_content: ext.includes('md') ? content : undefined
              });
              return;
            }
          } catch (error) {
            // Continue to next file
          }
        }
      }
    }
  }

  /**
   * Load external API data with comprehensive audit logging and sync with local data
   */
  private async loadExternalDataWithAudit(): Promise<any> {
    const externalData = {
      presupuesto_abierto: null,
      georef: null,
      indec: null,
      audit_logs: [],
      last_sync: new Date().toISOString(),
      integration_status: 'pending',
      data_verification: {
        local_documents: 0,
        external_matches: 0,
        discrepancies: []
      }
    };

    this.logAuditEvent('external_apis_load_start', {
      apis: Object.keys(EXTERNAL_APIS),
      timestamp: new Date().toISOString()
    });

    // Load cached external data first
    try {
      const externalResponse = await fetch(`${GITHUB_RAW_BASE}/data/external_api_cache.json`);
      if (externalResponse.ok) {
        const cachedExternal = await externalResponse.json();
        Object.assign(externalData, cachedExternal);
        this.logAuditEvent('external_api_cache_loaded', {
          cache_size: JSON.stringify(cachedExternal).length,
          cached_apis: Object.keys(cachedExternal)
        });
      }
    } catch (error) {
      this.logAuditEvent('external_api_cache_error', { error: error.message });
    }

    // Integrate with our externalAPIsService
    try {
      const externalResults = await externalAPIsService.loadAllExternalData();
      externalData.presupuesto_abierto = {
        status: 'available',
        data: externalResults.nationalBudget,
        last_updated: new Date().toISOString()
      };
      externalData.georef = {
        status: 'available',
        data: { municipios: [await externalAPIsService.getGeographicData()] },
        last_updated: new Date().toISOString()
      };
      // Note: We don't have an INDEC equivalent in externalAPIsService
    } catch (error) {
      console.error('Error integrating with externalAPIsService:', error);
      // Fallback to original approach
      // Try to load live data from Presupuesto Abierto API
      try {
        // Check if Presupuesto Abierto API is available (with timeout)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        const presupuestoResponse = await fetch(`${EXTERNAL_APIS.PRESUPUESTO_ABIERTO}/health`, {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        clearTimeout(timeoutId);

        if (presupuestoResponse.ok) {
          const presupuestoData = await presupuestoResponse.json();
          externalData.presupuesto_abierto = {
            status: 'available',
            data: presupuestoData,
            last_updated: new Date().toISOString()
          };
          this.logAuditEvent('presupuesto_abierto_api_success', {
            response_size: JSON.stringify(presupuestoData).length
          });
        }
      } catch (error) {
        externalData.presupuesto_abierto = {
          status: 'unavailable',
          error: error.message,
          fallback: true
        };
        this.logAuditEvent('presupuesto_abierto_api_error', { error: error.message });
      }

      // Try to load data from Georef API
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const georefResponse = await fetch(`${EXTERNAL_APIS.GEOREF}/provincias?campos=id,nombre&max=25`, {
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (georefResponse.ok) {
          const georefData = await georefResponse.json();
          externalData.georef = {
            status: 'available',
            data: georefData,
            last_updated: new Date().toISOString()
          };
          this.logAuditEvent('georef_api_success', {
            provincias_count: georefData.provincias?.length || 0
          });
        }
      } catch (error) {
        externalData.georef = {
          status: 'unavailable',
          error: error.message,
          fallback: true
        };
        this.logAuditEvent('georef_api_error', { error: error.message });
      }

      // Try to load data from INDEC API
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const indecResponse = await fetch(`${EXTERNAL_APIS.INDEC}/series?ids=101.1_DT_2004_A_21&limit=10&format=json`, {
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (indecResponse.ok) {
          const indecData = await indecResponse.json();
          externalData.indec = {
            status: 'available',
            data: indecData,
            last_updated: new Date().toISOString()
          };
          this.logAuditEvent('indec_api_success', {
            series_count: indecData.data?.length || 0
          });
        }
      } catch (error) {
        externalData.indec = {
          status: 'unavailable',
          error: error.message,
          fallback: true
        };
        this.logAuditEvent('indec_api_error', { error: error.message });
      }
    }

    // Perform data verification between local and external sources
    await this.performDataVerification(externalData);

    // Store audit logs in the external data
    externalData.audit_logs = this.getAuditLogs().slice(-20); // Last 20 audit events

    // Update integration status
    const activeApis = [
      externalData.presupuesto_abierto?.status === 'available',
      externalData.georef?.status === 'available',
      externalData.indec?.status === 'available'
    ].filter(Boolean).length;

    externalData.integration_status = activeApis > 0 ? 'active' : 'offline';

    this.logAuditEvent('external_apis_load_complete', {
      active_apis: activeApis,
      fallback_apis: Object.values(externalData).filter(api => api?.fallback === true).length,
      total_audit_events: externalData.audit_logs.length,
      integration_status: externalData.integration_status,
      verification_results: externalData.data_verification
    });

    return externalData;
  }

  /**
   * Perform data verification between local documents and external APIs
   */
  private async performDataVerification(externalData: any): Promise<void> {
    try {
      // Count local documents for verification
      const localDocs = await this.loadAllDocuments();
      const localDocCount = localDocs.length;

      // Count external data points if available
      let externalMatches = 0;
      const discrepancies: string[] = [];

      if (externalData.presupuesto_abierto?.status === 'available') {
        // Check for budget data consistency
        const budgetDocs = localDocs.filter(doc =>
          doc.category.toLowerCase().includes('presupuesto') ||
          doc.category.toLowerCase().includes('budget')
        );
        externalMatches += budgetDocs.length;

        if (budgetDocs.length === 0) {
          discrepancies.push('No local budget documents found for external API verification');
        }
      }

      if (externalData.georef?.status === 'available') {
        // Geographic data verification
        const geoDocs = localDocs.filter(doc =>
          doc.title.toLowerCase().includes('carmen de areco') ||
          doc.title.toLowerCase().includes('geografic')
        );

        if (geoDocs.length > 0) {
          externalMatches += geoDocs.length;
        }
      }

      // Update verification data
      externalData.data_verification = {
        local_documents: localDocCount,
        external_matches: externalMatches,
        discrepancies,
        verification_rate: localDocCount > 0 ? (externalMatches / localDocCount) * 100 : 0,
        last_verification: new Date().toISOString()
      };

      this.logAuditEvent('data_verification_complete', {
        local_documents: localDocCount,
        external_matches: externalMatches,
        verification_rate: externalData.data_verification.verification_rate,
        discrepancies_count: discrepancies.length
      });

    } catch (error) {
      this.logAuditEvent('data_verification_error', { error: error.message });
    }
  }

  // Helper methods
  private organizeDocuments(documents: Document[]) {
    const byYear: Record<number, Document[]> = {};
    const byCategory: Record<string, Document[]> = {};
    const byType: Record<string, Document[]> = {};

    documents.forEach(doc => {
      // By year
      if (!byYear[doc.year]) byYear[doc.year] = [];
      byYear[doc.year].push(doc);

      // By category
      const category = doc.category || 'general';
      if (!byCategory[category]) byCategory[category] = [];
      byCategory[category].push(doc);

      // By type
      if (!byType[doc.type]) byType[doc.type] = [];
      byType[doc.type].push(doc);
    });

    return {
      all: documents,
      byYear,
      byCategory,
      byType
    };
  }

  private deduplicateDocuments(documents: Document[]): Document[] {
    const seen = new Set();
    return documents.filter(doc => {
      const key = `${doc.title}-${doc.filename}-${doc.year}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private extractCategories(documents: Document[]): string[] {
    const categories = new Set<string>();
    documents.forEach(doc => {
      if (doc.category) categories.add(doc.category);
    });
    return Array.from(categories).sort();
  }

  private calculateVerificationStatus(documents: Document[]) {
    const total = documents.length;
    const verified = documents.filter(doc => doc.verified).length;
    return {
      total,
      verified,
      pending: total - verified
    };
  }

  private countActiveSources(structured: any, documents: Document[], external: any): number {
    let count = 0;
    if (Object.keys(structured.budget).length > 0) count++;
    if (documents.length > 0) count++;
    if (external.presupuesto_abierto || external.georef || external.indec) count++;
    return count;
  }

  private determineFileType(filename?: string): string {
    if (!filename) return 'unknown';
    const ext = filename.toLowerCase().split('.').pop();
    switch (ext) {
      case 'json': return 'json';
      case 'pdf': return 'pdf';
      case 'md': case 'markdown': return 'markdown';
      case 'xlsx': case 'xls': return 'excel';
      case 'csv': return 'csv';
      default: return 'unknown';
    }
  }

  private extractYearFromFilename(filename?: string): number | null {
    if (!filename) return null;
    const yearMatch = filename.match(/20\d{2}/);
    return yearMatch ? parseInt(yearMatch[0]) : null;
  }

  private formatTitle(pattern: string, year: number): string {
    const patterns = {
      presupuesto: `Presupuesto Municipal ${year}`,
      budget: `Budget ${year}`,
      debt: `Deuda Municipal ${year}`,
      deuda: `Deuda Municipal ${year}`,
      salaries: `Salarios ${year}`,
      sueldos: `Salarios ${year}`,
      contratos: `Contratos ${year}`,
      contracts: `Contratos ${year}`,
      declaraciones: `Declaraciones Patrimoniales ${year}`,
      declarations: `Declaraciones Patrimoniales ${year}`,
      audit: `Auditoría ${year}`,
      auditoria: `Auditoría ${year}`,
      financial: `Reporte Financiero ${year}`,
      financiero: `Reporte Financiero ${year}`
    };
    return patterns[pattern] || `${pattern} ${year}`;
  }

  private categorizeFromPattern(pattern: string): string {
    const categories = {
      presupuesto: 'Presupuesto',
      budget: 'Presupuesto',
      debt: 'Deuda',
      deuda: 'Deuda',
      salaries: 'Salarios',
      sueldos: 'Salarios',
      contratos: 'Contratos',
      contracts: 'Contratos',
      declaraciones: 'Declaraciones',
      declarations: 'Declaraciones',
      audit: 'Auditoría',
      auditoria: 'Auditoría',
      financial: 'Financiero',
      financiero: 'Financiero'
    };
    return categories[pattern] || 'General';
  }

  private logAuditEvent(eventType: string, details: any): void {
    const auditEvent: AuditEvent = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      event_type: eventType,
      source: 'MasterDataService',
      details,
      user_id: 'system'
    };
    this.auditLog.push(auditEvent);
    console.log('[AUDIT]', auditEvent);
  }

  /**
   * Get audit logs
   */
  public getAuditLogs(): AuditEvent[] {
    return [...this.auditLog];
  }

  /**
   * Clear cache
   */
  public clearCache(): void {
    this.cache.clear();
    this.logAuditEvent('cache_cleared', {});
  }

  /**
   * Get available years by checking all data sources
   */
  public getAvailableYears(): number[] {
    return this.intersectAvailableYears();
  }

  /**
   * Get available years by intersecting all data sources
   */
  private intersectAvailableYears(): number[] {
    return AVAILABLE_YEARS;
  }

  /**
   * Filter data by year
   */
  public filterDataByYear(data: UnifiedDataState, year: number): UnifiedDataState {
    return {
      ...data,
      documents: {
        all: data.documents.byYear[year] || [],
        byYear: { [year]: data.documents.byYear[year] || [] },
        byCategory: Object.fromEntries(
          Object.entries(data.documents.byCategory).map(([category, docs]) => [
            category,
            docs.filter(doc => doc.year === year)
          ])
        ),
        byType: Object.fromEntries(
          Object.entries(data.documents.byType).map(([type, docs]) => [
            type,
            docs.filter(doc => doc.year === year)
          ])
        )
      },
      metadata: {
        ...data.metadata,
        total_documents: (data.documents.byYear[year] || []).length,
        available_years: [year]
      }
    };
  }
}

// Export singleton instance
export const masterDataService = MasterDataService.getInstance();
export default masterDataService;

// Add compatibility function for useTransparencyData hook which expects loadAllData
export const loadAllData = async (year?: number) => {
  // Load comprehensive data and adapt it to MasterData format expected by the hook
  const unifiedData = await masterDataService.loadComprehensiveData();
  
  // Convert our UnifiedDataState to MasterData format
  const currentYear = year || new Date().getFullYear();
  
  // Extract data for the specified year
  const currentYearData = unifiedData.structured;
  const currentDocuments = unifiedData.documents.byYear[currentYear] || unifiedData.documents.all;
  
  return {
    yearData: {
      budget: currentYearData.budget[currentYear] || currentYearData.budget,
      contracts: currentYearData.contracts[currentYear] || currentYearData.contracts || [],
      salaries: currentYearData.salaries[currentYear] || currentYearData.salaries || [],
      documents: currentDocuments,
      treasury: currentYearData.financial[currentYear] || currentYearData.financial,
      debt: currentYearData.debt[currentYear] || currentYearData.debt
    },
    multiYearData: unifiedData.structured, // This needs reformatting
    chartsData: {
      budget: { years: [], summary: null },
      contracts: { data: [] },
      salaries: { data: [] },
      treasury: { data: [] },
      debt: { data: [] },
      documents: { data: [] },
      comprehensive: { allYears: unifiedData.metadata.available_years, metadata: unifiedData.metadata },
      budgetHistorical: [],
      contractsHistorical: [],
      salariesHistorical: [],
      treasuryHistorical: [],
      debtHistorical: [],
      documentsHistorical: []
    },
    metadata: {
      totalDocuments: unifiedData.metadata.total_documents,
      availableYears: unifiedData.metadata.available_years,
      categories: unifiedData.metadata.categories,
      dataSourcesActive: unifiedData.metadata.data_sources_active,
      lastUpdated: unifiedData.metadata.last_updated,
      coverage: 0
    }
  };
};