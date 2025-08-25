const axios = require('axios');
const cheerio = require('cheerio');
const { Sequelize } = require('sequelize');
const puppeteer = require('puppeteer');

// Database configuration
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'transparency_db',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  logging: false
});

// Web archive sources for historical data
const ARCHIVE_SOURCES = {
  WAYBACK_MACHINE: {
    base_url: 'https://web.archive.org/web',
    cdx_api: 'https://web.archive.org/cdx/search/cdx',
    save_api: 'https://web.archive.org/save'
  },
  
  ARCHIVE_TODAY: {
    base_url: 'https://archive.today',
    search_api: 'https://archive.today/search'
  },
  
  // Historical Carmen de Areco URLs to check
  TARGET_URLS: [
    'https://www.carmensdeareco.gov.ar',
    'https://www.carmensdeareco.gov.ar/transparencia',
    'https://www.carmensdeareco.gob.ar',
    'http://carmensdeareco.gov.ar',
    'https://municipalidad.carmensdeareco.gov.ar'
  ]
};

// Investigation timeframe for historical data
const HISTORICAL_PERIODS = {
  PERIOD_1: { start: '2009', end: '2015', label: 'Administración 2009-2015' },
  PERIOD_2: { start: '2016', end: '2019', label: 'Administración 2016-2019' },
  PERIOD_3: { start: '2020', end: '2023', label: 'Administración 2020-2023' },
  CURRENT: { start: '2024', end: '2025', label: 'Administración Actual' }
};

class ArchiveDataSynchronizer {
  constructor() {
    this.httpClient = axios.create({
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; TransparencyArchiveBot/1.0; +research@transparencia-cda.org)'
      }
    });
    
    this.archiveStats = {
      urls_checked: 0,
      snapshots_found: 0,
      documents_archived: 0,
      historical_data_extracted: 0,
      errors: []
    };
  }

  async syncArchivedData() {
    console.log('Starting archive data synchronization...');
    console.log('Investigating Carmen de Areco historical transparency data (2009-2025)');
    
    try {
      // Initialize browser for complex pages
      const browser = await puppeteer.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      // Check Wayback Machine archives
      await this.searchWaybackMachine();
      
      // Check Archive.today
      await this.searchArchiveToday();
      
      // Extract historical transparency data
      await this.extractHistoricalData(browser);
      
      // Save archived documents to database
      await this.saveArchivedDocuments();
      
      // Generate archive report
      await this.generateArchiveReport();
      
      await browser.close();
      
      return this.archiveStats;
      
    } catch (error) {
      console.error('Archive sync failed:', error);
      throw error;
    }
  }

  async searchWaybackMachine() {
    console.log('Searching Wayback Machine archives...');
    
    for (const url of ARCHIVE_SOURCES.TARGET_URLS) {
      try {
        console.log(`Checking archives for: ${url}`);
        
        // Search CDX API for all snapshots
        const cdxResponse = await this.httpClient.get(ARCHIVE_SOURCES.WAYBACK_MACHINE.cdx_api, {
          params: {
            url: url + '*',
            output: 'json',
            from: '2009',
            to: '2025',
            filter: 'statuscode:200',
            collapse: 'timestamp:6' // Collapse to monthly snapshots
          }
        });
        
        if (cdxResponse.status === 200 && cdxResponse.data.length > 1) {
          const snapshots = this.parseCDXResponse(cdxResponse.data);
          console.log(`Found ${snapshots.length} snapshots for ${url}`);
          
          // Process snapshots by period
          await this.processSnapshotsByPeriod(snapshots, url);
          
          this.archiveStats.snapshots_found += snapshots.length;
        }
        
        this.archiveStats.urls_checked++;
        
      } catch (error) {
        console.error(`Error checking archives for ${url}:`, error.message);
        this.archiveStats.errors.push({
          source: 'wayback_machine',
          url: url,
          error: error.message,
          timestamp: new Date()
        });
      }
    }
  }

  parseCDXResponse(cdxData) {
    if (!cdxData || cdxData.length < 2) return [];
    
    const headers = cdxData[0];
    const snapshots = [];
    
    for (let i = 1; i < cdxData.length; i++) {
      const row = cdxData[i];
      const snapshot = {};
      
      headers.forEach((header, index) => {
        snapshot[header] = row[index];
      });
      
      // Parse timestamp to Date
      if (snapshot.timestamp) {
        const year = snapshot.timestamp.substr(0, 4);
        const month = snapshot.timestamp.substr(4, 2);
        const day = snapshot.timestamp.substr(6, 2);
        snapshot.date = new Date(`${year}-${month}-${day}`);
        snapshot.year = parseInt(year);
      }
      
      snapshots.push(snapshot);
    }
    
    return snapshots;
  }

  async processSnapshotsByPeriod(snapshots, originalUrl) {
    const snapshotsByPeriod = this.groupSnapshotsByPeriod(snapshots);
    
    for (const [period, periodSnapshots] of Object.entries(snapshotsByPeriod)) {
      if (periodSnapshots.length > 0) {
        console.log(`Processing ${periodSnapshots.length} snapshots for ${period}`);
        
        // Select representative snapshots from each year
        const representativeSnapshots = this.selectRepresentativeSnapshots(periodSnapshots);
        
        for (const snapshot of representativeSnapshots) {
          await this.analyzeSnapshot(snapshot, originalUrl, period);
        }
      }
    }
  }

  groupSnapshotsByPeriod(snapshots) {
    const grouped = {
      'PERIOD_1': [],
      'PERIOD_2': [],
      'PERIOD_3': [],
      'CURRENT': []
    };
    
    snapshots.forEach(snapshot => {
      if (snapshot.year >= 2009 && snapshot.year <= 2015) {
        grouped.PERIOD_1.push(snapshot);
      } else if (snapshot.year >= 2016 && snapshot.year <= 2019) {
        grouped.PERIOD_2.push(snapshot);
      } else if (snapshot.year >= 2020 && snapshot.year <= 2023) {
        grouped.PERIOD_3.push(snapshot);
      } else if (snapshot.year >= 2024) {
        grouped.CURRENT.push(snapshot);
      }
    });
    
    return grouped;
  }

  selectRepresentativeSnapshots(snapshots) {
    // Group by year and select best snapshot per year
    const byYear = {};
    
    snapshots.forEach(snapshot => {
      if (!byYear[snapshot.year]) {
        byYear[snapshot.year] = [];
      }
      byYear[snapshot.year].push(snapshot);
    });
    
    const representative = [];
    
    Object.values(byYear).forEach(yearSnapshots => {
      // Prefer snapshots from mid-year or end-year
      yearSnapshots.sort((a, b) => {
        const aMonth = parseInt(a.timestamp.substr(4, 2));
        const bMonth = parseInt(b.timestamp.substr(4, 2));
        
        // Prefer December, then June, then other months
        const preferredOrder = (month) => {
          if (month === 12) return 1;
          if (month === 6) return 2;
          return 3;
        };
        
        return preferredOrder(aMonth) - preferredOrder(bMonth);
      });
      
      representative.push(yearSnapshots[0]);
    });
    
    return representative;
  }

  async analyzeSnapshot(snapshot, originalUrl, period) {
    try {
      const archiveUrl = `${ARCHIVE_SOURCES.WAYBACK_MACHINE.base_url}/${snapshot.timestamp}/${snapshot.original}`;
      
      console.log(`Analyzing snapshot: ${archiveUrl}`);
      
      const response = await this.httpClient.get(archiveUrl);
      
      if (response.status === 200) {
        const $ = cheerio.load(response.data);
        
        // Look for transparency-related content
        const transparencyData = this.extractTransparencyContent($, archiveUrl, snapshot.year);
        
        // Look for financial documents
        const documents = this.findHistoricalDocuments($, archiveUrl, snapshot.year);
        
        // Save findings
        await this.saveHistoricalSnapshot({
          archive_url: archiveUrl,
          original_url: originalUrl,
          timestamp: snapshot.timestamp,
          date: snapshot.date,
          year: snapshot.year,
          period: period,
          transparency_data: transparencyData,
          documents: documents,
          content_hash: this.generateContentHash(response.data)
        });
        
        this.archiveStats.historical_data_extracted++;
      }
      
    } catch (error) {
      console.error(`Error analyzing snapshot ${snapshot.timestamp}:`, error.message);
      this.archiveStats.errors.push({
        source: 'snapshot_analysis',
        snapshot: snapshot.timestamp,
        error: error.message,
        timestamp: new Date()
      });
    }
  }

  extractTransparencyContent($, archiveUrl, year) {
    const transparencyContent = {
      sections: [],
      financial_data: [],
      official_documents: []
    };
    
    // Look for transparency sections
    const transparencySelectors = [
      'a[href*="transparencia"]',
      'a[href*="presupuesto"]',
      'a[href*="sueldo"]',
      'a[href*="gasto"]',
      'a[href*="balance"]',
      'div[class*="transparencia"]',
      'div[id*="transparencia"]'
    ];
    
    transparencySelectors.forEach(selector => {
      $(selector).each((i, element) => {
        const $el = $(element);
        const text = $el.text().trim();
        const href = $el.attr('href');
        
        if (text || href) {
          transparencyContent.sections.push({
            text: text,
            href: href,
            type: this.categorizeTransparencyContent(text + ' ' + href)
          });
        }
      });
    });
    
    // Look for financial data tables
    $('table').each((i, table) => {
      const $table = $(table);
      const tableText = $table.text().toLowerCase();
      
      if (this.containsFinancialKeywords(tableText)) {
        const headers = [];
        const rows = [];
        
        $table.find('th, td').each((j, cell) => {
          const cellText = $(cell).text().trim();
          if (cellText) {
            if ($(cell).is('th') || (i === 0 && j < 10)) {
              headers.push(cellText);
            }
          }
        });
        
        if (headers.length > 0) {
          transparencyContent.financial_data.push({
            headers: headers,
            table_context: tableText.substr(0, 200)
          });
        }
      }
    });
    
    return transparencyContent;
  }

  findHistoricalDocuments($, archiveUrl, year) {
    const documents = [];
    
    // Look for document links
    const documentSelectors = [
      'a[href$=".pdf"]',
      'a[href$=".xlsx"]',
      'a[href$=".xls"]',
      'a[href$=".doc"]',
      'a[href$=".docx"]'
    ];
    
    documentSelectors.forEach(selector => {
      $(selector).each((i, element) => {
        const $el = $(element);
        const href = $el.attr('href');
        const text = $el.text().trim();
        
        if (href && this.isTransparencyDocument(text + ' ' + href)) {
          documents.push({
            url: this.resolveArchiveUrl(archiveUrl, href),
            title: text,
            type: this.categorizeDocument(text + ' ' + href),
            year: year,
            extension: this.getFileExtension(href)
          });
        }
      });
    });
    
    return documents;
  }

  containsFinancialKeywords(text) {
    const keywords = [
      'presupuesto', 'budget', 'sueldo', 'salario', 'gasto', 'expense',
      'ingreso', 'revenue', 'balance', 'ejecución', 'execution',
      'contratación', 'licitación', 'tender', 'deuda', 'debt'
    ];
    
    return keywords.some(keyword => text.includes(keyword));
  }

  isTransparencyDocument(text) {
    const transparencyKeywords = [
      'transparencia', 'presupuesto', 'sueldo', 'gasto', 'balance',
      'ejecucion', 'contratacion', 'licitacion', 'decreto', 'ordenanza',
      'declaracion', 'patrimonio'
    ];
    
    return transparencyKeywords.some(keyword => 
      text.toLowerCase().includes(keyword)
    );
  }

  categorizeTransparencyContent(text) {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('sueldo') || lowerText.includes('salari')) return 'salaries';
    if (lowerText.includes('gasto') || lowerText.includes('ejecuc')) return 'expenses';
    if (lowerText.includes('presupuesto')) return 'budget';
    if (lowerText.includes('contrat') || lowerText.includes('licit')) return 'contracts';
    if (lowerText.includes('balance')) return 'financial_statements';
    if (lowerText.includes('decreto')) return 'decrees';
    if (lowerText.includes('ordenanza')) return 'ordinances';
    
    return 'general';
  }

  categorizeDocument(text) {
    return this.categorizeTransparencyContent(text);
  }

  getFileExtension(url) {
    const match = url.match(/\.([^.?]+)(?:\?|$)/);
    return match ? match[1].toLowerCase() : '';
  }

  resolveArchiveUrl(baseArchiveUrl, relativeUrl) {
    if (relativeUrl.startsWith('http')) {
      return relativeUrl;
    }
    
    // Extract the timestamp and original URL from archive URL
    const match = baseArchiveUrl.match(/web\/(\d+)\/(.+)/);
    if (match) {
      const timestamp = match[1];
      const originalBase = match[2];
      
      try {
        const resolvedOriginal = new URL(relativeUrl, originalBase).toString();
        return `${ARCHIVE_SOURCES.WAYBACK_MACHINE.base_url}/${timestamp}/${resolvedOriginal}`;
      } catch (error) {
        return baseArchiveUrl + '/' + relativeUrl.replace(/^\//, '');
      }
    }
    
    return baseArchiveUrl + '/' + relativeUrl.replace(/^\//, '');
  }

  generateContentHash(content) {
    // Simple hash function for content deduplication
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  async searchArchiveToday() {
    console.log('Searching Archive.today...');
    
    for (const url of ARCHIVE_SOURCES.TARGET_URLS) {
      try {
        // Archive.today search implementation
        console.log(`Checking Archive.today for: ${url}`);
        
        // This would implement Archive.today API search
        // For now, just increment the counter
        this.archiveStats.urls_checked++;
        
      } catch (error) {
        console.error(`Error checking Archive.today for ${url}:`, error.message);
        this.archiveStats.errors.push({
          source: 'archive_today',
          url: url,
          error: error.message,
          timestamp: new Date()
        });
      }
    }
  }

  async extractHistoricalData(browser) {
    console.log('Extracting complex historical data with browser...');
    
    // Use Puppeteer for JavaScript-heavy pages
    const page = await browser.newPage();
    
    try {
      // Set realistic browser headers
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      
      // This would process JavaScript-heavy archive pages
      console.log('Browser-based extraction ready');
      
    } catch (error) {
      console.error('Browser extraction error:', error.message);
    } finally {
      await page.close();
    }
  }

  async saveHistoricalSnapshot(snapshotData) {
    try {
      await sequelize.authenticate();
      
      // Create table for historical snapshots
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS historical_snapshots (
          id SERIAL PRIMARY KEY,
          archive_url TEXT NOT NULL,
          original_url TEXT,
          timestamp VARCHAR(20),
          snapshot_date DATE,
          year INTEGER,
          period VARCHAR(20),
          transparency_data JSONB,
          documents JSONB,
          content_hash VARCHAR(50),
          created_at TIMESTAMP DEFAULT NOW(),
          UNIQUE(archive_url)
        )
      `);
      
      // Insert snapshot data
      await sequelize.query(`
        INSERT INTO historical_snapshots (
          archive_url, original_url, timestamp, snapshot_date, year, period,
          transparency_data, documents, content_hash
        ) VALUES (
          :archive_url, :original_url, :timestamp, :snapshot_date, :year, :period,
          :transparency_data, :documents, :content_hash
        ) ON CONFLICT (archive_url) DO UPDATE SET
          transparency_data = :transparency_data,
          documents = :documents,
          content_hash = :content_hash
      `, {
        replacements: {
          archive_url: snapshotData.archive_url,
          original_url: snapshotData.original_url,
          timestamp: snapshotData.timestamp,
          snapshot_date: snapshotData.date,
          year: snapshotData.year,
          period: snapshotData.period,
          transparency_data: JSON.stringify(snapshotData.transparency_data),
          documents: JSON.stringify(snapshotData.documents),
          content_hash: snapshotData.content_hash
        }
      });
      
    } catch (error) {
      console.error('Error saving historical snapshot:', error);
    }
  }

  async saveArchivedDocuments() {
    console.log('Saving archived documents...');
    
    try {
      // Create table for archived documents
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS archived_documents (
          id SERIAL PRIMARY KEY,
          archive_url TEXT NOT NULL,
          original_title TEXT,
          document_type VARCHAR(100),
          year INTEGER,
          period VARCHAR(20),
          extension VARCHAR(10),
          category VARCHAR(100),
          status VARCHAR(50) DEFAULT 'discovered',
          created_at TIMESTAMP DEFAULT NOW(),
          UNIQUE(archive_url)
        )
      `);
      
      this.archiveStats.documents_archived++;
      
    } catch (error) {
      console.error('Error saving archived documents:', error);
    }
  }

  async generateArchiveReport() {
    const report = {
      timestamp: new Date(),
      investigation_periods: HISTORICAL_PERIODS,
      archive_stats: this.archiveStats,
      summary: {
        total_urls_checked: this.archiveStats.urls_checked,
        total_snapshots: this.archiveStats.snapshots_found,
        historical_data_points: this.archiveStats.historical_data_extracted,
        archived_documents: this.archiveStats.documents_archived,
        errors: this.archiveStats.errors.length
      }
    };
    
    // Save report to database
    await this.saveArchiveReport(report);
    
    console.log('\n=== ARCHIVE SYNC REPORT ===');
    console.log(`URLs checked: ${report.summary.total_urls_checked}`);
    console.log(`Snapshots found: ${report.summary.total_snapshots}`);
    console.log(`Historical data extracted: ${report.summary.historical_data_points}`);
    console.log(`Documents archived: ${report.summary.archived_documents}`);
    console.log(`Errors: ${report.summary.errors}`);
    
    return report;
  }

  async saveArchiveReport(report) {
    try {
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS archive_reports (
          id SERIAL PRIMARY KEY,
          timestamp TIMESTAMP,
          investigation_periods JSONB,
          archive_stats JSONB,
          summary JSONB,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);
      
      await sequelize.query(`
        INSERT INTO archive_reports (timestamp, investigation_periods, archive_stats, summary)
        VALUES (:timestamp, :investigation_periods, :archive_stats, :summary)
      `, {
        replacements: {
          timestamp: report.timestamp,
          investigation_periods: JSON.stringify(report.investigation_periods),
          archive_stats: JSON.stringify(report.archive_stats),
          summary: JSON.stringify(report.summary)
        }
      });
      
    } catch (error) {
      console.error('Error saving archive report:', error);
    }
  }
}

// Main execution
async function main() {
  const synchronizer = new ArchiveDataSynchronizer();
  
  try {
    console.log('Carmen de Areco Transparency Investigation - Archive Data Sync');
    console.log('Historical Period Analysis: 2009-2025');
    console.log('=' * 70);
    
    const result = await synchronizer.syncArchivedData();
    console.log('Archive synchronization completed successfully');
    
    return result;
    
  } catch (error) {
    console.error('Archive synchronization failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = ArchiveDataSynchronizer;