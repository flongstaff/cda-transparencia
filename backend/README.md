# Carmen de Areco Transparency Portal - Backend API

This is the backend API for the Carmen de Areco Transparency Portal.

## 🚀 Getting Started

### Prerequisites
- Node.js v16+
- PostgreSQL v12+
- npm v8+

### Installation
```bash
npm install
```

### Database Setup
1. Make sure PostgreSQL is installed and running
2. Run the setup script:
   ```bash
   ./setup-db.sh
   ```
   Or manually create a database named `transparency_portal`

3. Update the `.env` file with your database credentials:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=transparency_portal
   DB_USER=your_username
   DB_PASSWORD=your_password
   PORT=3000
   NODE_ENV=development
   ```

### Populate Database
```bash
npm run populate-db
```

### Start Development Server
```bash
npm run dev
```

The server will start on `http://localhost:3000`

## 🧪 Testing

### Test API Endpoints
```bash
npm run test-api
```

## 📁 Project Structure
```
src/
├── config/          # Database configuration
├── controllers/     # Request handlers
├── database/        # Database setup
├── middleware/      # Custom middleware
├── models/          # Database models
├── routes/          # API routes
├── utils/           # Utility functions
├── sample-data.js   # Sample data for testing
├── populate-db.js   # Database population script
├── test-api.js      # API testing script
└── server.js        # Main server file
```

## 🔄 API Endpoints

### Property Declarations
- `GET /api/declarations` - Get all property declarations
- `GET /api/declarations/year/:year` - Get declarations for a specific year
- `GET /api/declarations/:id` - Get a specific declaration

### Salaries
- `GET /api/salaries` - Get all salary data
- `GET /api/salaries/year/:year` - Get salary data for a specific year

### Public Tenders
- `GET /api/tenders` - Get all public tenders
- `GET /api/tenders/year/:year` - Get tenders for a specific year

### Financial Reports
- `GET /api/reports` - Get all financial reports
- `GET /api/reports/year/:year` - Get reports for a specific year

### Treasury Movements
- `GET /api/treasury` - Get all treasury movements

### Fees and Rights
- `GET /api/fees` - Get all fees and rights data
- `GET /api/fees/year/:year` - Get data for a specific year

### Operational Expenses
- `GET /api/expenses` - Get all operational expenses
- `GET /api/expenses/year/:year` - Get expenses for a specific year

### Municipal Debt
- `GET /api/debt` - Get all municipal debt data
- `GET /api/debt/year/:year` - Get debt data for a specific year

### Investments and Assets
- `GET /api/investments` - Get all investments and assets
- `GET /api/investments/year/:year` - Get data for a specific year

### Financial Indicators
- `GET /api/indicators` - Get all financial indicators
- `GET /api/indicators/year/:year` - Get indicators for a specific year

## 🛠️ Development Scripts

- `npm run start` - Start production server
- `npm run dev` - Start development server with auto-reload
- `npm run populate-db` - Populate database with sample data
- `npm run test-api` - Test all API endpoints
- `npm test` - Run tests

## 📊 Database Schema

The database includes tables for:
- Property declarations
- Salaries
- Public tenders
- Financial reports
- Treasury movements
- Fees and rights
- Operational expenses
- Municipal debt
- Investments and assets
- Financial indicators

## 🔧 Environment Variables

Create a `.env` file in the root directory with the following variables:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=transparency_portal
DB_USER=your_username
DB_PASSWORD=your_password
PORT=3000
NODE_ENV=development
```