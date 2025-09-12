# Carmen de Areco Transparency Portal - Document Structure

This document provides a comprehensive mapping of all available documents from the [Carmen de Areco Municipal Website](https://carmendeareco.gob.ar/transparencia/), organized by year and category, as presented in the Transparency Portal.

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

## Document Storage Structure

Documents are stored using two different URL patterns:

### Pattern 1: Year-Only Structure (Primary)
`http://carmendeareco.gob.ar/wp-content/uploads/{year}/{filename}.pdf`

Example: `http://carmendeareco.gob.ar/wp-content/uploads/2023/ESTADO-DE-EJECUCION-DE-GASTOS-3°TRIMESTRE.pdf`

### Pattern 2: Year/Month Structure (Secondary)
`http://carmendeareco.gob.ar/wp-content/uploads/{year}/{month}/{filename}.pdf`

Example: `http://carmendeareco.gob.ar/wp-content/uploads/2020/05/2019.pdf`
Example: `http://carmendeareco.gob.ar/wp-content/uploads/2024/07/Situacion-Economico-Financiera-al-30-06-24-1.pdf`

## Available Years
- 2018
- 2019
- 2020
- 2021
- 2022
- 2023
- 2024
- 2025

## Document Categories

### 1. Ejecución Presupuestaria (Budget Execution)
Financial reports detailing the execution of municipal expenses and revenues:
- Monthly and quarterly execution reports
- Execution by economic classification
- Gender perspective spending analysis
- Finalidad y Funcion (Purpose and Function) breakdowns
- Fuente de Financiamiento (Funding Source) analysis

### 2. Estados Financieros (Financial Statements)
Comprehensive financial statements including:
- Balance sheets
- Income statements
- Cash flow statements
- Notes to financial statements

### 3. Recursos Humanos (Human Resources)
Personnel-related documents including:
- Salary scales
- Payroll reports
- Staffing levels

### 4. Contrataciones (Procurement)
Public bidding and contracting documents including:
- Tender announcements
- Contract awards
- Procurement procedures

### 5. Declaraciones Patrimoniales (Asset Declarations)
Sworn asset declarations from municipal officials as required by law.

### 6. Documentos Generales (General Documents)
Miscellaneous documents that don't fit into other categories, including:
- Fiscal and tax ordinances
- Administrative resolutions
- General financial reports

## File Naming Convention

Documents follow a naming pattern that typically includes:
- Category identifier (e.g., "ESTADO DE EJECUCION DE GASTOS")
- Period reference (e.g., "3°TRIMESTRE", "JUNIO", "MARZO")
- Year when not part of the directory structure

Example: `ESTADO-DE-EJECUCION-DE-GASTOS-3°TRIMESTRE.pdf`

## Access Patterns

All documents are accessible through the municipal website using one of these URL structures:
1. `http://carmendeareco.gob.ar/wp-content/uploads/{year}/{document_name}.pdf`
2. `http://carmendeareco.gob.ar/wp-content/uploads/{year}/{month}/{document_name}.pdf`

Examples:
- `http://carmendeareco.gob.ar/wp-content/uploads/2023/ESTADO-DE-EJECUCION-DE-GASTOS-3°TRIMESTRE.pdf`
- `http://carmendeareco.gob.ar/wp-content/uploads/2020/05/2019.pdf`
- `http://carmendeareco.gob.ar/wp-content/uploads/2024/07/Situacion-Economico-Financiera-al-30-06-24-1.pdf`

## Data Index Files

The system maintains organized indexes of all documents in JSON format at:
`/data/pdf_extracts/`

Index files include:
- `data_index.json` - Complete index of all documents
- `data_index_{year}.json` - Index of documents for a specific year
- `data_index_{category}.json` - Index of documents for a specific category (with spaces replaced by underscores)

Each index contains detailed metadata including:
- Document title
- Direct URL
- Year
- Category
- File size
- Description