# Data Organization Plan

## Current State Analysis

The data in `/data/source_materials/` is currently organized in a mixed structure:
1. Year-based directories (2018-2025) with various documents
2. Topic-based directories (budgets, declarations, tenders, etc.)
3. Mixed file types (PDFs, Excel files, etc.)

## Proposed Organization Structure

```
data/
├── source_materials/
│   ├── declarations/           # Property declarations (DDJJ)
│   ├── budgets/               # Budget documents and execution reports
│   ├── tenders/               # Public tender documents
│   ├── salaries/              # Salary scales and compensation data
│   ├── reports/               # General reports and studies
│   ├── debt/                  # Municipal debt documents
│   ├── investments/           # Investment and asset documents
│   ├── operational_expenses/  # Operational expense reports
│   ├── fees_rights/           # Fees and rights documentation
│   ├── resolutions/          # Resolutions and ordinances
│   ├── web_archives/          # Archived versions of important documents
│   └── README.md              # Documentation of organization
└── processed_data/            # Structured data extracted from source materials
    ├── json/                  # JSON formatted data
    ├── csv/                   # CSV formatted data
    └── README.md              # Documentation of processed data

## File Naming Convention

To ensure consistency and easy identification:

1. **Declarations**: `DDJJ-{YEAR}-{OFFICIAL_POSITION}.{ext}`
   Example: `DDJJ-2024-Intendente.pdf`

2. **Budgets**: `PRESUPUESTO-{YEAR}-APROBADO.{ext}` or `EJECUCION-{YEAR}-Q{QUARTER}.{ext}`
   Example: `PRESUPUESTO-2024-APROBADO.pdf`

3. **Tenders**: `LICITACION-PUBLICA-N{NUMBER}.{ext}`
   Example: `LICITACION-PUBLICA-N10.pdf`

4. **Salaries**: `ESCALA-SALARIAL-{MONTH}-{YEAR}.{ext}`
   Example: `ESCALA-SALARIAL-FEBRERO-2024.pdf`

5. **Reports**: `INFORME-{TYPE}-{PERIOD}.{ext}`
   Example: `INFORME-TRIMESTRAL-Q1-2024.pdf`

6. **Debt**: `STOCK-DE-DEUDA-{PERIOD}.{ext}`
   Example: `STOCK-DE-DEUDA-2024.xlsx`

7. **Investments**: `INVERSION-{TYPE}-{YEAR}.{ext}`
   Example: `INVERSION-ACTIVOS-2024.pdf`

## Cleanup Strategy

### Phase 1: Assessment
1. Identify duplicate files
2. Verify document authenticity and provenance
3. Categorize uncategorized files
4. Remove broken or corrupted files

### Phase 2: Organization
1. Move files to appropriate directories based on content
2. Rename files using consistent naming convention
3. Create README.md files for each directory
4. Update main documentation

### Phase 3: Web Archive Integration
1. Identify critical documents for archiving
2. Set up automated archiving processes
3. Document archive locations and access methods
4. Test restore procedures

### Phase 4: GitHub Repository Optimization
1. Remove unnecessary large files
2. Link to external sources instead of hosting large files
3. Use Git LFS for essential large binary files
4. Organize by type and year for easy navigation

## Implementation Plan

### Using Existing Scripts
The project already has several scripts that can help with organization:

1. **organize_materials.sh**: Already moves key files to organized structure
2. **cleanup_duplicates.sh**: Removes duplicate files
3. **consolidate_directories.sh**: Combines similar directories

### Running the Organization Process

1. First, run the existing organize_materials.sh script to create a basic structure:
   ```bash
   ./scripts/organize_materials.sh
   ```

2. Then, run cleanup scripts to remove duplicates:
   ```bash
   ./scripts/cleanup_duplicates.sh
   ```

3. Finally, consolidate directories:
   ```bash
   ./scripts/consolidate_directories.sh
   ```

## Verification Process

After organization, verify:
1. All files are in correct directories
2. File names follow consistent convention
3. No duplicates remain
4. README.md files are updated
5. Links in documentation still work