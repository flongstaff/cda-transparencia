# Getting Started

Welcome to the Carmen de Areco Transparency Portal project! This guide will help you get up and running with the project locally.

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js 18+ (for frontend and backend)
- Python 3.8+ (for data processing scripts)
- Docker (for database)
- Git

## Project Structure

```
├── data/                   # All data files
│   ├── preserved/          # Processed data in structured formats
│   ├── markdown_documents/ # Documents converted to markdown
│   └── source_materials/   # Original source files
├── frontend/              # React dashboard application
├── backend/               # Node.js API server
├── scripts/               # Python data processing scripts
└── docs/                  # Project documentation
```

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/flongstaff/cda-transparencia.git
cd cda-transparencia
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`

### 3. Backend Setup

```bash
cd backend
npm install
npm start
```

The API will be available at `http://localhost:3001/api`

### 4. Database Setup

```bash
cd backend
docker-compose up -d
```

This will start a PostgreSQL database container.

### 5. Data Processing (Optional)

```bash
cd scripts
pip install -r requirements.txt
python process_all.py
```

## Next Steps

- [API Documentation](../api/endpoints.md)
- [Architecture Overview](../architecture/overview.md)
- [Data Sources](../data/DATA_SOURCES.md)
- [Development Guide](../development/guide.md)