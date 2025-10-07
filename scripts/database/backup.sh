#!/bin/bash
# Database backup script for transparency portal

# Configuration
DB_NAME="transparency_portal"
DB_USER="postgres"
DB_HOST="localhost"
DB_PORT="5432"
BACKUP_DIR="/Users/flong/Developer/cda-transparencia/database/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Full database backup
echo "Creating full database backup..."
pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$BACKUP_DIR/full_backup_$TIMESTAMP.sql"

# Schema-only backup
echo "Creating schema backup..."
pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME --schema-only -f "$BACKUP_DIR/schema_backup_$TIMESTAMP.sql"

# Data-only backup
echo "Creating data backup..."
pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME --data-only -f "$BACKUP_DIR/data_backup_$TIMESTAMP.sql"

# Compressed full backup
echo "Creating compressed backup..."
pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME | gzip > "$BACKUP_DIR/full_backup_$TIMESTAMP.sql.gz"

# Clean up old backups (keep last 7 days)
find "$BACKUP_DIR" -name "*.sql" -mtime +7 -delete
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +7 -delete

echo "Backup completed successfully!"
echo "Files created:"
echo "  - $BACKUP_DIR/full_backup_$TIMESTAMP.sql"
echo "  - $BACKUP_DIR/schema_backup_$TIMESTAMP.sql"
echo "  - $BACKUP_DIR/data_backup_$TIMESTAMP.sql"
echo "  - $BACKUP_DIR/full_backup_$TIMESTAMP.sql.gz"