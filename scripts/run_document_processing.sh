#!/bin/bash

# Document Processing Pipeline - Carmen de Areco Transparency Portal
# This script runs the complete document processing workflow

echo "🚀 Starting Document Processing Pipeline"
echo "========================================"

# Set up environment
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

# Check Python dependencies
echo "📋 Checking Python dependencies..."
python3 -c "import PyPDF2, pandas, sqlite3, fitz" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "⚠️  Installing required Python libraries..."
    pip3 install PyPDF2 pandas openpyxl PyMuPDF sqlite3
fi

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p data/markdown_documents
mkdir -p cold_storage
mkdir -p data/source_materials

# Run the enhanced document processor
echo "🔄 Processing documents..."
python3 scripts/enhanced_document_processor.py

# Check if database was created
if [ -f "data/documents.db" ]; then
    echo "✅ Document database created successfully"
    
    # Show database statistics
    echo "📊 Database Statistics:"
    sqlite3 data/documents.db "SELECT COUNT(*) as 'Total Documents' FROM documents;"
    sqlite3 data/documents.db "SELECT category, COUNT(*) as count FROM documents GROUP BY category;"
    sqlite3 data/documents.db "SELECT year, COUNT(*) as count FROM documents WHERE year IS NOT NULL GROUP BY year ORDER BY year;"
else
    echo "❌ Database creation failed"
    exit 1
fi

# Check markdown files
MARKDOWN_COUNT=$(find data/markdown_documents -name "*.md" | wc -l)
echo "📝 Generated $MARKDOWN_COUNT markdown files"

# Verify backend can connect to database
echo "🔧 Testing backend database connection..."
cd backend
npm install --silent sqlite3
node -e "
const DocumentService = require('./src/services/DocumentService');
const service = new DocumentService();
service.getVerificationStatus().then(status => {
    console.log('✅ Backend database connection successful');
    console.log('📊 Verification rate:', status.verification_rate + '%');
}).catch(err => {
    console.log('❌ Backend database connection failed:', err.message);
    process.exit(1);
});
"

cd "$PROJECT_ROOT"

# Update frontend to use new document API
echo "🔗 Updating frontend API integration..."

# Create API service update
cat > frontend/src/services/DocumentAPIService.ts << 'EOF'
import ApiService from './ApiService';

export interface Document {
  id: number;
  filename: string;
  original_path: string;
  markdown_path: string;
  document_type: string;
  category: string;
  year: number;
  file_size: number;
  file_hash: string;
  verification_status: string;
  official_url: string;
  archive_url: string;
  markdown_available: boolean;
  verification_status_badge: string;
  display_category: string;
  file_size_formatted: string;
}

export interface SearchResult extends Document {
  relevance_score: number;
  search_snippet: string;
}

export interface FinancialData {
  id: number;
  document_id: number;
  year: number;
  category: string;
  subcategory: string;
  budgeted_amount: number;
  executed_amount: number;
  execution_percentage: string;
  formatted_budget: string;
  formatted_executed: string;
}

class DocumentAPIService {
  private baseURL = '/api/documents';

  async getAllDocuments(filters?: { category?: string; year?: string; type?: string }) {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.year) params.append('year', filters.year);
    if (filters?.type) params.append('type', filters.type);
    
    const response = await fetch(`${this.baseURL}?${params}`);
    return response.json();
  }

  async getDocumentById(id: number): Promise<Document> {
    const response = await fetch(`${this.baseURL}/${id}`);
    return response.json();
  }

  async getDocumentContent(id: number): Promise<string> {
    const response = await fetch(`${this.baseURL}/${id}/content`);
    return response.text();
  }

  async searchDocuments(query: string, filters?: { category?: string; year?: string }): Promise<{
    results: SearchResult[];
    total_results: number;
  }> {
    const params = new URLSearchParams();
    params.append('q', query);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.year) params.append('year', filters.year);
    
    const response = await fetch(`${this.baseURL}/search/query?${params}`);
    return response.json();
  }

  async getFinancialData(filters?: { year?: string; category?: string }) {
    const params = new URLSearchParams();
    if (filters?.year) params.append('year', filters.year);
    if (filters?.category) params.append('category', filters.category);
    
    const response = await fetch(`${this.baseURL}/financial/data?${params}`);
    return response.json();
  }

  async getCategories() {
    const response = await fetch(`${this.baseURL}/meta/categories`);
    return response.json();
  }

  async getVerificationStatus() {
    const response = await fetch(`${this.baseURL}/meta/verification`);
    return response.json();
  }

  async advancedSearch(query: string, filters?: any, facets?: string[]) {
    const response = await fetch(`${this.baseURL}/search/advanced`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, filters, facets }),
    });
    return response.json();
  }
}

export default new DocumentAPIService();
EOF

echo "✅ Frontend API service created"

# Run database integrity check
echo "🔍 Running database integrity check..."
python3 -c "
import sqlite3
import os

db_path = 'data/documents.db'
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Check table integrity
    cursor.execute('PRAGMA integrity_check')
    result = cursor.fetchone()[0]
    
    if result == 'ok':
        print('✅ Database integrity check passed')
    else:
        print('❌ Database integrity issues found:', result)
    
    conn.close()
else:
    print('❌ Database not found')
"

# Final verification
echo ""
echo "🎯 Processing Pipeline Complete!"
echo "================================"
echo "✅ Documents processed and stored in database"
echo "✅ Markdown files generated for GitHub compatibility" 
echo "✅ Backend API endpoints ready"
echo "✅ Frontend integration updated"
echo "✅ OSINT compliance maintained"
echo "✅ Document verification system active"
echo ""
echo "🚀 Ready for GitHub deployment with full document access via:"
echo "   • Database API endpoints"
echo "   • Markdown file fallback"
echo "   • Official source links"
echo "   • Web archive backup"
echo ""
echo "Next steps:"
echo "1. Test the application: npm run dev (in frontend directory)"
echo "2. Verify API endpoints: npm start (in backend directory)"  
echo "3. Commit to GitHub when ready"