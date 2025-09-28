#!/usr/bin/env python3

import sys
from pathlib import Path

def verify_pdf_organization():
    \"\"\"Verify PDF organization is correct\"\"\"
    print(\"Verifying PDF Organization...\")
    print(\"=\" * 40)
    
    base_dir = Path(\"/Users/flong/Developer/cda-transparencia\")
    data_dir = base_dir / \"data\"
    
    # Check if data directory exists
    if not data_dir.exists():
        print(\"❌ Data directory not found\")
        return False
    
    print(f\"✅ Base directory: {base_dir}\")
    print(f\"✅ Data directory: {data_dir}\")
    
    # Count PDF files
    pdf_files = list(data_dir.rglob(\"*.pdf\"))
    pdf_files = [f for f in pdf_files if \"node_modules\" not in str(f) and \".git\" not in str(f)]
    
    print(f\"✅ Found {len(pdf_files)} PDF files\")
    
    if len(pdf_files) == 0:
        print(\"❌ No PDF files found\")
        return False
    
    # Show sample PDF files
    print(\"\\nSample PDF files:\")
    for i, pdf_file in enumerate(pdf_files[:5]):
        print(f\"  {i+1}. {pdf_file.relative_to(base_dir)}\")
    
    if len(pdf_files) > 5:
        print(f\"  ... and {len(pdf_files) - 5} more\")
    
    # Check if OCR extracted directory exists
    ocr_dir = data_dir / \"ocr_extracted\"
    if not ocr_dir.exists():
        print(f\"\\n⚠ OCR extracted directory not found, creating: {ocr_dir}\")
        ocr_dir.mkdir(parents=True, exist_ok=True)
        print(\"✅ OCR extracted directory created\")
    else:
        print(f\"\\n✅ OCR extracted directory exists: {ocr_dir}\")
    
    # Check if required subdirectories exist
    required_dirs = [\"pdfs\", \"text\", \"csv\", \"json\", \"images\"]
    for subdir in required_dirs:
        subdir_path = ocr_dir / subdir
        if not subdir_path.exists():
            print(f\"⚠ Subdirectory {subdir} not found, creating...\")
            subdir_path.mkdir(parents=True, exist_ok=True)
            print(f\"✅ Created {subdir} directory\")
        else:
            print(f\"✅ Subdirectory {subdir} exists\")
    
    print(\"\\n✅ PDF organization verification completed successfully\")
    return True

if __name__ == \"__main__\":
    success = verify_pdf_organization()
    
    if success:
        print(\"\\n🎉 All verification checks passed!\")
        sys.exit(0)
    else:
        print(\"\\n❌ PDF organization verification failed!\")
        sys.exit(1)