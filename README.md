# Carmen de Areco Transparency Portal

This is the transparency portal for Carmen de Areco, providing citizens with access to municipal financial data and documents.

## 🌐 Live Demo

- **Portal**: [https://cda-transparencia.org](https://cda-transparencia.org)
- **GitHub Pages**: [https://flongstaff.github.io/cda-transparencia](https://flongstaff.github.io/cda-transparencia)
- **API Endpoint**: [https://cda-transparencia.flongstaff.workers.dev](https://cda-transparencia.flongstaff.workers.dev)

## Features

- **Financial Overview** - Budget execution, revenue, and expenditure tracking
- **Document Access** - Searchable municipal documents with multiple viewers
- **Interactive Charts** - Budget breakdown, debt analysis, and trend visualization
- **Multi-year Comparison** - Historical financial data comparison (2019-2025)
- **Transparency Dashboard** - Real-time data verification and quality metrics
- **External Data Integration** - Connects to official Argentine government APIs

## Technology Stack

- **Frontend**: React 18 + TypeScript, Vite, Recharts, D3.js, Nivo, Lucide React, Tailwind CSS
- **Data Sources**: Local JSON files + External APIs (datos.gob.ar, presupuestoabierto.gob.ar)
- **Charts**: Multiple chart libraries for comprehensive data visualization
- **Deployment**: Dual deployment to GitHub Pages and Cloudflare Pages with automated CI/CD

## Quick Start

```bash
# Clone the repository
git clone https://github.com/flongstaff/cda-transparencia.git
cd cda-transparencia

# Install dependencies and start development
cd frontend
npm install
npm run dev
```

## Project Structure

```
├── frontend/          # React application
├── backend/          # API server (Node.js)
├── data/            # Municipal data files
├── docs/            # Documentation
├── .github/workflows/ # GitHub Actions workflows
├── cloudflare-deploy/ # Cloudflare Pages deployment files
└── README.md        # This file
```

## Documentation

Detailed documentation is available in the `/docs` folder:

- [Component Library](docs/COMPONENT_LIBRARY.md) - UI components documentation
- [Data Sources](docs/DATA_SOURCES.md) - Available data sources and APIs
- [Frontend Components](docs/FRONTEND_COMPONENTS.md) - Component implementation details
- [Performance Considerations](docs/PERFORMANCE_CONSIDERATIONS.md) - Performance optimization guide
- [Testing Strategy](docs/TESTING_STRATEGY.md) - Testing approach and tools

## Deployment

The portal is deployed to three platforms for redundancy and performance:

1. **GitHub Pages** - Primary deployment with custom domain
2. **Cloudflare Pages** - Secondary deployment for improved global performance
3. **Cloudflare Workers** - API endpoint for external data integration

### Custom Domain Deployment Note

When deploying to GitHub Pages with a custom domain (cda-transparencia.org), ensure the build uses production mode to avoid subdirectory routing issues:

```bash
# For custom domains - use production mode (base: "/")
npm run build:production

# For username.github.io/repo-name - use github mode (base: "/repo-name/")
npm run build:github
```

The build process automatically sets the correct base path:
- Production mode: base path is "/" (for custom domains)
- GitHub mode: base path is "/cda-transparencia/" (for GitHub Pages subdirectories)

All deployments are automated through GitHub Actions and updated weekly.

## Data Sources

The portal integrates data from multiple sources:

- **Local Data**: Financial reports, documents, and municipal records
- **Official APIs**: National and provincial transparency portals
- **External Sources**: Government open data platforms

See [docs/DATA_SOURCES.md](docs/DATA_SOURCES.md) for complete list and implementation details.

## Enhanced Data Architecture

The transparency portal implements a robust, multi-source data architecture that integrates:

1. **External APIs** (Primary) - Government transparency portals and national databases
2. **Local Files** (Secondary) - CSV/JSON files in repository via GitHub raw URLs
3. **PDF Data** (Processed) - OCR-extracted data from official documents
4. **Generated Data** (Fallback) - Synthetic data when other sources unavailable

### Enhanced Data Organization

All data files are now organized in a comprehensive directory structure:

```
/public/data/csv/
├── budget/                 # Budget execution and planning data
├── contracts/              # Contracts and procurement data
├── salaries/               # Personnel and salary data
├── treasury/               # Treasury and cash flow data
├── debt/                   # Debt and obligation data
├── documents/              # Document and report inventories
├── infrastructure/          # Infrastructure projects data
├── education/              # Education statistics data
├── health/                 # Health statistics data
├── caif/                   # CAIF (Centro de Atención e Integración Familiar) data
├── reserves/               # Financial reserves data
├── expenses/               # Expense analysis data
├── financial/              # General financial data
├── revenue/                # Revenue analysis data
├── trends/                 # Trend analysis data
└── other/                  # Miscellaneous data files
```

Each category contains subdirectories for `execution`, `historical`, and `reports` data.

### Multi-Source Data Integration

Each page receives complementary data from multiple sources:
- **Budget Page**: Budget execution + Contracts + Salaries + Treasury
- **Contracts Page**: Contract details + Budget impact + Vendor analysis
- **Salaries Page**: Salary data + Budget impact + Market comparisons
- **Treasury Page**: Cash flow + Contract payments + Debt service
- **Debt Page**: Debt levels + Budget impact + Treasury relationships
- **Documents Page**: Document metadata + Content analysis + Cross-references

### Deployment Compatibility

✅ **GitHub Pages**: Works with GitHub raw URLs for data access
✅ **Cloudflare Pages**: Compatible with standard static hosting
✅ **Zero Backend Dependencies**: No separate processes or tunnels required

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
