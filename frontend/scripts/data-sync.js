#!/usr/bin/env node

const cron = require('node-cron');
const TransparencyDatabase = require('./database-manager');
const TransparencyDataCollector = require('./data-collector');
const TransparencySpider = require('./web-spider');
const fs = require('fs').promises;
const path = require('path');

class DataSyncManager {
  constructor() {
    this.db = new TransparencyDatabase();
    this.collector = new TransparencyDataCollector();
    this.spider = new TransparencySpider();
    this.isRunning = false;
    
    this.syncSchedules = {
      // Every day at 2 AM - full sync
      daily: '0 2 * * *',
      // Every 6 hours - incremental sync
      hourly: '0 */6 * * *',
      // Every Monday at 1 AM - deep crawl
      weekly: '0 1 * * 1'
    };
  }

  async initialize() {
    await this.db.initialize();
    await this.collector.initializeDirectories();
    await this.spider.initialize();
    console.log('✅ Data Sync Manager initialized');
  }

  async performFullSync() {
    if (this.isRunning) {
      console.log('⚠️ Sync already in progress, skipping');
      return;
    }

    this.isRunning = true;
    console.log('🔄 Starting full data synchronization...');
    
    const syncStart = new Date();
    let syncResult = {
      type: 'full',
      start_time: syncStart.toISOString(),
      end_time: null,
      status: 'failed',
      records_processed: 0,
      records_updated: 0,
      records_created: 0,
      records_failed: 0,
      error_message: null
    };

    try {
      // Step 1: Collect from official sources
      console.log('📡 Collecting from official sources...');
      const officialData = await this.collector.collectFromOfficialSite();
      
      if (officialData && officialData.documents) {
        await this.processDocuments(officialData.documents, 'official_site');
        syncResult.records_processed += officialData.documents.length;
      }

      // Step 2: Collect from Web Archive
      console.log('📦 Collecting from Web Archive...');
      const archiveData = await this.collector.collectFromWebArchive();
      
      if (archiveData && archiveData.documents) {
        await this.processDocuments(archiveData.documents, 'web_archive');
        syncResult.records_processed += archiveData.documents.length;
      }

      // Step 3: Validate data consistency
      console.log('✅ Validating data integrity...');
      const validationResults = await this.validateAllData();
      
      if (validationResults.length > 0) {
        console.warn(`⚠️ Found ${validationResults.length} validation issues`);
        syncResult.records_failed = validationResults.length;
      }

      // Step 4: Generate summary and comparison
      console.log('📊 Generating data summary...');
      await this.generateSyncSummary();

      syncResult.status = 'success';
      syncResult.end_time = new Date().toISOString();
      
    } catch (error) {
      console.error('❌ Full sync failed:', error);
      syncResult.error_message = error.message;
      syncResult.status = 'failed';
    } finally {
      this.isRunning = false;
      
      // Log sync results
      await this.logSyncResults(syncResult);
      
      console.log('🔄 Full synchronization completed');
      console.log(`📊 Results: ${syncResult.records_processed} processed, ${syncResult.records_failed} failed`);
    }

    return syncResult;
  }

  async performIncrementalSync() {
    if (this.isRunning) {
      console.log('⚠️ Sync already in progress, skipping incremental');
      return;
    }

    console.log('⚡ Starting incremental sync...');
    
    try {
      // Check for new documents only
      const recentData = await this.collector.collectFromOfficialSite();
      
      if (recentData && recentData.documents) {
        let newDocuments = 0;
        
        for (const doc of recentData.documents) {
          // Check if document already exists
          const existing = await this.db.allQuery(
            'SELECT id FROM documents WHERE url = ? OR title = ?',
            [doc.url, doc.title]
          );
          
          if (existing.length === 0) {
            await this.processDocument(doc, 'official_site');
            newDocuments++;
          }
        }
        
        console.log(`✅ Incremental sync completed: ${newDocuments} new documents`);
        return newDocuments;
      }
    } catch (error) {
      console.error('❌ Incremental sync failed:', error);
    }
    
    return 0;
  }

  async performDeepCrawl() {
    if (this.isRunning) {
      console.log('⚠️ Sync already in progress, skipping deep crawl');
      return;
    }

    console.log('🕷️ Starting deep crawl...');
    
    try {
      const crawlResults = await this.spider.crawl();
      
      if (crawlResults && crawlResults.documents_found > 0) {
        // Process discovered documents
        const documentsPath = path.join(this.spider.outputDir, 'documents_catalog.json');
        const documents = JSON.parse(await fs.readFile(documentsPath, 'utf-8'));
        
        for (const doc of documents) {
          await this.processDocument(doc, 'spider_crawl');
        }
        
        console.log(`✅ Deep crawl completed: ${documents.length} documents processed`);
        return documents.length;
      }
    } catch (error) {
      console.error('❌ Deep crawl failed:', error);
    }
    
    return 0;
  }

  async processDocuments(documents, sourceType) {
    const sourceId = await this.getOrCreateDataSource(sourceType);
    
    for (const doc of documents) {
      try {
        await this.processDocument(doc, sourceType, sourceId);
      } catch (error) {
        console.warn(`⚠️ Failed to process document ${doc.title}:`, error.message);
      }
    }
  }

  async processDocument(doc, sourceType, sourceId = null) {
    if (!sourceId) {
      sourceId = await this.getOrCreateDataSource(sourceType);
    }

    const docData = {
      title: doc.title,
      url: doc.url,
      type: doc.type || 'other',
      category: this.categorizeDocument(doc.title),
      year: this.extractYear(doc.title, doc.date),
      date: doc.date || doc.found_at || new Date().toISOString().split('T')[0],
      status: 'available',
      source_id: sourceId,
      metadata: {
        original_source: sourceType,
        found_at: doc.found_at,
        archive_url: doc.archive_url,
        context: doc.context
      }
    };

    return await this.db.addDocument(docData);
  }

  async getOrCreateDataSource(sourceType) {
    const sourceMap = {
      'official_site': { name: 'Carmen de Areco Official', type: 'live' },
      'web_archive': { name: 'Web Archive', type: 'archive' },
      'spider_crawl': { name: 'Spider Crawl', type: 'live' },
      'local_backup': { name: 'Local Backup', type: 'cold' }
    };

    const sourceConfig = sourceMap[sourceType];
    if (!sourceConfig) {
      throw new Error(`Unknown source type: ${sourceType}`);
    }

    // Try to find existing source
    const existing = await this.db.getQuery(
      'SELECT id FROM data_sources WHERE name = ?',
      [sourceConfig.name]
    );

    if (existing) {
      return existing.id;
    }

    // Create new source
    const result = await this.db.addDataSource(
      sourceConfig.name,
      sourceType === 'official_site' ? 'https://cda-transparencia.org/' : null,
      sourceConfig.type
    );

    return result.lastID;
  }

  categorizeDocument(title) {
    const titleLower = title.toLowerCase();
    
    if (titleLower.match(/(presupuesto|budget|ejecucion)/)) return 'budget';
    if (titleLower.match(/(licitacion|contrato|tender)/)) return 'contract';
    if (titleLower.match(/(declaracion|patrimonio|ddjj)/)) return 'declaration';
    if (titleLower.match(/(informe|auditoria|report)/)) return 'report';
    if (titleLower.match(/(resolucion|decreto)/)) return 'resolution';
    
    return 'other';
  }

  extractYear(title, date) {
    // Try to extract year from title
    const titleYearMatch = title.match(/20\d{2}/);
    if (titleYearMatch) {
      return parseInt(titleYearMatch[0]);
    }

    // Try to extract from date
    if (date) {
      const dateYear = new Date(date).getFullYear();
      if (dateYear >= 2020 && dateYear <= new Date().getFullYear() + 1) {
        return dateYear;
      }
    }

    return null;
  }

  async validateAllData() {
    const validations = [];
    
    // Validate budget data
    validations.push(...await this.db.validateData('budget_data'));
    
    // Validate revenue data
    validations.push(...await this.db.validateData('revenue_data'));
    
    // Check for duplicate documents
    const duplicates = await this.db.allQuery(`
      SELECT title, COUNT(*) as count 
      FROM documents 
      GROUP BY title 
      HAVING count > 1
    `);
    
    for (const duplicate of duplicates) {
      validations.push({
        table_name: 'documents',
        validation_type: 'duplicate_check',
        status: 'warning',
        message: `Duplicate document found: ${duplicate.title} (${duplicate.count} copies)`
      });
    }
    
    return validations;
  }

  async generateSyncSummary() {
    const stats = await this.db.getDataStats();
    
    const summary = {
      timestamp: new Date().toISOString(),
      data_statistics: stats,
      data_sources: await this.db.getDataSources(),
      recent_documents: await this.db.allQuery(`
        SELECT * FROM documents 
        ORDER BY created_at DESC 
        LIMIT 10
      `),
      validation_summary: await this.db.allQuery(`
        SELECT status, COUNT(*) as count 
        FROM validation_logs 
        WHERE created_at > datetime('now', '-1 day')
        GROUP BY status
      `)
    };

    const summaryPath = path.join(__dirname, '../src/data/sync_summary.json');
    await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2));
    
    return summary;
  }

  async logSyncResults(syncResult) {
    // This would be implemented to log to the database
    console.log('📝 Sync results logged:', {
      status: syncResult.status,
      duration: syncResult.end_time ? 
        (new Date(syncResult.end_time) - new Date(syncResult.start_time)) / 1000 + 's' : 
        'incomplete',
      processed: syncResult.records_processed
    });
  }

  setupScheduledTasks() {
    console.log('⏰ Setting up scheduled data synchronization...');
    
    // Daily full sync
    cron.schedule(this.syncSchedules.daily, async () => {
      console.log('🔄 Starting scheduled full sync...');
      await this.performFullSync();
    });

    // Incremental sync every 6 hours
    cron.schedule(this.syncSchedules.hourly, async () => {
      console.log('⚡ Starting scheduled incremental sync...');
      await this.performIncrementalSync();
    });

    // Weekly deep crawl
    cron.schedule(this.syncSchedules.weekly, async () => {
      console.log('🕷️ Starting scheduled deep crawl...');
      await this.performDeepCrawl();
    });

    console.log('✅ Scheduled tasks configured');
    console.log(`📅 Daily sync: ${this.syncSchedules.daily}`);
    console.log(`📅 Incremental sync: ${this.syncSchedules.hourly}`);
    console.log(`📅 Weekly crawl: ${this.syncSchedules.weekly}`);
  }

  async createDataBackup() {
    const backupDir = path.join(__dirname, '../data/backups');
    await fs.mkdir(backupDir, { recursive: true });
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `backup_${timestamp}.json`);
    
    await this.db.createBackup(backupPath);
    console.log(`💾 Backup created: ${backupPath}`);
    
    // Clean up old backups (keep last 7)
    const backupFiles = (await fs.readdir(backupDir))
      .filter(f => f.startsWith('backup_') && f.endsWith('.json'))
      .sort()
      .reverse();
    
    for (let i = 7; i < backupFiles.length; i++) {
      await fs.unlink(path.join(backupDir, backupFiles[i]));
      console.log(`🗑️ Removed old backup: ${backupFiles[i]}`);
    }
    
    return backupPath;
  }

  async compareDataSources(year) {
    console.log(`🔍 Comparing data sources for year ${year}...`);
    
    const comparison = {
      year,
      timestamp: new Date().toISOString(),
      budget: await this.db.compareLiveAndColdData(year, 'budget_data'),
      revenue: await this.db.compareLiveAndColdData(year, 'revenue_data'),
      document_count: {
        total: await this.db.getQuery('SELECT COUNT(*) as count FROM documents WHERE year = ?', [year]),
        by_source: await this.db.allQuery(`
          SELECT ds.name, ds.type, COUNT(d.id) as count
          FROM documents d
          JOIN data_sources ds ON d.source_id = ds.id
          WHERE d.year = ?
          GROUP BY ds.id, ds.name, ds.type
        `, [year])
      }
    };

    const comparisonPath = path.join(__dirname, `../src/data/comparison_${year}.json`);
    await fs.writeFile(comparisonPath, JSON.stringify(comparison, null, 2));
    
    return comparison;
  }

  async close() {
    await this.db.close();
  }
}

// CLI execution
if (require.main === module) {
  const syncManager = new DataSyncManager();
  
  const command = process.argv[2] || 'help';
  
  syncManager.initialize()
    .then(async () => {
      switch (command) {
        case 'full':
          await syncManager.performFullSync();
          break;
          
        case 'incremental':
          await syncManager.performIncrementalSync();
          break;
          
        case 'crawl':
          await syncManager.performDeepCrawl();
          break;
          
        case 'backup':
          await syncManager.createDataBackup();
          break;
          
        case 'compare':
          const year = process.argv[3] || new Date().getFullYear();
          await syncManager.compareDataSources(year);
          break;
          
        case 'schedule':
          syncManager.setupScheduledTasks();
          console.log('📅 Scheduled tasks are now running. Press Ctrl+C to stop.');
          break;
          
        case 'help':
        default:
          console.log(`
Carmen de Areco Data Sync Manager

Usage: node data-sync.js [command] [options]

Commands:
  full        - Perform full data synchronization
  incremental - Perform incremental sync (new documents only)  
  crawl       - Perform deep web crawl
  backup      - Create database backup
  compare     - Compare data sources for a year (default: current year)
  schedule    - Run scheduled sync tasks
  help        - Show this help message

Examples:
  node data-sync.js full
  node data-sync.js compare 2024
  node data-sync.js schedule
          `);
          break;
      }
    })
    .catch(error => {
      console.error('❌ Sync manager failed:', error);
      process.exit(1);
    })
    .finally(() => {
      if (command !== 'schedule') {
        syncManager.close();
      }
    });
}

module.exports = DataSyncManager;