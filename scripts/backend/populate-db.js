const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs').promises;

// Connect to the database
const dbPath = path.join(__dirname, 'transparency.db');
console.log('Connecting to database at:', dbPath);

const db = new sqlite3.Database(dbPath, async (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        return;
    }
    
    console.log('Connected to SQLite database.');
    
    try {
        // Find all data index files
        const dataIndexPath = path.join(__dirname, '../data/organized_documents/json');
        const files = await fs.readdir(dataIndexPath);
        const jsonFiles = files.filter(file => file.startsWith('data_index_') && file.endsWith('.json'));
        
        console.log(`Found ${jsonFiles.length} data index files`);
        
        let totalDocuments = 0;
        
        // Process each data index file
        for (const file of jsonFiles) {
            try {
                const filePath = path.join(dataIndexPath, file);
                const data = await fs.readFile(filePath, 'utf8');
                const yearData = JSON.parse(data);
                
                console.log(`Processing ${file} with ${yearData.total_documents} documents`);
                
                // Insert documents into database
                if (yearData.categories) {
                    for (const [category, documents] of Object.entries(yearData.categories)) {
                        for (const doc of documents) {
                            const stmt = db.prepare(`
                                INSERT INTO documents (
                                    filename, title, year, file_type, size_bytes, 
                                    category, document_type, url, official_url, 
                                    verification_status, created_at, file_size
                                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                            `);
                            
                            stmt.run([
                                doc.title || doc.filename || 'unknown.pdf',
                                doc.title || 'Documento sin título',
                                doc.year || yearData.year || new Date().getFullYear(),
                                doc.type || 'PDF',
                                (doc.size_mb || 0) * 1024 * 1024, // Convert MB to bytes
                                category,
                                doc.category || 'general',
                                doc.url || '',
                                doc.official_url || '',
                                'verified',
                                new Date().toISOString(),
                                doc.size_mb || 0
                            ], function(err) {
                                if (err) {
                                    console.error('Error inserting document:', err.message);
                                }
                            });
                            
                            stmt.finalize();
                            totalDocuments++;
                        }
                    }
                }
            } catch (fileError) {
                console.error(`Error processing file ${file}:`, fileError.message);
            }
        }
        
        console.log(`Inserted ${totalDocuments} documents into database`);
        
        // Verify data was inserted
        db.get("SELECT COUNT(*) as count FROM documents", [], (err, row) => {
            if (err) {
                console.error('Error counting documents:', err.message);
            } else {
                console.log(`Total documents in database: ${row.count}`);
            }
            
            // Close the database connection
            db.close((err) => {
                if (err) {
                    console.error('Error closing database:', err.message);
                } else {
                    console.log('Database connection closed.');
                }
            });
        });
        
    } catch (error) {
        console.error('Error processing data:', error);
        db.close();
    }
});