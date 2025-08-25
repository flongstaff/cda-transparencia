#!/bin/bash

# 🚀 Carmen de Areco Transparency Portal - Deployment Script
# Automated deployment with environment-specific configurations

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Environment detection
ENVIRONMENT=${1:-"development"}
BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")

# Helper functions
print_header() {
    echo -e "\n${PURPLE}🏛️ Carmen de Areco Transparency Portal${NC}"
    echo -e "${PURPLE}===========================================${NC}"
}

print_step() {
    echo -e "\n${BLUE}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Validate environment
validate_environment() {
    case $ENVIRONMENT in
        development|staging|production)
            print_success "Valid environment: $ENVIRONMENT"
            ;;
        *)
            print_error "Invalid environment: $ENVIRONMENT"
            echo "Valid options: development, staging, production"
            exit 1
            ;;
    esac
}

# Check prerequisites
check_prerequisites() {
    print_step "Checking prerequisites..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi
    
    # Check Wrangler
    if ! command -v wrangler &> /dev/null; then
        print_error "Wrangler CLI is not installed"
        echo "Install with: npm install -g wrangler"
        exit 1
    fi
    
    # Check if logged into Cloudflare
    if ! wrangler whoami &> /dev/null; then
        print_error "Not authenticated with Cloudflare"
        echo "Run: wrangler login"
        exit 1
    fi
    
    print_success "All prerequisites satisfied"
}

# Build frontend
build_frontend() {
    print_step "Building frontend..."
    cd frontend
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        print_step "Installing frontend dependencies..."
        npm install
    fi
    
    # Set environment variables for build
    export VITE_ENVIRONMENT=$ENVIRONMENT
    export VITE_API_BASE_URL="https://api.cda-transparencia.org"
    
    if [ "$ENVIRONMENT" = "production" ]; then
        export VITE_ANALYTICS_ENABLED=true
    else
        export VITE_ANALYTICS_ENABLED=false
    fi
    
    # Build the project
    npm run build
    cd ..
    
    print_success "Frontend build completed"
}

# Deploy to Cloudflare Workers
deploy_worker() {
    print_step "Deploying to Cloudflare Workers ($ENVIRONMENT)..."
    
    # Deploy with environment-specific configuration
    wrangler deploy --env $ENVIRONMENT
    
    print_success "Deployment to $ENVIRONMENT completed"
}

# Post-deployment verification
verify_deployment() {
    print_step "Verifying deployment..."
    
    case $ENVIRONMENT in
        development)
            URL="https://carmen-de-areco-transparency-dev.your-subdomain.workers.dev"
            ;;
        staging)
            URL="https://staging.cda-transparencia.org"
            ;;
        production)
            URL="https://cda-transparencia.org"
            ;;
    esac
    
    echo "🌐 Testing deployment at: $URL"
    
    # Basic health check
    if curl -s -o /dev/null -w "%{http_code}" "$URL" 2>/dev/null | grep -q "200"; then
        print_success "Deployment is live and responding"
    else
        print_warning "Deployment may still be propagating"
    fi
    
    echo ""
    echo "🔗 Deployment URL: $URL"
}

# Environment-specific configurations
configure_environment() {
    print_step "Configuring environment: $ENVIRONMENT"
    
    case $ENVIRONMENT in
        development)
            print_warning "Development environment - Debug logging enabled"
            ;;
        staging)
            print_warning "Staging environment - Testing configuration"
            ;;
        production)
            print_success "Production environment - Optimized for performance"
            if [ "$BRANCH" != "main" ] && [ "$BRANCH" != "unknown" ]; then
                print_warning "You're not on the main branch. Production should be deployed from main."
                read -p "Continue anyway? (y/N): " -n 1 -r
                echo
                if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                    exit 1
                fi
            fi
            ;;
    esac
}

# Main deployment process
main() {
    print_header
    echo -e "🚀 Deploying to: ${GREEN}$ENVIRONMENT${NC}"
    echo -e "🌿 Branch: ${BLUE}$BRANCH${NC}"
    echo ""
    
    validate_environment
    configure_environment
    check_prerequisites
    build_frontend
    deploy_worker
    verify_deployment
    
    echo ""
    print_success "Deployment completed successfully! 🎉"
    echo ""
    echo "📊 Deployment Summary:"
    echo "   Environment: $ENVIRONMENT"
    echo "   Branch: $BRANCH"
    echo "   Timestamp: $(date)"
    echo ""
    echo "📚 Next steps:"
    echo "   • Monitor your application at the deployment URL"
    echo "   • Check Cloudflare Workers dashboard for metrics"
    echo "   • Review logs with: wrangler tail --env $ENVIRONMENT"
    echo ""
}

# Handle script arguments
case "${1:-}" in
    "development"|"dev")
        ENVIRONMENT="development"
        ;;
    "staging"|"stage")
        ENVIRONMENT="staging"
        ;;
    "production"|"prod")
        ENVIRONMENT="production"
        ;;
    "--help"|"-h"|"help")
        echo "🚀 Deployment Script Usage:"
        echo ""
        echo "Usage: ./scripts/deploy.sh [environment]"
        echo ""
        echo "Environments:"
        echo "  development, dev     Deploy to development environment"
        echo "  staging, stage       Deploy to staging environment  "
        echo "  production, prod     Deploy to production environment"
        echo ""
        echo "Examples:"
        echo "  ./scripts/deploy.sh development"
        echo "  ./scripts/deploy.sh prod"
        echo ""
        exit 0
        ;;
    *)
        if [ -n "${1:-}" ]; then
            print_error "Unknown environment: $1"
            echo "Run './scripts/deploy.sh --help' for usage information"
            exit 1
        fi
        ;;
esac

# Run main function
main