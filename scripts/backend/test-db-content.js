const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to the database
const dbPath = path.join(__dirname, 'transparency.db');
console.log('Connecting to database at:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
        
        // Check if documents table has data
        db.all("SELECT COUNT(*) as count FROM documents", [], (err, rows) => {
            if (err) {
                console.error('Error counting documents:', err.message);
            } else {
                console.log('Total documents:', rows[0].count);
                
                if (rows[0].count > 0) {
                    // Show first few documents
                    db.all("SELECT * FROM documents LIMIT 5", [], (err, rows) => {
                        if (err) {
                            console.error('Error querying documents:', err.message);
                        } else {
                            console.log('\nFirst 5 documents:');
                            rows.forEach((row, index) => {
                                console.log(`  ${index + 1}. ${row.filename} (${row.year}) - ${row.category}`);
                            });
                        }
                        
                        // Close the database connection
                        db.close((err) => {
                            if (err) {
                                console.error('Error closing database:', err.message);
                            } else {
                                console.log('\nDatabase connection closed.');
                            }
                        });
                    });
                } else {
                    console.log('No documents found in database.');
                    
                    // Close the database connection
                    db.close((err) => {
                        if (err) {
                            console.error('Error closing database:', err.message);
                        } else {
                            console.log('\nDatabase connection closed.');
                        }
                    });
                }
            }
        });
    }
});