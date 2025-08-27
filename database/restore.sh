#!/bin/bash
# Database restore script for transparency portal

# Configuration
DB_NAME="transparency_portal"
DB_USER="postgres"
DB_HOST="localhost"
DB_PORT="5432"
BACKUP_DIR="/Users/flong/Developer/cda-transparencia/database/backups"

# Function to show usage
show_usage() {
    echo "Usage: $0 <backup_file>"
    echo "Example: $0 full_backup_20250826_143022.sql"
    echo "         $0 full_backup_20250826_143022.sql.gz"
}

# Check if backup file is provided
if [ $# -eq 0 ]; then
    show_usage
    exit 1
fi

BACKUP_FILE="$1"

# Check if backup file exists
if [ ! -f "$BACKUP_DIR/$BACKUP_FILE" ]; then
    echo "Error: Backup file $BACKUP_DIR/$BACKUP_FILE not found!"
    echo "Available backup files:"
    ls -la "$BACKUP_DIR"/*.sql* 2>/dev/null || echo "No backup files found"
    exit 1
fi

# Confirm before restore
echo "WARNING: This will completely replace the existing database!"
echo "Database: $DB_NAME"
echo "Backup file: $BACKUP_DIR/$BACKUP_FILE"
read -p "Are you sure you want to continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Restore cancelled."
    exit 1
fi

# Drop existing database and recreate
echo "Dropping existing database..."
dropdb -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME --if-exists

echo "Creating new database..."
createdb -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME

# Restore from backup
echo "Restoring from backup..."
if [[ $BACKUP_FILE == *.gz ]]; then
    # Compressed backup
    gunzip -c "$BACKUP_DIR/$BACKUP_FILE" | psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME
else
    # Regular SQL backup
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$BACKUP_DIR/$BACKUP_FILE"
fi

echo "Database restore completed successfully!"
echo "Verifying restore..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "\dt" | head -10