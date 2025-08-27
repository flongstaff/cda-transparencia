-- Initialize transparency portal database
-- This script runs automatically when PostgreSQL container starts

CREATE DATABASE transparency_portal;

-- Connect to the new database
\c transparency_portal;

-- Create extension for UUID generation if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON DATABASE transparency_portal TO postgres;

-- Create schemas for different data types
CREATE SCHEMA IF NOT EXISTS transparency;
CREATE SCHEMA IF NOT EXISTS archive;
CREATE SCHEMA IF NOT EXISTS metadata;

-- Set default search path
ALTER DATABASE transparency_portal SET search_path TO transparency,public;

COMMENT ON DATABASE transparency_portal IS 'Carmen de Areco Transparency Portal Database';
COMMENT ON SCHEMA transparency IS 'Current transparency data';
COMMENT ON SCHEMA archive IS 'Historical archived data';
COMMENT ON SCHEMA metadata IS 'System metadata and configuration';