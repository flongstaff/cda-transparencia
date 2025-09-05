# Makefile for Carmen de Areco Transparency Portal

# Variables
FRONTEND_DIR = frontend
BACKEND_DIR = backend
SCRIPTS_DIR = scripts

# Default target
.PHONY: help
help:
	@echo "Carmen de Areco Transparency Portal - Development Commands"
	@echo ""
	@echo "Frontend:"
	@echo "  frontend-install     - Install frontend dependencies"
	@echo "  frontend-dev         - Start frontend development server"
	@echo "  frontend-build       - Build frontend for production"
	@echo "  frontend-test        - Run frontend tests"
	@echo "  frontend-lint        - Lint frontend code"
	@echo ""
	@echo "Backend:"
	@echo "  backend-install      - Install backend dependencies"
	@echo "  backend-dev          - Start backend development server"
	@echo "  backend-test         - Run backend tests"
	@echo "  backend-db-start     - Start database with Docker"
	@echo ""
	@echo "Data Processing:"
	@echo "  data-install         - Install data processing dependencies"
	@echo "  data-process         - Run data processing pipeline"
	@echo "  data-test            - Run data processing tests"
	@echo ""
	@echo "Cloudflare Workers:"
	@echo "  cf-setup             - Install Cloudflare Workers CLI (wrangler)"
	@echo "  cf-dev               - Start Cloudflare Workers development server"
	@echo "  cf-deploy            - Deploy Cloudflare Workers to production"
	@echo ""
	@echo "Project-wide:"
	@echo "  install              - Install all dependencies"
	@echo "  test                 - Run all tests"
	@echo "  lint                 - Run all linters"
	@echo "  clean                - Clean build artifacts"

# Frontend targets
.PHONY: frontend-install
frontend-install:
	@echo "Installing frontend dependencies..."
	cd $(FRONTEND_DIR) && npm install

.PHONY: frontend-dev
frontend-dev:
	@echo "Starting frontend development server..."
	cd $(FRONTEND_DIR) && npm run dev

.PHONY: frontend-build
frontend-build:
	@echo "Building frontend for production..."
	cd $(FRONTEND_DIR) && npm run build

.PHONY: frontend-test
frontend-test:
	@echo "Running frontend tests..."
	cd $(FRONTEND_DIR) && npm test

.PHONY: frontend-lint
frontend-lint:
	@echo "Linting frontend code..."
	cd $(FRONTEND_DIR) && npm run lint

# Backend targets
.PHONY: backend-install
backend-install:
	@echo "Installing backend dependencies..."
	cd $(BACKEND_DIR) && npm install

.PHONY: backend-dev
backend-dev:
	@echo "Starting backend development server..."
	cd $(BACKEND_DIR) && npm run dev

.PHONY: backend-test
backend-test:
	@echo "Running backend tests..."
	cd $(BACKEND_DIR) && npm test

.PHONY: backend-db-start
backend-db-start:
	@echo "Starting database with Docker..."
	cd $(BACKEND_DIR) && docker-compose up -d

# Data processing targets
.PHONY: data-install
data-install:
	@echo "Installing data processing dependencies..."
	pip install -r requirements.txt
	pip install -r requirements-dev.txt

.PHONY: data-process
data-process:
	@echo "Running data processing pipeline..."
	cd $(SCRIPTS_DIR) && python process_all.py

.PHONY: data-test
data-test:
	@echo "Running data processing tests..."
	cd $(SCRIPTS_DIR) && python -m pytest

# Cloudflare Workers targets
.PHONY: cf-setup
cf-setup:
	@echo "Installing Cloudflare Workers CLI (wrangler)..."
	npm install -g wrangler

.PHONY: cf-dev
cf-dev:
	@echo "Starting Cloudflare Workers development server..."
	wrangler dev

.PHONY: cf-deploy
cf-deploy:
	@echo "Deploying Cloudflare Workers to production..."
	wrangler deploy

# Project-wide targets
.PHONY: install
install: frontend-install backend-install data-install
	@echo "All dependencies installed!"

.PHONY: test
test: frontend-test backend-test data-test
	@echo "All tests completed!"

.PHONY: lint
lint: frontend-lint
	@echo "All linting completed!"

.PHONY: clean
clean:
	@echo "Cleaning build artifacts..."
	rm -rf $(FRONTEND_DIR)/dist
	rm -rf $(FRONTEND_DIR)/node_modules/.vite
	rm -rf $(BACKEND_DIR)/node_modules
	find . -name "*.pyc" -delete
	find . -name "__pycache__" -type d -exec rm -rf {} +