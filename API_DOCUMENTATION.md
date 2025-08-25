# Database API Endpoints

## Available Endpoints

### Documents
- `GET /api/documents` - List all documents with metadata
- `GET /api/documents/:id` - Get specific document details
- `GET /api/documents/:id/content` - Get document content by page

### Search
- `GET /api/search?q=:query` - Full-text search across all documents
- `GET /api/search/financial?amount=:amount` - Search financial data

### Categories
- `GET /api/categories` - List all document categories
- `GET /api/categories/:category` - Get documents by category

### Financial Data
- `GET /api/financial-data` - Get all extracted financial data
- `GET /api/financial-data/:year` - Get financial data by year

### Verification
- `GET /api/verification` - Get verification status for all documents
- `GET /api/verification/:id` - Get verification details for specific document

## Database Statistics
- Total documents processed: 317
- Categories available: 6
- Years covered: 2011-2025
