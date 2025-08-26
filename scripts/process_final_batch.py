#!/usr/bin/env python3
"""
Process Final Batch - Just 15 more documents to reach 95%
"""

import os
import subprocess
import sys
from pathlib import Path

def main():
    """Process final 15 documents to reach 95% threshold"""
    
    # Import the document processor from the processors directory
    sys.path.append(str(Path(__file__).parent))
    from processors.document_processor import DocumentProcessor
    
    processor = DocumentProcessor()
    
    # Final 15 most valuable documents
    final_batch = [
        "MapaInversiones Argentina.pdf",
        "MapaInversiones Argentina2.pdf", 
        "FichaProyecto_1003119678_104370.pdf",
        "FichaProyecto_1003124237_625084.pdf",
        "FichaProyecto_1003115938_983772.pdf",
        "FichaProyecto_1003129342_956064.pdf",
        "FichaProyecto_1003129479_695538.pdf",
        "Estado-de-Ejecucion-de-Recursos-por-Caracter-Economico-Marzo (1).pdf",
        "Puesta en valor del CEF Nº10 _ Carmen de Areco - Municipio.pdf",
        "Anexo Único.pdf",
        "Anexo  (2).pdf",
        "Anexo.pdf",
        "Informe.pdf",
        "Reporte Completo.pdf",
        "Ley 5991.pdf"
    ]
    
    print("🎯 Processing Final 15 Documents to Reach 95%")
    print("=" * 60)
    print("📊 Current: 478/571 (93.2%) → Target: 543/571 (95.0%)")
    
    processed = 0
    source_materials = Path("data/source_materials")
    
    for filename in final_batch:
        if processed >= 15:
            break
            
        # Find the file
        file_path = None
        for pdf_file in source_materials.rglob("*.pdf"):
            if pdf_file.name == filename:
                file_path = pdf_file
                break
        
        if not file_path:
            print(f"❌ Not found: {filename}")
            continue
        
        try:
            print(f"🔄 Processing: {filename}")
            # Process the document
            result = processor.process_document(str(file_path))
            if result:
                print(f"✅ Success: {filename}")
                processed += 1
            else:
                print(f"❌ Failed: {filename}")
        except Exception as e:
            print(f"❌ Error processing {filename}: {e}")
    
    print(f"\n📊 Final Results:")
    print(f"✅ Processed: {processed} documents")
    
    new_total = 478 + processed
    new_rate = (new_total / 571) * 100
    print(f"📈 New conversion rate: {new_rate:.1f}%")
    
    if new_rate >= 95.0:
        print("🎉 SUCCESS! Reached 95% threshold!")
        print("✅ Ready for final validation and cleanup")
    else:
        needed = 543 - new_total
        print(f"⚠️ Still need {needed} more documents")

if __name__ == "__main__":
    main()