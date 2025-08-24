# System Architecture

## Overview

The Carmen de Areco Transparency Portal follows a modern web application architecture with a clear separation of concerns between the frontend and backend services.

## High-Level Architecture

```
┌─────────────────┐    API Calls    ┌─────────────────┐    Database Queries    ┌─────────────────┐
│   Frontend      │ ◀─────────────▶ │    Backend      │ ◀────────────────────▶ │   PostgreSQL    │
│  (React/Vite)   │                 │  (Node/Express) │                        │   Database      │
└─────────────────┘                 └─────────────────┘                        └─────────────────┘
         │                                   │                                          │
         │                                   │                                          │
         ▼                                   ▼                                          ▼
  ┌─────────────┐                    ┌─────────────┐                           ┌─────────────┐
  │   Users     │                    │ API Service │                           │   Data      │
  └─────────────┘                    └─────────────┘                           └─────────────┘
```

## Frontend Architecture

### Technology Stack
- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router
- **State Management**: React Hooks and Context API
- **Data Visualization**: Recharts
- **Animations**: Framer Motion
- **Icons**: Lucide React

### Component Structure
```
src/
├── components/
│   ├── layout/          # Layout components (Header, Footer, Sidebar)
│   ├── dashboard/       # Dashboard components
│   ├── data/            # Data display components
│   └── ui/              # Reusable UI components
├── pages/              # Page components
├── services/           # API and data services
├── hooks/              # Custom React hooks
├── contexts/           # React context providers
├── data/               # Static data files
└── types/              # TypeScript interfaces and types
```

## Backend Architecture

### Technology Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL with Sequelize ORM
- **Security**: Helmet, CORS
- **Environment**: dotenv

### Component Structure
```
src/
├── config/             # Configuration files
├── controllers/        # Request handlers
├── database/           # Database configuration
├── middleware/         # Custom middleware
├── models/             # Database models
├── routes/             # API routes
├── services/           # Business logic
├── utils/              # Utility functions
└── server.js          # Main server file
```

## Data Flow

1. **User Interaction**: User interacts with the frontend UI
2. **API Requests**: Frontend makes HTTP requests to backend API
3. **Request Processing**: Backend processes requests through middleware and controllers
4. **Database Operations**: Controllers interact with database models
5. **Response**: Backend returns JSON data to frontend
6. **UI Update**: Frontend updates UI with received data

## Data Sources

The portal integrates data from multiple sources:

### Primary Sources
1. **Official Municipal Portal**: https://carmendeareco.gob.ar/transparencia/
2. **Web Archive**: https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/*
3. **Local Database**: PostgreSQL database with processed and validated data

### Document Types
- Budget Documents (`presupuesto`, `ejecucion`, `balance`)
- Contracts (`licitacion`, `contrato`, `adjudicacion`)
- Declarations (`declaracion`, `patrimonio`, `ddjj`)
- Reports (`informe`, `auditoria`, `memoria`)
- Resolutions (`resolucion`, `decreto`, `ordenanza`)

## Security Architecture

### Frontend Security
- Content Security Policy enforcement
- Secure HTTP headers
- Input validation and sanitization

### Backend Security
- Helmet.js for HTTP headers security
- CORS configuration
- Input validation with Zod (planned)
- Rate limiting (planned)
- JWT authentication for admin endpoints (planned)

## Scalability Considerations

### Horizontal Scaling
- Stateless frontend can be scaled with CDN
- Backend can be scaled with load balancer
- Database can be scaled with read replicas

### Performance Optimization
- Database indexing for frequently queried fields
- API response caching (planned)
- Frontend code splitting
- Image optimization