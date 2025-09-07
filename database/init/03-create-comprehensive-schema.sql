-- Comprehensive database schema for Carmen de Areco Transparency Portal
-- Based on the extensive JSON data structure

-- Create comprehensive tables for all data types

-- 1. DOCUMENTS TABLE (Enhanced)
CREATE TABLE IF NOT EXISTS transparency.documents (
    id SERIAL PRIMARY KEY,
    filename TEXT NOT NULL,
    title TEXT,
    year INTEGER,
    file_type TEXT,
    size_bytes BIGINT,
    category TEXT,
    document_type TEXT, -- budget, contract, salary, declaration, etc.
    
    -- File paths and URLs
    url TEXT,
    relative_path TEXT,
    absolute_path TEXT,
    official_url TEXT,
    archive_url TEXT,
    
    -- Verification and integrity
    sha256_hash TEXT UNIQUE,
    verification_status TEXT DEFAULT 'unverified',
    integrity_verified BOOLEAN DEFAULT false,
    
    -- Processing metadata  
    processing_date TIMESTAMP WITH TIME ZONE,
    created_date TIMESTAMP WITH TIME ZONE,
    modified_date TIMESTAMP WITH TIME ZONE,
    
    -- Status
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. BUDGET DATA TABLE
CREATE TABLE IF NOT EXISTS transparency.budget_data (
    id SERIAL PRIMARY KEY,
    document_id INTEGER REFERENCES transparency.documents(id),
    year INTEGER NOT NULL,
    
    -- Budget amounts
    budgeted_amount DECIMAL(15,2),
    executed_amount DECIMAL(15,2),
    execution_rate DECIMAL(5,2),
    
    -- Classification
    category TEXT, -- Personal, Obras Publicas, etc.
    subcategory TEXT,
    economic_character TEXT,
    functional_classification TEXT,
    funding_source TEXT, -- coparticipacion, recursos propios, etc.
    
    -- Quarterly breakdown
    q1_amount DECIMAL(15,2),
    q2_amount DECIMAL(15,2),
    q3_amount DECIMAL(15,2),
    q4_amount DECIMAL(15,2),
    
    -- Metadata
    extraction_method TEXT,
    confidence_score DECIMAL(3,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. SALARY DATA TABLE  
CREATE TABLE IF NOT EXISTS transparency.salary_data (
    id SERIAL PRIMARY KEY,
    document_id INTEGER REFERENCES transparency.documents(id),
    year INTEGER,
    month INTEGER,
    
    -- Employee info
    employee_name TEXT,
    position TEXT,
    department TEXT,
    cuil TEXT,
    
    -- Salary components
    basic_salary DECIMAL(10,2),
    additional_payments DECIMAL(10,2),
    deductions DECIMAL(10,2),
    net_salary DECIMAL(10,2),
    
    -- Module system
    salary_modules DECIMAL(8,2),
    module_value DECIMAL(8,2),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. CONTRACTS AND TENDERS TABLE
CREATE TABLE IF NOT EXISTS transparency.contracts (
    id SERIAL PRIMARY KEY,
    document_id INTEGER REFERENCES transparency.documents(id),
    
    -- Contract identification
    contract_number TEXT,
    tender_number TEXT,
    contract_type TEXT, -- licitacion, contratacion directa, etc.
    
    -- Contract details
    description TEXT,
    contractor_name TEXT,
    contractor_cuit TEXT,
    contract_amount DECIMAL(15,2),
    
    -- Dates
    tender_date DATE,
    award_date DATE,
    contract_start_date DATE,
    contract_end_date DATE,
    
    -- Status
    status TEXT, -- active, completed, cancelled
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. PROPERTY DECLARATIONS TABLE
CREATE TABLE IF NOT EXISTS transparency.property_declarations (
    id SERIAL PRIMARY KEY,
    document_id INTEGER REFERENCES transparency.documents(id),
    
    -- Official info
    official_name TEXT,
    position TEXT,
    cuil TEXT,
    year INTEGER,
    
    -- Declaration details
    real_estate_value DECIMAL(15,2),
    vehicles_value DECIMAL(15,2),
    bank_deposits DECIMAL(15,2),
    investments DECIMAL(15,2),
    other_assets DECIMAL(15,2),
    total_assets DECIMAL(15,2),
    
    -- Liabilities
    debts DECIMAL(15,2),
    
    declaration_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. FINANCIAL REPORTS TABLE
CREATE TABLE IF NOT EXISTS transparency.financial_reports (
    id SERIAL PRIMARY KEY,
    document_id INTEGER REFERENCES transparency.documents(id),
    
    report_type TEXT, -- balance, income_statement, cash_flow, etc.
    year INTEGER,
    period TEXT, -- monthly, quarterly, annual
    period_number INTEGER,
    
    -- Financial metrics
    total_income DECIMAL(15,2),
    total_expenses DECIMAL(15,2),
    net_result DECIMAL(15,2),
    
    -- Assets and liabilities
    current_assets DECIMAL(15,2),
    non_current_assets DECIMAL(15,2),
    current_liabilities DECIMAL(15,2),
    non_current_liabilities DECIMAL(15,2),
    equity DECIMAL(15,2),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. PUBLIC WORKS AND INVESTMENTS TABLE
CREATE TABLE IF NOT EXISTS transparency.public_works (
    id SERIAL PRIMARY KEY,
    document_id INTEGER REFERENCES transparency.documents(id),
    
    -- Project info
    project_name TEXT,
    project_description TEXT,
    project_type TEXT, -- infrastructure, equipment, etc.
    location TEXT,
    
    -- Financial details
    budgeted_amount DECIMAL(15,2),
    executed_amount DECIMAL(15,2),
    execution_percentage DECIMAL(5,2),
    
    -- Dates
    project_start_date DATE,
    planned_completion_date DATE,
    actual_completion_date DATE,
    
    -- Status
    status TEXT, -- planning, in_progress, completed, cancelled
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. DATA SOURCES AND VERIFICATION TABLE
CREATE TABLE IF NOT EXISTS transparency.data_sources (
    id SERIAL PRIMARY KEY,
    
    source_name TEXT,
    source_type TEXT, -- official_site, pdf_extraction, manual_entry
    source_url TEXT,
    
    -- Verification
    last_verified TIMESTAMP WITH TIME ZONE,
    verification_method TEXT,
    is_active BOOLEAN DEFAULT true,
    
    -- Metadata
    scraping_frequency TEXT,
    reliability_score DECIMAL(3,2),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. PROCESSING LOG TABLE
CREATE TABLE IF NOT EXISTS transparency.processing_log (
    id SERIAL PRIMARY KEY,
    
    process_type TEXT, -- data_import, pdf_extraction, verification
    status TEXT, -- success, error, partial
    
    -- Details
    files_processed INTEGER DEFAULT 0,
    records_created INTEGER DEFAULT 0,
    records_updated INTEGER DEFAULT 0,
    errors_count INTEGER DEFAULT 0,
    
    -- Timing
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    
    -- Additional info
    error_details JSONB,
    processing_metadata JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_documents_year ON transparency.documents(year);
CREATE INDEX IF NOT EXISTS idx_documents_category ON transparency.documents(category);
CREATE INDEX IF NOT EXISTS idx_documents_type ON transparency.documents(document_type);
CREATE INDEX IF NOT EXISTS idx_documents_hash ON transparency.documents(sha256_hash);

CREATE INDEX IF NOT EXISTS idx_budget_year ON transparency.budget_data(year);
CREATE INDEX IF NOT EXISTS idx_budget_category ON transparency.budget_data(category);

CREATE INDEX IF NOT EXISTS idx_salary_year_month ON transparency.salary_data(year, month);

CREATE INDEX IF NOT EXISTS idx_contracts_year ON transparency.contracts USING BTREE (EXTRACT(YEAR FROM tender_date));

CREATE INDEX IF NOT EXISTS idx_declarations_year ON transparency.property_declarations(year);

CREATE INDEX IF NOT EXISTS idx_reports_year ON transparency.financial_reports(year);

-- Create views for common queries
CREATE OR REPLACE VIEW transparency.v_budget_summary AS
SELECT 
    year,
    category,
    SUM(budgeted_amount) as total_budgeted,
    SUM(executed_amount) as total_executed,
    AVG(execution_rate) as avg_execution_rate,
    COUNT(*) as record_count
FROM transparency.budget_data
GROUP BY year, category
ORDER BY year DESC, category;

CREATE OR REPLACE VIEW transparency.v_documents_by_year AS
SELECT 
    year,
    document_type,
    COUNT(*) as document_count,
    SUM(size_bytes) as total_size_bytes
FROM transparency.documents
GROUP BY year, document_type
ORDER BY year DESC, document_type;

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA transparency TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA transparency TO postgres;