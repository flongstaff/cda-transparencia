# PDF Management System

This directory contains an optimized PDF management system for the Carmen de Areco Transparency Portal.

## Overview

The system implements:
- Content-based deduplication (removes files with identical content)
- Centralized storage with organized subdirectories
- Symbolic links to avoid file duplication
- Automated maintenance scripts

## Directory Structure

```
central_pdfs/              # Central PDF repository
├── originals/            # All unique PDF files (201 files)
├── by_year/              # Organized by document year
│   ├── 2019/
│   ├── 2020/
│   └── ... (2021-2025)
├── by_category/          # Organized by document type
│   ├── contrataciones/
│   ├── documentos_generales/
│   ├── ejecucion_gastos/
│   ├── ejecucion_recursos/
│   ├── estadisticas_salud/
│   ├── otros/
│   ├── recursos_humanos/
│   └── situacion_economica/
backups/pdfs/             # PDF backups
```

## Key Features

1. **Deduplication**: The system identified and removed 402 duplicate files based on content (not just filename)
2. **Centralized Storage**: All unique PDFs are stored in `central_pdfs/originals/`
3. **Organized Access**: Files are accessible through categorized directories
4. **Symbolic Links**: Other parts of the project use symbolic links to the central repository
5. **Cross-Platform Compatibility**: Works with GitHub Pages deployment through Cloudflare

## Maintenance

Regular maintenance ensures the system stays optimized:

```bash
# Run full maintenance (deduplication + backup + cleanup)
./maintain_pdfs.sh

# Or run individual commands:
python3 pdf_optimization_manager.py deduplicate   # Remove duplicates
python3 pdf_optimization_manager.py backup        # Create backup
python3 pdf_optimization_manager.py cleanup      # Remove old backups
python3 pdf_optimization_manager.py list         # List available backups
```

## Tracking Files

- `.pdf_content_registry.json`: Tracks file content hashes to identify duplicates
- `.pdf_location_registry.json`: Tracks file locations across the project

## Benefits

- Reduced disk usage by eliminating 400+ duplicate files
- Improved organization with logical categorization
- Easier maintenance with a single source of truth
- Better performance with fewer files to process
- Scalable system that accommodates new PDFs without duplication
- Compatible with GitHub Pages and Cloudflare deployment

## Adding New PDFs

To add new PDFs to the system:

1. Place the PDF in `central_pdfs/originals/`
2. Run `python3 pdf_optimization_manager.py deduplicate` to ensure no duplicates exist
3. The system will automatically organize the file in the appropriate subdirectories

The maintenance script will handle periodic cleanup and backups.