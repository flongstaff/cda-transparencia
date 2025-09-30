# Carmen de Areco Transparency Portal

This is the transparency portal for Carmen de Areco, providing citizens with access to municipal financial data and documents.

## 🌐 Live Demo

- **Portal**: [https://cda-transparencia.org](https://cda-transparencia.org)
- **GitHub Pages**: [https://flongstaff.github.io/cda-transparencia](https://flongstaff.github.io/cda-transparencia)

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

The portal is deployed to two platforms for redundancy and performance:

1. **GitHub Pages** - Primary deployment with custom domain
2. **Cloudflare Pages** - Secondary deployment for improved global performance

Both deployments are automated through GitHub Actions and updated weekly.

## Data Sources

The portal integrates data from multiple sources:

- **Local Data**: Financial reports, documents, and municipal records
- **Official APIs**: National and provincial transparency portals
- **External Sources**: Government open data platforms

See [docs/DATA_SOURCES.md](docs/DATA_SOURCES.md) for complete list and implementation details.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
