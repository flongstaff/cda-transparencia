# Deployment Guide

This guide explains how to deploy the Carmen de Areco Transparency Portal to production environments.

## Deployment Options

### 1. GitHub Pages (Recommended for Demo)

The project is configured to automatically deploy to GitHub Pages using GitHub Actions.

**Requirements:**
- Repository must be public
- GitHub Pages must be enabled in repository settings

**Automatic Deployment:**
- Any push to the `main` branch triggers deployment
- Manual deployment can be triggered from GitHub Actions

### 2. VPS/Cloud Server

For full control over the deployment, you can deploy to a VPS or cloud server.

## GitHub Pages Deployment

### Setup
1. Go to repository Settings
2. Navigate to Pages section
3. Set Source to "GitHub Actions"
4. Save settings

### Manual Deployment
```bash
# From repository root
cd frontend
npm run build
npm run deploy
```

## VPS Deployment

### Server Requirements
- Ubuntu 20.04+ or CentOS 8+
- Node.js 18+
- PostgreSQL 13+
- Nginx or Apache
- 2GB+ RAM
- 20GB+ disk space

### 1. Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Install Nginx
sudo apt install nginx -y
```

### 2. Database Setup

```bash
# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql
CREATE DATABASE transparency_portal;
CREATE USER transparency_user WITH ENCRYPTED PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE transparency_portal TO transparency_user;
\q
```

### 3. Backend Deployment

```bash
# Clone repository
git clone https://github.com/flongstaff/cda-transparencia.git
cd cda-transparencia/backend

# Install dependencies
npm install

# Set environment variables
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
npm run setup-db

# Start backend service
npm start
```

### 4. Frontend Deployment

```bash
# Build frontend
cd ../frontend
npm install
npm run build:production

# Copy build files to web server directory
sudo cp -r dist/* /var/www/html/
```

### 5. Nginx Configuration

Create `/etc/nginx/sites-available/transparency`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /var/www/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # API
    location /api/ {
        proxy_pass http://localhost:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/transparency /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 6. Process Management

Install PM2 for process management:

```bash
sudo npm install -g pm2

# Start backend with PM2
cd /path/to/cda-transparencia/backend
pm2 start npm --name "transparency-api" -- run start

# Save PM2 configuration
pm2 save
pm2 startup
```

## Docker Deployment

### Single Container Deployment

```bash
# Build and run backend
cd backend
docker build -t transparency-backend .
docker run -d -p 3000:3000 --name transparency-api transparency-backend

# Build and run frontend
cd ../frontend
docker build -t transparency-frontend .
docker run -d -p 80:80 --name transparency-web transparency-frontend
```

### Docker Compose (Recommended)

```bash
# From repository root
docker-compose up -d
```

## Environment Variables

### Backend (.env)
```env
# Database
DATABASE_URL=postgresql://transparency_user:secure_password@localhost:5432/transparency_portal
DB_HOST=localhost
DB_PORT=5432
DB_NAME=transparency_portal
DB_USER=transparency_user
DB_PASSWORD=secure_password

# Server
PORT=3000
NODE_ENV=production

# Security
JWT_SECRET=your_jwt_secret_here
CORS_ORIGIN=https://your-domain.com

# API Keys (if needed)
GOOGLE_API_KEY=your_google_api_key
```

### Frontend (.env)
```env
# API Configuration
VITE_API_URL=https://your-domain.com/api
VITE_BASE_URL=/cda-transparencia

# Analytics (optional)
VITE_GA_ID=your_google_analytics_id
```

## SSL Configuration

### Let's Encrypt with Certbot

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Monitoring and Maintenance

### Log Monitoring
```bash
# View backend logs
pm2 logs transparency-api

# View frontend logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Data Updates
```bash
# Run data processing scripts
cd /path/to/cda-transparencia/scripts
python process_all.py

# Update database
cd ../backend
npm run sync-data
```

### Backup Strategy
```bash
#!/bin/bash
# backup.sh

# Database backup
pg_dump -U transparency_user -h localhost transparency_portal > /backups/transparency_$(date +%Y%m%d).sql

# File backup
tar -czf /backups/transparency_files_$(date +%Y%m%d).tar.gz /path/to/cda-transparencia/data/

# Keep only last 30 days of backups
find /backups -name "transparency*" -mtime +30 -delete
```

Add to crontab:
```bash
# Daily backup at 2 AM
0 2 * * * /path/to/backup.sh
```

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check PostgreSQL service status
   - Verify database credentials in .env
   - Ensure PostgreSQL is accepting connections

2. **API Not Responding**
   - Check if backend service is running
   - Verify PORT in .env
   - Check firewall settings

3. **Frontend Not Loading**
   - Verify build was successful
   - Check Nginx configuration
   - Ensure static files are in correct directory

### Logs Location

- **Backend:** `/var/log/pm2/` or PM2 logs
- **Frontend:** `/var/log/nginx/`
- **Database:** `/var/log/postgresql/`
- **System:** `/var/log/syslog`

## Performance Optimization

### Database
- Enable query caching
- Create appropriate indexes
- Regularly vacuum and analyze tables

### Frontend
- Enable gzip compression in Nginx
- Use CDN for static assets
- Implement browser caching

### API
- Implement response caching for frequently accessed data
- Use database connection pooling
- Implement rate limiting

## Security Considerations

- Keep all software updated
- Use strong, unique passwords
- Implement proper firewall rules
- Regular security audits
- HTTPS only (redirect HTTP to HTTPS)
- Regular backup verification