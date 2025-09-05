#!/bin/bash

# Database Setup Script for Transparency Portal

echo "🚀 Setting up PostgreSQL database for Transparency Portal..."

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null
then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL first."
    echo "   On macOS: brew install postgresql"
    echo "   On Ubuntu: sudo apt install postgresql postgresql-contrib"
    exit 1
fi

# Check if PostgreSQL is running
if ! pg_isready &> /dev/null
then
    echo "❌ PostgreSQL is not running. Please start PostgreSQL service."
    echo "   On macOS: brew services start postgresql"
    echo "   On Ubuntu: sudo systemctl start postgresql"
    exit 1
fi

# Database configuration
DB_NAME="transparency_portal"
DB_USER="postgres"
DB_PASSWORD="postgres"

echo "📋 Database Configuration:"
echo "   Database Name: $DB_NAME"
echo "   Database User: $DB_USER"
echo "   Database Password: $DB_PASSWORD"

# Create database
echo "🔧 Creating database..."
createdb $DB_NAME 2>/dev/null || echo "⚠️  Database already exists or error occurred"

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📄 Creating .env file..."
    cat > .env << EOF
DB_HOST=localhost
DB_PORT=5432
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
PORT=3001
NODE_ENV=development
EOF
    echo "✅ .env file created successfully"
else
    echo "ℹ️  .env file already exists"
fi

echo "✅ Database setup completed!"
echo ""
echo "📝 Next steps:"
echo "1. Run 'npm run populate-db' to populate the database with sample data"
echo "2. Run 'npm run dev' to start the backend server"
echo "3. Navigate to the frontend directory and run 'npm run dev' to start the frontend"