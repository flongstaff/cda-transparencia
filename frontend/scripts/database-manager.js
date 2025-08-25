#!/usr/bin/env node

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs').promises;
const path = require('path');

class TransparencyDatabase {
  constructor(dbPath = path.join(__dirname, '../data/transparency.db')) {
    this.dbPath = dbPath;
    this.db = null;
  }

  async initialize() {
    try {
      // Ensure data directory exists
      await fs.mkdir(path.dirname(this.dbPath), { recursive: true });
      
      // Open database connection
      this.db = new sqlite3.Database(this.dbPath);
      
      // Create tables
      await this.createTables();
      console.log('✅ Database initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize database:', error);
      throw error;
    }
  }

  async createTables() {
    const queries = [
      // Data sources table
      `CREATE TABLE IF NOT EXISTS data_sources (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        url TEXT,
        type TEXT CHECK(type IN ('live', 'cold', 'archive')),
        status TEXT CHECK(status IN ('active', 'inactive', 'error')),
        last_sync DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Documents table
      `CREATE TABLE IF NOT EXISTS documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        url TEXT,
        local_path TEXT,
        type TEXT CHECK(type IN ('budget', 'contract', 'report', 'resolution', 'declaration', 'other')),
        category TEXT,
        year INTEGER,
        date TEXT,
        size_bytes INTEGER,
        pages INTEGER,
        status TEXT CHECK(status IN ('available', 'archived', 'missing')),
        checksum TEXT,
        source_id INTEGER,
        metadata TEXT, -- JSON
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (source_id) REFERENCES data_sources (id)
      )`,

      // Budget data table
      `CREATE TABLE IF NOT EXISTS budget_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        year INTEGER NOT NULL,
        category TEXT NOT NULL,
        allocated REAL,
        executed REAL,
        percentage REAL,
        quarter INTEGER,
        month INTEGER,
        source_id INTEGER,
        data_type TEXT CHECK(data_type IN ('live', 'cold')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (source_id) REFERENCES data_sources (id)
      )`,

      // Revenue data table
      `CREATE TABLE IF NOT EXISTS revenue_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        year INTEGER NOT NULL,
        source_type TEXT NOT NULL,
        amount REAL,
        month INTEGER,
        quarter INTEGER,
        source_id INTEGER,
        data_type TEXT CHECK(data_type IN ('live', 'cold')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (source_id) REFERENCES data_sources (id)
      )`,

      // Contracts table
      `CREATE TABLE IF NOT EXISTS contracts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        contract_number TEXT,
        title TEXT NOT NULL,
        contractor TEXT,
        amount REAL,
        start_date TEXT,
        end_date TEXT,
        status TEXT,
        type TEXT,
        department TEXT,
        year INTEGER,
        source_id INTEGER,
        data_type TEXT CHECK(data_type IN ('live', 'cold')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (source_id) REFERENCES data_sources (id)
      )`,

      // Data validation logs
      `CREATE TABLE IF NOT EXISTS validation_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        table_name TEXT NOT NULL,
        record_id INTEGER,
        validation_type TEXT NOT NULL,
        status TEXT CHECK(status IN ('pass', 'fail', 'warning')),
        message TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Sync history
      `CREATE TABLE IF NOT EXISTS sync_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        source_id INTEGER,
        sync_type TEXT CHECK(sync_type IN ('full', 'incremental')),
        records_processed INTEGER,
        records_updated INTEGER,
        records_created INTEGER,
        records_failed INTEGER,
        start_time DATETIME,
        end_time DATETIME,
        status TEXT CHECK(status IN ('success', 'partial', 'failed')),
        error_message TEXT,
        FOREIGN KEY (source_id) REFERENCES data_sources (id)
      )`
    ];

    for (const query of queries) {
      await this.runQuery(query);
    }

    // Create indexes
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_documents_year ON documents(year)',
      'CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(type)',
      'CREATE INDEX IF NOT EXISTS idx_budget_year ON budget_data(year)',
      'CREATE INDEX IF NOT EXISTS idx_revenue_year ON revenue_data(year)',
      'CREATE INDEX IF NOT EXISTS idx_contracts_year ON contracts(year)',
      'CREATE INDEX IF NOT EXISTS idx_sync_history_source ON sync_history(source_id)'
    ];

    for (const index of indexes) {
      await this.runQuery(index);
    }
  }

  runQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this);
        }
      });
    });
  }

  getQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  allQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Data source management
  async addDataSource(name, url, type) {
    const query = `
      INSERT INTO data_sources (name, url, type, status)
      VALUES (?, ?, ?, 'active')
    `;
    return await this.runQuery(query, [name, url, type]);
  }

  async getDataSources() {
    return await this.allQuery('SELECT * FROM data_sources ORDER BY created_at DESC');
  }

  async updateDataSourceStatus(id, status, lastSync = null) {
    const query = `
      UPDATE data_sources 
      SET status = ?, last_sync = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    return await this.runQuery(query, [status, lastSync, id]);
  }

  // Document management
  async addDocument(docData) {
    const query = `
      INSERT INTO documents (
        title, url, local_path, type, category, year, date, 
        size_bytes, pages, status, checksum, source_id, metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      docData.title,
      docData.url,
      docData.local_path || null,
      docData.type,
      docData.category,
      docData.year || null,
      docData.date,
      docData.size_bytes || null,
      docData.pages || null,
      docData.status || 'available',
      docData.checksum || null,
      docData.source_id,
      JSON.stringify(docData.metadata || {})
    ];
    
    return await this.runQuery(query, params);
  }

  async getDocumentsByYear(year) {
    const query = `
      SELECT d.*, ds.name as source_name
      FROM documents d
      LEFT JOIN data_sources ds ON d.source_id = ds.id
      WHERE d.year = ? OR d.year IS NULL
      ORDER BY d.date DESC, d.created_at DESC
    `;
    return await this.allQuery(query, [year]);
  }

  async getDocumentsByType(type, year = null) {
    let query = `
      SELECT d.*, ds.name as source_name
      FROM documents d
      LEFT JOIN data_sources ds ON d.source_id = ds.id
      WHERE d.type = ?
    `;
    const params = [type];
    
    if (year) {
      query += ' AND d.year = ?';
      params.push(year);
    }
    
    query += ' ORDER BY d.date DESC, d.created_at DESC';
    return await this.allQuery(query, params);
  }

  // Budget data management
  async saveBudgetData(budgetData) {
    const query = `
      INSERT OR REPLACE INTO budget_data (
        year, category, allocated, executed, percentage, 
        quarter, month, source_id, data_type
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const results = [];
    for (const item of budgetData) {
      const params = [
        item.year,
        item.category,
        item.allocated,
        item.executed,
        item.percentage || null,
        item.quarter || null,
        item.month || null,
        item.source_id,
        item.data_type || 'cold'
      ];
      
      results.push(await this.runQuery(query, params));
    }
    
    return results;
  }

  async getBudgetData(year, dataType = null) {
    let query = `
      SELECT * FROM budget_data 
      WHERE year = ?
    `;
    const params = [year];
    
    if (dataType) {
      query += ' AND data_type = ?';
      params.push(dataType);
    }
    
    query += ' ORDER BY category, quarter, month';
    return await this.allQuery(query, params);
  }

  // Revenue data management
  async saveRevenueData(revenueData) {
    const query = `
      INSERT OR REPLACE INTO revenue_data (
        year, source_type, amount, month, quarter, source_id, data_type
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const results = [];
    for (const item of revenueData) {
      const params = [
        item.year,
        item.source_type,
        item.amount,
        item.month || null,
        item.quarter || null,
        item.source_id,
        item.data_type || 'cold'
      ];
      
      results.push(await this.runQuery(query, params));
    }
    
    return results;
  }

  async getRevenueData(year, dataType = null) {
    let query = `
      SELECT * FROM revenue_data 
      WHERE year = ?
    `;
    const params = [year];
    
    if (dataType) {
      query += ' AND data_type = ?';
      params.push(dataType);
    }
    
    query += ' ORDER BY source_type, quarter, month';
    return await this.allQuery(query, params);
  }

  // Data validation
  async validateData(tableName, recordId = null) {
    const validations = [];
    
    if (tableName === 'budget_data') {
      let query = `
        SELECT * FROM budget_data 
        WHERE allocated < 0 OR executed < 0 OR percentage > 100
      `;
      const params = [];
      
      if (recordId) {
        query += ' AND id = ?';
        params.push(recordId);
      }
      
      const invalidRecords = await this.allQuery(query, params);
      
      for (const record of invalidRecords) {
        validations.push({
          table_name: tableName,
          record_id: record.id,
          validation_type: 'data_integrity',
          status: 'fail',
          message: 'Invalid budget values detected'
        });
      }
    }
    
    // Log validations
    for (const validation of validations) {
      await this.runQuery(`
        INSERT INTO validation_logs (
          table_name, record_id, validation_type, status, message
        ) VALUES (?, ?, ?, ?, ?)
      `, [
        validation.table_name,
        validation.record_id,
        validation.validation_type,
        validation.status,
        validation.message
      ]);
    }
    
    return validations;
  }

  // Data comparison
  async compareLiveAndColdData(year, table) {
    const query = `
      SELECT 
        data_type,
        COUNT(*) as count,
        SUM(CASE WHEN data_type = 'live' THEN allocated ELSE 0 END) as live_total,
        SUM(CASE WHEN data_type = 'cold' THEN allocated ELSE 0 END) as cold_total
      FROM ${table}
      WHERE year = ?
      GROUP BY data_type
    `;
    
    const results = await this.allQuery(query, [year]);
    
    const comparison = {
      year,
      table,
      live_count: 0,
      cold_count: 0,
      live_total: 0,
      cold_total: 0,
      difference_percentage: 0
    };
    
    for (const result of results) {
      if (result.data_type === 'live') {
        comparison.live_count = result.count;
        comparison.live_total = result.live_total || 0;
      } else if (result.data_type === 'cold') {
        comparison.cold_count = result.count;
        comparison.cold_total = result.cold_total || 0;
      }
    }
    
    if (comparison.cold_total > 0) {
      comparison.difference_percentage = 
        ((comparison.live_total - comparison.cold_total) / comparison.cold_total) * 100;
    }
    
    return comparison;
  }

  // Backup and restore
  async createBackup(backupPath) {
    try {
      const data = {
        timestamp: new Date().toISOString(),
        data_sources: await this.allQuery('SELECT * FROM data_sources'),
        documents: await this.allQuery('SELECT * FROM documents'),
        budget_data: await this.allQuery('SELECT * FROM budget_data'),
        revenue_data: await this.allQuery('SELECT * FROM revenue_data'),
        contracts: await this.allQuery('SELECT * FROM contracts')
      };
      
      await fs.writeFile(backupPath, JSON.stringify(data, null, 2));
      console.log(`✅ Backup created: ${backupPath}`);
    } catch (error) {
      console.error('❌ Backup failed:', error);
      throw error;
    }
  }

  async restoreFromBackup(backupPath) {
    try {
      const backupData = JSON.parse(await fs.readFile(backupPath, 'utf-8'));
      
      // Clear existing data
      await this.runQuery('DELETE FROM contracts');
      await this.runQuery('DELETE FROM revenue_data');
      await this.runQuery('DELETE FROM budget_data');
      await this.runQuery('DELETE FROM documents');
      await this.runQuery('DELETE FROM data_sources');
      
      // Restore data sources
      for (const source of backupData.data_sources) {
        await this.runQuery(`
          INSERT INTO data_sources (id, name, url, type, status, last_sync, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [source.id, source.name, source.url, source.type, source.status, 
            source.last_sync, source.created_at, source.updated_at]);
      }
      
      // Restore documents
      for (const doc of backupData.documents) {
        await this.runQuery(`
          INSERT INTO documents (
            id, title, url, local_path, type, category, year, date, 
            size_bytes, pages, status, checksum, source_id, metadata, 
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [doc.id, doc.title, doc.url, doc.local_path, doc.type, doc.category,
            doc.year, doc.date, doc.size_bytes, doc.pages, doc.status,
            doc.checksum, doc.source_id, doc.metadata, doc.created_at, doc.updated_at]);
      }
      
      // Restore budget data
      for (const budget of backupData.budget_data) {
        await this.runQuery(`
          INSERT INTO budget_data (
            id, year, category, allocated, executed, percentage, 
            quarter, month, source_id, data_type, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [budget.id, budget.year, budget.category, budget.allocated, budget.executed,
            budget.percentage, budget.quarter, budget.month, budget.source_id,
            budget.data_type, budget.created_at, budget.updated_at]);
      }
      
      console.log('✅ Backup restored successfully');
    } catch (error) {
      console.error('❌ Restore failed:', error);
      throw error;
    }
  }

  async close() {
    if (this.db) {
      return new Promise((resolve) => {
        this.db.close((err) => {
          if (err) {
            console.error('Error closing database:', err);
          }
          resolve();
        });
      });
    }
  }

  // Statistics and reporting
  async getDataStats() {
    const stats = {
      documents: await this.getQuery('SELECT COUNT(*) as count FROM documents'),
      budget_records: await this.getQuery('SELECT COUNT(*) as count FROM budget_data'),
      revenue_records: await this.getQuery('SELECT COUNT(*) as count FROM revenue_data'),
      contracts: await this.getQuery('SELECT COUNT(*) as count FROM contracts'),
      data_sources: await this.getQuery('SELECT COUNT(*) as count FROM data_sources'),
      last_sync: await this.getQuery(`
        SELECT MAX(last_sync) as last_sync 
        FROM data_sources 
        WHERE last_sync IS NOT NULL
      `)
    };
    
    return stats;
  }
}

// CLI execution
if (require.main === module) {
  const db = new TransparencyDatabase();
  
  db.initialize()
    .then(async () => {
      // Add default data sources
      await db.addDataSource('Carmen de Areco Official', 'https://carmendeareco.gob.ar/transparencia/', 'live');
      await db.addDataSource('Web Archive', 'https://web.archive.org/', 'archive');
      await db.addDataSource('Local Backup', null, 'cold');
      
      const stats = await db.getDataStats();
      console.log('📊 Database Statistics:', stats);
    })
    .catch(error => {
      console.error('❌ Database setup failed:', error);
      process.exit(1);
    })
    .finally(() => {
      db.close();
    });
}

module.exports = TransparencyDatabase;