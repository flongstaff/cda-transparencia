#!/usr/bin/env python3
"""
Example usage of the Carmen de Areco Transparency modules.
"""

import sys
import os
from pathlib import Path

# Add the src directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

def demonstrate_modules():
    """Demonstrate the main functionality of each module."""
    print("🚀 Demonstrating Carmen de Areco Transparency modules...\\n")
    
    # 1. Data Extraction Module
    print("1. Data Extraction Module")
    print("   This module can scrape documents from:")
    print("   - Live website: scrape_live_sync()")
    print("   - Wayback Machine: scrape_wayback_sync()")
    print("   Both functions download PDF, DOCX, XLSX, CSV, and other document types.\\n")
    
    # 2. Processing Module
    print("2. Processing Module")
    print("   This module can convert documents to structured formats:")
    print("   - PDF tables → CSV: convert_table_pdf_to_csv()")
    print("   - DOCX → TXT: convert_docx_to_txt()")
    print("   - Excel → CSV: convert_excel_to_csv()")
    print("   - Excel → Markdown: convert_excel_to_markdown()\\n")
    
    # 3. Database Module
    print("3. Database Module")
    print("   This module manages SQLite database operations:")
    print("   - Create tables: create_documents_table()")
    print("   - Insert metadata: insert_metadata()")
    print("   - Initialize database: initialize_database()\\n")
    
    # 4. CLI Usage
    print("4. Command Line Interface")
    print("   You can use the CLI commands:")
    print("   - carmen-transparencia scrape live [--output DIR] [--depth N]")
    print("   - carmen-transparencia scrape wayback [--output DIR] [--depth N]")
    print("   - carmen-transparencia process documents INPUT_DIR OUTPUT_FILE")
    print("   - carmen-transparencia populate from-json FILE_PATH TABLE_NAME")
    print("   - carmen-transparencia populate from-csv CSV_PATH TABLE_NAME")
    print("   - carmen-transparencia validate DIRECTORY\\n")
    
    print("✨ Example workflow:")
    print("   1. Scrape documents: carmen-transparencia scrape live --output ./data")
    print("   2. Process documents: carmen-transparencia process documents ./data ./report.json")
    print("   3. Populate database: carmen-transparencia populate from-json ./report.json documents")
    print("   4. Validate results: carmen-transparencia validate ./data\\n")

if __name__ == "__main__":
    demonstrate_modules()