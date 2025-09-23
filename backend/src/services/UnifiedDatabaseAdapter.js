const { Pool } = require('pg');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

let instance = null;

/**
 * Unified Database Adapter for Carmen de Areco Transparency Portal
 * Handles both PostgreSQL and SQLite databases with consistent schema mapping
 */
class UnifiedDatabaseAdapter {
    constructor() {
        this.dbType = process.env.DB_TYPE || 'auto';
        this.db = null;
        this.pool = null;
        
        // Schema mapping between PostgreSQL and SQLite
        this.schemaMapping = {
            postgresql: {
                table: 'transparency.documents',
                sizeColumn: 'size_bytes',
                columns: {
                    id: 'id',
                    filename: 'filename',
                    title: 'title',
                    year: 'year',
                    file_type: 'file_type',
                    size: 'size_bytes',
                    category: 'category',
                    document_type: 'document_type',
                    url: 'url',
                    official_url: 'official_url',
                    verification_status: 'verification_status',
                    created_at: 'created_at',
                    content: 'content'
                }
            },
            sqlite: {
                table: 'documents',
                sizeColumn: 'file_size',
                columns: {
                    id: 'id',
                    filename: 'filename',
                    title: 'filename as title', // SQLite uses filename as title
                    year: 'year',
                    file_type: 'document_type',
                    size: 'file_size',
                    category: 'category',
                    document_type: 'document_type',
                    url: 'official_url as url',
                    official_url: 'official_url',
                    verification_status: 'verification_status',
                    created_at: 'created_at',
                    content: 'NULL as content' // SQLite doesn't store content
                }
            }
        };
    }

    static async getInstance() {
        if (!instance) {
            instance = new UnifiedDatabaseAdapter();
            await instance.initialize();
        }
        return instance;
    }

    async initialize() {
        try {
            if (this.dbType === 'auto') {
                // Try PostgreSQL first, fallback to SQLite
                try {
                    await this.initPostgreSQL();
                    this.dbType = 'postgresql';
                    console.log('🐘 Connected to PostgreSQL database');
                } catch (error) {
                    console.log('PostgreSQL not available, falling back to SQLite');
                    await this.initSQLite();
                    this.dbType = 'sqlite';
                    console.log('📄 Connected to SQLite database');
                }
            } else if (this.dbType === 'postgresql') {
                await this.initPostgreSQL();
                console.log('🐘 Connected to PostgreSQL database');
            } else if (this.dbType === 'sqlite') {
                await this.initSQLite();
                console.log('📄 Connected to SQLite database');
            }
        } catch (error) {
            console.error('Failed to initialize database:', error);
            throw error;
        }
    }

    async initPostgreSQL() {
        this.pool = new Pool({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 5433,
            database: process.env.DB_NAME || 'transparency_portal',
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'postgres',
        });
        
        // Test connection
        await this.pool.query('SELECT 1');
    }

    async initSQLite() {
        const dbPath = path.join(__dirname, '../../transparency.db');
        
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(dbPath, async (err) => {
                if (err) {
                    reject(err);
                } else {
                    await this.createTables();
                    resolve();
                }
            });
        });
    }

    async createTables() {
        const query = `
        CREATE TABLE IF NOT EXISTS documents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT,
            title TEXT,
            year INTEGER,
            file_type TEXT,
            size_bytes REAL,
            category TEXT,
            document_type TEXT,
            url TEXT,
            official_url TEXT,
            verification_status TEXT,
            created_at TEXT,
            content TEXT,
            file_size REAL
        );
        `;
        return new Promise((resolve, reject) => {
            this.db.exec(query, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    getSchema() {
        return this.schemaMapping[this.dbType];
    }

    buildSelectQuery(baseFields, conditions = '', orderBy = '', limit = '') {
        const schema = this.getSchema();
        const mappedFields = baseFields.map(field => {
            return schema.columns[field] || field;
        }).join(', ');

        let query = `SELECT ${mappedFields} FROM ${schema.table}`;
        
        if (conditions) {
            query += ` WHERE ${conditions}`;
        }
        
        if (orderBy) {
            query += ` ORDER BY ${orderBy}`;
        }
        
        if (limit) {
            query += ` LIMIT ${limit}`;
        }

        return query;
    }

    async query(sql, params = []) {
        if (this.dbType === 'postgresql') {
            const result = await this.pool.query(sql, params);
            return {
                rows: result.rows,
                rowCount: result.rowCount
            };
        } else if (this.dbType === 'sqlite') {
            return new Promise((resolve, reject) => {
                // For SELECT queries
                if (sql.trim().toUpperCase().startsWith('SELECT')) {
                    this.db.all(sql, params, (err, rows) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve({
                                rows: rows || [],
                                rowCount: rows ? rows.length : 0
                            });
                        }
                    });
                } else {
                    // For INSERT/UPDATE/DELETE queries
                    this.db.run(sql, params, function(err) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve({
                                rows: [],
                                rowCount: this.changes
                            });
                        }
                    });
                }
            });
        }
    }

    async getAvailableYears() {
        const schema = this.getSchema();
        const query = `
            SELECT DISTINCT year 
            FROM ${schema.table}
            WHERE year IS NOT NULL 
            ORDER BY year DESC
        `;
        
        try {
            const result = await this.query(query);
            return result.rows.map(row => row.year);
        } catch (error) {
            console.error('Error fetching available years:', error);
            return [2025, 2024, 2023, 2022, 2021, 2020, 2019]; // Fallback
        }
    }

    async getDocumentsByYear(year) {
        const baseFields = ['id', 'filename', 'title', 'year', 'category', 'document_type', 'size', 'verification_status', 'created_at', 'official_url'];
        const schema = this.getSchema();
        
        const query = this.buildSelectQuery(
            baseFields,
            `year = ${this.dbType === 'postgresql' ? '$1' : '?'}`,
            'created_at DESC'
        );
        
        try {
            const result = await this.query(query, [year]);
            
            return result.rows.map(doc => ({
                id: doc.id,
                title: doc.title || doc.filename,
                filename: doc.filename,
                year: doc.year,
                category: doc.category,
                type: doc.document_type,
                size_mb: this.convertSizeToMB(doc[schema.sizeColumn === 'size_bytes' ? 'size_bytes' : 'file_size']),
                url: doc.url || doc.official_url,
                official_url: doc.official_url || `http://cda-transparencia.org/wp-content/uploads/${doc.year}/${String(doc.month || '01').padStart(2, '0')}/${doc.filename}`,
                archive_url: `https://web.archive.org/web/*/cda-transparencia.org/transparencia/`,
                verification_status: doc.verification_status,
                processing_date: doc.created_at,
                data_sources: ['official_site'],
                file_size: this.convertSizeToMB(doc[schema.sizeColumn === 'size_bytes' ? 'size_bytes' : 'file_size'])
            }));
        } catch (error) {
            console.error('Error fetching documents by year:', error);
            return [];
        }
    }

    async getAllDocuments(filters = {}) {
        const baseFields = ['id', 'filename', 'title', 'year', 'category', 'document_type', 'size', 'verification_status', 'created_at'];
        
        let conditions = '';
        let params = [];
        let paramIndex = 1;
        
        // Build conditions based on filters
        if (filters.year) {
            if (conditions) conditions += ' AND ';
            conditions += `year = ${this.dbType === 'postgresql' ? `${paramIndex}` : '?'}`;
            params.push(filters.year);
            paramIndex++;
        }
        
        if (filters.category) {
            if (conditions) conditions += ' AND ';
            conditions += `category = ${this.dbType === 'postgresql' ? `${paramIndex}` : '?'}`;
            params.push(filters.category);
            paramIndex++;
        }
        
        const query = this.buildSelectQuery(
            baseFields,
            conditions,
            'year DESC, created_at DESC',
            '1000'
        );
        
        try {
            const result = await this.query(query, params);
            const schema = this.getSchema();
            
            return result.rows.map(doc => ({
                id: doc.id,
                title: doc.title || doc.filename,
                filename: doc.filename,
                year: doc.year,
                category: doc.category,
                type: doc.document_type,
                size_mb: this.convertSizeToMB(doc[schema.sizeColumn === 'size_bytes' ? 'size_bytes' : 'file_size']),
                verification_status: doc.verification_status,
                processing_date: doc.created_at
            }));
        } catch (error) {
            console.error('Error fetching all documents:', error);
            return [];
        }
    }

    async getDocumentsByCategory(category, year = null) {
        const baseFields = ['id', 'filename', 'title', 'year', 'category', 'document_type', 'size', 'verification_status', 'created_at'];
        
        let conditions = `category = ${this.dbType === 'postgresql' ? '$1' : '?'}`;
        let params = [category];
        
        if (year) {
            conditions += ` AND year = ${this.dbType === 'postgresql' ? '$2' : '?'}`;
            params.push(year);
        }
        
        const query = this.buildSelectQuery(
            baseFields,
            conditions,
            'year DESC, created_at DESC'
        );
        
        try {
            const result = await this.query(query, params);
            return result.rows;
        } catch (error) {
            console.error('Error fetching documents by category:', error);
            return [];
        }
    }

    async updateDocumentWithFinancialData(documentId, financialData) {
        const baseFields = ['budgeted', 'executed', 'execution_rate', 'financial_summary', 'updated_at'];
        
        let updates = [];
        let params = [];
        let paramIndex = 1;
        
        // Build update query with proper parameter binding for each database type
        baseFields.forEach(field => {
            if (financialData[field] !== undefined) {
                updates.push(`${field} = ${this.dbType === 'postgresql' ? `${paramIndex}` : '?'}`);
                params.push(financialData[field]);
                paramIndex++;
            }
        });
        
        // Always update the timestamp
        updates.push(`updated_at = ${this.dbType === 'postgresql' ? `${paramIndex}` : '?'}`);
        params.push(new Date().toISOString());
        paramIndex++;
        
        if (updates.length === 0) {
            console.warn('No financial data to update for document:', documentId);
            return;
        }
        
        const query = `
            UPDATE documents 
            SET ${updates.join(', ')}
            WHERE id = ${this.dbType === 'postgresql' ? `${paramIndex}` : '?'}
        `;
        
        params.push(documentId);
        
        try {
            await this.query(query, params);
            console.log(`Successfully updated financial data for document ${documentId}`);
        } catch (error) {
            console.error(`Error updating financial data for document ${documentId}:`, error);
            throw error;
        }
    }

    async getYearlySummary(year) {
        const schema = this.getSchema();
        
        let query;
        if (this.dbType === 'postgresql') {
            query = `
                SELECT 
                    COUNT(*) as total_documents,
                    COUNT(DISTINCT category) as total_categories,
                    SUM(size_bytes) as total_size_bytes,
                    COUNT(CASE WHEN verification_status = 'verified' THEN 1 END) as verified_documents
                FROM ${schema.table}
                WHERE year = $1
            `;
        } else {
            query = `
                SELECT 
                    COUNT(*) as total_documents,
                    COUNT(DISTINCT category) as total_categories,
                    SUM(file_size) as total_size_bytes,
                    COUNT(CASE WHEN verification_status = 'verified' THEN 1 END) as verified_documents
                FROM ${schema.table}
                WHERE year = ?
            `;
        }
        
        try {
            const result = await this.query(query, [year]);
            const row = result.rows[0];
            
            return {
                total_documents: parseInt(row.total_documents),
                total_categories: parseInt(row.total_categories),
                total_size_mb: this.convertSizeToMB(row.total_size_bytes),
                verified_documents: parseInt(row.verified_documents),
                transparency_score: parseInt(row.total_documents) > 0 ? 
                    Math.round((row.verified_documents / row.total_documents) * 100) : 0
            };
        } catch (error) {
            console.error('Error fetching yearly summary:', error);
            return {
                total_documents: 0,
                total_categories: 0,
                total_size_mb: 0,
                verified_documents: 0,
                transparency_score: 0
            };
        }
    }

    async getHealthStatus() {
        const schema = this.getSchema();
        
        let query;
        if (this.dbType === 'postgresql') {
            query = `
                SELECT 
                    COUNT(*) as total_documents,
                    COUNT(CASE WHEN verification_status = 'verified' THEN 1 END) as verified_documents,
                    MAX(created_at) as last_update
                FROM ${schema.table}
            `;
        } else {
            query = `
                SELECT 
                    COUNT(*) as total_documents,
                    COUNT(CASE WHEN verification_status = 'verified' THEN 1 END) as verified_documents,
                    MAX(created_at) as last_update
                FROM ${schema.table}
            `;
        }
        
        try {
            const result = await this.query(query);
            const row = result.rows[0];
            
            return {
                status: 'healthy',
                database: 'connected',
                db_type: this.dbType,
                total_documents: parseInt(row.total_documents),
                verified_documents: parseInt(row.verified_documents),
                last_update: row.last_update,
                transparency_score: parseInt(row.total_documents) > 0 ? 
                    Math.round((row.verified_documents / row.total_documents) * 100) : 0
            };
        } catch (error) {
            console.error('Error fetching health status:', error.message);
            return {
                status: 'error',
                database: 'disconnected',
                db_type: this.dbType,
                error: error.message
            };
        }
    }

    convertSizeToMB(sizeValue) {
        if (!sizeValue) return '0.00';
        
        // If it's already in MB (SQLite file_size), return as is
        if (this.dbType === 'sqlite') {
            return parseFloat(sizeValue).toFixed(2);
        }
        
        // If it's in bytes (PostgreSQL size_bytes), convert to MB
        return (parseFloat(sizeValue) / (1024 * 1024)).toFixed(2);
    }

    async close() {
        if (this.pool) {
            await this.pool.end();
        }
        
        if (this.db) {
            return new Promise((resolve) => {
                this.db.close(resolve);
            });
        }
    }
}

module.exports = UnifiedDatabaseAdapter;
