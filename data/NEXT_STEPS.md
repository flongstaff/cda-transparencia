# Data Organization: Next Steps

## Immediate Actions

### 1. Run Existing Organization Scripts
First, let's leverage the existing scripts that were already created for this project:

```bash
# Navigate to project root
cd /Users/flong/Developer/cda-transparencia

# Run the material organization script
./scripts/organize_materials.sh

# Clean up duplicates
./scripts/cleanup_duplicates.sh

# Consolidate directories
./scripts/consolidate_directories.sh
```

### 2. Verify Current Structure
After running the scripts, check what was created:

```bash
# Check the organized materials
ls -la data/organized_materials/

# Check the source materials structure
find data/source_materials -type d | head -20
```

### 3. Identify Key Files to Keep
Based on our analysis, we should focus on these essential document types:

1. **Property Declarations** (Declaraciones Juradas Patrimoniales)
2. **Budget Documents** (Presupuestos y Ejecución)
3. **Public Tenders** (Licitaciones Públicas)
4. **Salary Information** (Escalas Salariales)
5. **Financial Reports** (Informes Económico-Financieros)
6. **Municipal Debt** (Deuda Municipal)
7. **Investments and Assets** (Inversiones y Activos)
8. **Operational Expenses** (Gastos Operativos)
9. **Fees and Rights** (Tasas y Derechos)
10. **Resolutions and Ordinances** (Resoluciones y Ordenanzas)

## Organization Strategy

### Recommended Directory Structure
```
data/
├── source_materials/
│   ├── declarations/          # Property declarations
│   ├── budgets/               # Budget documents
│   ├── tenders/               # Public tenders
│   ├── salaries/              # Salary information
│   ├── reports/               # Financial reports
│   ├── debt/                  # Municipal debt
│   ├── investments/           # Investments and assets
│   ├── operational_expenses/ # Operational expenses
│   ├── fees_rights/           # Fees and rights
│   ├── resolutions/           # Resolutions and ordinances
│   ├── web_archives/          # Web archive snapshots
│   └── README.md              # Documentation
└── processed_data/
    ├── json/                  # Structured JSON data
    ├── csv/                   # CSV formatted data
    └── README.md              # Documentation
```

## File Selection Criteria

### What to Keep:
1. **Official documents** from the municipal website
2. **Verified documents** with clear provenance
3. **Structured data files** that can be processed (Excel, CSV)
4. **Key PDF reports** that contain unique information
5. **Legal documents** with official seals and signatures

### What to Remove:
1. **Duplicates** or redundant copies
2. **Large files** that can be re-downloaded from official sources
3. **Temporary files** or working documents
4. **Unclear provenance** documents without source information
5. **Broken links** or inaccessible files

## Implementation Steps

### Phase 1: Assessment (Today)
1. Run existing organization scripts
2. Review created structure
3. Identify gaps and overlaps
4. Document current state

### Phase 2: Organization (Tomorrow)
1. Move files to recommended directories
2. Apply consistent naming convention
3. Remove duplicates and unnecessary files
4. Create documentation for each directory

### Phase 3: Web Archive Integration (Soon)
1. Identify critical documents for archiving
2. Set up automated archiving processes
3. Document archive locations
4. Test restore procedures

### Phase 4: GitHub Repository Optimization (Later)
1. Remove large unnecessary files
2. Link to external sources where appropriate
3. Use Git LFS for essential large files
4. Final organization for GitHub hosting

## Key Considerations

### Provenance and Reliability
- Always keep track of document sources
- Verify document authenticity before including
- Document any processing or transformations
- Maintain checksums for integrity verification

### Size Management
- Target repository size < 1GB for optimal GitHub performance
- Use external links for large files (>10MB)
- Compress files when possible
- Archive old versions rather than deleting

### Accessibility
- Use descriptive file names
- Include metadata in file names when possible
- Maintain consistent directory structure
- Provide clear documentation

## Success Metrics

### Organization Goals
- Reduce duplicate files by 80%
- Organize files into logical categories
- Apply consistent naming convention to 95% of files
- Create comprehensive documentation

### Repository Goals
- Reduce repository size by 50%
- Improve navigation and discoverability
- Ensure all files have clear provenance
- Make repository suitable for GitHub hosting

### Data Quality Goals
- Verify authenticity of 90% of included documents
- Extract structured data from 70% of PDF documents
- Create machine-readable versions of key data
- Establish update procedures for ongoing maintenance

By following this plan, we'll create a well-organized, reliable, and accessible data repository that maintains the integrity of the original sources while making them easy to use and verify.