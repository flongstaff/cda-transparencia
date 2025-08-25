#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class TransparencyDataCollector {
  constructor() {
    this.officialSite = 'https://carmendeareco.gob.ar/transparencia/';
    this.webArchiveBase = 'https://web.archive.org/web/';
    this.outputDir = path.join(__dirname, '../src/data/collected');
    this.backupDir = path.join(__dirname, '../data/backups');
    
    this.sources = [
      {
        name: 'Carmen de Areco Official',
        url: 'https://carmendeareco.gob.ar/transparencia/',
        type: 'live',
        selectors: {
          documents: 'a[href$=".pdf"]',
          budget: '.presupuesto, .ejecucion-presupuestaria',
          contracts: '.licitaciones, .contrataciones',
          reports: '.informes, .reportes'
        }
      },
      {
        name: 'Buenos Aires Province Portal',
        url: 'https://www.gba.gob.ar/transparencia',
        type: 'reference',
        selectors: {
          documents: 'a[href*="pdf"]',
          structure: '.transparency-section'
        }
      },
      {
        name: 'La Plata Transparency',
        url: 'https://www.laplata.gob.ar/transparencia/',
        type: 'reference',
        selectors: {
          documents: '.documento-item a',
          categories: '.categoria-transparencia'
        }
      }
    ];
  }

  async initializeDirectories() {
    try {
      await fs.mkdir(this.outputDir, { recursive: true });
      await fs.mkdir(this.backupDir, { recursive: true });
      await fs.mkdir(path.join(this.outputDir, 'documents'), { recursive: true });
      await fs.mkdir(path.join(this.outputDir, 'metadata'), { recursive: true });
      console.log('✅ Directories initialized');
    } catch (error) {
      console.error('❌ Failed to initialize directories:', error.message);
    }
  }

  async fetchWithRetry(url, retries = 3) {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await axios.get(url, {
          timeout: 30000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'es-ES,es;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
          }
        });
        return response;
      } catch (error) {
        console.warn(`⚠️ Attempt ${i + 1} failed for ${url}:`, error.message);
        if (i === retries - 1) throw error;
        await this.delay(2000 * (i + 1)); // Exponential backoff
      }
    }
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async collectFromOfficialSite() {
    console.log('🔍 Starting official site collection...');
    try {
      const source = this.sources[0];
      const response = await this.fetchWithRetry(source.url);
      const $ = cheerio.load(response.data);
      
      const collected = {
        url: source.url,
        timestamp: new Date().toISOString(),
        documents: [],
        sections: {},
        metadata: {
          title: $('title').text().trim(),
          description: $('meta[name="description"]').attr('content') || '',
        }
      };

      // Collect document links
      $(source.selectors.documents).each((i, element) => {
        const $el = $(element);
        const href = $el.attr('href');
        const text = $el.text().trim();
        
        if (href && text) {
          const fullUrl = href.startsWith('http') ? href : new URL(href, source.url).href;
          collected.documents.push({
            title: text,
            url: fullUrl,
            type: this.categorizeDocument(text),
            found_at: new Date().toISOString()
          });
        }
      });

      // Collect section data
      for (const [key, selector] of Object.entries(source.selectors)) {
        if (key !== 'documents') {
          collected.sections[key] = [];
          $(selector).each((i, element) => {
            const $el = $(element);
            collected.sections[key].push({
              text: $el.text().trim(),
              html: $el.html(),
              links: $el.find('a').map((j, link) => ({
                text: $(link).text().trim(),
                href: $(link).attr('href')
              })).get()
            });
          });
        }
      }

      // Save collected data
      const filename = `official_site_${new Date().toISOString().split('T')[0]}.json`;
      await fs.writeFile(
        path.join(this.outputDir, 'metadata', filename),
        JSON.stringify(collected, null, 2)
      );
      
      console.log(`✅ Official site data saved: ${collected.documents.length} documents found`);
      return collected;
    } catch (error) {
      console.error('❌ Failed to collect from official site:', error.message);
      return null;
    }
  }

  async collectFromWebArchive() {
    console.log('🔍 Starting Web Archive collection...');
    try {
      // Get available snapshots
      const cdxUrl = `https://web.archive.org/cdx/search/cdx?url=${encodeURIComponent(this.officialSite)}&output=json&limit=50`;
      const response = await this.fetchWithRetry(cdxUrl);
      
      if (!Array.isArray(response.data) || response.data.length < 2) {
        console.warn('⚠️ No archive snapshots found');
        return null;
      }

      const snapshots = response.data.slice(1).map(row => ({
        timestamp: row[1],
        url: row[2],
        status: row[4],
        archiveUrl: `https://web.archive.org/web/${row[1]}/${row[2]}`
      })).filter(snapshot => snapshot.status === '200');

      console.log(`📦 Found ${snapshots.length} archive snapshots`);

      const archiveData = {
        source_url: this.officialSite,
        collection_timestamp: new Date().toISOString(),
        snapshots: snapshots.slice(0, 10), // Take latest 10
        documents: []
      };

      // Collect from recent snapshots
      for (const snapshot of snapshots.slice(0, 3)) {
        try {
          console.log(`📖 Processing snapshot: ${snapshot.timestamp}`);
          const snapshotResponse = await this.fetchWithRetry(snapshot.archiveUrl);
          const $ = cheerio.load(snapshotResponse.data);
          
          $('a[href$=".pdf"]').each((i, element) => {
            const $el = $(element);
            const href = $el.attr('href');
            const text = $el.text().trim();
            
            if (href && text && !archiveData.documents.some(doc => doc.title === text)) {
              archiveData.documents.push({
                title: text,
                url: href,
                archive_url: snapshot.archiveUrl,
                snapshot_date: snapshot.timestamp,
                type: this.categorizeDocument(text),
                source: 'web_archive'
              });
            }
          });
          
          await this.delay(2000); // Be respectful to Archive.org
        } catch (error) {
          console.warn(`⚠️ Failed to process snapshot ${snapshot.timestamp}:`, error.message);
        }
      }

      // Save archive data
      const filename = `web_archive_${new Date().toISOString().split('T')[0]}.json`;
      await fs.writeFile(
        path.join(this.outputDir, 'metadata', filename),
        JSON.stringify(archiveData, null, 2)
      );
      
      console.log(`✅ Web Archive data saved: ${archiveData.documents.length} documents found`);
      return archiveData;
    } catch (error) {
      console.error('❌ Failed to collect from Web Archive:', error.message);
      return null;
    }
  }

  async collectFromReferenceSites() {
    console.log('🔍 Collecting from reference transparency portals...');
    const referenceData = [];

    for (const source of this.sources.slice(1)) {
      try {
        console.log(`📊 Processing reference site: ${source.name}`);
        const response = await this.fetchWithRetry(source.url);
        const $ = cheerio.load(response.data);
        
        const siteData = {
          name: source.name,
          url: source.url,
          timestamp: new Date().toISOString(),
          structure: {},
          features: []
        };

        // Analyze site structure
        $('.nav, .menu, .navigation').each((i, nav) => {
          const $nav = $(nav);
          const navItems = $nav.find('a').map((j, link) => ({
            text: $(link).text().trim(),
            href: $(link).attr('href')
          })).get();
          
          if (navItems.length > 0) {
            siteData.structure[`navigation_${i}`] = navItems;
          }
        });

        // Identify transparency features
        const transparencyKeywords = [
          'presupuesto', 'licitacion', 'contrato', 'declaracion', 'patrimonio',
          'gasto', 'ingreso', 'auditoria', 'control', 'transparencia'
        ];

        $('a, .section, .category').each((i, element) => {
          const $el = $(element);
          const text = $el.text().toLowerCase();
          
          for (const keyword of transparencyKeywords) {
            if (text.includes(keyword)) {
              siteData.features.push({
                keyword,
                text: $el.text().trim(),
                element: element.tagName,
                href: $el.attr('href')
              });
              break;
            }
          }
        });

        referenceData.push(siteData);
        await this.delay(3000); // Be respectful
      } catch (error) {
        console.warn(`⚠️ Failed to process ${source.name}:`, error.message);
      }
    }

    // Save reference data
    const filename = `reference_sites_${new Date().toISOString().split('T')[0]}.json`;
    await fs.writeFile(
      path.join(this.outputDir, 'metadata', filename),
      JSON.stringify(referenceData, null, 2)
    );
    
    console.log(`✅ Reference sites analysis saved: ${referenceData.length} sites processed`);
    return referenceData;
  }

  categorizeDocument(title) {
    const titleLower = title.toLowerCase();
    
    if (titleLower.includes('presupuesto') || titleLower.includes('ejecucion')) {
      return 'budget';
    } else if (titleLower.includes('licitacion') || titleLower.includes('contrato')) {
      return 'contract';
    } else if (titleLower.includes('declaracion') || titleLower.includes('patrimonio')) {
      return 'declaration';
    } else if (titleLower.includes('resolucion') || titleLower.includes('decreto')) {
      return 'resolution';
    } else if (titleLower.includes('informe') || titleLower.includes('auditoria')) {
      return 'report';
    } else {
      return 'other';
    }
  }

  async downloadDocument(doc, maxSizeMB = 50) {
    try {
      const response = await this.fetchWithRetry(doc.url);
      
      if (response.headers['content-length']) {
        const sizeMB = parseInt(response.headers['content-length']) / (1024 * 1024);
        if (sizeMB > maxSizeMB) {
          console.warn(`⚠️ Skipping large file: ${doc.title} (${sizeMB.toFixed(1)}MB)`);
          return false;
        }
      }

      const filename = `${doc.type}_${Date.now()}_${path.basename(new URL(doc.url).pathname)}`;
      const filepath = path.join(this.outputDir, 'documents', filename);
      
      await fs.writeFile(filepath, response.data);
      console.log(`💾 Downloaded: ${filename}`);
      
      doc.local_path = filepath;
      doc.downloaded_at = new Date().toISOString();
      return true;
    } catch (error) {
      console.warn(`⚠️ Failed to download ${doc.title}:`, error.message);
      return false;
    }
  }

  async generateDataSummary() {
    console.log('📋 Generating data collection summary...');
    
    const metadataFiles = await fs.readdir(path.join(this.outputDir, 'metadata'));
    const summary = {
      collection_date: new Date().toISOString(),
      sources_processed: 0,
      total_documents: 0,
      documents_by_type: {},
      data_quality: {
        official_site_accessible: false,
        web_archive_available: false,
        reference_sites_analyzed: 0
      },
      next_collection: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      recommendations: []
    };

    for (const file of metadataFiles) {
      if (file.endsWith('.json')) {
        try {
          const data = JSON.parse(await fs.readFile(path.join(this.outputDir, 'metadata', file), 'utf-8'));
          summary.sources_processed++;
          
          if (file.includes('official_site') && data.documents) {
            summary.total_documents += data.documents.length;
            summary.data_quality.official_site_accessible = true;
            
            for (const doc of data.documents) {
              summary.documents_by_type[doc.type] = (summary.documents_by_type[doc.type] || 0) + 1;
            }
          }
          
          if (file.includes('web_archive') && data.documents) {
            summary.data_quality.web_archive_available = data.documents.length > 0;
          }
          
          if (file.includes('reference_sites')) {
            summary.data_quality.reference_sites_analyzed = data.length;
          }
        } catch (error) {
          console.warn(`⚠️ Failed to process summary for ${file}:`, error.message);
        }
      }
    }

    // Generate recommendations
    if (!summary.data_quality.official_site_accessible) {
      summary.recommendations.push('Official site is not accessible - rely on web archive data');
    }
    
    if (summary.total_documents < 10) {
      summary.recommendations.push('Low document count - consider expanding search criteria');
    }
    
    if (!summary.documents_by_type.budget) {
      summary.recommendations.push('No budget documents found - manual review required');
    }

    await fs.writeFile(
      path.join(this.outputDir, 'collection_summary.json'),
      JSON.stringify(summary, null, 2)
    );
    
    console.log('✅ Data collection summary generated');
    return summary;
  }

  async run() {
    console.log('🚀 Starting Carmen de Areco Transparency Data Collection');
    console.log('================================================');
    
    await this.initializeDirectories();
    
    const results = {
      official: null,
      archive: null,
      references: null,
      summary: null
    };

    // Collect from official site
    results.official = await this.collectFromOfficialSite();
    
    // Collect from Web Archive
    results.archive = await this.collectFromWebArchive();
    
    // Collect from reference sites
    results.references = await this.collectFromReferenceSites();
    
    // Generate summary
    results.summary = await this.generateDataSummary();
    
    console.log('================================================');
    console.log('✅ Data collection completed!');
    console.log(`📊 Sources processed: ${results.summary?.sources_processed || 0}`);
    console.log(`📄 Documents found: ${results.summary?.total_documents || 0}`);
    console.log(`💾 Data saved to: ${this.outputDir}`);
    console.log('================================================');
    
    return results;
  }
}

// CLI execution
if (require.main === module) {
  const collector = new TransparencyDataCollector();
  collector.run().catch(error => {
    console.error('❌ Collection failed:', error);
    process.exit(1);
  });
}

module.exports = TransparencyDataCollector;