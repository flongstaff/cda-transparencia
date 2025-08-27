-- Create tables in the transparency schema

-- Connect to the new database
\c transparency_portal;

-- Create documents table
CREATE TABLE IF NOT EXISTS transparency.documents (
    id SERIAL PRIMARY KEY,
    url TEXT UNIQUE,
    filename TEXT NOT NULL,
    location TEXT,
    size INTEGER,
    content_type TEXT,
    sha256 TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_verified TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'active'
);

CREATE INDEX IF NOT EXISTS idx_documents_filename ON transparency.documents(filename);
CREATE INDEX IF NOT EXISTS idx_documents_sha256 ON transparency.documents(sha256);

-- Create processed_files table
CREATE TABLE IF NOT EXISTS transparency.processed_files (
    id SERIAL PRIMARY KEY,
    document_id INTEGER,
    original_filename TEXT NOT NULL,
    processed_filename TEXT NOT NULL,
    processing_type TEXT NOT NULL,
    file_size INTEGER,
    processing_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    FOREIGN KEY (document_id) REFERENCES transparency.documents(id)
);

-- Create financial_data table
CREATE TABLE IF NOT EXISTS transparency.financial_data (
    id SERIAL PRIMARY KEY,
    document_id INTEGER,
    year INTEGER,
    amount DECIMAL(15,2),
    concept TEXT,
    category TEXT,
    date_extracted DATE,
    extraction_method TEXT,
    FOREIGN KEY (document_id) REFERENCES transparency.documents(id)
);

COMMENT ON TABLE transparency.documents IS 'Metadata about scraped documents';
COMMENT ON TABLE transparency.processed_files IS 'Tracks processed files (CSV, TXT, Markdown)';
COMMENT ON TABLE transparency.financial_data IS 'Extracted financial data';
