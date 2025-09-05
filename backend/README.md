# Carmen de Areco Transparency Portal - Backend

Backend API for the Carmen de Areco Transparency Portal, designed for investigating municipal financial data from 2009-2025.

## Features

- **Excel Data Processing**: Extract and process financial data from Excel/CSV files
- **Live Data Synchronization**: Sync with official government transparency portals
- **Archive Data Mining**: Extract historical data from web archives (Wayback Machine, Archive.today)
- **PostgreSQL Integration**: Store and query processed transparency data
- **RESTful API**: Serve transparency data to frontend applications

## Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

3. Set up PostgreSQL database:
```bash
# Create database
createdb transparency_db

# Run setup script
npm run setup-db
```

## Available Scripts

### Data Processing
- `npm run process-excel` - Process Excel files with financial data
- `npm run sync-data` - Sync live data from official sources  
- `npm run archive-sync` - Sync historical data from web archives

### Database Operations
- `npm run setup-db` - Initialize database schema
- `npm run populate-db` - Populate database with sample data

### Development
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run test suite
- `npm run test-api` - Test API endpoints

## Usage Examples

### Processing Excel Data

```bash
# Process salary data for 2023
node src/process-excel-data.js /path/to/salaries_2023.xlsx salaries 2023

# Process operational expenses for 2022
node src/process-excel-data.js /path/to/expenses_2022.xlsx operational_expenses 2022
```

### Syncing Live Data

```bash
# Sync all official sources
npm run sync-data

# Sync historical archives
npm run archive-sync
```

### Data Categories

- `salaries` - Municipal employee salaries and benefits
- `operational_expenses` - Day-to-day operational expenses
- `public_tenders` - Public contracts and tenders
- `municipal_debt` - Municipal debt and liabilities
- `investments_assets` - Municipal investments and assets
- `treasury_movements` - Treasury movements and transfers
- `property_declarations` - Public official property declarations

## API Endpoints

### Financial Data
- `GET /api/salaries` - Employee salary data
- `GET /api/expenses` - Operational expenses
- `GET /api/contracts` - Public contracts and tenders
- `GET /api/debt` - Municipal debt information
- `GET /api/investments` - Municipal investments
- `GET /api/treasury` - Treasury movements

### Data Sources
- `GET /api/sources` - Available data sources
- `GET /api/sources/:id/sync` - Sync specific data source

## Investigation Periods

The system is configured to investigate the following critical periods:

1. **Period 1 (2009-2015)**: Initial investigation period
2. **Period 2 (2016-2019)**: Second administration period  
3. **Period 3 (2020-2023)**: Recent administration period
4. **Current Period (2024-2025)**: Current administration

## Data Sources

### Live Sources
- Municipal transparency portal
- Provincial transparency system
- National transparency portal
- Official gazettes and bulletins

### Archive Sources  
- Wayback Machine historical snapshots
- Archive.today snapshots
- Historical document repositories

## Database Schema

The system uses PostgreSQL with the following main tables:

- `processed_salaries` - Employee salary data
- `processed_operational_expenses` - Expense records
- `processed_public_tenders` - Contract information
- `live_data_sources` - Live data source tracking
- `historical_snapshots` - Archived webpage snapshots
- `sync_reports` - Synchronization reports

## Environment Variables

```bash
# Database
DB_HOST=localhost
DB_PORT=5432  
DB_NAME=transparency_db
DB_USER=postgres
DB_PASSWORD=your_password

# API
PORT=1
NODE_ENV=development

# Security
JWT_SECRET=your_secret_key
```

## License

MIT License - This project is for transparency and public accountability purposes.

## Contributing

This is a transparency investigation project. Contributions should focus on:

1. Improving data extraction accuracy
2. Adding new official data sources
3. Enhancing historical data recovery
4. Strengthening data validation

## Support

For technical issues or data source additions, please create an issue in the repository.