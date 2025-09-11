# Carmen de Areco Transparency Documents - Complete Organization

This repository contains all transparency documents from the Carmen de Areco municipal website, organized in a structured format for easy access and analysis.

## Organization Structure

The documents are organized in a hierarchical structure:

```
organized_documents/
├── {year}/                          # Document year (2000-2025)
│   ├── {category}/                  # Document category
│   │   ├── pdf/                     # Original PDF documents
│   │   ├── markdown/                # Markdown conversions
│   │   ├── json/                    # Structured JSON data
│   │   └── csv/                     # Tabular CSV data
├── document_inventory.json          # Detailed inventory of all documents
├── document_inventory.csv           # CSV version of inventory
├── inventory_summary.json           # Summary statistics
├── organization_summary.json        # Organization process summary
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

## Document Inventory

Each document in the inventory includes:
- **Year**: Document year
- **Category**: Document category
- **File Type**: Format (pdf, markdown, json, csv)
- **Filename**: Name of the file
- **Relative Path**: Location within the organized structure
- **Official URL**: Direct link to the original document on the municipal website
- **File Size**: Size of the file in bytes

## Summary Statistics

- **Total Documents**: 394
- **Years Covered**: 2000-2025
- **File Types**: JSON (132), Markdown (262)
- **Categories**: 9 main document types

## Key Features

1. **Cross-Referenced**: Each document is linked to its official URL on the municipal website
2. **Multiple Formats**: Documents are available in multiple formats for different use cases
3. **Structured Data**: JSON and CSV formats provide structured data for analysis
4. **Searchable**: Markdown format allows for easy text search
5. **Complete Inventory**: CSV and JSON inventories provide complete document listings

## Usage Examples

### Finding Documents by Year
All documents from 2023 are in `/organized_documents/2023/`

### Finding Documents by Category
All expense execution reports are in `/{year}/Ejecución_de_Gastos/`

### Accessing Different Formats
Each document is available in multiple formats:
- Original PDF: `/{year}/{category}/pdf/{filename}.pdf`
- Readable text: `/{year}/{category}/markdown/{filename}.md`
- Structured data: `/{year}/{category}/json/{filename}.json`
- Tabular data: `/{year}/{category}/csv/{filename}.csv`

### Getting Official Links
The inventory files (`document_inventory.json` and `document_inventory.csv`) contain the official URLs for each document, making it easy to verify sources or download originals.

## File Naming Convention

Document names generally follow the pattern from the municipal website:
- `{Document Type} {Period} {Year}.{extension}`
- Example: `ESTADO-DE-EJECUCION-DE-GASTOS-2023-4°TRI.pdf`

## Data Sources

The documents were collected from:
- `http://carmendeareco.gob.ar/wp-content/uploads/{year}/{document}`
- `http://carmendeareco.gob.ar/wp-content/uploads/{year}/{month}/{document}`

## Maintenance

To update this collection:
1. Run the web scrapers to collect new documents
2. Run the organization script to sort documents into the proper structure
3. Run the inventory script to update the inventory files

This organization makes it easy to track, verify, and analyze the municipal transparency documents over time.