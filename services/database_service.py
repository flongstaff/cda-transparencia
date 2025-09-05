#!/usr/bin/env python3
"""
Database Service for Transparency System
Handles all database operations in a centralized way
"""

import psycopg2
import sqlite3
import json
import logging
from pathlib import Path
from typing import Dict, List, Any, Optional
from contextlib import contextmanager

class DatabaseService:
    """Centralized database service for all system operations"""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.db_type = config.get("type", "postgresql")
        
        # Setup logging
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
        
        self.logger.info(f"Database service initialized for {self.db_type}")
    
    @contextmanager
    def get_connection(self):
        """Get database connection with proper context management"""
        conn = None
        try:
            if self.db_type == "postgresql":
                conn = psycopg2.connect(
                    host=self.config.get("host", "localhost"),
                    port=self.config.get("port", 5432),
                    database=self.config.get("name", "transparency_portal"),
                    user=self.config.get("user", "postgres"),
                    password=self.config.get("password", "")
                )
            elif self.db_type == "sqlite":
                db_path = self.config.get("path", "data/transparency.db")
                Path(db_path).parent.mkdir(parents=True, exist_ok=True)
                conn = sqlite3.connect(db_path)
                conn.row_factory = sqlite3.Row
            
            yield conn
        except Exception as e:
            self.logger.error(f"Database connection error: {e}")
            if conn:
                conn.rollback()
            raise
        finally:
            if conn:
                conn.close()
    
    def execute_query(self, query: str, params: tuple = None) -> List[Dict]:
        """Execute a SELECT query and return results"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            if params:
                cursor.execute(query, params)
            else:
                cursor.execute(query)
            
            # For PostgreSQL, we need to handle the results differently
            if self.db_type == "postgresql":
                columns = [desc[0] for desc in cursor.description]
                results = []
                for row in cursor.fetchall():
                    results.append(dict(zip(columns, row)))
                return results
            else:
                # SQLite with row_factory
                return [dict(row) for row in cursor.fetchall()]
    
    def execute_update(self, query: str, params: tuple = None) -> int:
        """Execute an INSERT/UPDATE/DELETE query and return affected rows"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            if params:
                cursor.execute(query, params)
            else:
                cursor.execute(query)
            
            conn.commit()
            return cursor.rowcount
    
    def initialize_schema(self):
        """Initialize database schema"""
        if self.db_type == "postgresql":
            self._initialize_postgresql_schema()
        else:
            self._initialize_sqlite_schema()
    
    def _initialize_postgresql_schema(self):
        """Initialize PostgreSQL schema"""
        # This would be implemented based on your existing schema
        self.logger.info("PostgreSQL schema initialization would be implemented here")
    
    def _initialize_sqlite_schema(self):
        """Initialize SQLite schema"""
        queries = [
            """
            CREATE TABLE IF NOT EXISTS documents (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                url TEXT UNIQUE,
                filename TEXT NOT NULL,
                location TEXT,
                size INTEGER,
                content_type TEXT,
                sha256 TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_verified TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                status TEXT DEFAULT 'active'
            )
            """,
            """
            CREATE TABLE IF NOT EXISTS processed_files (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                document_id INTEGER,
                original_filename TEXT NOT NULL,
                processed_filename TEXT NOT NULL,
                processing_type TEXT NOT NULL,
                file_size INTEGER,
                processing_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                success BOOLEAN DEFAULT TRUE,
                error_message TEXT,
                FOREIGN KEY (document_id) REFERENCES documents(id)
            )
            """,
            """
            CREATE TABLE IF NOT EXISTS financial_data (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                document_id INTEGER,
                year INTEGER,
                amount DECIMAL(15,2),
                concept TEXT,
                category TEXT,
                date_extracted DATE,
                extraction_method TEXT,
                FOREIGN KEY (document_id) REFERENCES documents(id)
            )
            """
        ]
        
        with self.get_connection() as conn:
            cursor = conn.cursor()
            for query in queries:
                cursor.execute(query)
            conn.commit()
        
        self.logger.info("SQLite schema initialized")
    
    def import_from_backup(self, backup_file: str):
        """Import data from a database backup"""
        # This would be implemented based on your backup format
        self.logger.info(f"Database import from {backup_file} would be implemented here")

if __name__ == "__main__":
    # Example usage
    db_config = {
        "type": "sqlite",
        "path": "data/transparency.db"
    }
    
    db_service = DatabaseService(db_config)
    db_service.initialize_schema()
    
    print("Database service initialized")
    print("Available methods:")
    print("  - execute_query(query, params)")
    print("  - execute_update(query, params)")
    print("  - initialize_schema()")
    print("  - import_from_backup(backup_file)")