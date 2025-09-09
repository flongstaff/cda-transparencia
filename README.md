# Carmen de Areco Transparency Portal

This is the transparency portal for Carmen de Areco, providing citizens with access to municipal financial data and documents.

## Features

- Financial overview with citizen-friendly explanations
- Budget breakdown by category
- Document search and access
- Investment tracking
- Municipal debt analysis
- Comparative analysis between years
- Real-time transparency dashboard

## Technology Stack

- **Frontend**: React with TypeScript, Vite for build tooling, Recharts for data visualization, Lucide React for icons, Tailwind CSS for styling
- **Backend**: Node.js with Express, PostgreSQL database
- **Deployment**: GitHub Pages for frontend, Cloudflare Tunnel for backend API

## API Integration

The frontend connects to our comprehensive transparency API at `https://api.cda-transparencia.org/api/transparency/` via Cloudflare Tunnel.

## Deployment

### Automated Deployment (Manual)

To deploy the site, run the deployment script:

```bash
./deploy.sh
```

This script will:
1. Build the frontend using Vite
2. Deploy the built files to GitHub Pages using gh-pages

### Backend API

The backend API is exposed to the internet using Cloudflare Tunnel. To start the tunnel, run:

```bash
cloudflared tunnel --config cloudflared-config.json run cda-transparency-api
```

The tunnel configuration is in `cloudflared-config.json` and routes requests from `api.cda-transparencia.org` to `localhost:3001`.

### Prerequisites

- Node.js and npm
- cloudflared CLI tool
- GitHub account with permissions to deploy to GitHub Pages

### Environment Variables

The frontend uses the following environment variables:

- `VITE_API_URL`: The URL of the backend API (defaults to `https://api.cda-transparencia.org/api/transparency/` in production)

## Development

To run the frontend locally:

```bash
cd frontend
npm install
npm run dev
```

To run the backend locally:

```bash
cd backend
npm install
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Commit your changes
5. Push to the branch
6. Create a pull request