# Development Guide

This guide provides information for developers who want to contribute to the Carmen de Areco Transparency Portal project.

## Project Architecture

### High-Level Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│   Data Sources  │───▶│  Data Processing │───▶│   Data Storage   │
│ (PDF, Excel,    │    │   (Python/Node)  │    │ (PostgreSQL/API) │
│  Web Scraping)  │    │                  │    │                  │
└─────────────────┘    └──────────────────┘    └──────────────────┘
                                │                         │
                                ▼                         ▼
                    ┌──────────────────┐    ┌──────────────────┐
                    │   REST API       │◀──▶│   Dashboard      │
                    │ (Node.js/Express)│    │ (React/Vite)     │
                    └──────────────────┘    └──────────────────┘
```

### Component Breakdown

1. **Frontend** (`frontend/`)
   - React + TypeScript + Vite
   - Responsive dashboard with data visualizations
   - Multi-language support (Spanish/English)

2. **Backend** (`backend/`)
   - Node.js + Express REST API
   - PostgreSQL database with Sequelize ORM
   - Data validation and processing

3. **Data Processing** (`scripts/`)
   - Python scripts for document processing
   - PDF/Excel to structured data conversion
   - Data validation and integrity checks

4. **Data Storage** (`data/`)
   - Structured data (JSON/CSV)
   - Markdown documents
   - Source materials archive

## Setting Up Development Environment

### Prerequisites

1. Install Node.js 18+ (Recommended: Use nvm)
2. Install Python 3.8+ (Recommended: Use pyenv)
3. Install Docker and Docker Compose
4. Install Git

### Repository Setup

```bash
# Fork the repository on GitHub
git clone https://github.com/YOUR_USERNAME/cda-transparencia.git
cd cda-transparencia

# Add upstream remote
git remote add upstream https://github.com/flongstaff/cda-transparencia.git
```

### Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Type checking
npm run typecheck

# Build for production
npm run build
```

### Backend Development

```bash
cd backend

# Install dependencies
npm install

# Start development server with auto-reload
npm run dev

# Run tests
npm test

# Run specific test
npm test -- --testNamePattern="budget"

# Database setup
npm run setup-db

# Populate with sample data
npm run populate-db
```

### Data Processing Development

```bash
cd scripts

# Install Python dependencies
pip install -r requirements.txt

# Install in development mode
pip install -e .

# Run processing scripts
python process_all.py

# Run specific processor
python processors/budget_processor.py
```

## Code Structure

### Frontend

```
frontend/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI components
│   ├── pages/              # Page components
│   ├── services/           # API service clients
│   ├── contexts/           # React contexts
│   ├── hooks/              # Custom hooks
│   ├── utils/              # Utility functions
│   ├── config/             # Configuration
│   ├── types/              # TypeScript types
│   ├── App.tsx             # Main application component
│   └── main.tsx            # Entry point
├── vite.config.ts          # Vite configuration
└── tsconfig.json           # TypeScript configuration
```

### Backend

```
backend/
├── src/
│   ├── controllers/        # Request handlers
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── middleware/         # Express middleware
│   ├── services/           # Business logic
│   ├── utils/              # Utility functions
│   ├── config/             # Configuration
│   └── server.js           # Server entry point
├── tests/                  # Test files
├── migrations/             # Database migrations
└── seeds/                  # Database seed data
```

### Data Processing Scripts

```
scripts/
├── processors/             # Document processors
├── scrapers/               # Data scrapers
├── validators/             # Data validators
├── converters/             # Format converters
├── utils/                  # Utility functions
├── config/                 # Configuration
└── process_all.py          # Main processing script
```

## Development Workflow

### 1. Feature Development

1. Create a feature branch
   ```bash
   git checkout -b feature/new-dashboard-widget
   ```

2. Make your changes
   - Follow the coding standards for each language
   - Write tests for new functionality
   - Update documentation if needed

3. Run tests
   ```bash
   # Frontend tests
   cd frontend && npm test

   # Backend tests
   cd backend && npm test

   # Data processing tests
   cd scripts && python -m pytest
   ```

4. Commit your changes
   ```bash
   git add .
   git commit -m "Add new dashboard widget for budget visualization"
   ```

5. Push and create a Pull Request
   ```bash
   git push origin feature/new-dashboard-widget
   ```

### 2. Bug Fixes

1. Create a fix branch
   ```bash
   git checkout -b fix/budget-calculation-error
   ```

2. Make your changes

3. Add a test that reproduces the bug

4. Fix the bug

5. Verify the test passes

6. Commit and push

### 3. Code Review Process

All changes must go through a Pull Request review process:

1. PR must have a clear description of changes
2. All tests must pass
3. Code must follow style guidelines
4. At least one reviewer must approve
5. CI/CD checks must pass

## Coding Standards

### JavaScript/TypeScript (Frontend & Backend)

1. **Formatting**: Use Prettier with default settings
2. **Linting**: Use ESLint with recommended rules
3. **Naming**: Use camelCase for variables/functions, PascalCase for classes/components
4. **Comments**: Use JSDoc for functions and classes
5. **Imports**: Sort alphabetically, group by type

### Python (Data Processing)

1. **Formatting**: Use Black formatter
2. **Linting**: Use Flake8
3. **Type Hints**: Use type annotations
4. **Naming**: Use snake_case for variables/functions, PascalCase for classes
5. **Documentation**: Use docstrings for modules, classes, and functions

### React Components

1. Use functional components with hooks
2. Use TypeScript interfaces for props
3. Break down complex components into smaller ones
4. Use React Context for state management when appropriate
5. Follow the Container/Presentational pattern

### Database Design

1. Use meaningful table and column names
2. Follow normalization principles
3. Add appropriate indexes
4. Use foreign key constraints
5. Document complex relationships

## Testing

### Frontend Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- src/components/FinancialChart.test.tsx

# Run tests with coverage
npm test -- --coverage
```

### Backend Testing

```bash
# Run all tests
npm test

# Run specific test file
npm test -- tests/controllers/budgetController.test.js

# Run tests with coverage
npm test -- --coverage
```

### Data Processing Testing

```bash
# Run all tests
python -m pytest

# Run specific test file
python -m pytest tests/test_budget_processor.py

# Run tests with coverage
python -m pytest --cov=processors
```

## Database Development

### Migrations

```bash
# Create a new migration
npx sequelize-cli migration:generate --name add-budget-table

# Run migrations
npx sequelize-cli db:migrate

# Undo last migration
npx sequelize-cli db:migrate:undo
```

### Seeding

```bash
# Create a new seed file
npx sequelize-cli seed:generate --name demo-budget-data

# Run all seeds
npx sequelize-cli db:seed:all

# Undo seeds
npx sequelize-cli db:seed:undo:all
```

## API Development

### Adding a New Endpoint

1. Create a controller in `backend/src/controllers/`
2. Add routes in `backend/src/routes/`
3. Update API documentation in `docs/api/`
4. Add tests in `backend/tests/`

### Example Controller

```javascript
// backend/src/controllers/exampleController.js
const ExampleService = require('../services/exampleService');

class ExampleController {
  async getExamples(req, res, next) {
    try {
      const examples = await ExampleService.getAll();
      res.json({
        success: true,
        data: examples
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ExampleController();
```

## Data Processing Development

### Adding a New Processor

1. Create a processor in `scripts/processors/`
2. Add tests in `scripts/tests/`
3. Update documentation
4. Integrate into main processing pipeline

### Example Processor

```python
# scripts/processors/example_processor.py
import pandas as pd
from utils.logger import get_logger

logger = get_logger(__name__)

class ExampleProcessor:
    def process(self, data):
        """Process example data and return structured output."""
        logger.info("Processing example data")
        
        # Process data here
        processed_data = self._transform_data(data)
        
        return processed_data
    
    def _transform_data(self, data):
        # Implementation here
        pass

if __name__ == "__main__":
    processor = ExampleProcessor()
    result = processor.process(input_data)
    print(result)
```

## Internationalization (i18n)

The frontend supports multiple languages (Spanish and English).

### Adding New Translations

1. Add keys to `frontend/src/locales/es.json` and `frontend/src/locales/en.json`
2. Use the `useTranslation` hook in components
3. Update translation files as needed

### Example Usage

```typescript
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('dashboard.title')}</h1>
      <p>{t('dashboard.description')}</p>
    </div>
  );
};
```

## Performance Considerations

### Frontend

1. Use React.memo for components that render frequently
2. Implement lazy loading for routes and components
3. Optimize images and assets
4. Use code splitting
5. Implement proper error boundaries

### Backend

1. Use database indexing
2. Implement caching for frequently accessed data
3. Use connection pooling
4. Optimize database queries
5. Implement rate limiting

### Data Processing

1. Process files in chunks for large datasets
2. Use generators for memory efficiency
3. Implement progress tracking
4. Use multiprocessing where appropriate
5. Cache intermediate results

## Debugging

### Frontend Debugging

1. Use React DevTools browser extension
2. Use Redux DevTools if using Redux
3. Use browser developer tools
4. Add console.log statements temporarily
5. Use TypeScript for compile-time error checking

### Backend Debugging

1. Use console.log or a logging library
2. Use Node.js inspector
3. Use Postman or curl to test API endpoints
4. Check database directly with psql
5. Use debugging tools like ndb

### Data Processing Debugging

1. Use Python debugger (pdb)
2. Add logging statements
3. Use Jupyter notebooks for exploratory analysis
4. Validate intermediate results
5. Use unit tests to isolate issues

## Common Tasks

### Adding a New Data Source

1. Create a scraper in `scripts/scrapers/`
2. Add a processor in `scripts/processors/`
3. Update the main processing pipeline
4. Add tests
5. Update documentation

### Adding a New Dashboard Widget

1. Create a new component in `frontend/src/components/`
2. Add necessary API endpoints
3. Update the dashboard page
4. Add tests
5. Update documentation

### Adding a New API Endpoint

1. Create a controller in `backend/src/controllers/`
2. Add routes in `backend/src/routes/`
3. Update service layer if needed
4. Add tests
5. Update API documentation

## Contributing

Please read [CONTRIBUTING.md](../contributing/contributing-guide.md) for details on our code of conduct and the process for submitting pull requests.