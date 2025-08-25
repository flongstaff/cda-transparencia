# Getting Started

## Prerequisites

- Node.js v16+
- npm v8+
- PostgreSQL v12+
- Docker (for containerized deployment)

## Project Structure

```
cda-transparencia/
├── backend/              # Node.js API
├── frontend/             # React application
├── data/                 # Data processing scripts and source materials
├── docs/                 # Project documentation
└── scripts/              # Automation scripts
```

## Installation

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at http://localhost:5173

### Backend Setup

```bash
cd backend
npm install
npm run dev
```

The backend API will be available at http://localhost:3000

## Environment Configuration

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000/api
```

### Backend (.env)
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=transparency_portal
DB_USER=postgres
DB_PASSWORD=postgres
PORT=3000
NODE_ENV=development
```

## Quick Start

1. Set up PostgreSQL database
2. Configure environment variables
3. Install dependencies for both frontend and backend
4. Start both services
5. Access the application at http://localhost:5173