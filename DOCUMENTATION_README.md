# Carmen de Areco Transparency Portal - Document Structure Documentation

This directory contains documentation that maps and organizes all financial and administrative documents from the Carmen de Areco Municipal Website's transparency portal, as presented in the Transparency Portal.

## Files Overview

1. **DOCUMENT_STRUCTURE.md** - High-level overview of the document organization system and portal structure
2. **DETAILED_DOCUMENT_STRUCTURE.md** - Comprehensive listing of all documents by year and category
3. **DOCUMENT_INVENTORY_SUMMARY.md** - Statistical summary of document counts by year and category

## Portal Structure

The transparency portal consolidates municipal data into the following main sections:

### 1. Financial Management (Financial.tsx)
- **Ejecución Presupuestaria** (Budget Execution)
- **Deuda Pública** (Public Debt)
- **Estados Financieros** (Financial Statements)

### 2. Human Resources (Salaries.tsx)
- **Recursos Humanos** (Human Resources)

### 3. Procurement (Contracts.tsx)
- **Contrataciones** (Public Procurement)

### 4. Governance (PropertyDeclarations.tsx)
- **Declaraciones Patrimoniales** (Asset Declarations)

### 5. Document Repository (Documents.tsx)
- **Documentos Generales** (General Documents)

## Document Organization

Documents are organized using two different structures:

### Structure 1: Year-Only (Primary)
`http://carmendeareco.gob.ar/wp-content/uploads/{year}/{filename}.pdf`

### Structure 2: Year/Month (Secondary)
`http://carmendeareco.gob.ar/wp-content/uploads/{year}/{month}/{filename}.pdf`

The documents span from 2018-2025, with documents organized by:
- **Year** (2018-2025)
- **Category** (5 main categories based on the portal structure)

## Data Index Files

The system maintains organized indexes of all documents in JSON format at:
`/data/pdf_extracts/`

Index files include:
- `data_index.json` - Complete index of all documents
- `data_index_{year}.json` - Index of documents for a specific year
- `data_index_{category}.json` - Index of documents for a specific category (with spaces replaced by underscores)

## Maintenance

To update these documents:

1. Run the data index generation script:
   ```bash
   python scripts/generate_data_index.py
   ```

2. The script will automatically update all JSON index files in `/data/pdf_extracts/`

3. After running the script, update these documentation files by:
   - Checking the updated JSON files for any changes in document counts
   - Updating the detailed structure document with new files
   - Recalculating totals in the inventory summary

## Accessing Documents

Documents can be accessed directly through the web using either of these patterns:
1. `http://carmendeareco.gob.ar/wp-content/uploads/{year}/{document_name}.pdf`
2. `http://carmendeareco.gob.ar/wp-content/uploads/{year}/{month}/{document_name}.pdf`

Examples:
- `http://carmendeareco.gob.ar/wp-content/uploads/2023/ESTADO-DE-EJECUCION-DE-GASTOS-3°TRIMESTRE.pdf`
- `http://carmendeareco.gob.ar/wp-content/uploads/2020/05/2019.pdf`
- `http://carmendeareco.gob.ar/wp-content/uploads/2024/07/Situacion-Economico-Financiera-al-30-06-24-1.pdf`

## Categories

1. **Ejecución Presupuestaria** (Budget Execution)
2. **Estados Financieros** (Financial Statements)
3. **Recursos Humanos** (Human Resources)
4. **Contrataciones** (Procurement)
5. **Declaraciones Patrimoniales** (Asset Declarations)
6. **Documentos Generales** (General Documents)

## Contributing

To contribute to this documentation:
1. Fork the repository
2. Make your changes
3. Submit a pull request

Please ensure that any changes to the document structure are reflected in all three documentation files for consistency.