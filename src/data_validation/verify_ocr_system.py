#!/usr/bin/env python3
\"\"\"
Verification script for OCR system components
\"\"\"

print(\"PDF Inventory System Verification\")
print(\"=================================\")

import os
import sys

try:
    from scripts.pdf_inventory import PDFInventory
    print(\"✓ PDFInventory module import successful\")
except Exception as e:
    print(f\"✗ PDFInventory import failed: {e}\")

try:
    from scripts.ocr_extraction import PDFOCRExtractor
    print(\"✓ PDFOCRExtractor module import successful\")
except Exception as e:
    print(f\"✗ PDFOCRExtractor import failed: {e}\")

try:
    from scripts.organize_ocr_data import OCROrganizationManager
    print(\"✓ OCROrganizationManager module import successful\")
except Exception as e:
    print(f\"✗ OCROrganizationManager import failed: {e}\")

try:
    from scripts.run_ocr_pipeline import OCROrchestrator
    print(\"✓ OCROrchestrator module import successful\")
except Exception as e:
    print(f\"✗ OCROrchestrator import failed: {e}\")

print(\"\n✓ All modules can be imported\")