# Project Overview

## Carmen de Areco Transparency Portal

A comprehensive government transparency platform for the municipality of Carmen de Areco in Buenos Aires, Argentina. This open-source portal provides citizens with accessible public information about government activities, financial management, and decision-making processes.

## Mission

Promote governmental accountability and citizen engagement through:
- **Open Data Access**: Complete transparency of municipal operations
- **Financial Accountability**: Real-time budget and spending information  
- **Civic Engagement**: Tools for citizen participation and oversight
- **Data Integrity**: Secure, verified, and auditable information systems

## Core Objectives

1. **🏛️ Government Transparency**: Provide comprehensive access to municipal data
2. **💰 Financial Oversight**: Enable tracking of public spending and budget execution
3. **👥 Citizen Engagement**: Facilitate public participation in governance
4. **📊 Data-Driven Governance**: Support evidence-based municipal decision making
5. **🔍 Accountability Mechanisms**: Enable oversight and performance monitoring

## Key Capabilities

The platform covers all major areas of municipal transparency:

- **Property Declarations & Ethics Compliance**
- **Budget Management & Financial Reporting** 
- **Public Contracts & Tender Processes**
- **Salary Information & Personnel Management**
- **Public Spending & Operational Expenses**
- **Citizen Services & Participation Tools**

> **📚 For detailed feature documentation, see [FEATURES.md](FEATURES.md)**

## Technology Stack

**Frontend:**
- **Framework:** React with Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Key Libraries:**
    - `react-router-dom` for routing
    - `recharts` for data visualization
    - `framer-motion` for animations
    - `lucide-react` for icons

**Backend:**
- **Framework:** Express.js
- **Language:** JavaScript
- **Database:** PostgreSQL with Sequelize ORM
- **Key Libraries:**
    - `cors` for handling cross-origin requests
    - `helmet` for security headers
    - `dotenv` for environment variables

## Development Plan

An agile development approach with iterative sprints will be followed, focusing on delivering value to users early and often.

### Phase 1: Foundation (Weeks 1-2)
- Project Setup
- Data Analysis and API Design

### Phase 2: Core Implementation (Weeks 3-6)
- Backend Development
- Frontend Development

### Phase 3: Integration and Enhancement (Weeks 7-8)
- Integration
- Advanced Features

### Phase 4: Testing and Deployment (Weeks 9-10)
- Testing
- Deployment

### Phase 5: Documentation and Maintenance (Ongoing)
- Documentation
- Maintenance

## Deployment Plan

The application will be deployed using a combination of free and self-hosted solutions.

- **Frontend**: Deployed to GitHub Pages for free hosting, CDN, and SSL.
- **Backend**: Self-hosted on a Proxmox server with two VMs (Application and Database).
- **Database**: PostgreSQL will be used as the database.
- **Security**: Nginx will be used as a reverse proxy with Let's Encrypt for SSL certificates.
