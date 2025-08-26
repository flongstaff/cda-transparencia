# API Documentation

The Carmen de Areco Transparency Portal provides a RESTful API for accessing municipal transparency data programmatically.

## Base URL

```
https://flongstaff.github.io/cda-transparencia/api
```

For local development:
```
http://localhost:3000/api
```

## Authentication

All API endpoints are publicly accessible. No authentication is required.

## Rate Limiting

- **Anonymous requests:** 100 requests per hour
- **Contact us** for higher rate limits for research or commercial use

## Endpoints

### Financial Data

#### Get Budget Data
```
GET /budget
```

**Parameters:**
- `year` (optional): Filter by year (2009-2025)
- `quarter` (optional): Filter by quarter (1-4)
- `category` (optional): Filter by budget category

**Response:**
```json
{
  "data": [
    {
      "year": 2024,
      "quarter": 3,
      "category": "Public Works",
      "allocated": 15000000,
      "executed": 12500000,
      "percentage": 83.33
    }
  ],
  "total": 1,
  "timestamp": "2025-08-26T10:30:00Z"
}
```

#### Get Revenue Data
```
GET /revenue
```

**Parameters:**
- `year` (optional): Filter by year (2009-2025)
- `month` (optional): Filter by month (1-12)
- `source` (optional): Filter by revenue source

#### Get Expenditure Data
```
GET /expenditure
```

**Parameters:**
- `year` (optional): Filter by year (2009-2025)
- `month` (optional): Filter by month (1-12)
- `category` (optional): Filter by expenditure category

### Contracts

#### Get Public Contracts
```
GET /contracts
```

**Parameters:**
- `year` (optional): Filter by year (2009-2025)
- `status` (optional): Filter by status (open, closed, cancelled)
- `amount_min` (optional): Minimum contract amount
- `amount_max` (optional): Maximum contract amount

### Salaries

#### Get Salary Data
```
GET /salaries
```

**Parameters:**
- `year` (optional): Filter by year (2009-2025)
- `department` (optional): Filter by department
- `position` (optional): Filter by position

### Documents

#### Search Documents
```
GET /documents
```

**Parameters:**
- `query` (optional): Search text
- `year` (optional): Filter by year (2009-2025)
- `type` (optional): Filter by document type (budget, contract, report)
- `limit` (optional): Number of results (default: 10, max: 100)

#### Get Document by ID
```
GET /documents/{id}
```

**Response:**
```json
{
  "id": "doc_12345",
  "title": "2024 Q3 Budget Execution Report",
  "year": 2024,
  "type": "budget",
  "source": "Municipal Portal",
  "url": "https://carmendeareco.gob.ar/transparencia/budgets/2024-q3.pdf",
  "archive_url": "https://web.archive.org/web/20240901/carmendeareco.gob.ar/transparencia/budgets/2024-q3.pdf",
  "published_date": "2024-09-15",
  "processed_date": "2024-09-16",
  "file_size": 1024000,
  "checksum": "a1b2c3d4e5f6...",
  "data": {
    // Structured data extracted from document
  }
}
```

## Response Format

All API responses follow the same JSON structure:

```json
{
  "success": true,
  "data": {...},
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "timestamp": "2025-08-26T10:30:00Z"
  }
}
```

## Error Handling

All errors follow the standard format:

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found",
    "details": "The requested document does not exist"
  }
}
```

## Examples

### JavaScript (Fetch API)
```javascript
// Get budget data for 2024
fetch('/api/budget?year=2024')
  .then(response => response.json())
  .then(data => console.log(data));

// Search for contracts
fetch('/api/contracts?amount_min=100000&status=open')
  .then(response => response.json())
  .then(data => console.log(data));
```

### Python (requests)
```python
import requests

# Get salary data
response = requests.get('http://localhost:3000/api/salaries', params={'year': 2024})
data = response.json()
print(data)
```

## Data Licensing

All data is provided under the [Open Data Commons Attribution License](https://opendatacommons.org/licenses/by/1.0/). Proper attribution is required when using this data.