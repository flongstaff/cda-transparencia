#!/usr/bin/env node

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;
const path = require('path');
const { URL } = require('url');

class TransparencySpider {
  constructor(options = {}) {
    this.startUrl = options.startUrl || 'https://carmendeareco.gob.ar/transparencia/';
    this.maxDepth = options.maxDepth || 3;
    this.maxPages = options.maxPages || 100;
    this.delay = options.delay || 2000;
    this.outputDir = path.join(__dirname, '../src/data/spider');
    
    this.visited = new Set();
    this.toVisit = [];
    this.documents = [];
    this.errors = [];
    
    this.selectors = {
      links: 'a[href]',
      documents: 'a[href$=".pdf"], a[href$=".doc"], a[href$=".docx"], a[href$=".xls"], a[href$=".xlsx"]',
      transparencyKeywords: [
        'presupuesto', 'budget', 'ejecucion', 'gastos', 'ingresos',
        'licitacion', 'tender', 'contrato', 'contract',
        'declaracion', 'declaration', 'patrimonio', 'assets',
        'informe', 'report', 'auditoria', 'audit',
        'resolucion', 'resolution', 'decreto', 'ordinance'
      ]
    };
  }

  async initialize() {
    try {
      await fs.mkdir(this.outputDir, { recursive: true });
      await fs.mkdir(path.join(this.outputDir, 'pages'), { recursive: true });
      await fs.mkdir(path.join(this.outputDir, 'documents'), { recursive: true });
      console.log('🕷️ Spider initialized');
    } catch (error) {
      console.error('Failed to initialize spider:', error);
    }
  }

  async fetchPage(url) {
    try {
      console.log(`🔍 Fetching: ${url}`);
      const response = await axios.get(url, {
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; CDA-TransparencyBot/1.0)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        }
      });
      
      return {
        url,
        status: response.status,
        data: response.data,
        headers: response.headers,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.warn(`⚠️ Failed to fetch ${url}:`, error.message);
      this.errors.push({
        url,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      return null;
    }
  }

  extractLinks(html, baseUrl) {
    const $ = cheerio.load(html);
    const links = [];
    
    $(this.selectors.links).each((i, element) => {
      const $el = $(element);
      const href = $el.attr('href');
      const text = $el.text().trim();
      
      if (href && text) {
        try {
          const absoluteUrl = new URL(href, baseUrl).href;
          const urlObj = new URL(absoluteUrl);
          
          // Only process same domain links
          if (urlObj.hostname === new URL(baseUrl).hostname) {
            links.push({
              url: absoluteUrl,
              text: text,
              context: $el.parent().text().trim().substring(0, 100)
            });
          }
        } catch (error) {
          // Invalid URL, skip
        }
      }
    });
    
    return links;
  }

  extractDocuments(html, baseUrl) {
    const $ = cheerio.load(html);
    const documents = [];
    
    $(this.selectors.documents).each((i, element) => {
      const $el = $(element);
      const href = $el.attr('href');
      const text = $el.text().trim();
      
      if (href && text) {
        try {
          const absoluteUrl = new URL(href, baseUrl).href;
          const urlObj = new URL(absoluteUrl);
          const extension = path.extname(urlObj.pathname).toLowerCase();
          
          documents.push({
            url: absoluteUrl,
            title: text,
            type: this.categorizeDocument(text, extension),
            extension: extension,
            context: $el.closest('div, section, article').text().trim().substring(0, 200),
            found_on: baseUrl,
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          // Invalid URL, skip
        }
      }
    });
    
    return documents;
  }

  categorizeDocument(title, extension) {
    const titleLower = title.toLowerCase();
    
    // Budget/Financial documents
    if (titleLower.match(/(presupuesto|budget|ejecucion|gastos|ingresos|balance)/)) {
      return 'budget';
    }
    
    // Contracts/Tenders
    if (titleLower.match(/(licitacion|tender|contrato|contract|adjudicacion)/)) {
      return 'contract';
    }
    
    // Declarations/Assets
    if (titleLower.match(/(declaracion|declaration|patrimonio|assets|ddjj)/)) {
      return 'declaration';
    }
    
    // Reports/Audits
    if (titleLower.match(/(informe|report|auditoria|audit|memoria)/)) {
      return 'report';
    }
    
    // Resolutions/Legal
    if (titleLower.match(/(resolucion|resolution|decreto|ordinance|ordenanza)/)) {
      return 'resolution';
    }
    
    // Organizational
    if (titleLower.match(/(organigrama|estructura|directorio)/)) {
      return 'organizational';
    }
    
    return 'other';
  }

  analyzeTransparencyContent(html, url) {
    const $ = cheerio.load(html);
    const analysis = {
      url,
      timestamp: new Date().toISOString(),
      transparency_score: 0,
      features_found: [],
      sections: [],
      accessibility: {
        has_navigation: false,
        has_search: false,
        has_sitemap: false,
        language_declared: false
      }
    };

    // Check for transparency keywords in content
    const pageText = $('body').text().toLowerCase();
    let keywordMatches = 0;
    
    for (const keyword of this.selectors.transparencyKeywords) {
      if (pageText.includes(keyword)) {
        keywordMatches++;
        analysis.features_found.push(keyword);
      }
    }
    
    analysis.transparency_score += keywordMatches * 5;

    // Check for structured sections
    $('section, .section, div[class*="transparencia"], div[class*="presupuesto"]').each((i, element) => {
      const $el = $(element);
      const text = $el.text().trim();
      const heading = $el.find('h1, h2, h3, h4').first().text().trim();
      
      if (text.length > 50) {
        analysis.sections.push({
          heading: heading || 'Sin título',
          content_length: text.length,
          has_links: $el.find('a').length > 0,
          has_documents: $el.find(this.selectors.documents).length > 0
        });
      }
    });

    analysis.transparency_score += analysis.sections.length * 10;

    // Check accessibility features
    analysis.accessibility.has_navigation = $('nav, .nav, .navigation').length > 0;
    analysis.accessibility.has_search = $('input[type="search"], .search').length > 0;
    analysis.accessibility.has_sitemap = $('a[href*="sitemap"]').length > 0;
    analysis.accessibility.language_declared = $('html[lang]').length > 0;

    // Bonus points for accessibility
    const accessibilityScore = Object.values(analysis.accessibility).filter(Boolean).length * 5;
    analysis.transparency_score += accessibilityScore;

    return analysis;
  }

  isRelevantPage(url, html) {
    const urlLower = url.toLowerCase();
    const htmlLower = html.toLowerCase();
    
    // Check if URL contains transparency-related terms
    const urlRelevant = this.selectors.transparencyKeywords.some(keyword => 
      urlLower.includes(keyword)
    );
    
    // Check if page content contains transparency terms
    let contentScore = 0;
    for (const keyword of this.selectors.transparencyKeywords) {
      if (htmlLower.includes(keyword)) {
        contentScore++;
      }
    }
    
    return urlRelevant || contentScore >= 2;
  }

  async crawl() {
    console.log('🕷️ Starting transparency spider crawl...');
    console.log(`📍 Starting URL: ${this.startUrl}`);
    console.log(`🎯 Max depth: ${this.maxDepth}, Max pages: ${this.maxPages}`);
    
    // Initialize crawl
    this.toVisit.push({ url: this.startUrl, depth: 0 });
    
    while (this.toVisit.length > 0 && this.visited.size < this.maxPages) {
      const { url, depth } = this.toVisit.shift();
      
      if (this.visited.has(url) || depth > this.maxDepth) {
        continue;
      }
      
      this.visited.add(url);
      
      // Fetch page
      const page = await this.fetchPage(url);
      if (!page) {
        continue;
      }
      
      // Check if page is relevant to transparency
      if (!this.isRelevantPage(url, page.data)) {
        console.log(`⏭️ Skipping irrelevant page: ${url}`);
        continue;
      }
      
      console.log(`📄 Processing relevant page: ${url} (depth: ${depth})`);
      
      // Extract documents
      const documents = this.extractDocuments(page.data, url);
      this.documents.push(...documents);
      console.log(`📎 Found ${documents.length} documents`);
      
      // Analyze transparency content
      const analysis = this.analyzeTransparencyContent(page.data, url);
      
      // Save page data
      const pageData = {
        ...page,
        analysis,
        documents,
        processed_at: new Date().toISOString()
      };
      
      const filename = `page_${this.visited.size}_${Date.now()}.json`;
      await fs.writeFile(
        path.join(this.outputDir, 'pages', filename),
        JSON.stringify(pageData, null, 2)
      );
      
      // Extract and queue new links (if not at max depth)
      if (depth < this.maxDepth) {
        const links = this.extractLinks(page.data, url);
        for (const link of links) {
          if (!this.visited.has(link.url) && 
              !this.toVisit.some(item => item.url === link.url)) {
            this.toVisit.push({ url: link.url, depth: depth + 1 });
          }
        }
        console.log(`🔗 Queued ${links.length} new links`);
      }
      
      // Be respectful to the server
      await this.delay(this.delay);
    }
    
    console.log('✅ Crawl completed');
    return await this.generateReport();
  }

  async generateReport() {
    console.log('📊 Generating spider report...');
    
    const report = {
      crawl_summary: {
        start_url: this.startUrl,
        pages_visited: this.visited.size,
        documents_found: this.documents.length,
        errors: this.errors.length,
        crawl_date: new Date().toISOString(),
        crawl_duration: 'calculated_separately'
      },
      documents_by_type: {},
      top_transparency_pages: [],
      document_analysis: {
        total_documents: this.documents.length,
        unique_documents: new Set(this.documents.map(d => d.url)).size,
        document_types: {},
        document_sources: {}
      },
      recommendations: [],
      errors: this.errors
    };

    // Analyze documents
    for (const doc of this.documents) {
      report.documents_by_type[doc.type] = (report.documents_by_type[doc.type] || 0) + 1;
      report.document_analysis.document_types[doc.extension] = 
        (report.document_analysis.document_types[doc.extension] || 0) + 1;
      
      const domain = new URL(doc.found_on).hostname;
      report.document_analysis.document_sources[domain] = 
        (report.document_analysis.document_sources[domain] || 0) + 1;
    }

    // Generate recommendations
    if (report.documents_by_type.budget || 0 < 3) {
      report.recommendations.push('Limited budget documents found - consider expanding search or checking archive');
    }
    
    if (report.documents_by_type.contract || 0 < 5) {
      report.recommendations.push('Few contract documents found - may need manual document discovery');
    }
    
    if (report.crawl_summary.errors > report.crawl_summary.pages_visited * 0.2) {
      report.recommendations.push('High error rate detected - site may have accessibility issues');
    }

    // Save comprehensive reports
    await fs.writeFile(
      path.join(this.outputDir, 'crawl_report.json'),
      JSON.stringify(report, null, 2)
    );
    
    await fs.writeFile(
      path.join(this.outputDir, 'documents_catalog.json'),
      JSON.stringify(this.documents, null, 2)
    );
    
    console.log('✅ Spider report generated');
    return report;
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// CLI execution
if (require.main === module) {
  const spider = new TransparencySpider({
    startUrl: process.argv[2] || process.env.SPIDER_START_URL || 'https://carmendeareco.gob.ar/transparencia/', // This should point to the official site
    maxDepth: parseInt(process.argv[3]) || 3,
    maxPages: parseInt(process.argv[4]) || 50
  });
  
  spider.initialize()
    .then(() => spider.crawl())
    .then(report => {
      console.log('🎉 Spider crawl completed successfully!');
      console.log(`📄 Pages crawled: ${report.crawl_summary.pages_visited}`);
      console.log(`📎 Documents found: ${report.crawl_summary.documents_found}`);
      console.log(`❌ Errors: ${report.crawl_summary.errors}`);
    })
    .catch(error => {
      console.error('❌ Spider crawl failed:', error);
      process.exit(1);
    });
}

module.exports = TransparencySpider;