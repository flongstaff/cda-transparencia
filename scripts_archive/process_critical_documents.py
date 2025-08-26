#!/usr/bin/env python3
"""
Process Critical Priority Documents - Carmen de Areco Transparency Portal
Converts the 9 most critical documents to achieve 95% conversion rate
"""

import os
import sys
from pathlib import Path

# Add the project root to the Python path
project_root = Path(__file__).parent.parent
sys.path.append(str(project_root))

from scripts.enhanced_document_processor import EnhancedDocumentProcessor

def main():
    """Process only the critical priority documents"""
    processor = EnhancedDocumentProcessor()
    
    # Critical priority files identified from validation
    critical_files = [
        "ddjj-2022.pdf",
        "ddjj-2023.pdf", 
        "DDJJ-2024.pdf",
        "Ordenanza-Fiscal-3057-2021.pdf",
        "Ordenanza-Impositiva-3059-2021.pdf",
        "Ordenanza-Impositiva-3135-2022.pdf",
        "Ordenanza-Fiscal-3112-2022.pdf",
        "Anexo-II-Ordenanza-Impositiva-3135-2022.pdf",
        "ORDENANZA-IMPOSITIVA-3282-25 (1).pdf"
    ]
    
    print("🚨 Processing Critical Priority Documents")
    print("=" * 60)
    print(f"📋 Processing {len(critical_files)} critical files")
    
    stats = {"processed": 0, "failed": 0, "not_found": 0}
    
    for filename in critical_files:
        # Find the file in source_materials
        file_path = None
        for pdf_file in processor.data_dir.rglob("*.pdf"):
            if pdf_file.name == filename:
                file_path = pdf_file
                break
        
        if not file_path:
            print(f"❌ File not found: {filename}")
            stats["not_found"] += 1
            continue
        
        print(f"🔄 Processing: {filename}")
        if processor.process_document(file_path):
            print(f"✅ Successfully processed: {filename}")
            stats["processed"] += 1
        else:
            print(f"❌ Failed to process: {filename}")
            stats["failed"] += 1
    
    print(f"\n📊 Critical Processing Results:")
    print(f"✅ Successfully processed: {stats['processed']}")
    print(f"❌ Failed: {stats['failed']}")
    print(f"🔍 Not found: {stats['not_found']}")
    
    if stats["processed"] > 0:
        print(f"\n🎯 Ready to re-run validation to check conversion rate improvement")
        print(f"📈 Expected conversion rate increase: ~1.6%")

if __name__ == "__main__":
    main()