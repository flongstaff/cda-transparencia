# Official Data Sources Analysis

## Primary Official Portal
URL: https://carmendeareco.gob.ar/transparencia/

### Typical Sections Found on Municipal Transparency Portals:
1. **Declaraciones Juradas Patrimoniales** (Property Declarations)
2. **Presupuesto y Ejecución** (Budget and Execution)
3. **Licitaciones Públicas** (Public Tenders)
4. **Sueldos y Remuneraciones** (Salaries and Compensation)
5. **Informes y Reportes** (Reports and Studies)
6. **Resoluciones y Ordenanzas** (Resolutions and Ordinances)
7. **Deuda Municipal** (Municipal Debt)
8. **Inversiones y Activos** (Investments and Assets)
9. **Gastos Operativos** (Operational Expenses)
10. **Tasas y Derechos** (Fees and Rights)

## Recommended Data Organization Structure

### For GitHub Repository (Reduced, Essential Files Only)

```
data/
├── source_materials/
│   ├── declarations/
│   ├── budgets/
│   ├── tenders/
│   ├── salaries/
│   ├── reports/
│   ├── debt/
│   ├── investments/
│   ├── operational_expenses/
│   ├── fees_rights/
│   └── resolutions/
├── web_archives/
│   └── [Only critical/snapshot documents]
└── README.md
```

## Data Curation Guidelines

### What to Keep:
1. **Official documents** from municipal website
2. **Verified documents** with clear provenance
3. **Structured data files** (Excel, CSV) that can be processed
4. **Key PDF reports** that contain unique information
5. **Legal documents** (ordinances, resolutions) with official seals

### What to Remove:
1. **Duplicates** or redundant copies
2. **Large files** that can be re-downloaded from official sources
3. **Temporary files** or working documents
4. **Unclear provenance** documents without source information
5. **Broken links** or inaccessible files

### File Naming Convention:
- Use descriptive names: `DDJJ-2024-Intendente.pdf`
- Include year when applicable: `Presupuesto-2024.pdf`
- Use hyphens instead of spaces: `Informe-Trimestral-2024-Q1.pdf`
- Include document type: `Resolucion-1234-2024.pdf`

## Web Archive Strategy

### Critical Documents to Archive:
1. **Main transparency portal pages** (snapshots)
2. **Annual reports** that may be removed
3. **Budget documents** for historical reference
4. **Key legal documents** that establish policies
5. **Meeting minutes** and decisions

### Archive Frequency:
- **Monthly** snapshots of main transparency portal
- **Quarterly** comprehensive archiving
- **As-needed** for time-sensitive documents

## GitHub Repository Optimization

### Size Reduction Strategies:
1. **Remove duplicates** - Keep only one copy of each unique document
2. **Compress large files** when possible
3. **Link to external sources** instead of hosting large files
4. **Use Git LFS** for large binary files (>100MB)
5. **Organize by type and year** for easy navigation

### README Documentation:
Each directory should have a README.md file explaining:
- What type of documents are contained
- Date range of documents
- Source of documents
- Update frequency
- Contact for questions

## Implementation Plan

### Phase 1: Assessment
1. Review all current files in `/data/source_materials/`
2. Identify duplicates and redundant files
3. Categorize documents by type
4. Verify document authenticity and provenance

### Phase 2: Organization
1. Create proper directory structure
2. Move files to appropriate directories
3. Rename files with consistent naming convention
4. Remove unnecessary or duplicate files

### Phase 3: Documentation
1. Create README.md files for each directory
2. Document file sources and provenance
3. Create master index of all documents
4. Establish update procedures

### Phase 4: Archive Strategy
1. Identify critical documents for web archiving
2. Set up automated archiving processes
3. Document archive locations and access methods
4. Test restore procedures