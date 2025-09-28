#!/usr/bin/env python3
"""
PDF Inventory and Organization Script
Catalogs all PDF files and creates organization structure
"""

import os
import sys
import json
import hashlib
from pathlib import Path
from datetime import datetime
import pandas as pd
import sqlite3
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('pdf_inventory.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

class PDFInventory:
    def __init__(self, base_dir=None):
        self.base_dir = Path(base_dir) if base_dir else Path.cwd()
        self.data_dir = self.base_dir / "data"
        self.db_path = self.data_dir / "documents.db"
        
        logger.info(f"PDFInventory initialized with base_dir: {self.base_dir}")

    def get_file_hash(self, file_path):
        """Calculate SHA256 hash of file"""
        sha256_hash = hashlib.sha256()
        with open(file_path, "rb") as f:
            for byte_block in iter(lambda: f.read(4096), b""):
                sha256_hash.update(byte_block)
        return sha256_hash.hexdigest()

    def get_file_info(self, file_path):
        """Get comprehensive file information"""
        try:
            stat = file_path.stat()
            
            # Get file extension and size
            ext = file_path.suffix.lower()
            size_bytes = stat.st_size
            
            # Convert size to human readable format
            if size_bytes < 1024:
                size_str = f"{size_bytes} B"
            elif size_bytes < 1024**2:
                size_str = f"{size_bytes/1024:.1f} KB"
            elif size_bytes < 1024**3:
                size_str = f"{size_bytes/(1024**2):.1f} MB"
            else:
                size_str = f"{size_bytes/(1024**3):.1f} GB"
            
            # Try to extract year from filename
            year = None
            filename = file_path.name.lower()
            for i in range(2015, 2030):
                if str(i) in filename:
                    year = i
                    break
            
            # Determine category based on path and filename
            category = self.categorize_file(file_path)
            
            return {
                'file_path': str(file_path.relative_to(self.base_dir)),
                'filename': file_path.name,
                'extension': ext,
                'size_bytes': size_bytes,
                'size_formatted': size_str,
                'modified_date': datetime.fromtimestamp(stat.st_mtime).isoformat(),
                'created_date': datetime.fromtimestamp(stat.st_ctime).isoformat(),
                'file_hash': self.get_file_hash(file_path),
                'year': year,
                'category': category,
                'directory': str(file_path.parent.relative_to(self.base_dir))
            }
        except Exception as e:
            logger.error(f"Failed to get file info for {file_path}: {e}")
            return None

    def categorize_file(self, file_path):
        """Categorize file based on path and filename"""
        path_str = str(file_path).lower()
        filename = file_path.name.lower()
        
        # Budget and financial documents
        if any(keyword in path_str for keyword in [
            'budget', 'presupuesto', 'ejecucion', 'execution'
        ]):
            return 'budget'
        
        # Debt documents
        if any(keyword in path_str for keyword in [
            'debt', 'deuda', 'loan', 'prestamo'
        ]):
            return 'debt'
        
        # Contract and procurement documents
        if any(keyword in path_str for keyword in [
            'contract', 'contrato', 'tender', 'licitacion', 'procurement', 'adquisicion'
        ]):
            return 'contracts'
        
        # Personnel and salary documents
        if any(keyword in path_str for keyword in [
            'salary', 'salario', 'personal', 'staff', 'employee', 'empleado'
        ]):
            return 'personnel'
        
        # Infrastructure and investment documents
        if any(keyword in path_str for keyword in [
            'infrastructure', 'infraestructura', 'investment', 'inversion', 'project', 'proyecto'
        ]):
            return 'infrastructure'
        
        # Education documents
        if any(keyword in path_str for keyword in [
            'education', 'educacion', 'school', 'escuela', 'student', 'estudiante'
        ]):
            return 'education'
        
        # Health documents
        if any(keyword in path_str for keyword in [
            'health', 'salud', 'medical', 'medico', 'hospital'
        ]):
            return 'health'
        
        # Revenue documents
        if any(keyword in path_str for keyword in [
            'revenue', 'ingreso', 'tax', 'impuesto', 'source', 'fuente'
        ]):
            return 'revenue'
        
        # Financial reserves
        if any(keyword in path_str for keyword in [
            'reserve', 'reserva', 'fund', 'fondo', 'financial', 'financiero'
        ]):
            return 'financial_reserves'
        
        # Fiscal balance
        if any(keyword in path_str for keyword in [
            'balance', 'equilibrio', 'fiscal', 'deficit', 'surplus'
        ]):
            return 'fiscal_balance'
        
        # Reports
        if any(keyword in path_str for keyword in [
            'report', 'informe', 'analysis', 'analisis'
        ]):
            return 'reports'
        
        # Documents (default)
        return 'documents'

    def find_pdf_files(self):
        """Find all PDF files in the directory structure"""
        logger.info("Searching for PDF files...")
        
        pdf_files = []
        for pdf_path in self.base_dir.rglob("*.pdf"):
            # Skip node_modules and .git directories
            if "node_modules" in str(pdf_path) or ".git" in str(pdf_path):
                continue
                
            # Skip already processed OCR files
            if "ocr_extracted" in str(pdf_path):
                continue
            
            file_info = self.get_file_info(pdf_path)
            if file_info:
                pdf_files.append(file_info)
        
        logger.info(f"Found {len(pdf_files)} PDF files")
        return pdf_files

    def create_inventory_reports(self, pdf_files):
        """Create various inventory reports"""
        if not pdf_files:
            logger.warning("No PDF files to create inventory for")
            return
        
        # Create output directory
        reports_dir = self.data_dir / "inventory_reports"
        reports_dir.mkdir(exist_ok=True)
        
        # 1. CSV inventory
        df = pd.DataFrame(pdf_files)
        csv_file = reports_dir / "pdf_inventory.csv"
        df.to_csv(csv_file, index=False, encoding='utf-8')
        logger.info(f"Created CSV inventory: {csv_file}")
        
        # 2. JSON inventory
        json_file = reports_dir / "pdf_inventory.json"
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(pdf_files, f, ensure_ascii=False, indent=2)
        logger.info(f"Created JSON inventory: {json_file}")
        
        # 3. Summary report
        summary = self.generate_summary(pdf_files)
        summary_file = reports_dir / "pdf_inventory_summary.json"
        with open(summary_file, 'w', encoding='utf-8') as f:
            json.dump(summary, f, ensure_ascii=False, indent=2)
        logger.info(f"Created summary report: {summary_file}")
        
        # 4. Per-category breakdown
        categories_dir = reports_dir / "by_category"
        categories_dir.mkdir(exist_ok=True)
        
        for category in df['category'].unique():
            if pd.notna(category):
                category_df = df[df['category'] == category]
                category_file = categories_dir / f"{category}_inventory.csv"
                category_df.to_csv(category_file, index=False, encoding='utf-8')
                logger.info(f"Created category inventory: {category_file}")
        
        # 5. Per-year breakdown
        years_dir = reports_dir / "by_year"
        years_dir.mkdir(exist_ok=True)
        
        for year in df['year'].dropna().unique():
            year_df = df[df['year'] == year]
            if not year_df.empty:
                year_file = years_dir / f"{int(year)}_inventory.csv"
                year_df.to_csv(year_file, index=False, encoding='utf-8')
                logger.info(f"Created year inventory: {year_file}")

    def generate_summary(self, pdf_files):
        """Generate summary statistics"""
        if not pdf_files:
            return {}
        
        df = pd.DataFrame(pdf_files)
        
        # Basic statistics
        total_size = df['size_bytes'].sum()
        avg_size = df['size_bytes'].mean()
        
        # Convert total size to human readable
        if total_size < 1024:
            total_size_str = f"{total_size} B"
        elif total_size < 1024**2:
            total_size_str = f"{total_size/1024:.1f} KB"
        elif total_size < 1024**3:
            total_size_str = f"{total_size/(1024**2):.1f} MB"
        else:
            total_size_str = f"{total_size/(1024**3):.1f} GB"
        
        summary = {
            'generated_at': datetime.now().isoformat(),
            'total_files': len(pdf_files),
            'total_size_bytes': int(total_size),
            'total_size_formatted': total_size_str,
            'average_file_size_bytes': int(avg_size),
            'categories': {},
            'years': {},
            'file_extensions': df['extension'].value_counts().to_dict(),
            'largest_files': df.nlargest(10, 'size_bytes')[['filename', 'size_formatted', 'category']].to_dict('records'),
            'newest_files': df.nlargest(10, 'modified_date')[['filename', 'modified_date', 'category']].to_dict('records')
        }
        
        # Category breakdown
        category_counts = df['category'].value_counts()
        for category, count in category_counts.items():
            if pd.notna(category):
                category_size = df[df['category'] == category]['size_bytes'].sum()
                summary['categories'][str(category)] = {
                    'count': int(count),
                    'total_size_bytes': int(category_size)
                }
        
        # Year breakdown
        year_counts = df['year'].value_counts()
        for year, count in year_counts.items():
            if pd.notna(year):
                year_size = df[df['year'] == year]['size_bytes'].sum()
                summary['years'][int(year)] = {
                    'count': int(count),
                    'total_size_bytes': int(year_size)
                }
        
        return summary

    def update_database(self, pdf_files):
        """Update database with PDF file information"""
        try:
            if not self.db_path.exists():
                logger.warning(f"Database not found: {self.db_path}")
                return False
            
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Create pdf_inventory table if it doesn't exist
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS pdf_inventory (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    file_hash TEXT UNIQUE,
                    filename TEXT,
                    file_path TEXT,
                    category TEXT,
                    year INTEGER,
                    size_bytes INTEGER,
                    modified_date TEXT,
                    created_date TEXT,
                    last_scanned TEXT
                )
            ''')
            
            # Insert or update file information
            inserted = 0
            updated = 0
            
            for file_info in pdf_files:
                try:
                    cursor.execute('''
                        INSERT OR REPLACE INTO pdf_inventory 
                        (file_hash, filename, file_path, category, year, size_bytes, 
                         modified_date, created_date, last_scanned)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ''', (
                        file_info['file_hash'],
                        file_info['filename'],
                        file_info['file_path'],
                        file_info['category'],
                        file_info['year'],
                        file_info['size_bytes'],
                        file_info['modified_date'],
                        file_info['created_date'],
                        datetime.now().isoformat()
                    ))
                    
                    if cursor.rowcount > 0:
                        if cursor.lastrowid == cursor.rowcount:
                            inserted += 1
                        else:
                            updated += 1
                    
                except Exception as e:
                    logger.error(f"Failed to insert/update {file_info['filename']}: {e}")
                    continue
            
            conn.commit()
            conn.close()
            
            logger.info(f"Database updated: {inserted} new files, {updated} updated files")
            return True
            
        except Exception as e:
            logger.error(f"Failed to update database: {e}")
            return False

    def run_inventory(self):
        """Run complete PDF inventory process"""
        logger.info("Starting PDF inventory process...")
        
        try:
            # 1. Find all PDF files
            pdf_files = self.find_pdf_files()
            
            if not pdf_files:
                logger.warning("No PDF files found")
                return False
            
            # 2. Create inventory reports
            self.create_inventory_reports(pdf_files)
            
            # 3. Update database
            self.update_database(pdf_files)
            
            logger.info("PDF inventory process completed successfully")
            return True
            
        except Exception as e:
            logger.error(f"PDF inventory process failed: {e}")
            return False

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='Inventory and organize PDF files')
    parser.add_argument('--base-dir', help='Base directory to scan')
    parser.add_argument('--update-db', action='store_true', help='Update database with inventory')
    parser.add_argument('--reports-only', action='store_true', help='Only generate reports, no database update')
    
    args = parser.parse_args()
    
    # Initialize inventory system
    inventory = PDFInventory(base_dir=args.base_dir)
    
    # Run inventory
    success = inventory.run_inventory()
    
    if success:
        logger.info("PDF inventory completed successfully")
    else:
        logger.error("PDF inventory failed")
        return False
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)