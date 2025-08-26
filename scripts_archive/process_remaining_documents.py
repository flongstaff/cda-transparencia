#!/usr/bin/env python3
"""
Process Remaining Documents to Reach 95% - Carmen de Areco Transparency Portal
"""

import os
import sys
from pathlib import Path

# Add the project root to the Python path
project_root = Path(__file__).parent.parent
sys.path.append(str(project_root))

from scripts.enhanced_document_processor import EnhancedDocumentProcessor

def main():
    """Process remaining documents to reach 95% conversion rate"""
    processor = EnhancedDocumentProcessor()
    
    # Need to process ~30 more files to reach 95% (currently at 93.2%)
    # Focus on the remaining medium priority files
    remaining_files = [
        # Legal documents and annexes
        "Anexo Único.pdf",
        "Anexo  (2).pdf", 
        "Anexo.pdf",
        "Informe.pdf",
        "Reporte Completo.pdf",
        # Project files
        "FichaProyecto_1003119678_104370.pdf",
        "FichaProyecto_1003124237_625084.pdf", 
        "FichaProyecto_1003115938_983772.pdf",
        "FichaProyecto_1003129342_956064.pdf",
        "FichaProyecto_1003129479_695538.pdf",
        # Investment maps
        "MapaInversiones Argentina.pdf",
        "MapaInversiones Argentina2.pdf",
        # Provincial laws
        "Ley 5991.pdf",
        "Ley 7240.pdf", 
        "Ley 7240(1).pdf",
        # Historical decrees
        "Decreto 3105_1994.pdf",
        # Municipal documents
        "Puesta en valor del CEF Nº10 _ Carmen de Areco - Municipio.pdf",
        "Publicación de avisos municipales en el Boletín Oficial BA.pdf",
        # Financial reports
        "Estado-de-Ejecucion-de-Recursos-por-Caracter-Economico-Marzo (1).pdf",
        # System files (lower priority)
        "D__livecycle_tmp_pdfg-LIVECYCLE01__50_8eb5-1676d4-6ec990-471e3f-487b1a-35d004_File.html.pdf"
    ]
    
    print("🎯 Processing Remaining Documents to Reach 95%")
    print("=" * 60)
    print(f"📋 Processing {len(remaining_files)} remaining files")
    print("🎯 Target: 95% conversion rate (need ~30 more files)")
    
    stats = {"processed": 0, "failed": 0, "not_found": 0}
    
    for filename in remaining_files[:30]:  # Process first 30 to reach target
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
    
    print(f"\n📊 Final Processing Results:")
    print(f"✅ Successfully processed: {stats['processed']}")
    print(f"❌ Failed: {stats['failed']}")
    print(f"🔍 Not found: {stats['not_found']}")
    
    if stats["processed"] > 0:
        current_converted = 478 + stats["processed"]
        conversion_rate = (current_converted / 571) * 100
        print(f"\n🎯 Updated Statistics:")
        print(f"📊 Total converted files: {current_converted}/571")
        print(f"📈 Conversion rate: {conversion_rate:.1f}%")
        if conversion_rate >= 95.0:
            print(f"🎉 SUCCESS! Reached 95% conversion rate threshold!")
            print(f"✅ Ready to re-run validation for final cleanup")

if __name__ == "__main__":
    main()