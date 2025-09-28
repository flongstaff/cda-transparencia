#!/usr/bin/env python3
"""
OSINT Automation System
Automated monitoring and data extraction for transparency analysis
NOT OFFICIAL - Educational/Research purposes only
"""

import os
import json
import csv
import pandas as pd
import requests
from datetime import datetime, timedelta
import hashlib
import sqlite3
import logging
from pathlib import Path
import schedule
import time
from typing import Dict, List, Any
import fitz  # PyMuPDF
import tabula
import pdfplumber
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('osint_automation.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class DataMonitor:
    """Monitor data changes and trigger processing"""

    def __init__(self, watch_directories: List[str]):
        self.watch_directories = watch_directories
        self.observer = Observer()
        self.processed_files = set()

    def start_monitoring(self):
        """Start file system monitoring"""
        for directory in self.watch_directories:
            if os.path.exists(directory):
                event_handler = DataChangeHandler(self)
                self.observer.schedule(event_handler, directory, recursive=True)
                logger.info(f"Monitoring directory: {directory}")

        self.observer.start()
        logger.info("Data monitoring started")

class DataChangeHandler(FileSystemEventHandler):
    """Handle file system events"""

    def __init__(self, monitor: DataMonitor):
        self.monitor = monitor

    def on_modified(self, event):
        if not event.is_directory:
            self.process_file_change(event.src_path)

    def on_created(self, event):
        if not event.is_directory:
            self.process_file_change(event.src_path)

    def process_file_change(self, file_path: str):
        """Process changed files"""
        if file_path.endswith(('.csv', '.json', '.pdf')):
            logger.info(f"File changed: {file_path}")
            processor = DataProcessor()
            processor.process_file(file_path)

class DataProcessor:
    """Process CSV, JSON, and PDF files"""

    def __init__(self):
        self.db_path = "osint_data.db"
        self.init_database()

    def init_database(self):
        """Initialize SQLite database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        # Create tables
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS processed_files (
                id INTEGER PRIMARY KEY,
                file_path TEXT UNIQUE,
                file_hash TEXT,
                processed_at TIMESTAMP,
                file_type TEXT,
                metadata TEXT
            )
        ''')

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS extracted_data (
                id INTEGER PRIMARY KEY,
                source_file TEXT,
                data_type TEXT,
                content TEXT,
                extracted_at TIMESTAMP,
                FOREIGN KEY (source_file) REFERENCES processed_files (file_path)
            )
        ''')

        conn.commit()
        conn.close()

    def process_file(self, file_path: str):
        """Process different file types"""
        file_ext = Path(file_path).suffix.lower()

        try:
            if file_ext == '.csv':
                self.process_csv(file_path)
            elif file_ext == '.json':
                self.process_json(file_path)
            elif file_ext == '.pdf':
                self.process_pdf(file_path)
        except Exception as e:
            logger.error(f"Error processing {file_path}: {e}")

    def process_csv(self, file_path: str):
        """Process CSV files"""
        logger.info(f"Processing CSV: {file_path}")

        try:
            df = pd.read_csv(file_path)

            # Store file info
            self.store_file_info(file_path, 'csv', {
                'rows': len(df),
                'columns': list(df.columns),
                'size': os.path.getsize(file_path)
            })

            # Extract and store data
            for idx, row in df.iterrows():
                self.store_extracted_data(file_path, 'csv_row', row.to_dict())

        except Exception as e:
            logger.error(f"Error processing CSV {file_path}: {e}")

    def process_json(self, file_path: str):
        """Process JSON files"""
        logger.info(f"Processing JSON: {file_path}")

        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)

            # Store file info
            self.store_file_info(file_path, 'json', {
                'structure': type(data).__name__,
                'size': os.path.getsize(file_path)
            })

            # Extract and store data
            self.store_extracted_data(file_path, 'json_content', data)

        except Exception as e:
            logger.error(f"Error processing JSON {file_path}: {e}")

    def process_pdf(self, file_path: str):
        """Process PDF files with multiple extraction methods"""
        logger.info(f"Processing PDF: {file_path}")

        try:
            # Method 1: pdfplumber for text and tables
            with pdfplumber.open(file_path) as pdf:
                text_content = ""
                tables = []

                for page_num, page in enumerate(pdf.pages):
                    # Extract text
                    page_text = page.extract_text()
                    if page_text:
                        text_content += f"Page {page_num + 1}:\n{page_text}\n\n"

                    # Extract tables
                    page_tables = page.extract_tables()
                    if page_tables:
                        for table_idx, table in enumerate(page_tables):
                            tables.append({
                                'page': page_num + 1,
                                'table_index': table_idx,
                                'data': table
                            })

            # Store file info
            self.store_file_info(file_path, 'pdf', {
                'pages': len(pdf.pages),
                'tables_found': len(tables),
                'size': os.path.getsize(file_path)
            })

            # Store extracted content
            if text_content:
                self.store_extracted_data(file_path, 'pdf_text', text_content)

            if tables:
                self.store_extracted_data(file_path, 'pdf_tables', tables)

            # Method 2: Try tabula for financial tables
            try:
                tabula_tables = tabula.read_pdf(file_path, pages='all', multiple_tables=True)
                if tabula_tables:
                    self.store_extracted_data(file_path, 'tabula_tables',
                                            [table.to_dict() for table in tabula_tables])
            except Exception as e:
                logger.warning(f"Tabula extraction failed for {file_path}: {e}")

        except Exception as e:
            logger.error(f"Error processing PDF {file_path}: {e}")

    def store_file_info(self, file_path: str, file_type: str, metadata: Dict):
        """Store file processing information"""
        file_hash = self.calculate_file_hash(file_path)

        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        cursor.execute('''
            INSERT OR REPLACE INTO processed_files
            (file_path, file_hash, processed_at, file_type, metadata)
            VALUES (?, ?, ?, ?, ?)
        ''', (file_path, file_hash, datetime.now(), file_type, json.dumps(metadata)))

        conn.commit()
        conn.close()

    def store_extracted_data(self, source_file: str, data_type: str, content: Any):
        """Store extracted data"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        cursor.execute('''
            INSERT INTO extracted_data
            (source_file, data_type, content, extracted_at)
            VALUES (?, ?, ?, ?)
        ''', (source_file, data_type, json.dumps(content, ensure_ascii=False), datetime.now()))

        conn.commit()
        conn.close()

    def calculate_file_hash(self, file_path: str) -> str:
        """Calculate file hash for change detection"""
        hash_md5 = hashlib.md5()
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hash_md5.update(chunk)
        return hash_md5.hexdigest()

class OSINTCollector:
    """Collect external intelligence"""

    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })

    def collect_external_data(self):
        """Collect data from external sources"""
        logger.info("Starting external data collection")

        # Add your specific OSINT collection methods here
        self.check_data_sources()
        self.monitor_changes()

    def check_data_sources(self):
        """Check various data sources for updates"""
        # This is where you'd add specific monitoring for your targets
        # Example: government transparency portals, public databases, etc.
        pass

    def monitor_changes(self):
        """Monitor for changes in tracked sources"""
        # Implement change detection logic
        pass

class ReportGenerator:
    """Generate reports from processed data"""

    def __init__(self, db_path: str):
        self.db_path = db_path

    def generate_daily_report(self):
        """Generate daily processing report"""
        conn = sqlite3.connect(self.db_path)

        # Get today's processed files
        today = datetime.now().date()
        query = '''
            SELECT file_type, COUNT(*) as count
            FROM processed_files
            WHERE date(processed_at) = ?
            GROUP BY file_type
        '''

        df = pd.read_sql_query(query, conn, params=[today])

        # Generate report
        report = {
            'date': str(today),
            'files_processed': df.to_dict('records'),
            'total_files': df['count'].sum() if not df.empty else 0
        }

        # Save report
        report_path = f"reports/daily_report_{today}.json"
        os.makedirs(os.path.dirname(report_path), exist_ok=True)

        with open(report_path, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)

        logger.info(f"Daily report generated: {report_path}")
        conn.close()

def main():
    """Main automation function"""
    logger.info("Starting OSINT Automation System")

    # Define directories to monitor
    watch_dirs = [
        "../data",
        "../frontend/public/data",
        "."  # Current directory
    ]

    # Initialize components
    monitor = DataMonitor(watch_dirs)
    processor = DataProcessor()
    osint_collector = OSINTCollector()
    report_generator = ReportGenerator(processor.db_path)

    # Start monitoring
    monitor.start_monitoring()

    # Schedule regular tasks
    schedule.every().hour.do(osint_collector.collect_external_data)
    schedule.every().day.at("23:59").do(report_generator.generate_daily_report)

    # Process existing files
    logger.info("Processing existing files...")
    for watch_dir in watch_dirs:
        if os.path.exists(watch_dir):
            for root, dirs, files in os.walk(watch_dir):
                for file in files:
                    if file.endswith(('.csv', '.json', '.pdf')):
                        file_path = os.path.join(root, file)
                        processor.process_file(file_path)

    logger.info("Automation system started. Press Ctrl+C to stop.")

    try:
        while True:
            schedule.run_pending()
            time.sleep(60)  # Check every minute
    except KeyboardInterrupt:
        logger.info("Stopping automation system...")
        monitor.observer.stop()
        monitor.observer.join()

if __name__ == "__main__":
    main()