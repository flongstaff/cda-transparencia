# Organized Documents Directory

This directory contains all documents from the Carmen de Areco transparency portal, organized by:

1. **Year** (2000-2025)
2. **Category** (9 main categories based on document type)
3. **File Type** (pdf, markdown, json, csv)

## Directory Structure

```
organized_documents/
├── {year}/
│   ├── {category}/
│   │   ├── pdf/
│   │   ├── markdown/
│   │   ├── json/
│   │   └── csv/
├── organization_summary.json
└── README.md
```

## Categories

1. **Ejecución_de_Gastos** - Expense execution reports
2. **Ejecución_de_Recursos** - Revenue execution reports
3. **Estados_Financieros** - Financial statements
4. **Presupuesto_Municipal** - Municipal budget documents
5. **Recursos_Humanos** - Human resources documents (payroll, salaries)
6. **Contrataciones** - Procurement and contracting documents
7. **Declaraciones_Patrimoniales** - Asset declarations
8. **Salud_Pública** - Public health documents (CAIF reports)
9. **Documentos_Generales** - General documents that don't fit other categories

## File Types

- **pdf** - Original PDF documents from the municipal website
- **markdown** - Markdown conversions of PDF documents for easier reading
- **json** - Structured data extracted from PDF documents
- **csv** - Tabular data extracted from PDF documents

## Summary

- Total files organized: 394
- Years covered: 2000-2025
- File types: JSON (132), Markdown (262)
- Categories: 9 main document types

## Usage

Each document is organized to make it easy to:
1. Find documents by year
2. Filter by document category
3. Access different formats of the same document
4. Track official document URLs

The organization follows the URL structure of the original documents:
`http://carmendeareco.gob.ar/wp-content/uploads/{year}/{document_name}.pdf`

For documents with month directories:
`http://carmendeareco.gob.ar/wp-content/uploads/{year}/{month}/{document_name}.pdf`