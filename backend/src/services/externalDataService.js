/**
 * External Data Service for Cloudflare Workers
 * Handles all external API calls and data integration
 */

import { cacheManager } from '../utils/cache.js';

export class ExternalDataService {
  constructor() {
    this.cache = cacheManager;
    this.userAgent = 'Carmen-de-Areco-Transparency-Portal/2.0 (Cloudflare Workers)';
  }

  /**
   * Fetch data with caching
   */
  async fetchWithCache(url, cacheKey, ttl = 300000) { // 5 minutes default
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return {
        success: true,
        data: cached,
        source: 'cache',
        cached: true
      };
    }

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'application/json, text/html, application/xhtml+xml, application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'es-AR,es;q=0.9,en;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
        timeout: 10000
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type') || '';
      let data;

      if (contentType.includes('application/json')) {
        data = await response.json();
      } else if (contentType.includes('text/html')) {
        const html = await response.text();
        data = this.parseHtmlData(html, url);
      } else {
        data = await response.text();
      }

      // Cache the result
      this.cache.set(cacheKey, data, ttl);

      return {
        success: true,
        data,
        source: 'network',
        cached: false,
        contentType,
        responseTime: Date.now()
      };

    } catch (error) {
      console.error(`Error fetching ${url}:`, error);

      return {
        success: false,
        data: null,
        source: 'error',
        error: error.message
      };
    }
  }

  /**
   * Parse HTML content for transparency data
   */
  parseHtmlData(html, url) {
    return {
      url,
      content_length: html.length,
      parsed_at: new Date().toISOString(),
      transparency_indicators: this.extractTransparencyIndicators(html),
      links: this.extractLinks(html),
      metadata: this.extractMetadata(html)
    };
  }

  /**
   * Extract transparency indicators from HTML
   */
  extractTransparencyIndicators(html) {
    const indicators = {
      has_budget_info: /presupuesto|budget|gasto|ingreso|ejecuci[oó]n/i.test(html),
      has_contract_info: /contrato|licitaci[oó]n|procurement|proveedor|adjudicaci[oó]n|compra/i.test(html),
      has_salary_info: /sueldo|salario|empleado|funcionario|remuneraci[oó]n/i.test(html),
      has_transparency_section: /transparencia|transparency|open|datos/i.test(html),
      has_audit_info: /auditor[ií]a|control|interno|externo|fiscalizaci[oó]n/i.test(html),
      has_declarations: /declaraci[oó]n|jurada|patrimonio|intereses/i.test(html),
      has_ordnances: /ordenanza|resoluci[oó]n|normativa|legal/i.test(html),
      last_checked: new Date().toISOString()
    };

    return indicators;
  }

  /**
   * Extract links from HTML
   */
  extractLinks(html) {
    const links = [];
    const linkRegex = /<a[^>]+href="([^"]+)"[^>]*>([^<]+)<\/a>/gi;
    let match;

    while ((match = linkRegex.exec(html)) !== null) {
      links.push({
        url: match[1],
        text: match[2].trim()
      });
    }

    return links;
  }

  /**
   * Extract metadata from HTML
   */
  extractMetadata(html) {
    const metadata = {};

    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) {
      metadata.title = titleMatch[1].trim();
    }

    const descMatch = html.match(/<meta[^>]+name="description"[^>]+content="([^"]+)"/i);
    if (descMatch) {
      metadata.description = descMatch[1].trim();
    }

    return metadata;
  }

  /**
   * Get Carmen de Areco data
   */
  async getCarmenDeArecoData() {
    const cacheKey = 'carmen_de_areco_data';

    try {
      // Try multiple sources for Carmen de Areco data
      const sources = [
        {
          name: 'Official Portal',
          url: 'https://carmendeareco.gob.ar',
          priority: 1
        },
        {
          name: 'Transparency Portal',
          url: 'https://carmendeareco.gob.ar/transparencia',
          priority: 1
        },
        {
          name: 'Official Bulletin',
          url: 'https://carmendeareco.gob.ar/gobierno/boletin-oficial/',
          priority: 2
        }
      ];

      const results = [];

      for (const source of sources) {
        const result = await this.fetchWithCache(
          source.url,
          `${cacheKey}_${source.name.toLowerCase().replace(/\s+/g, '_')}`,
          1800000 // 30 minutes
        );

        results.push({
          ...result,
          source: source.name,
          priority: source.priority
        });
      }

      // Return the first successful result
      const successfulResult = results.find(r => r.success);
      if (successfulResult) {
        return {
          success: true,
          data: successfulResult.data,
          source: successfulResult.source,
          results: results
        };
      }

      return {
        success: false,
        data: null,
        error: 'No successful sources for Carmen de Areco data',
        results: results
      };

    } catch (error) {
      return {
        success: false,
        data: null,
        error: error.message
      };
    }
  }

  /**
   * Get Buenos Aires Province data
   */
  async getBuenosAiresTransparencyData() {
    const cacheKey = 'buenos_aires_data';

    try {
      const sources = [
        {
          name: 'Fiscal Transparency',
          url: 'https://www.gba.gob.ar/transparencia_fiscal/',
          priority: 1
        },
        {
          name: 'Open Data',
          url: 'https://www.gba.gob.ar/datos_abiertos',
          priority: 2
        }
      ];

      const results = [];

      for (const source of sources) {
        const result = await this.fetchWithCache(
          source.url,
          `${cacheKey}_${source.name.toLowerCase().replace(/\s+/g, '_')}`,
          3600000 // 1 hour
        );

        results.push({
          ...result,
          source: source.name,
          priority: source.priority
        });
      }

      const successfulResult = results.find(r => r.success);
      if (successfulResult) {
        return {
          success: true,
          data: successfulResult.data,
          source: successfulResult.source,
          results: results
        };
      }

      return {
        success: false,
        data: null,
        error: 'No successful sources for Buenos Aires data',
        results: results
      };

    } catch (error) {
      return {
        success: false,
        data: null,
        error: error.message
      };
    }
  }

  /**
   * Get national budget data
   */
  async getNationalBudgetData() {
    const cacheKey = 'national_budget_data';

    try {
      const sources = [
        {
          name: 'Datos Argentina',
          url: 'https://datos.gob.ar/api/3/action/package_search?q=presupuesto',
          priority: 1
        },
        {
          name: 'Presupuesto Abierto',
          url: 'https://www.presupuestoabierto.gob.ar/sici/api/v1/entidades',
          priority: 2
        }
      ];

      const results = [];

      for (const source of sources) {
        const result = await this.fetchWithCache(
          source.url,
          `${cacheKey}_${source.name.toLowerCase().replace(/\s+/g, '_')}`,
          7200000 // 2 hours
        );

        results.push({
          ...result,
          source: source.name,
          priority: source.priority
        });
      }

      const successfulResult = results.find(r => r.success);
      if (successfulResult) {
        return {
          success: true,
          data: successfulResult.data,
          source: successfulResult.source,
          results: results
        };
      }

      return {
        success: false,
        data: null,
        error: 'No successful sources for national budget data',
        results: results
      };

    } catch (error) {
      return {
        success: false,
        data: null,
        error: error.message
      };
    }
  }

  /**
   * Load all external data sources
   */
  async loadAllExternalData() {
    console.log('Loading all external data sources...');

    const [carmenData, buenosAiresData, nationalData] = await Promise.all([
      this.getCarmenDeArecoData(),
      this.getBuenosAiresTransparencyData(),
      this.getNationalBudgetData()
    ]);

    const allResults = [
      { name: 'Carmen de Areco', data: carmenData, type: 'municipal' },
      { name: 'Buenos Aires Province', data: buenosAiresData, type: 'provincial' },
      { name: 'National Budget APIs', data: nationalData, type: 'national' }
    ];

    const successfulSources = allResults.filter(r => r.data.success).length;
    const failedSources = allResults.filter(r => !r.data.success).length;

    return {
      results: allResults,
      summary: {
        total_sources: allResults.length,
        successful_sources: successfulSources,
        failed_sources: failedSources,
        cache_hits: 0, // Would need to track this
        last_updated: new Date().toISOString()
      }
    };
  }
}

// Export singleton instance
export const externalDataService = new ExternalDataService();
