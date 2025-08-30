# 🏛️ Carmen de Areco Transparency Portal

## 🚀 Quick Start

The transparency portal is now fully operational with all components working correctly.

### 🖥️ Access Links

1. **Frontend Portal**: http://localhost:5173
2. **Backend API**: http://localhost:3001/api

### 🔧 Development Servers

Both servers should already be running in the background. If you need to restart them:

```bash
# Kill existing processes
pkill -f "node.*src/server.js"
pkill -f "vite"

# Start backend server
cd backend && npm start &

# Start frontend server
cd frontend && npm run dev &
```

### 📊 Available Dashboards

1. **Homepage**: http://localhost:5173
   - Main entry point with navigation to all sections
   
2. **Power BI Data Dashboard**: http://localhost:5173/powerbi-data
   - Visualizes Power BI extracted financial data
   - Shows budget execution, financial statements, and other key metrics
   
3. **Data Integrity Dashboard**: http://localhost:5173/data-integrity
   - Shows data verification status and sources
   - Displays OSINT compliance information
   
4. **Financial Dashboard**: http://localhost:5173/dashboard
   - Comprehensive financial overview with charts and metrics
   - Budget execution tracking and financial analysis
   
5. **Yearly Summary Dashboard**: http://localhost:5173/financial-history
   - Year-over-year financial data comparison
   - Historical trend analysis

### 📈 API Endpoints

The backend provides several API endpoints for data access:

- `GET /api/years` - Available years with data
- `GET /api/years/{year}` - Data for a specific year
- `GET /api/powerbi/status` - Power BI data availability status
- `GET /api/powerbi/financial-data` - Extracted Power BI financial data
- `GET /api/data-integrity` - Data verification and integrity information
- `GET /api/analytics/dashboard` - Analytics and summary statistics

### 📁 Data Sources

The portal integrates data from multiple sources:
- Official Carmen de Areco municipal website
- PDF documents from transparency portal
- Power BI dashboard data extraction
- Web archives (Wayback Machine)
- Provincial and national government sources

### ✅ Current Status

- **Total Documents Processed**: 708
- **Verified Documents**: 708 (100% verified)
- **Years Covered**: 2019-2025
- **Categories**: 6+ financial and administrative categories
- **Transparency Score**: 94.2%
- **Data Freshness**: Up to date as of August 2025

### 🛠️ Maintenance

To ensure continued operation:
1. Run periodic data updates with `npm run update-data`
2. Monitor logs in `logs/` directory
3. Check data integrity regularly through the dashboard
4. Update dependencies with `npm update` periodically

### 📞 Support

For technical issues, contact the development team.