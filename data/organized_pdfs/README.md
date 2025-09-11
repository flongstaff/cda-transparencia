# Organized PDF Documents

This directory contains all PDF documents from the Carmen de Areco municipal transparency portal, organized by year and category.

## Directory Structure

```
organized_pdfs/
├── {year}/                          # Document year (2017-2025)
│   ├── {category}/                  # Document category
│   │   └── {pdf_files}             # PDF documents
├── organization_summary.json       # Organization process summary
└── README.md                        # This file
```

## Document Categories

1. **Ejecución_de_Gastos** - Expense execution reports
2. **Ejecución_de_Recursos** - Revenue execution reports
3. **Estados_Financieros** - Financial statements
4. **Presupuesto_Municipal** - Municipal budget documents
5. **Recursos_Humanos** - Human resources documents (payroll, salaries)
6. **Contrataciones** - Procurement and contracting documents
7. **Declaraciones_Patrimoniales** - Asset declarations
8. **Salud_Pública** - Public health documents (CAIF reports)
9. **Documentos_Generales** - General documents that don't fit other categories

## Key Features

- **No Duplicates**: All files have been checked for duplicates using SHA256 hashing
- **Properly Categorized**: Files are organized by year and document category
- **Complete Collection**: All 168 PDF documents have been organized
- **Easy Navigation**: Clear directory structure for finding documents by year and type

## Summary Statistics

- **Total Documents**: 168
- **Years Covered**: 2017-2025
- **Categories**: 9 main document types
- **Duplicates**: 0 (all files are unique)

## File Naming

Document names generally follow the pattern from the municipal website:
- `{Document Type} {Period} {Year}.pdf`
- Example: `ESTADO-DE-EJECUCION-DE-GASTOS-2023-4°TRI.pdf`

## Data Sources

The documents were collected from:
- `http://carmendeareco.gob.ar/wp-content/uploads/{year}/{document}`

## Maintenance

To update this collection:
1. Add new PDF files to `/data/pdf_extracts/`
2. Run the organization script: `python /scripts/organize_pdfs.py`