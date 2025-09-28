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
        
        // Test query to check if tables exist
        db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, rows) => {
            if (err) {
                console.error('Error querying database:', err.message);
            } else {
                console.log('Tables in database:');
                rows.forEach(row => {
                    console.log('  -', row.name);
                });
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
    }
});