#!/usr/bin/env python3
"""
Process Final Documents to Reach 95% - Carmen de Areco Transparency Portal
"""

import os
import sys
from pathlib import Path

# Add the project root to the Python path
project_root = Path(__file__).parent.parent
sys.path.append(str(project_root))

from scripts.enhanced_document_processor import EnhancedDocumentProcessor

def main():
    """Process final documents to reach 95% conversion rate"""
    processor = EnhancedDocumentProcessor()
    
    # Process the highest-value remaining files
    final_batch = [
        "MapaInversiones Argentina.pdf",
        "MapaInversiones Argentina2.pdf", 
        "FichaProyecto_1003119678_104370.pdf",
        "FichaProyecto_1003124237_625084.pdf",
        "FichaProyecto_1003115938_983772.pdf",
        "FichaProyecto_1003129342_956064.pdf",
        "FichaProyecto_1003129479_695538.pdf",
        "Puesta en valor del CEF Nº10 _ Carmen de Areco - Municipio.pdf",
        "Estado-de-Ejecucion-de-Recursos-por-Caracter-Economico-Marzo (1).pdf",
        "Publicación de avisos municipales en el Boletín Oficial BA.pdf",
        "Anexo Único.pdf",
        "Anexo  (2).pdf",
        "Anexo.pdf",
        "Informe.pdf",
        "Reporte Completo.pdf",
        "Decreto 3105_1994.pdf",
        "Ley 5991.pdf",
        "Ley 7240.pdf",
        "Ley 7240(1).pdf"
    ]
    
    print("🎯 Processing Final Documents to Reach 95%")
    print("=" * 60)
    print(f"📋 Processing {len(final_batch)} final batch files")
    print("🎯 Current: 93.2% → Target: 95%+")
    
    stats = {"processed": 0, "failed": 0, "not_found": 0}
    
    for filename in final_batch:
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
        
        # Check if we've reached the target
        current_converted = 478 + stats["processed"]
        conversion_rate = (current_converted / 571) * 100
        if conversion_rate >= 95.0:
            print(f"🎉 TARGET REACHED! Conversion rate: {conversion_rate:.1f}%")
            break
    
    print(f"\n📊 Final Processing Results:")
    print(f"✅ Successfully processed: {stats['processed']}")
    print(f"❌ Failed: {stats['failed']}")
    print(f"🔍 Not found: {stats['not_found']}")
    
    current_converted = 478 + stats["processed"]
    conversion_rate = (current_converted / 571) * 100
    print(f"\n🎯 Final Statistics:")
    print(f"📊 Total converted files: {current_converted}/571")
    print(f"📈 Conversion rate: {conversion_rate:.1f}%")
    
    if conversion_rate >= 95.0:
        print(f"🎉 SUCCESS! Achieved 95%+ conversion rate!")
        print(f"✅ Ready for final validation and cleanup")

if __name__ == "__main__":
    main()