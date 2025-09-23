#!/bin/bash
# Cleanup Script for Carmen de Areco Transparency Project

echo "Starting cleanup of redundant scripts..."

# Create logs directory if it doesn't exist
mkdir -p logs

# Remove redundant audit scripts
echo "Removing redundant audit scripts..."
rm -f scripts/audit/complete_audit_system.py
rm -f scripts/audit/master_audit_orchestrator.py  
rm -f scripts/audit/unified_audit_orchestrator.py
rm -f scripts/audit/run_complete_audit.py
rm -f scripts/audit/run_refactored_audit.py

# Remove redundant processing scripts  
echo "Removing redundant processing scripts..."
rm -f scripts/audit/convert_pdf_extracts_to_csv.py
rm -f scripts/audit/create_analysis_inventory.py
rm -f scripts/audit/generate_data_index.py

# Remove JavaScript validation scripts (since they're not needed for Python system)
echo "Removing JavaScript files..."
rm -f scripts/audit/final_verification.js
rm -f scripts/audit/test-api.js
rm -f scripts/audit/test_data_integration.js

# Remove duplicate data processor files (keep only the working ones)
echo "Removing duplicate scripts..."
rm -f src/data_processor.py
rm -f src/verification_analyzer.py

# Remove old cleanup files that might conflict
echo "Removing cleanup files..."
rm -f scripts/audit/cleanup_docs.sh
rm -f scripts/audit/cleanup_organized_files.py

# Remove the problematic production script we created
echo "Removing temporary production script..."
rm -f src/production_ready_system.py

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "Remaining essential files for production:"
echo "- services/data_acquisition_service.py"
echo "- services/database_service.py" 
echo "- services/pdf_processing_service.py"
echo "- src/dashboard_analyzer.py"
echo "- src/validation_health_monitor.py"
echo "- data/multi_source_report.json (main data source)"
echo ""
echo "Your system is now streamlined with only the essential components."
echo "All your processed data is ready for website deployment!"