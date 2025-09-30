/**
 * Resource Service - Efficient management of all resources (CSV, JSON, PDF, etc.)
 * Centralized resource loading, caching, and optimization
 */

export interface ResourceConfig {
  url: string;
  type: 'csv' | 'json' | 'pdf' | 'xml' | 'image' | 'api';
  cacheDuration?: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  description: string;
  dependencies?: string[];
  preprocessor?: (data: any) => any;
}

export interface ResourceStatus {
  url: string;
  status: 'loading' | 'loaded' | 'error' | 'cached';
  loadTime: number;
  size: number;
  lastAccess: number;
  error?: string;
}

export class ResourceService {
  private static instance: ResourceService;
  private resources: Map<string, ResourceConfig> = new Map();
  private status: Map<string, ResourceStatus> = new Map();
  private cache: Map<string, { data: any; timestamp: number; expires: number }> = new Map();
  private loadingPromises: Map<string, Promise<any>> = new Map();

  // Default resource configurations
  private defaultResources: ResourceConfig[] = [
    // CSV Resources
    {
      url: '/data/charts/Budget_Execution_consolidated_2019-2025.csv',
      type: 'csv',
      cacheDuration: 10 * 60 * 1000, // 10 minutes
      priority: 'critical',
      category: 'budget',
      description: 'Consolidated budget execution data',
      dependencies: []
    },
    {
      url: '/data/charts/Revenue_Analysis_2019-2025.csv',
      type: 'csv',
      cacheDuration: 10 * 60 * 1000,
      priority: 'high',
      category: 'revenue',
      description: 'Revenue analysis data',
      dependencies: []
    },
    {
      url: '/data/charts/Expenses_by_Category_2019-2025.csv',
      type: 'csv',
      cacheDuration: 10 * 60 * 1000,
      priority: 'high',
      category: 'expenses',
      description: 'Expenses categorized data',
      dependencies: []
    },

    // JSON Resources
    {
      url: '/data/audit_results/external_data_audit.json',
      type: 'json',
      cacheDuration: 15 * 60 * 1000,
      priority: 'medium',
      category: 'audit',
      description: 'External data audit results',
      dependencies: []
    },
    {
      url: '/data/audit_results/audit_summary.json',
      type: 'json',
      cacheDuration: 15 * 60 * 1000,
      priority: 'medium',
      category: 'audit',
      description: 'Audit summary data',
      dependencies: []
    },

    // PDF Resources
    {
      url: '/src/data/downloaded/pdfs/pdf_160_PRESUPUESTO-2025-APROBADO-ORD-3280-24.pdf',
      type: 'pdf',
      cacheDuration: 30 * 60 * 1000,
      priority: 'high',
      category: 'budget',
      description: 'Presupuesto 2025 aprobado',
      dependencies: []
    },
    {
      url: '/src/data/downloaded/pdfs/pdf_173_ESCALA-SALARIAL-OCTUBRE-2024.pdf',
      type: 'pdf',
      cacheDuration: 30 * 60 * 1000,
      priority: 'medium',
      category: 'salaries',
      description: 'Escala salarial octubre 2024',
      dependencies: []
    },
    {
      url: '/src/data/downloaded/pdfs/pdf_184_ORGANIGRAMA-2025.pdf',
      type: 'pdf',
      cacheDuration: 30 * 60 * 1000,
      priority: 'medium',
      category: 'organizational',
      description: 'Organigrama 2025',
      dependencies: []
    }
  ];

  private constructor() {
    // Initialize default resources
    this.defaultResources.forEach(resource => {
      this.resources.set(resource.url, resource);
    });
  }

  public static getInstance(): ResourceService {
    if (!ResourceService.instance) {
      ResourceService.instance = new ResourceService();
    }
    return ResourceService.instance;
  }

  /**
   * Register a new resource
   */
  public registerResource(config: ResourceConfig): void {
    this.resources.set(config.url, config);
  }

  /**
   * Load a resource with caching and optimization
   */
  public async loadResource(url: string): Promise<any> {
    const config = this.resources.get(url);
    if (!config) {
      throw new Error(`Resource not registered: ${url}`);
    }

    // Check if already loading
    const existingPromise = this.loadingPromises.get(url);
    if (existingPromise) {
      return existingPromise;
    }

    // Check cache first
    const cached = this.cache.get(url);
    if (cached && Date.now() < cached.expires) {
      this.updateStatus(url, {
        status: 'cached',
        lastAccess: Date.now()
      });
      return cached.data;
    }

    // Create loading promise
    const loadingPromise = this.performLoad(config);
    this.loadingPromises.set(url, loadingPromise);

    try {
      const result = await loadingPromise;
      this.loadingPromises.delete(url);
      return result;
    } catch (error) {
      this.loadingPromises.delete(url);
      throw error;
    }
  }

  /**
   * Perform the actual loading
   */
  private async performLoad(config: ResourceConfig): Promise<any> {
    const startTime = Date.now();

    this.updateStatus(config.url, {
      status: 'loading',
      lastAccess: startTime
    });

    try {
      let data: any;

      switch (config.type) {
        case 'csv':
          data = await this.loadCsvResource(config.url);
          break;
        case 'json':
          data = await this.loadJsonResource(config.url);
          break;
        case 'pdf':
          data = await this.loadPdfResource(config.url);
          break;
        case 'xml':
          data = await this.loadXmlResource(config.url);
          break;
        case 'api':
          data = await this.loadApiResource(config.url);
          break;
        default:
          throw new Error(`Unsupported resource type: ${config.type}`);
      }

      // Apply preprocessor if defined
      if (config.preprocessor) {
        data = config.preprocessor(data);
      }

      const loadTime = Date.now() - startTime;

      // Cache the result
      this.cache.set(config.url, {
        data,
        timestamp: Date.now(),
        expires: Date.now() + (config.cacheDuration || 10 * 60 * 1000)
      });

      this.updateStatus(config.url, {
        status: 'loaded',
        loadTime,
        size: JSON.stringify(data).length,
        lastAccess: Date.now()
      });

      return data;

    } catch (error) {
      this.updateStatus(config.url, {
        status: 'error',
        error: (error as Error).message,
        lastAccess: Date.now()
      });
      throw error;
    }
  }

  /**
   * Load CSV resource
   */
  private async loadCsvResource(url: string): Promise<any[]> {
    const Papa = (await import('papaparse')).default;

    return new Promise((resolve, reject) => {
      Papa.parse(url, {
        download: true,
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            console.warn(`CSV parsing warnings for ${url}:`, results.errors);
          }

          const cleanData = results.data.filter((row: any) =>
            Object.values(row).some(value => value !== null && value !== '')
          );

          resolve(cleanData);
        },
        error: (error) => reject(error)
      });
    });
  }

  /**
   * Load JSON resource
   */
  private async loadJsonResource(url: string): Promise<any> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  /**
   * Load PDF resource metadata
   */
  private async loadPdfResource(url: string): Promise<any> {
    const response = await fetch(url, { method: 'HEAD' });

    return {
      url,
      available: response.ok,
      size: response.headers.get('content-length'),
      lastModified: response.headers.get('last-modified'),
      contentType: response.headers.get('content-type'),
      name: url.split('/').pop()
    };
  }

  /**
   * Load XML resource
   */
  private async loadXmlResource(url: string): Promise<any> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const text = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(text, 'text/xml');

    // Convert XML to JSON-like object
    return this.xmlToJson(xmlDoc);
  }

  /**
   * Load API resource
   */
  private async loadApiResource(url: string): Promise<any> {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Convert XML to JSON
   */
  private xmlToJson(xml: Document | Element): any {
    let obj: any = {};

    if (xml.nodeType === 1) { // element
      const element = xml as Element;
      if (element.attributes.length > 0) {
        obj['@attributes'] = {};
        for (let j = 0; j < element.attributes.length; j++) {
          const attribute = element.attributes.item(j);
          if (attribute) {
            obj['@attributes'][attribute.nodeName] = attribute.nodeValue;
          }
        }
      }
    } else if (xml.nodeType === 3) { // text
      obj = xml.nodeValue;
    }

    if (xml.hasChildNodes()) {
      for (let i = 0; i < xml.childNodes.length; i++) {
        const item = xml.childNodes.item(i);
        const nodeName = item.nodeName;
        if (typeof obj[nodeName] === 'undefined') {
          obj[nodeName] = this.xmlToJson(item);
        } else {
          if (typeof obj[nodeName].push === 'undefined') {
            const old = obj[nodeName];
            obj[nodeName] = [];
            obj[nodeName].push(old);
          }
          obj[nodeName].push(this.xmlToJson(item));
        }
      }
    }
    return obj;
  }

  /**
   * Update resource status
   */
  private updateStatus(url: string, updates: Partial<ResourceStatus>): void {
    const current = this.status.get(url) || {
      url,
      status: 'loading',
      loadTime: 0,
      size: 0,
      lastAccess: Date.now()
    };

    this.status.set(url, { ...current, ...updates });
  }

  /**
   * Get resource status
   */
  public getStatus(url: string): ResourceStatus | undefined {
    return this.status.get(url);
  }

  /**
   * Get all resources by category
   */
  public getResourcesByCategory(category: string): ResourceConfig[] {
    return Array.from(this.resources.values()).filter(
      resource => resource.category === category
    );
  }

  /**
   * Get resources by priority
   */
  public getResourcesByPriority(priority: ResourceConfig['priority']): ResourceConfig[] {
    return Array.from(this.resources.values()).filter(
      resource => resource.priority === priority
    );
  }

  /**
   * Preload critical resources
   */
  public async preloadCriticalResources(): Promise<void> {
    const critical = this.getResourcesByPriority('critical');
    const high = this.getResourcesByPriority('high');

    // Load critical resources first
    await Promise.all(critical.map(resource =>
      this.loadResource(resource.url).catch(error =>
        console.warn(`Failed to preload critical resource ${resource.url}:`, error)
      )
    ));

    // Load high priority resources
    await Promise.all(high.map(resource =>
      this.loadResource(resource.url).catch(error =>
        console.warn(`Failed to preload high priority resource ${resource.url}:`, error)
      )
    ));
  }

  /**
   * Clear cache
   */
  public clearCache(url?: string): void {
    if (url) {
      this.cache.delete(url);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Get cache statistics
   */
  public getCacheStats(): any {
    const entries = Array.from(this.cache.entries());
    return {
      totalEntries: entries.length,
      totalSize: entries.reduce((sum, [, cached]) =>
        sum + JSON.stringify(cached.data).length, 0
      ),
      entries: entries.map(([url, cached]) => ({
        url,
        size: JSON.stringify(cached.data).length,
        age: Date.now() - cached.timestamp,
        expires: cached.expires
      }))
    };
  }

  /**
   * Get performance metrics
   */
  public getPerformanceMetrics(): any {
    const statusEntries = Array.from(this.status.values());
    const loadedResources = statusEntries.filter(s => s.status === 'loaded');

    return {
      totalResources: statusEntries.length,
      loadedCount: loadedResources.length,
      errorCount: statusEntries.filter(s => s.status === 'error').length,
      cachedCount: statusEntries.filter(s => s.status === 'cached').length,
      avgLoadTime: loadedResources.length > 0 ?
        loadedResources.reduce((sum, s) => sum + s.loadTime, 0) / loadedResources.length : 0,
      totalSize: loadedResources.reduce((sum, s) => sum + s.size, 0)
    };
  }
}

// Export singleton instance
export const resourceService = ResourceService.getInstance();
export default resourceService;