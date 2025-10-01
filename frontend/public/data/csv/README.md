# CSV Data Directory Structure

This directory contains all CSV data files organized by category.

## Directory Structure

```
/csv/
├── budget/              # Budget execution and SEF data
│   ├── execution/       # Budget execution by period
│   ├── sef/            # Sistema Electrónico de Finanzas data
│   └── historical/     # Historical budget data
├── contracts/           # Contract and procurement data
│   ├── licitaciones/   # Public tender announcements
│   ├── adjudications/  # Contract awards
│   └── suppliers/      # Supplier information
├── salaries/            # Personnel and salary data
│   ├── personnel/      # Overall personnel data
│   └── positions/      # Position-specific data
├── treasury/            # Treasury and cash flow data
│   ├── cashflow/       # Cash flow statements
│   └── balances/       # Account balances
├── debt/                # Debt and obligation data
│   ├── obligations/    # Outstanding obligations
│   └── servicing/      # Debt service payments
└── documents/           # Document and report inventories
    ├── reports/        # Administrative reports
    └── inventory/      # Document inventories
```

## Data Integration

These CSV files are used by the frontend to provide comprehensive transparency data. The system:

1. **Prioritizes external APIs** for real-time data
2. **Uses local CSV files** as secondary sources
3. **Processes PDF documents** as tertiary sources
4. **Generates fallback data** when other sources are unavailable

## File Naming Convention

Files follow a consistent naming pattern:
- `category_year_period.extension` (e.g., `budget_2024_Q2.csv`)
- `subcategory_year.extension` (e.g., `sef_2024.csv`)
- `dataset_year_range.extension` (e.g., `historical_2019-2025.csv`)

## Data Quality

All CSV files are:
- Regularly updated from official sources
- Validated for accuracy and completeness
- Cross-referenced with external data sources
- Annotated with metadata for traceability
