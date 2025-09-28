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
        
        // Check table schema
        db.all("PRAGMA table_info(documents)", [], (err, rows) => {
            if (err) {
                console.error('Error getting table info:', err.message);
            } else {
                console.log('\nTable schema:');
                rows.forEach(row => {
                    console.log(`  ${row.name} - ${row.type} (${row.pk ? 'PRIMARY KEY' : ''})`);
                });
            }
            
            // Check first few rows to see what data we have
            db.all("SELECT * FROM documents LIMIT 3", [], (err, rows) => {
                if (err) {
                    console.error('Error querying documents:', err.message);
                } else {
                    console.log('\nFirst 3 rows:');
                    rows.forEach((row, index) => {
                        console.log(`\nRow ${index + 1}:`);
                        Object.keys(row).forEach(key => {
                            console.log(`  ${key}: ${row[key]}`);
                        });
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
        });
    }
});