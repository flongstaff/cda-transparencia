#!/usr/bin/env python3
"""
Process High Priority Documents - Carmen de Areco Transparency Portal
Converts high priority statistical and administrative documents
"""

import os
import sys
from pathlib import Path

# Add the project root to the Python path
project_root = Path(__file__).parent.parent
sys.path.append(str(project_root))

from scripts.enhanced_document_processor import EnhancedDocumentProcessor

def main():
    """Process high priority statistical and administrative documents"""
    processor = EnhancedDocumentProcessor()
    
    # High priority files for economic and administrative transparency
    high_priority_files = [
        "STOCK-DE-GANADERIA.pdf",
        "PROYECCION-DE-POBLACION-CARMEN-DE-ARECO.pdf", 
        "PRODUCCION-AGRICOLA-CARMEN-DE-ARECO.pdf",
        "SUPERFICIES-COSECHADAS-CARMEN-DE-ARECO.pdf",
        "CONSULTAS-DE-LAS-CAPS-CARMEN-DE-ARECO.pdf",
        "ADMINISTRACION PUBLICA.pdf",
        "BROMATOLOGIA.pdf"
    ]
    
    print("📈 Processing High Priority Documents")
    print("=" * 60)
    print(f"📋 Processing {len(high_priority_files)} high priority files")
    
    stats = {"processed": 0, "failed": 0, "not_found": 0}
    
    for filename in high_priority_files:
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
    
    print(f"\n📊 High Priority Processing Results:")
    print(f"✅ Successfully processed: {stats['processed']}")
    print(f"❌ Failed: {stats['failed']}")
    print(f"🔍 Not found: {stats['not_found']}")
    
    if stats["processed"] > 0:
        print(f"\n🎯 Ready to re-run validation to check overall conversion rate")
        print(f"📈 Total documents processed in both phases: {9 + stats['processed']}")

if __name__ == "__main__":
    main()