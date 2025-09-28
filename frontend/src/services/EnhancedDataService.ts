/**
 * Enhanced Data Service - Optimized service for data fetching and caching
 * Improved performance and reliability for production environment
 */

import Papa from 'papaparse';
import externalAPIsService from './ExternalAPIsService';

// Define interfaces for data structures to avoid using 'any'
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expires: number;
}

interface YearData {
  year: number;
  total_budget: number;
  expenses: number;
  execution_rate: number;
  external_source?: string;
  total_executed?: number;
}

interface Contract {
  id?: string | number;
  title?: string;
  url?: string;
  year?: number;
  value?: number;
  contractor?: string;
  [key: string]: unknown; // Allow for other properties
}

interface BudgetData {
  year: number;
  total_budget: number;
  total_executed: number;
  execution_rate: number;
  documents?: unknown;
  external_source?: string;
  budget_links?: { text: string, url: string }[];
}

interface Document {
  id?: string | number;
  title?: string;
  url?: string;
  year?: number;
  category?: string;
  source?: string;
  [key: string]: unknown; // Allow for other properties
}

interface TreasuryData {
  year: number;
  income: number;
  expenses: number;
  balance: number;
}

interface SalaryData {
  year?: number;
  monthly_salaries?: { month: string, data: unknown }[];
  total_months?: number;
  salaries?: unknown[];
  [key: string]: unknown;
}

interface DebtData {
  year: number;
  total_debt: number;
  debt_service: number;
  debt_by_type?: unknown;
  analysis?: unknown;
}

// Enhanced data service with improved caching and error handling
class EnhancedDataService {
  private static instance: EnhancedDataService;
  private cache = new Map<string, CacheEntry<unknown>>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private readonly LONG_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes for expensive operations

  private constructor() {}

  public static getInstance(): EnhancedDataService {
    if (!EnhancedDataService.instance) {
      EnhancedDataService.instance = new EnhancedDataService();
    }
    return EnhancedDataService.instance;
  }

  /**
   * Generic fetch with caching and error handling
   */
  private async fetchWithCache<T>(
    url: string, 
    cacheKey: string, 
    options: RequestInit = {},
    cacheDuration: number = this.CACHE_DURATION
  ): Promise<T | null> {
    try {
      // Check cache first
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() < cached.expires) {
        return cached.data as T;
      }

      // Fetch fresh data
      const response = await fetch(url, {
        ...options,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          ...options.headers
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Cache the result
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
        expires: Date.now() + cacheDuration
      });

      return data;
    } catch (error) {
      console.error(`Error fetching ${url}:`, error);
      
      // Try to return cached data even if expired
      const cached = this.cache.get(cacheKey);
      if (cached) {
        console.warn(`Returning expired cached data for ${url}`);
        return cached.data as T;
      }
      
      return null;
    }
  }

  /**
   * Fetch JSON data with enhanced error handling
   */
  public async fetchJson<T>(url: string, cacheKey?: string): Promise<T | null> {
    const key = cacheKey || `json-${url}`;
    return this.fetchWithCache<T>(url, key);
  }

  /**
   * Fetch CSV data and parse it
   */
  public async fetchCsv<T>(url: string, cacheKey?: string): Promise<T[] | null> {
    const key = cacheKey || `csv-${url}`;
    
    try {
      // Check cache first
      const cached = this.cache.get(key);
      if (cached && Date.now() < cached.expires) {
        return cached.data as T[];
      }

      // Fetch CSV data
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const csvText = await response.text();
      
      // Parse CSV
      const parsed = Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        transform: (value) => {
          // Try to convert numeric strings to numbers
          if (!isNaN(Number(value)) && value.trim() !== '') {
            return Number(value);
          }
          return value;
        }
      });

      const data = parsed.data as T[];
      
      // Cache the result
      this.cache.set(key, {
        data,
        timestamp: Date.now(),
        expires: Date.now() + this.CACHE_DURATION
      });

      return data;
    } catch (error) {
      console.error(`Error fetching CSV ${url}:`, error);
      
      // Try to return cached data even if expired
      const cached = this.cache.get(key);
      if (cached) {
        console.warn(`Returning expired cached CSV data for ${url}`);
        return cached.data as T[];
      }
      
      return null;
    }
  }

  /**
   * Fetch all years data with optimized caching
   */
  public async getAllYears(): Promise<YearData[]> {
    const cacheKey = 'all-years-data';
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() < cached.expires) {
      console.log(`Cache hit for ${cacheKey}`);
      return cached.data as YearData[];
    }

    try {
      // Fetch multi-source report which contains comprehensive data
      const multiSourceData = await this.fetchJson<{ multi_year_summary: YearData[] }>
        ('/data/multi_source_report.json', 
        'multi-source-report'
      );

      if (multiSourceData) {
        // Extract year data from the comprehensive report
        const yearData = multiSourceData.multi_year_summary || [];
        
        // Cache the result with longer duration since this is expensive
        this.cache.set(cacheKey, {
          data: yearData,
          timestamp: Date.now(),
          expires: Date.now() + this.LONG_CACHE_DURATION
        });

        return yearData;
      } else {
        // If local data is not available, check for data index files as a fallback
        console.log('Fetching data from data index files...');
        const availableYears: YearData[] = [];
        
        // Check for available data index files
        for (let year = 2018; year <= new Date().getFullYear(); year++) {
          try {
            const dataIndex = await this.fetchJson<{ summary?: { total_documents: number } }>(`/data/organized_documents/json/data_index_${year}.json`, `data-index-${year}`);
            if (dataIndex) {
              availableYears.push({
                year: year,
                total_budget: dataIndex.summary?.total_documents || 0,
                expenses: 0, // Placeholder
                execution_rate: 0  // Placeholder
              });
            }
          } catch (indexError) {
            // Year data index doesn't exist, continue to next year
            continue;
          }
        }
        
        if (availableYears.length > 0) {
          // Cache the data with longer duration
          this.cache.set(cacheKey, {
            data: availableYears,
            timestamp: Date.now(),
            expires: Date.now() + this.LONG_CACHE_DURATION
          });

          return availableYears;
        }
        
        // If still no data, fetch from external sources
        console.log('Fetching data from external sources...');
        const externalData = await externalAPIsService.loadAllExternalData().catch(() => ({ 
          carmenDeAreco: { success: false, data: null },
          buenosAires: { success: false, data: null },
          nationalBudget: { success: false, data: null }
        }));
        
        // Try to get data from the comprehensive_data_index.json first
        try {
          const comprehensiveData = await this.fetchJson<{ year: number, financialOverview?: { totalBudget: number, totalExecuted: number, executionRate: number } }>('/data/comprehensive_data_index.json', 'comprehensive-data-index');
          if (comprehensiveData && comprehensiveData.year) {
            // Create year-specific entry from the comprehensive data
            return [{
              year: comprehensiveData.year,
              total_budget: comprehensiveData.financialOverview?.totalBudget || 0,
              total_executed: comprehensiveData.financialOverview?.totalExecuted || 0,
              execution_rate: comprehensiveData.financialOverview?.executionRate || 0,
              expenses: comprehensiveData.financialOverview?.totalExecuted || 0
            }];
          }
        } catch (comprehensiveError) {
          console.warn('Could not fetch comprehensive data index:', comprehensiveError);
        }
        
        // If external data exists, process it
        const processedExternalData: YearData[] = [];
        
        if (externalData.carmenDeAreco.success && externalData.carmenDeAreco.data) {
          const cdaData = externalData.carmenDeAreco.data;
          if (cdaData.links && Array.isArray(cdaData.links)) {
            // Process links for potential data URLs
            const dataLinks = cdaData.links.filter((link: { text: string }) => 
              link.text && (link.text.includes('budget') || link.text.includes('presupuesto') || link.text.includes('gasto'))
            );
            
            for (const link of dataLinks) {
              // Extract year from URL or text if possible
              const yearMatch = (link as {url: string}).url.match(/(\d{4})/);
              if (yearMatch) {
                const year = parseInt(yearMatch[1]);
                if (year >= 2000 && year <= 2025) {
                  processedExternalData.push({
                    year: year,
                    expenses: 0, // Placeholder value
                    total_budget: 0, // Placeholder value
                    execution_rate: 0, // Placeholder value
                    external_source: 'Carmen de Areco Website'
                  });
                }
              }
            }
          }
        }
        
        // Cache the external data with shorter duration since it's less reliable
        this.cache.set(cacheKey, {
          data: processedExternalData,
          timestamp: Date.now(),
          expires: Date.now() + this.CACHE_DURATION
        });

        return processedExternalData;
      }
    } catch (error) {
      console.error('Error fetching all years data:', error);
      
      // Try to return cached data even if expired
      const cached = this.cache.get(cacheKey);
      if (cached) {
        console.warn('Returning expired cached all years data');
        return cached.data as YearData[];
      }
      
      // Fallback to empty array
      return [];
    }
  }

  /**
   * Fetch contracts data for a specific year
   */
  public async getContracts(year: number): Promise<Contract[]> {
    const cacheKey = `contracts-${year}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() < cached.expires) {
      return cached.data as Contract[];
    }

    try {
      // Try to fetch from multi-source report first
      const multiSourceData = await this.fetchJson<{ sources?: { contracts?: { structured_data?: { [key: number]: { contracts: Contract[] } } } } }>
        ('/data/multi_source_report.json',
        'multi-source-report'
      );

      if (multiSourceData?.sources?.contracts?.structured_data?.[year]) {
        const contracts = multiSourceData.sources.contracts.structured_data[year].contracts || [];
        
        // Cache the result
        this.cache.set(cacheKey, {
          data: contracts,
          timestamp: Date.now(),
          expires: Date.now() + this.CACHE_DURATION
        });

        return contracts;
      }

      // Try to fetch from GitHub service as fallback
      let contractsData: { contracts: Contract[] } | null = null;
      try {
        const githubService = (await import('./GitHubDataService')).default;
        contractsData = await githubService.fetchJson(`data/organized_documents/json/contracts_data_${year}.json`);
      } catch (githubError) {
        console.warn(`GitHub service unavailable for contracts ${year}:`, githubError);
      }

      // Fallback to separate contracts data file if GitHub service didn't work
      if (!contractsData) {
        contractsData = await this.fetchJson<{ contracts: Contract[] }>
          (`/data/organized_documents/json/contracts_data_${year}.json`,
          `contracts-data-${year}`
        );
      }
      
      // If year-specific file not found, use data index files and filter by year
      if (!contractsData) {
        try {
          const dataIndex = await this.fetchJson<{ data_sources?: { resolutions?: { documents: Document[] } } }>(`/data/organized_documents/json/data_index_${year}.json`, `data-index-${year}`);
          if (dataIndex && dataIndex.data_sources && dataIndex.data_sources.resolutions) {
            // Extract contract-type information from resolutions or other sections
            contractsData = {
              contracts: dataIndex.data_sources.resolutions.documents || []
            };
          }
        } catch (indexError) {
          console.warn(`No data index available for contracts ${year}:`, indexError);
        }
      }

      const contracts = contractsData?.contracts || [];
      
      // Cache the result
      this.cache.set(cacheKey, {
        data: contracts,
        timestamp: Date.now(),
        expires: Date.now() + this.CACHE_DURATION
      });

      return contracts;
    } catch (error) {
      console.error(`Error fetching contracts for ${year}:`, error);
      
      // Try to fetch from external sources as a fallback
      try {
        const externalResults = await externalAPIsService.loadAllExternalData().catch(() => ({ 
          carmenDeAreco: { success: false, data: null },
          comparative: []
        }));
        
        if (externalResults.carmenDeAreco.success && externalResults.carmenDeAreco.data) {
          const cdaData = externalResults.carmenDeAreco.data;
          
          // Look for contract-related links in the Carmen de Areco data
          if (cdaData.links) {
            const contractLinks = cdaData.links.filter((link: { text: string }) => 
              link.text && (link.text.toLowerCase().includes('contract') || 
                           link.text.toLowerCase().includes('licitacion') ||
                           link.text.toLowerCase().includes('contratacion'))
            );
            
            // Create a minimal contract data structure from links
            const contractsFromLinks: Contract[] = contractLinks.map((link: { text: string, url: string }, index: number) => ({
              id: `ext-${year}-${index}`,
              title: link.text,
              url: link.url,
              year: year,
              value: 0, // Placeholder value
              contractor: 'Unknown'
            }));
            
            if (contractsFromLinks.length > 0) {
              // Cache the result
              this.cache.set(cacheKey, {
                data: contractsFromLinks,
                timestamp: Date.now(),
                expires: Date.now() + this.CACHE_DURATION
              });

              return contractsFromLinks;
            }
          }
        }
      } catch (externalError) {
        console.error(`Error fetching contracts from external source for ${year}:`, externalError);
      }
      
      // Try to return cached data even if expired
      const cached = this.cache.get(cacheKey);
      if (cached) {
        console.warn(`Returning expired cached contracts data for ${year}`);
        return cached.data as Contract[];
      }
      
      return [];
    }
  }

  /**
   * Fetch budget data for a specific year
   */
  public async getBudget(year: number): Promise<BudgetData | object> {
    const cacheKey = `budget-${year}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() < cached.expires) {
      return cached.data as BudgetData;
    }

    try {
      // Try to fetch from multi-source report first
      const multiSourceData = await this.fetchJson<{ sources?: { budget?: { structured_data?: { [key: number]: BudgetData } } } }>
        ('/data/multi_source_report.json',
        'multi-source-report'
      );

      if (multiSourceData?.sources?.budget?.structured_data?.[year]) {
        const budget = multiSourceData.sources.budget.structured_data[year];
        
        // Cache the result
        this.cache.set(cacheKey, {
          data: budget,
          timestamp: Date.now(),
          expires: Date.now() + this.CACHE_DURATION
        });

        return budget;
      }

      // Try to fetch from GitHub service as fallback
      let budgetData: BudgetData | null = null;
      try {
        const githubService = (await import('./GitHubDataService')).default;
        budgetData = await githubService.fetchJson(`data/organized_documents/json/budget_data_${year}.json`);
      } catch (githubError) {
        console.warn(`GitHub service unavailable for budget ${year}:`, githubError);
      }

      // Fallback to separate budget data file if GitHub service didn't work
      if (!budgetData) {
        budgetData = await this.fetchJson<BudgetData>(
          `/data/organized_documents/json/budget_data_${year}.json`,
          `budget-data-${year}`
        );
      }
      
      // If year-specific file not found, extract budget data from data index
      if (!budgetData) {
        try {
          const dataIndex = await this.fetchJson<any>(`/data/organized_documents/json/data_index_${year}.json`, `data-index-${year}`);
          if (dataIndex) {
            // Create budget data structure from the data index
            if (dataIndex.data_sources && dataIndex.data_sources.budget_execution) {
              budgetData = { ...dataIndex.data_sources.budget_execution, year };
            } else {
              budgetData = { 
                year: year,
                total_budget: 0, 
                total_executed: 0, 
                execution_rate: 0,
                documents: dataIndex.summary?.categories || {}
              };
            }
          }
        } catch (indexError) {
          console.warn(`No data index available for budget ${year}:`, indexError);
        }
      }

      // Cache the result
      this.cache.set(cacheKey, {
        data: budgetData,
        timestamp: Date.now(),
        expires: Date.now() + this.CACHE_DURATION
      });

      return budgetData || {};
    } catch (error) {
      console.error(`Error fetching budget for ${year}:`, error);
      
      // Try to fetch from external sources as a fallback
      try {
        const externalResults = await externalAPIsService.loadAllExternalData().catch(() => ({ 
          carmenDeAreco: { success: false, data: null }
        }));
        
        if (externalResults.carmenDeAreco.success && externalResults.carmenDeAreco.data) {
          const cdaData = externalResults.carmenDeAreco.data;
          
          // Look for budget-related information in the Carmen de Areco data
          if (cdaData.links) {
            const budgetLinks = cdaData.links.filter((link: { text: string }) => 
              link.text && (link.text.toLowerCase().includes('budget') || 
                           link.text.toLowerCase().includes('presupuesto') ||
                           link.text.toLowerCase().includes('gasto') ||
                           link.text.toLowerCase().includes('ejecucion'))
            );
            
            if (budgetLinks.length > 0) {
              // Create a minimal budget data structure
              const budgetData: BudgetData = {
                year,
                total_budget: 0, // Placeholder value
                total_executed: 0, // Placeholder value
                execution_rate: 0, // Placeholder value
                external_source: 'Carmen de Areco Website',
                budget_links: budgetLinks as { text: string, url: string }[]
              };
              
              // Cache the result
              this.cache.set(cacheKey, {
                data: budgetData,
                timestamp: Date.now(),
                expires: Date.now() + this.CACHE_DURATION
              });

              return budgetData;
            }
          }
        }
      } catch (externalError) {
        console.error(`Error fetching budget from external source for ${year}:`, externalError);
      }
      
      // Try to return cached data even if expired
      const cached = this.cache.get(cacheKey);
      if (cached) {
        console.warn(`Returning expired cached budget data for ${year}`);
        return cached.data as BudgetData;
      }
      
      return {};
    }
  }

  /**
   * Fetch documents data for a specific year
   */
  public async getDocuments(year: number): Promise<Document[]> {
    const cacheKey = `documents-${year}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() < cached.expires) {
      return cached.data as Document[];
    }

    try {
      // Try to fetch from multi-source report first
      const multiSourceData = await this.fetchJson<{ sources?: { documents?: { structured_data?: { [key: number]: { documents: Document[] } } } } }>
        ('/data/multi_source_report.json',
        'multi-source-report'
      );

      if (multiSourceData?.sources?.documents?.structured_data?.[year]) {
        const documents = multiSourceData.sources.documents.structured_data[year].documents || [];
        
        // Cache the result
        this.cache.set(cacheKey, {
          data: documents,
          timestamp: Date.now(),
          expires: Date.now() + this.CACHE_DURATION
        });

        return documents;
      }

      // Try to fetch from GitHub service as fallback
      let documentsData: { documents: Document[] } | null = null;
      try {
        const githubService = (await import('./GitHubDataService')).default;
        documentsData = await githubService.fetchJson(`data/organized_documents/json/documents_data_${year}.json`);
      } catch (githubError) {
        console.warn(`GitHub service unavailable for documents ${year}:`, githubError);
      }

      // Fallback to separate documents data file if GitHub service didn't work
      if (!documentsData) {
        documentsData = await this.fetchJson<{ documents: Document[] }>
          (`/data/organized_documents/json/documents_data_${year}.json`,
          `documents-data-${year}`
        );
      }
      
      // If year-specific file not found, use data index to construct document list
      if (!documentsData) {
        try {
          const dataIndex = await this.fetchJson<any>(`/data/organized_documents/json/data_index_${year}.json`, `data-index-${year}`);
          if (dataIndex) {
            // Extract all document information from the data index
            const allDocuments: Document[] = [];
            
            if (dataIndex.data_sources) {
              // Add different document types to the list
              if (dataIndex.data_sources.salary_data && dataIndex.data_sources.salary_data.documents) {
                allDocuments.push(...dataIndex.data_sources.salary_data.documents);
              }
              if (dataIndex.data_sources.budget_execution && dataIndex.data_sources.budget_execution.documents) {
                allDocuments.push(...dataIndex.data_sources.budget_execution.documents);
              }
              if (dataIndex.data_sources.resolutions && dataIndex.data_sources.resolutions.documents) {
                allDocuments.push(...dataIndex.data_sources.resolutions.documents.map((doc: Document) => ({
                  ...doc, 
                  category: 'resolutions' 
                })));
              }
              if (dataIndex.data_sources.caif_data && dataIndex.data_sources.caif_data.documents) {
                allDocuments.push(...dataIndex.data_sources.caif_data.documents);
              }
            }
            
            documentsData = {
              documents: allDocuments,
              total: allDocuments.length,
              categories: dataIndex.summary?.categories || {}
            } as any;
          }
        } catch (indexError) {
          console.warn(`No data index available for documents ${year}:`, indexError);
          
          // Try to get document list from general data inventory
          try {
            const generalIndex = await this.fetchJson<{ documents: Document[] }>(`/data/json/data_inventory.json`, `general-data-index`);
            if (generalIndex && Array.isArray(generalIndex.documents)) {
              const filteredDocs = generalIndex.documents.filter(doc => doc.year === year);
              documentsData = {
                documents: filteredDocs,
                total: filteredDocs.length
              } as any;
            }
          } catch (generalIndexError) {
            console.warn(`No general data index available for documents ${year}:`, generalIndexError);
          }
        }
      }

      const documents = documentsData?.documents || [];
      
      // Cache the result
      this.cache.set(cacheKey, {
        data: documents,
        timestamp: Date.now(),
        expires: Date.now() + this.CACHE_DURATION
      });

      return documents;
    } catch (error) {
      console.error(`Error fetching documents for ${year}:`, error);
      
      // Try to fetch from external sources as a fallback
      try {
        const externalResults = await externalAPIsService.loadAllExternalData().catch(() => ({ 
          carmenDeAreco: { success: false, data: null },
          buenosAires: { success: false, data: null }
        }));
        
        // Collect documents from multiple sources
        const allDocuments: Document[] = [];
        
        if (externalResults.carmenDeAreco.success && externalResults.carmenDeAreco.data) {
          const cdaData = externalResults.carmenDeAreco.data;
          
          // Look for document links in Carmen de Areco data
          if (cdaData.links) {
            const docLinks = cdaData.links.filter((link: { url: string, text: string }) => 
              link.url && (link.url.includes('.pdf') || 
                          link.url.includes('.doc') || 
                          link.url.includes('.docx') ||
                          link.text.toLowerCase().includes('document') ||
                          link.text.toLowerCase().includes('resolucion') ||
                          link.text.toLowerCase().includes('ordenanza'))
            );
            
            allDocuments.push(...docLinks.map((link: { text: string, url: string }, index: number) => ({
              id: `cda-${year}-${index}`,
              title: link.text,
              url: link.url,
              year: year,
              category: 'Municipal',
              source: 'Carmen de Areco Website'
            })));
          }
        }
        
        if (externalResults.buenosAires.success && externalResults.buenosAires.data) {
          const gbaData = externalResults.buenosAires.data;
          
          // Look for document links in Buenos Aires data
          if (gbaData.links) {
            const gbaDocLinks = gbaData.links.filter((link: { url: string, text: string }) => 
              link.url && (link.url.includes('.pdf') || 
                          link.url.includes('.doc') || 
                          link.url.includes('.docx') ||
                          link.text.toLowerCase().includes('document') ||
                          link.text.toLowerCase().includes('transparencia'))
            );
            
            allDocuments.push(...gbaDocLinks.map((link: { text: string, url: string }, index: number) => ({
              id: `gba-${year}-${index}`,
              title: link.text,
              url: link.url,
              year: year,
              category: 'Provincial',
              source: 'Buenos Aires Province'
            })));
          }
        }
        
        if (allDocuments.length > 0) {
          // Cache the result
          this.cache.set(cacheKey, {
            data: allDocuments,
            timestamp: Date.now(),
            expires: Date.now() + this.CACHE_DURATION
          });

          return allDocuments;
        }
      } catch (externalError) {
        console.error(`Error fetching documents from external sources for ${year}:`, externalError);
      }
      
      // Try to return cached data even if expired
      const cached = this.cache.get(cacheKey);
      if (cached) {
        console.warn(`Returning expired cached documents data for ${year}`);
        return cached.data as Document[];
      }
      
      return [];
    }
  }

  /**
   * Fetch treasury data for a specific year
   */
  public async getTreasury(year: number): Promise<TreasuryData | object> {
    const cacheKey = `treasury-${year}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() < cached.expires) {
      return cached.data as TreasuryData;
    }

    try {
      // Try to fetch from multi-source report first
      const multiSourceData = await this.fetchJson<{ sources?: { treasury?: { structured_data?: { [key: number]: TreasuryData } } } }>
        ('/data/multi_source_report.json',
        'multi-source-report'
      );

      if (multiSourceData?.sources?.treasury?.structured_data?.[year]) {
        const treasury = multiSourceData.sources.treasury.structured_data[year];
        
        // Cache the result
        this.cache.set(cacheKey, {
          data: treasury,
          timestamp: Date.now(),
          expires: Date.now() + this.CACHE_DURATION
        });

        return treasury;
      }

      // Try to fetch from GitHub service as fallback
      let treasuryData: TreasuryData | null = null;
      try {
        const githubService = (await import('./GitHubDataService')).default;
        treasuryData = await githubService.fetchJson(`data/organized_documents/json/treasury_data_${year}.json`);
      } catch (githubError) {
        console.warn(`GitHub service unavailable for treasury ${year}:`, githubError);
      }

      // Fallback to separate treasury data file if GitHub service didn't work
      if (!treasuryData) {
        treasuryData = await this.fetchJson<TreasuryData>(
          `/data/organized_documents/json/treasury_data_${year}.json`,
          `treasury-data-${year}`
        );
      }
      
      // If year-specific file not found, extract treasury-related info from data index
      if (!treasuryData) {
        try {
          const dataIndex = await this.fetchJson<{ data_sources?: { budget_execution?: TreasuryData } }>(`/data/organized_documents/json/data_index_${year}.json`, `data-index-${year}`);
          if (dataIndex && dataIndex.data_sources) {
            // Use budget execution data as treasury data since it contains similar financial information
            treasuryData = dataIndex.data_sources.budget_execution || {
              year: year,
              income: 0,
              expenses: 0,
              balance: 0
            };
          }
        } catch (indexError) {
          console.warn(`No data index available for treasury ${year}:`, indexError);
        }
      }

      // Cache the result
      this.cache.set(cacheKey, {
        data: treasuryData,
        timestamp: Date.now(),
        expires: Date.now() + this.CACHE_DURATION
      });

      return treasuryData || {};
    } catch (error) {
      console.error(`Error fetching treasury for ${year}:`, error);
      
      // Try to return cached data even if expired
      const cached = this.cache.get(cacheKey);
      if (cached) {
        console.warn(`Returning expired cached treasury data for ${year}`);
        return cached.data as TreasuryData;
      }
      
      return {};
    }
  }

  /**
   * Fetch salaries data for a specific year
   */
  public async getSalaries(year: number): Promise<SalaryData[]> {
    const cacheKey = `salaries-${year}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() < cached.expires) {
      return cached.data as SalaryData[];
    }

    try {
      // Try to fetch from multi-source report first
      const multiSourceData = await this.fetchJson<{ sources?: { salaries?: { structured_data?: { [key: number]: { salaries: SalaryData[] } } } } }>
        ('/data/multi_source_report.json',
        'multi-source-report'
      );

      if (multiSourceData?.sources?.salaries?.structured_data?.[year]) {
        const salaries = multiSourceData.sources.salaries.structured_data[year].salaries || [];
        
        // Cache the result
        this.cache.set(cacheKey, {
          data: salaries,
          timestamp: Date.now(),
          expires: Date.now() + this.CACHE_DURATION
        });

        return salaries;
      }

      // Try to fetch from GitHub service as fallback
      let salariesData: { salaries: SalaryData[] } | null = null;
      try {
        const githubService = (await import('./GitHubDataService')).default;
        salariesData = await githubService.fetchJson(`data/organized_documents/json/salaries_data_${year}.json`);
      } catch (githubError) {
        console.warn(`GitHub service unavailable for salaries ${year}:`, githubError);
      }

      // Fallback to separate salaries data file if GitHub service didn't work
      if (!salariesData) {
        salariesData = await this.fetchJson<{ salaries: SalaryData[] }>
          (`/data/organized_documents/json/salaries_data_${year}.json`,
          `salaries-data-${year}`
        );
      }
      
      // If year-specific file not found, extract salary data from data index or specific salary files
      if (!salariesData) {
        try {
          const dataIndex = await this.fetchJson<{ data_sources?: { salary_data?: { salaries: SalaryData[] } } }>(`/data/organized_documents/json/data_index_${year}.json`, `data-index-${year}`);
          if (dataIndex && dataIndex.data_sources && dataIndex.data_sources.salary_data) {
            salariesData = dataIndex.data_sources.salary_data;
          }
        } catch (indexError) {
          console.warn(`No data index available for salaries ${year}:`, indexError);
          
          // Try to find specific salary files that might exist for this year
          try {
            // Look for files that match patterns like "SUELDOS-ENERO-2023.json" 
            const response = await fetch('/data/organized_documents/json');
            if (!response.ok) {
              throw new Error('Directory listing not available');
            }
          } catch (dirError) {
            // Directory listing is not available, try to find specific salary files
            try {
              // Try to find specific monthly salary files for the year
              const monthlyData: { month: string, data: unknown }[] = [];
              const months = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];
              
              for (const month of months) {
                try {
                  const salaryFile = await this.fetchJson<unknown>(`/data/organized_documents/json/SUELDOS-${month}-${year}.json`, `salary-${month}-${year}`);
                  if (salaryFile) {
                    monthlyData.push({ month, data: salaryFile });
                  }
                } catch (monthError) {
                  // Month file doesn't exist, continue to next
                  continue;
                }
              }
              
              if (monthlyData.length > 0) {
                salariesData = {
                  salaries: [{
                    year: year,
                    monthly_salaries: monthlyData,
                    total_months: monthlyData.length
                  }]
                };
              }
            } catch (monthlyError) {
              console.warn(`No monthly salary data available for ${year}:`, monthlyError);
            }
          }
        }
      }

      const salaries = salariesData?.salaries || [];
      
      // Cache the result
      this.cache.set(cacheKey, {
        data: salaries,
        timestamp: Date.now(),
        expires: Date.now() + this.CACHE_DURATION
      });

      return salaries;
    } catch (error) {
      console.error(`Error fetching salaries for ${year}:`, error);
      
      // Try to return cached data even if expired
      const cached = this.cache.get(cacheKey);
      if (cached) {
        console.warn(`Returning expired cached salaries data for ${year}`);
        return cached.data as SalaryData[];
      }
      
      return [];
    }
  }

  /**
   * Fetch debt data for a specific year
   */
  public async getDebt(year: number): Promise<DebtData | object> {
    const cacheKey = `debt-${year}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() < cached.expires) {
      return cached.data as DebtData;
    }

    try {
      // Try to fetch from multi-source report first
      const multiSourceData = await this.fetchJson<{ sources?: { debt?: { structured_data?: { [key: number]: DebtData } } } }>
        ('/data/multi_source_report.json',
        'multi-source-report'
      );

      if (multiSourceData?.sources?.debt?.structured_data?.[year]) {
        const debt = multiSourceData.sources.debt.structured_data[year];
        
        // Cache the result
        this.cache.set(cacheKey, {
          data: debt,
          timestamp: Date.now(),
          expires: Date.now() + this.CACHE_DURATION
        });

        return debt;
      }

      // Try to fetch from GitHub service as fallback
      let debtData: DebtData | null = null;
      try {
        const githubService = (await import('./GitHubDataService')).default;
        debtData = await githubService.fetchJson(`data/organized_documents/json/debt_data_${year}.json`);
      } catch (githubError) {
        console.warn(`GitHub service unavailable for debt ${year}:`, githubError);
      }

      // Fallback to separate debt data file if GitHub service didn't work
      if (!debtData) {
        debtData = await this.fetchJson<DebtData>(
          `/data/organized_documents/json/debt_data_${year}.json`,
          `debt-data-${year}`
        );
      }
      
      // If year-specific file not found, extract debt-related info from data index
      if (!debtData) {
        try {
          const dataIndex = await this.fetchJson<any>(`/data/organized_documents/json/data_index_${year}.json`, `data-index-${year}`);
          if (dataIndex && dataIndex.data_sources) {
            // Look for debt analysis or fiscal data in the data sources
            if (dataIndex.data_sources.debt_analysis) {
              debtData = dataIndex.data_sources.debt_analysis;
            } else if (dataIndex.data_sources.fiscal_module) {
              debtData = dataIndex.data_sources.fiscal_module; // Fiscal data often relates to debt
            } else {
              debtData = {
                year: year,
                total_debt: 0,
                debt_service: 0,
                debt_by_type: {},
                analysis: dataIndex.data_sources
              };
            }
          }
        } catch (indexError) {
          console.warn(`No data index available for debt ${year}:`, indexError);
        }
      }

      // Cache the result
      this.cache.set(cacheKey, {
        data: debtData,
        timestamp: Date.now(),
        expires: Date.now() + this.CACHE_DURATION
      });

      return debtData || {};
    } catch (error) {
      console.error(`Error fetching debt for ${year}:`, error);
      
      // Try to return cached data even if expired
      const cached = this.cache.get(cacheKey);
      if (cached) {
        console.warn(`Returning expired cached debt data for ${year}`);
        return cached.data as DebtData;
      }
      
      return {};
    }
  }

  /**
   * Clear all cache
   */
  public clearCache(): void {
    this.cache.clear();
    console.log('EnhancedDataService cache cleared');
  }

  /**
   * Get cache stats
   */
  public getCacheStats(): { size: number, keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

export default EnhancedDataService.getInstance();
