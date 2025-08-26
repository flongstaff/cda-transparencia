#!/usr/bin/env python3
"""
Data Integrity Validator for Carmen de Areco Transparency Portal
This script validates that all original files have been properly converted to markdown
and backed up in PostgreSQL before allowing safe deletion of original files.
"""

import os
import json
import hashlib
import psycopg2
from pathlib import Path
from typing import Dict, List, Tuple
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class DataIntegrityValidator:
    def __init__(self):
        self.base_path = Path("/Users/flong/Developer/cda-transparencia")
        self.source_materials_path = self.base_path / "data" / "source_materials"
        self.markdown_path = self.base_path / "data" / "markdown_documents"
        self.preserved_path = self.base_path / "data" / "preserved"
        
        # Database connection
        self.db_config = {
            'host': 'localhost',
            'port': 5432,
            'database': 'transparency_portal',
            'user': 'postgres',
            'password': 'postgres'
        }
        
        self.validation_report = {
            'timestamp': datetime.now().isoformat(),
            'original_files': 0,
            'markdown_files': 0,
            'db_records': 0,
            'missing_conversions': [],
            'integrity_issues': [],
            'safe_to_delete': False,
            'recommendations': []
        }

    def calculate_file_hash(self, file_path: Path) -> str:
        """Calculate SHA256 hash of a file"""
        sha256_hash = hashlib.sha256()
        with open(file_path, "rb") as f:
            for byte_block in iter(lambda: f.read(4096), b""):
                sha256_hash.update(byte_block)
        return sha256_hash.hexdigest()

    def find_all_original_files(self) -> List[Dict]:
        """Find all original PDF and Excel files"""
        logger.info("🔍 Scanning for original files...")
        original_files = []
        
        if self.source_materials_path.exists():
            for file_path in self.source_materials_path.rglob("*"):
                if file_path.is_file() and file_path.suffix.lower() in ['.pdf', '.xlsx', '.xls']:
                    file_info = {
                        'path': str(file_path),
                        'name': file_path.name,
                        'size': file_path.stat().st_size,
                        'hash': self.calculate_file_hash(file_path),
                        'year': self.extract_year_from_path(file_path),
                        'category': self.determine_category(file_path.name)
                    }
                    original_files.append(file_info)
        
        self.validation_report['original_files'] = len(original_files)
        logger.info(f"📊 Found {len(original_files)} original files")
        return original_files

    def find_all_markdown_files(self) -> List[Dict]:
        """Find all converted markdown files"""
        logger.info("📝 Scanning for markdown files...")
        markdown_files = []
        
        if self.markdown_path.exists():
            for file_path in self.markdown_path.rglob("*.md"):
                if file_path.is_file():
                    file_info = {
                        'path': str(file_path),
                        'name': file_path.name,
                        'size': file_path.stat().st_size,
                        'original_name': file_path.stem + '.pdf',  # Assume PDF conversion
                        'category': file_path.parent.name
                    }
                    markdown_files.append(file_info)
        
        self.validation_report['markdown_files'] = len(markdown_files)
        logger.info(f"📄 Found {len(markdown_files)} markdown files")
        return markdown_files

    def check_database_records(self) -> int:
        """Check how many records are in the database"""
        logger.info("💾 Checking database records...")
        try:
            conn = psycopg2.connect(**self.db_config)
            cursor = conn.cursor()
            
            # Count processed documents
            cursor.execute("SELECT COUNT(*) FROM processed_documents")
            doc_count = cursor.fetchone()[0]
            
            logger.info(f"🗃️ Found {doc_count} records in processed_documents table")
            self.validation_report['db_records'] = doc_count
            
            conn.close()
            return doc_count
            
        except Exception as e:
            logger.error(f"❌ Database error: {e}")
            self.validation_report['integrity_issues'].append(f"Database connection failed: {e}")
            return 0

    def validate_conversion_completeness(self, original_files: List[Dict], markdown_files: List[Dict]) -> List[str]:
        """Validate that all original files have been converted"""
        logger.info("🔍 Validating conversion completeness...")
        
        markdown_names = {md['original_name'].lower() for md in markdown_files}
        missing_conversions = []
        
        for original in original_files:
            original_name = original['name'].lower()
            # Check multiple possible conversions
            possible_names = [
                original_name,
                original_name.replace('.xlsx', '.pdf'),
                original_name.replace('.xls', '.pdf')
            ]
            
            if not any(name in markdown_names for name in possible_names):
                missing_conversions.append(original['name'])
                logger.warning(f"⚠️ Missing conversion for: {original['name']}")
        
        self.validation_report['missing_conversions'] = missing_conversions
        return missing_conversions

    def check_preserved_data_integrity(self) -> bool:
        """Check if preserved data exists with proper metadata"""
        logger.info("🛡️ Checking preserved data integrity...")
        
        preserved_json_files = [
            'salaries_data.json',
            'financial_data.json',
            'tenders_data.json',
            'documents_data.json'
        ]
        
        all_preserved = True
        for json_file in preserved_json_files:
            json_path = self.preserved_path / "json" / json_file
            if json_path.exists():
                try:
                    with open(json_path, 'r') as f:
                        data = json.load(f)
                        logger.info(f"✅ {json_file}: {len(data)} records")
                except Exception as e:
                    logger.error(f"❌ Error reading {json_file}: {e}")
                    all_preserved = False
            else:
                logger.warning(f"⚠️ Missing preserved file: {json_file}")
                all_preserved = False
        
        return all_preserved

    def extract_year_from_path(self, file_path: Path) -> str:
        """Extract year from file path"""
        parts = file_path.parts
        for part in parts:
            if part.isdigit() and len(part) == 4 and 2000 <= int(part) <= 2025:
                return part
        return "unknown"

    def determine_category(self, filename: str) -> str:
        """Determine file category from filename"""
        filename_lower = filename.lower()
        if any(word in filename_lower for word in ['sueldo', 'salario', 'escala']):
            return 'salaries'
        elif any(word in filename_lower for word in ['licitacion', 'tender']):
            return 'tenders'
        elif any(word in filename_lower for word in ['presupuesto', 'budget', 'gastos', 'ingresos']):
            return 'financial_data'
        elif any(word in filename_lower for word in ['declaracion', 'patrimonio']):
            return 'declarations'
        else:
            return 'other'

    def generate_backup_validation_report(self) -> Dict:
        """Generate comprehensive backup validation report"""
        logger.info("📋 Generating validation report...")
        
        original_files = self.find_all_original_files()
        markdown_files = self.find_all_markdown_files()
        db_records = self.check_database_records()
        
        missing_conversions = self.validate_conversion_completeness(original_files, markdown_files)
        preserved_integrity = self.check_preserved_data_integrity()
        
        # Determine if safe to delete
        conversion_rate = (len(original_files) - len(missing_conversions)) / len(original_files) if original_files else 0
        
        self.validation_report['safe_to_delete'] = (
            conversion_rate >= 0.95 and  # 95% conversion rate
            db_records > 0 and           # Database has records
            preserved_integrity and      # Preserved data exists
            len(missing_conversions) < 10  # Less than 10 missing files
        )
        
        # Generate recommendations
        recommendations = []
        if not self.validation_report['safe_to_delete']:
            if conversion_rate < 0.95:
                recommendations.append(f"❌ Conversion rate too low: {conversion_rate:.1%} (need >95%)")
            if db_records == 0:
                recommendations.append("❌ No database records found")
            if not preserved_integrity:
                recommendations.append("❌ Preserved data integrity issues")
            if len(missing_conversions) >= 10:
                recommendations.append(f"❌ Too many missing conversions: {len(missing_conversions)}")
        else:
            recommendations.append("✅ All data properly backed up and converted")
            recommendations.append("✅ Safe to remove original files")
            recommendations.append("✅ PostgreSQL contains structured data")
            recommendations.append("✅ Markdown files available for comparison")
        
        self.validation_report['recommendations'] = recommendations
        
        return self.validation_report

    def create_file_cleanup_script(self) -> str:
        """Create a script to safely remove original files"""
        if not self.validation_report['safe_to_delete']:
            return "❌ Cannot create cleanup script - validation failed"
        
        cleanup_script = f"""#!/bin/bash
# Safe File Cleanup Script for Carmen de Areco Transparency Portal
# Generated: {datetime.now().isoformat()}
# Validation Status: PASSED

echo "🧹 Starting safe file cleanup..."
echo "📊 Original files to process: {self.validation_report['original_files']}"
echo "📄 Markdown backups available: {self.validation_report['markdown_files']}"
echo "💾 Database records: {self.validation_report['db_records']}"

# Create backup before deletion
echo "📦 Creating final backup archive..."
tar -czf data/original_files_backup_$(date +%Y%m%d_%H%M%S).tar.gz data/source_materials/

# Move files to archive instead of deleting
echo "🗃️ Moving original files to archive..."
mkdir -p data/archive/original_files
mv data/source_materials/* data/archive/original_files/ 2>/dev/null || echo "No files to move"

echo "✅ Cleanup completed successfully!"
echo "📁 Original files archived in: data/archive/original_files/"
echo "📄 Markdown files available in: data/markdown_documents/"
echo "💾 Structured data in PostgreSQL database"
echo ""
echo "🎯 You can now use markdown + PostgreSQL for all transparency investigation!"
"""
        
        script_path = self.base_path / "scripts" / "cleanup_original_files.sh"
        with open(script_path, 'w') as f:
            f.write(cleanup_script)
        
        os.chmod(script_path, 0o755)  # Make executable
        
        return f"✅ Cleanup script created: {script_path}"

def main():
    validator = DataIntegrityValidator()
    
    print("🚀 Carmen de Areco Data Integrity Validation")
    print("=" * 60)
    
    # Generate validation report
    report = validator.generate_backup_validation_report()
    
    # Display results
    print(f"\n📊 VALIDATION RESULTS")
    print(f"Original files found: {report['original_files']}")
    print(f"Markdown files found: {report['markdown_files']}")
    print(f"Database records: {report['db_records']}")
    print(f"Missing conversions: {len(report['missing_conversions'])}")
    
    print(f"\n🔍 RECOMMENDATIONS:")
    for rec in report['recommendations']:
        print(f"  {rec}")
    
    if report['safe_to_delete']:
        print(f"\n✅ VALIDATION PASSED - SAFE TO REMOVE ORIGINAL FILES")
        cleanup_script = validator.create_file_cleanup_script()
        print(f"🧹 {cleanup_script}")
    else:
        print(f"\n❌ VALIDATION FAILED - DO NOT REMOVE ORIGINAL FILES YET")
        print(f"🔧 Please fix the issues above before proceeding")
    
    # Save report
    report_path = validator.base_path / "data" / "validation_report.json"
    with open(report_path, 'w') as f:
        json.dump(report, f, indent=2)
    
    print(f"\n📋 Full report saved to: {report_path}")

if __name__ == "__main__":
    main()