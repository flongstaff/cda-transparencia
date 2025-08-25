#!/bin/bash

# 🌐 Cloudflare Workers Setup Script for cda-transparencia.org
# Complete setup for GitHub Actions and Workers deployment

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

print_header() {
    echo -e "\n${PURPLE}🏛️ Cloudflare Workers Setup - cda-transparencia.org${NC}"
    echo -e "${PURPLE}===============================================${NC}"
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

# Check prerequisites
check_prerequisites() {
    print_step "Checking prerequisites..."
    
    # Check if we're in the right directory
    if [ ! -f "wrangler.toml" ]; then
        print_error "wrangler.toml not found. Run this script from the project root."
        exit 1
    fi
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Install from https://nodejs.org/"
        exit 1
    fi
    
    # Check Git
    if ! command -v git &> /dev/null; then
        print_error "Git is not installed."
        exit 1
    fi
    
    print_success "All prerequisites satisfied"
}

# Install Wrangler CLI
install_wrangler() {
    print_step "Installing Wrangler CLI..."
    
    if command -v wrangler &> /dev/null; then
        WRANGLER_VERSION=$(wrangler --version)
        print_success "Wrangler already installed: $WRANGLER_VERSION"
    else
        npm install -g wrangler
        print_success "Wrangler CLI installed successfully"
    fi
}

# Cloudflare authentication setup
setup_cloudflare_auth() {
    print_step "Setting up Cloudflare authentication..."
    
    echo ""
    echo "🔑 Cloudflare Authentication Options:"
    echo "1. Interactive login (recommended for development)"
    echo "2. API Token (recommended for production/CI)"
    echo ""
    
    read -p "Choose authentication method (1 or 2): " auth_choice
    
    case $auth_choice in
        1)
            print_step "Starting interactive Cloudflare login..."
            wrangler login
            print_success "Cloudflare login completed"
            ;;
        2)
            print_warning "For API Token setup:"
            echo "1. Go to https://dash.cloudflare.com/profile/api-tokens"
            echo "2. Create a Custom Token with:"
            echo "   - Zone:Zone:Edit"
            echo "   - Zone:Zone Settings:Edit"
            echo "   - Account:Cloudflare Workers:Edit"
            echo "3. Set the token in your .env file as CLOUDFLARE_API_TOKEN"
            echo ""
            print_warning "Also get your Account ID from Cloudflare Dashboard → Right sidebar"
            ;;
        *)
            print_error "Invalid choice. Please run the script again."
            exit 1
            ;;
    esac
}

# Verify domain setup
verify_domain() {
    print_step "Verifying domain configuration..."
    
    echo ""
    echo "🌐 Domain Setup Checklist for cda-transparencia.org:"
    echo ""
    echo "1. Domain added to Cloudflare? (Required)"
    echo "2. DNS records configured? (Required)"
    echo "   - A record: cda-transparencia.org → 192.0.2.1 (Proxied)"
    echo "   - Optional: CNAME staging.cda-transparencia.org → cda-transparencia.org (Proxied)"
    echo "3. SSL/TLS set to 'Full (strict)'? (Recommended)"
    echo ""
    
    read -p "Have you completed the domain setup? (y/N): " domain_ready
    
    if [[ ! $domain_ready =~ ^[Yy]$ ]]; then
        print_warning "Please complete domain setup in Cloudflare Dashboard first"
        echo ""
        echo "Steps:"
        echo "1. Go to https://dash.cloudflare.com/"
        echo "2. Add Site: cda-transparencia.org"
        echo "3. Update nameservers at your domain registrar"
        echo "4. Configure DNS records as shown above"
        echo "5. Run this script again"
        exit 0
    fi
    
    print_success "Domain configuration confirmed"
}

# GitHub Secrets setup
setup_github_secrets() {
    print_step "Setting up GitHub Secrets..."
    
    echo ""
    echo "🔐 Required GitHub Repository Secrets:"
    echo ""
    echo "For automatic deployments, add these secrets to your GitHub repository:"
    echo ""
    echo "Repository → Settings → Secrets and Variables → Actions → New repository secret"
    echo ""
    echo "1. CLOUDFLARE_API_TOKEN"
    echo "   - Value: Your Cloudflare API Token"
    echo "   - Get from: https://dash.cloudflare.com/profile/api-tokens"
    echo ""
    echo "2. CLOUDFLARE_ACCOUNT_ID"
    echo "   - Value: Your Cloudflare Account ID"
    echo "   - Get from: Cloudflare Dashboard → Right sidebar"
    echo ""
    
    read -p "Have you added these secrets to GitHub? (y/N): " secrets_ready
    
    if [[ ! $secrets_ready =~ ^[Yy]$ ]]; then
        print_warning "GitHub Actions will not work without these secrets"
        echo "Add them when you're ready to enable automatic deployments"
    else
        print_success "GitHub Secrets configured"
    fi
}

# Test local development
test_local() {
    print_step "Testing local development setup..."
    
    echo ""
    echo "🧪 Local Testing Commands:"
    echo ""
    echo "1. Build frontend:"
    echo "   cd frontend && npm run build"
    echo ""
    echo "2. Test worker locally:"
    echo "   wrangler dev"
    echo ""
    echo "3. Deploy to development:"
    echo "   wrangler deploy --env development"
    echo ""
    
    read -p "Would you like to test the worker locally now? (y/N): " test_now
    
    if [[ $test_now =~ ^[Yy]$ ]]; then
        print_step "Starting local development server..."
        echo ""
        echo "🌐 Local server will start at http://localhost:8787"
        echo "Press Ctrl+C to stop the server"
        echo ""
        wrangler dev
    else
        print_success "Local testing skipped - you can run 'wrangler dev' later"
    fi
}

# Final deployment instructions
deployment_instructions() {
    print_step "Deployment Instructions"
    
    echo ""
    echo "🚀 Your Carmen de Areco Transparency Portal is ready for deployment!"
    echo ""
    echo "📋 Manual Deployment Commands:"
    echo "   Development:  ./scripts/deploy.sh dev"
    echo "   Staging:      ./scripts/deploy.sh staging"
    echo "   Production:   ./scripts/deploy.sh prod"
    echo ""
    echo "🔄 Automatic GitHub Actions Deployment:"
    echo "   • Push to 'development' → Deploys to dev environment"
    echo "   • Push to 'staging' → Deploys to staging environment"
    echo "   • Push to 'main' → Deploys to production (cda-transparencia.org)"
    echo ""
    echo "🌐 Your URLs:"
    echo "   • Production:  https://cda-transparencia.org"
    echo "   • Staging:     https://staging.cda-transparencia.org"
    echo "   • Development: https://carmen-de-areco-transparency-dev.your-subdomain.workers.dev"
    echo ""
    echo "📊 Monitoring:"
    echo "   • Health check: https://cda-transparencia.org/health"
    echo "   • Worker logs:  wrangler tail --env production"
    echo "   • Cloudflare Dashboard for analytics and metrics"
    echo ""
}

# Summary and next steps
summary() {
    print_step "Setup Complete! 🎉"
    
    echo ""
    print_success "Carmen de Areco Transparency Portal setup completed successfully!"
    echo ""
    echo "✅ What's configured:"
    echo "   • Cloudflare Workers with cda-transparencia.org"
    echo "   • GitHub Actions CI/CD pipeline"
    echo "   • Multi-environment deployment (dev/staging/prod)"
    echo "   • Security headers and SSL/TLS"
    echo "   • Static asset serving with SPA routing"
    echo "   • Health monitoring endpoints"
    echo ""
    echo "🔗 Useful links:"
    echo "   • Cloudflare Dashboard: https://dash.cloudflare.com/"
    echo "   • Workers Dashboard: https://workers.cloudflare.com/"
    echo "   • GitHub Actions: Check your repository's Actions tab"
    echo ""
    echo "📚 Documentation:"
    echo "   • Full deployment guide: docs/deployment/DEPLOYMENT_GUIDE.md"
    echo "   • Domain setup guide: docs/deployment/domain-ssl-setup.md"
    echo ""
    echo "💰 Free tier limits:"
    echo "   • Cloudflare Workers: 100,000 requests/day"
    echo "   • GitHub Actions: 2,000 minutes/month"
    echo "   • Total cost: $0.00 per month! 🎉"
    echo ""
}

# Main setup process
main() {
    print_header
    
    check_prerequisites
    install_wrangler
    setup_cloudflare_auth
    verify_domain
    setup_github_secrets
    test_local
    deployment_instructions
    summary
}

# Run main function
main