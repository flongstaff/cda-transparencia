# Carmen de Areco Transparency API

This is the backend API for the Carmen de Areco Transparency Portal.

## Deployment

To deploy this API to Fly.io:

1. Install the Fly.io CLI: `curl -L https://fly.io/install.sh | sh`
2. Log in to Fly.io: `flyctl auth login`
3. Deploy the app: `flyctl deploy`

## Environment Variables

The following environment variables need to be set:

- `DATABASE_URL` - PostgreSQL database connection string
- `PORT` - Port to run the server on (default: 8080)

## API Endpoints

All endpoints are available under `/api/transparency/`:

- `/api/transparency/available-years` - Get available years of data
- `/api/transparency/year-data/:year` - Get all data for a specific year
- `/api/transparency/documents` - Get documents with filtering
- And many more...

## Health Check

- `/api/health` - Basic health check endpoint