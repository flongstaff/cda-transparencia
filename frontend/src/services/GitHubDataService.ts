/**
 * GITHUB REPOSITORY DATA SERVICE
 *
 * Fetches data directly from GitHub repository files
 * Works in production (GitHub Pages) and development
 * Uses raw.githubusercontent.com URLs instead of local file paths
 *
 * This service replaces all local file access patterns and ensures
 * the app works when deployed to GitHub Pages/Cloudflare
 */

export interface GitHubDataResponse {
  success: boolean;
  data: any;
  source: 'github_raw' | 'cache';
  lastModified?: string;
  error?: string;
}

export interface RepositoryConfig {
  owner: string;
  repo: string;
  branch: string;
  baseUrl: string;
}

class GitHubDataService {
  private static instance: GitHubDataService;
  private cache = new Map<string, { data: any; timestamp: number; etag?: string }>();
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes cache

  private config: RepositoryConfig = {
    owner: 'flongstaff',
    repo: 'cda-transparencia',
    branch: 'main',
    baseUrl: 'https://raw.githubusercontent.com'
  };

  private constructor() {}

  public static getInstance(): GitHubDataService {
    if (!GitHubDataService.instance) {
      GitHubDataService.instance = new GitHubDataService();
    }
    return GitHubDataService.instance;
  }

  /**
   * Get raw GitHub URL for file
   */
  private getFileUrl(filePath: string): string {
    // Remove leading slash if present
    const cleanPath = filePath.startsWith('/') ? filePath.substring(1) : filePath;
    
    // For data files in production, use relative paths to avoid CORS
    if (cleanPath.startsWith('data/')) {
      if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        // For GitHub Pages deployment or production domain
        if (hostname === 'cda-transparencia.org' || hostname.endsWith('github.io')) {
          return `/${cleanPath}`;
        }
      }
    }
    
    return `${this.config.baseUrl}/${this.config.owner}/${this.config.repo}/${this.config.branch}/${cleanPath}`;
  }

  /**
   * Fetch JSON file from GitHub repository or local assets
   */
  async fetchJson(filePath: string): Promise<GitHubDataResponse> {
    const cacheKey = `json:${filePath}`;
    const cached = this.cache.get(cacheKey);

    if (cached && (Date.now() - cached.timestamp) < this.CACHE_DURATION) {
      console.log(`Cache hit for ${filePath}`);
      return {
        success: true,
        data: cached.data,
        source: 'cache'
      };
    }

    try {
      const url = this.getFileUrl(filePath);
      console.log(`📥 Fetching JSON from: ${url}`);
      
      // Determine if this is a local file path vs GitHub raw URL
      let response: Response;
      let sourceType: 'github_raw' | 'local' = 'github_raw';

      if (url.startsWith('/') && url.includes('/data/')) {
        // This is a local path (likely for deployed site)
        response = await fetch(url);
        sourceType = 'local';
      } else {
        // This is the GitHub raw URL (for development or when needed)
        response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Carmen-de-Areco-Transparency-Portal'
          }
        });
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch ${filePath}: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const lastModified = response.headers.get('last-modified') || new Date().toISOString();

      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
        etag: response.headers.get('etag') || undefined
      });

      return {
        success: true,
        data,
        source: sourceType,
        lastModified
      };

    } catch (error) {
      console.error(`❌ Fetch error for ${filePath}:`, error);

      // Return cached data if available, even if expired
      if (cached) {
        console.log(`📦 Using expired cache for ${filePath}`);
        return {
          success: true,
          data: cached.data,
          source: 'cache'
        };
      }
      
      // If it failed as local, try GitHub URL as fallback
      if (filePath.startsWith('/data/')) {
        try {
          console.log(`Trying GitHub URL as fallback for ${filePath}`);
          const githubUrl = `${this.config.baseUrl}/${this.config.owner}/${this.config.repo}/${this.config.branch}/${filePath.startsWith('/') ? filePath.substring(1) : filePath}`;
          const response = await fetch(githubUrl, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'Carmen-de-Areco-Transparency-Portal'
            }
          });

          if (!response.ok) {
            throw new Error(`Failed to fetch ${filePath} from GitHub: ${response.status} ${response.statusText}`);
          }

          const data = await response.json();
          const lastModified = response.headers.get('last-modified') || new Date().toISOString();

          this.cache.set(cacheKey, {
            data,
            timestamp: Date.now(),
            etag: response.headers.get('etag') || undefined
          });

          return {
            success: true,
            data,
            source: 'github_raw',
            lastModified
          };
        } catch (githubError) {
          console.error(`❌ GitHub fallback also failed for ${filePath}:`, githubError);
        }
      }

      return {
        success: false,
        data: null,
        source: 'github_raw',
        error: (error as Error).message
      };
    }
  }

  /**
   * Fetch markdown file from GitHub repository or local assets
   */
  async fetchMarkdown(filePath: string): Promise<GitHubDataResponse> {
    const cacheKey = `md:${filePath}`;
    const cached = this.cache.get(cacheKey);

    if (cached && (Date.now() - cached.timestamp) < this.CACHE_DURATION) {
      return {
        success: true,
        data: cached.data,
        source: 'cache'
      };
    }

    try {
      const url = this.getFileUrl(filePath);
      console.log(`📥 Fetching Markdown from: ${url}`);
      
      // Determine if this is a local file path vs GitHub raw URL
      let response: Response;
      let sourceType: 'github_raw' | 'local' = 'github_raw';

      if (url.startsWith('/') && url.includes('/data/')) {
        // This is a local path (likely for deployed site)
        response = await fetch(url);
        sourceType = 'local';
      } else {
        // This is the GitHub raw URL (for development or when needed)
        response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'text/plain',
            'User-Agent': 'Carmen-de-Areco-Transparency-Portal'
          }
        });
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch ${filePath}: ${response.status} ${response.statusText}`);
      }

      const text = await response.text();
      const lastModified = response.headers.get('last-modified') || new Date().toISOString();

      // Parse markdown to extract structured data
      const parsedData = this.parseMarkdownContent(text);

      this.cache.set(cacheKey, {
        data: parsedData,
        timestamp: Date.now()
      });

      return {
        success: true,
        data: parsedData,
        source: sourceType,
        lastModified
      };

    } catch (error) {
      console.error(`❌ Markdown fetch error for ${filePath}:`, error);

      if (cached) {
        return {
          success: true,
          data: cached.data,
          source: 'cache'
        };
      }
      
      // If it failed as local, try GitHub URL as fallback
      if (filePath.startsWith('/data/')) {
        try {
          console.log(`Trying GitHub URL as fallback for ${filePath}`);
          const githubUrl = `${this.config.baseUrl}/${this.config.owner}/${this.config.repo}/${this.config.branch}/${filePath.startsWith('/') ? filePath.substring(1) : filePath}`;
          const response = await fetch(githubUrl, {
            method: 'GET',
            headers: {
              'Accept': 'text/plain',
              'User-Agent': 'Carmen-de-Areco-Transparency-Portal'
            }
          });

          if (!response.ok) {
            throw new Error(`Failed to fetch ${filePath} from GitHub: ${response.status} ${response.statusText}`);
          }

          const text = await response.text();
          const lastModified = response.headers.get('last-modified') || new Date().toISOString();

          // Parse markdown to extract structured data
          const parsedData = this.parseMarkdownContent(text);

          this.cache.set(cacheKey, {
            data: parsedData,
            timestamp: Date.now()
          });

          return {
            success: true,
            data: parsedData,
            source: 'github_raw',
            lastModified
          };
        } catch (githubError) {
          console.error(`❌ GitHub fallback also failed for ${filePath}:`, githubError);
        }
      }

      return {
        success: false,
        data: null,
        source: 'github_raw',
        error: (error as Error).message
      };
    }
  }

  /**
   * Load comprehensive data for a specific year
   */
  async loadYearData(year: number): Promise<GitHubDataResponse> {
    try {
      console.log(`🚀 Loading comprehensive data for year ${year} from GitHub`);

      // Try multiple data source patterns to find the right files
      const dataPatterns = [
        // Primary pattern - consolidated data
        {
          budget: `data/consolidated/${year}/budget.json`,
          contracts: `data/consolidated/${year}/contracts.json`,
          salaries: `data/consolidated/${year}/salaries.json`,
          documents: `data/consolidated/${year}/documents.json`,
          treasury: `data/consolidated/${year}/treasury.json`,
          summary: `data/consolidated/${year}/summary.json`
        },
        // Analysis pattern
        {
          budget: `data/organized_analysis/financial_oversight/budget_analysis/budget_data_${year}.json`,
          contracts: `data/organized_analysis/financial_oversight/contract_monitoring/contracts_data_${year}.json`,
          salaries: `data/organized_analysis/financial_oversight/salary_oversight/salary_data_${year}.json`,
          documents: `data/organized_analysis/document_analysis/documents_data_${year}.json`,
          treasury: `data/organized_analysis/financial_oversight/treasury_monitoring/treasury_data_${year}.json`,
          summary: `data/organized_analysis/financial_oversight/annual_summary_${year}.json`
        }
      ];

      // Try each pattern until we find data
      const consolidatedData: any = {
        year,
        budget: null,
        contracts: [],
        salaries: [],
        documents: [],
        treasury: null,
        debt: null,
        summary: null,
        sources: [],
        lastUpdated: new Date().toISOString()
      };

      let foundData = false;

      for (const pattern of dataPatterns) {
        const fileKeys = Object.keys(pattern) as Array<keyof typeof pattern>;
        const filePromises = fileKeys.map(key => this.fetchJson(pattern[key]));

        try {
          const results = await Promise.allSettled(filePromises);

          // Check if any data was successfully loaded
          const hasSuccess = results.some(result =>
            result.status === 'fulfilled' && result.value.success
          );

          if (hasSuccess) {
            // Process successful results
            results.forEach((result, index) => {
              const key = fileKeys[index];
              if (result.status === 'fulfilled' && result.value.success) {
                const data = result.value.data;
                consolidatedData[key] = data;
                consolidatedData.sources.push(`github:${pattern[key]}`);
                foundData = true;
              }
            });

            // If we found data, break out of the loop
            if (foundData) {
              break;
            }
          }
        } catch (patternError) {
          console.warn(`Pattern failed for year ${year}:`, patternError);
          // Continue to next pattern
        }
      }

      // If no data found, try to get from multi-source report as fallback
      if (!foundData) {
        console.log(`No specific year data found for ${year}, trying multi-source report...`);
        const multiSourceResponse = await this.fetchJson('data/multi_source_report.json');

        if (multiSourceResponse.success && multiSourceResponse.data) {
          const multiSourceData = multiSourceResponse.data;

          // Extract year-specific data from multi-source report
          if (multiSourceData.sources) {
            // Budget data
            if (multiSourceData.sources.budget?.structured_data?.[year]) {
              consolidatedData.budget = multiSourceData.sources.budget.structured_data[year];
              foundData = true;
            }

            // Contracts data
            if (multiSourceData.sources.contracts?.structured_data?.[year]) {
              consolidatedData.contracts = multiSourceData.sources.contracts.structured_data[year].contracts || [];
              foundData = true;
            }

            // Salaries data
            if (multiSourceData.sources.salaries?.structured_data?.[year]) {
              consolidatedData.salaries = multiSourceData.sources.salaries.structured_data[year].salaries || [];
              foundData = true;
            }

            // Documents data
            if (multiSourceData.sources.documents?.structured_data?.[year]) {
              consolidatedData.documents = multiSourceData.sources.documents.structured_data[year].documents || [];
              foundData = true;
            }

            // Treasury data
            if (multiSourceData.sources.treasury?.structured_data?.[year]) {
              consolidatedData.treasury = multiSourceData.sources.treasury.structured_data[year];
              foundData = true;
            }

            // Debt data
            if (multiSourceData.sources.debt?.structured_data?.[year]) {
              consolidatedData.debt = multiSourceData.sources.debt.structured_data[year];
              foundData = true;
            }

            consolidatedData.sources.push('github:data/multi_source_report.json');
          }

          // Multi-year summary data
          if (multiSourceData.multi_year_summary) {
            const yearSummary = multiSourceData.multi_year_summary.find((y: any) => y.year === year);
            if (yearSummary) {
              consolidatedData.summary = yearSummary;
              foundData = true;
            }
          }
        }
      }

      // If still no data, try to get from comprehensive data index
      if (!foundData) {
        console.log(`No multi-source data for ${year}, trying comprehensive index...`);
        const indexResponse = await this.fetchJson('frontend/src/data/comprehensive_data_index.json');

        if (indexResponse.success && indexResponse.data) {
          const indexData = indexResponse.data;

          // Try to extract year data from comprehensive index
          if (indexData.financial_data?.[year]) {
            consolidatedData.budget = indexData.financial_data[year];
            consolidatedData.sources.push('github:frontend/src/data/comprehensive_data_index.json');
            foundData = true;
          }
        }
      }

      return {
        success: foundData,
        data: consolidatedData,
        source: 'github_raw',
        lastModified: new Date().toISOString()
      };

    } catch (error) {
      console.error(`❌ Failed to load year data for ${year}:`, error);
      return {
        success: false,
        data: null,
        source: 'github_raw',
        error: (error as Error).message
      };
    }
  }

  /**
   * Load all available data (multi-year)
   */
  async loadAllData(): Promise<GitHubDataResponse> {
    try {
      // Get years from the repository index first
      const indexResponse = await this.fetchJson('data/index.json');
      let years = [2020, 2021, 2022, 2023, 2024, 2025];

      if (indexResponse.success) {
        const availableYears = indexResponse.data?.availableYears;
        if (Array.isArray(availableYears) && availableYears.length > 0) {
          years = availableYears;
        }
      }

      const yearDataResults = await Promise.allSettled(
        years.map(year => this.loadYearData(year))
      );

      const allData = {
        byYear: {} as Record<number, any>,
        summary: {
          total_documents: 0,
          years_covered: [] as number[],
          categories: [] as string[],
          audit_completion_rate: 0,
          external_sources_active: 0,
          last_updated: new Date().toISOString()
        },
        external_validation: [],
        metadata: {
          source: 'GitHub Repository',
          repository: `${this.config.owner}/${this.config.repo}`,
          branch: this.config.branch,
          fetched_at: new Date().toISOString()
        }
      };

      const categoriesSet = new Set<string>();
      let totalDocuments = 0;

      yearDataResults.forEach((result, index) => {
        const year = years[index];

        if (result.status === 'fulfilled' && result.value.success) {
          const yearData = result.value.data;
          allData.byYear[year] = yearData;
          allData.summary.years_covered.push(year);

          if (yearData.documents) {
            totalDocuments += yearData.documents.length;
            yearData.documents.forEach((doc: any) => {
              if (doc.category) categoriesSet.add(doc.category);
            });
          }
        }
      });

      allData.summary.total_documents = totalDocuments;
      allData.summary.categories = Array.from(categoriesSet);
      allData.summary.audit_completion_rate = allData.summary.years_covered.length > 0 ?
        Math.round((allData.summary.years_covered.length / years.length) * 100) : 0;
      allData.summary.external_sources_active = 3; // GitHub + External APIs

      return {
        success: true,
        data: allData,
        source: 'github_raw',
        lastModified: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Failed to load all data:', error);
      return {
        success: false,
        data: null,
        source: 'github_raw',
        error: (error as Error).message
      };
    }
  }

  /**
   * Get available years from repository
   */
  async getAvailableYears(): Promise<number[]> {
    try {
      // Try to fetch the index file first
      const indexResponse = await this.fetchJson('data/index.json');
      if (indexResponse.success && indexResponse.data?.availableYears) {
        return indexResponse.data.availableYears;
      }

      // Try to get available years from the multi_source_report.json
      const multiSourceResponse = await this.fetchJson('data/multi_source_report.json');
      if (multiSourceResponse.success && multiSourceResponse.data?.multi_year_summary) {
        return multiSourceResponse.data.multi_year_summary.map((item: any) => item.year).filter((year: number) => year);
      }

      // Try to get available years from directory structure
      try {
        const dirResponse = await fetch(`https://api.github.com/repos/${this.config.owner}/${this.config.repo}/contents/data/consolidated`);
        if (dirResponse.ok) {
          const dirContents = await dirResponse.json();
          if (Array.isArray(dirContents)) {
            const years = dirContents
              .filter(item => item.type === 'dir' && /^\d{4}$/.test(item.name))
              .map(item => parseInt(item.name))
              .filter(year => !isNaN(year));
            if (years.length > 0) {
              return years.sort((a, b) => b - a);
            }
          }
        }
      } catch (dirError) {
        console.warn('Could not fetch directory structure, using default years');
      }
    } catch (error) {
      console.warn('Could not fetch data index, using default years');
    }

    // Default years if index is not available
    return [2020, 2021, 2022, 2023, 2024];
  }

  /**
   * Parse markdown content to extract structured data
   */
  private parseMarkdownContent(markdown: string) {
    const lines = markdown.split('\n');
    const data: any = {
      title: '',
      sections: [],
      links: [],
      metadata: {
        lineCount: lines.length,
        parsed_at: new Date().toISOString()
      }
    };

    let currentSection: any = null;

    for (const line of lines) {
      const trimmedLine = line.trim();

      // Extract title (first H1)
      if (trimmedLine.startsWith('# ') && !data.title) {
        data.title = trimmedLine.substring(2);
      }

      // Extract sections (H2, H3, etc.)
      if (trimmedLine.startsWith('## ')) {
        if (currentSection) {
          data.sections.push(currentSection);
        }
        currentSection = {
          title: trimmedLine.substring(3),
          content: [],
          links: []
        };
      }

      // Extract links
      const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
      let match;
      while ((match = linkRegex.exec(trimmedLine)) !== null) {
        const linkData = { text: match[1], url: match[2] };
        data.links.push(linkData);
        if (currentSection) {
          currentSection.links.push(linkData);
        }
      }

      // Add content to current section
      if (currentSection && trimmedLine && !trimmedLine.startsWith('#')) {
        currentSection.content.push(trimmedLine);
      }
    }

    // Add the last section
    if (currentSection) {
      data.sections.push(currentSection);
    }

    return data;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    console.log('🧹 GitHub data service cache cleared');
  }

  /**
   * Get cache stats
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys()),
      lastCleared: new Date().toISOString()
    };
  }
}

export const githubDataService = GitHubDataService.getInstance();
export default githubDataService;