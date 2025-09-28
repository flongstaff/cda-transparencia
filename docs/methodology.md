# Data Processing Methodology

## Overview
This document outlines the methodology used to parse PDFs, handle inconsistencies, and process data from the Carmen de Areco transparency portal and related municipal sources.

## Data Collection Pipeline

### 1. PDF Processing Workflow

#### a. Source Identification
- Locate all `Situacion-Economico-Financiera-*.pdf` files from municipal portal
- Identify other relevant PDF documents (annual reports, procurement documents, etc.)
- Organize files by year and document type

#### b. PDF Parsing with pdfplumber
We use pdfplumber to extract tables from PDFs as it performs well with structured financial documents:

```python
def extract_tables_from_pdf(pdf_path: str, output_csv: str = None) -> list:
    all_tables = []
    
    with pdfplumber.open(pdf_path) as pdf:
        for page_num, page in enumerate(pdf.pages):
            tables = page.extract_tables()
            for table_idx, table in enumerate(tables):
                if table and len(table) > 0:  # Check if table is not empty
                    headers = table[0]  # First row as header
                    data_rows = table[1:]  # Remaining rows as data
                    
                    # Replace None headers with generic names
                    headers = [f"Column_{i}" if h is None else h for i, h in enumerate(headers)]
                    df = pd.DataFrame(data_rows, columns=headers)
                    
                    # Add metadata columns
                    df['extraction_date'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                    df['source_file'] = os.path.basename(pdf_path)
                    df['source_page'] = page_num + 1
                    df['table_number'] = table_idx + 1
                    all_tables.append(df)
```

#### c. Data Extraction Considerations
- Preserve page and table context for quality assurance
- Handle multi-page tables that span across pages
- Capture table headers consistently, even when they span multiple rows
- Maintain original data structure while adding provenance metadata

### 2. Data Cleaning and Standardization

#### a. Monetary Value Processing
Financial documents often contain inconsistent currency formatting. Our cleaning process handles:

```python
def clean_monetary_values(df: pd.DataFrame, monetary_columns: List[str]) -> pd.DataFrame:
    for col in monetary_columns:
        if col in df.columns:
            # Remove currency symbols, spaces, and other non-numeric characters except commas and periods
            df[col] = df[col].astype(str).str.replace(r'[^\d,.-]', '', regex=True)
            
            # Handle different decimal separators (comma vs period)
            # If there are multiple commas, assume last one is decimal separator
            df[col] = df[col].apply(lambda x: x.replace(',', '.') if x.count('.') == 0 and x.count(',') == 1 else x.replace(',', ''))
            
            # Convert to numeric, handling any remaining issues
            df[col] = pd.to_numeric(df[col], errors='coerce')
    
    return df
```

#### b. Sector Name Harmonization
Municipal documents may use inconsistent sector names. We standardize them using:

```python
def standardize_sector_names(df: pd.DataFrame, sector_column: str) -> pd.DataFrame:
    if sector_column in df.columns:
        # Define mapping of variations to standard names
        sector_mapping = {
            'Educación': 'Educacion',
            'Educacion y Deportes': 'Educacion',
            'Educación y Deportes': 'Educacion',
            'Desarrollo Social': 'Desarrollo Social',
            'Salud': 'Salud',
            'Hacienda': 'Hacienda',
            'Gobierno': 'Gobierno',
            'Obras y Servicios Públicos': 'Obras y Servicios Publicos',
            'Obras y Servicios Publicos': 'Obras y Servicios Publicos',
            'Planeamiento': 'Planeamiento',
        }
        
        df[sector_column] = df[sector_column].replace(sector_mapping)
    
    return df
```

#### c. Column Name Standardization
To ensure consistency across datasets:

```python
def standardize_columns(df: pd.DataFrame, column_mapping: Dict[str, str] = None) -> pd.DataFrame:
    # Remove special characters from column names and standardize them
    df.columns = df.columns.str.replace(r'[^\w\s-]', '_', regex=True)
    df.columns = df.columns.str.replace(r'\s+', '_', regex=True)
    df.columns = df.columns.str.strip('_')
    df.columns = [col.lower() for col in df.columns]
    
    # Apply custom mapping if provided
    if column_mapping:
        df = df.rename(columns=column_mapping)
    
    return df
```

### 3. Data Validation Process

#### a. Budget vs Execution Validation
A critical validation check ensures that budgeted amounts are not less than executed amounts:

```python
def validate_budget_execution(df: pd.DataFrame) -> list:
    errors = []
    
    if 'budget' in df.columns and 'execution' in df.columns:
        invalid_rows = df[df['budget'] < df['execution']]
        for idx, row in invalid_rows.iterrows():
            errors.append(f"Row {idx}: Budget ({row['budget']}) < Execution ({row['execution']})")
    
    return errors
```

#### b. Data Type Consistency
Ensure all columns maintain expected data types throughout the pipeline.

#### c. Range Validation
Verify that monetary values and other numeric fields fall within reasonable ranges.

### 4. Handling Inconsistencies

#### a. Column Structure Variations
Different years or document types may have variations in column structure. Our approach:

1. Identify common column patterns across documents
2. Create mapping rules for similar columns with different names
3. Standardize column names using a unified schema
4. Fill missing columns with null values where appropriate

#### b. Data Type Discrepancies
- Convert text representations of numbers to numeric types
- Handle different date formats (DD/MM/YYYY vs YYYY-MM-DD)
- Standardize currency symbols and decimal separators

#### c. Missing Data
- Document the reason for missing data when possible
- Use forward-fill or interpolation for time-series data where appropriate
- Mark data as null when not available rather than attempting to impute

### 5. Quality Assurance

#### a. Cross-Validation Between Sources
- Compare data from different document types that should match
- Identify inconsistencies between quarterly and annual reports
- Validate totals against component sums

#### b. Provenance Tracking
- Track source file for each data point
- Record extraction timestamp
- Maintain page number and table location information

#### c. Data Integrity Checks
- Verify referential integrity between related datasets
- Check for duplicate records
- Validate business logic (e.g., expenses don't exceed budget)

### 6. Documentation and Reproducibility

Every step of the process is documented with:
- Clear function docstrings
- Version control for all code changes
- Log files tracking data processing steps
- Data dictionaries for each processed file