#!/bin/bash

# Script to verify DNS configuration for cda-transparencia.org
# This script checks if your domain is properly configured to point to GitHub Pages and Cloudflare

echo "🔍 Checking DNS configuration for cda-transparencia.org..."
echo "======================================================"

# Check A record
echo "Checking A records..."
dig +short A cda-transparencia.org

# Check CNAME record for www
echo -e "\nChecking CNAME records..."
dig +short CNAME www.cda-transparencia.org

# Check if domain points to GitHub Pages
echo -e "\nChecking GitHub Pages configuration..."
curl -s -I https://cda-transparencia.org | head -5

echo -e "\n✅ DNS verification complete!"
echo "If you see GitHub Pages IPs (185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153), your DNS is configured correctly."
echo "If you see Cloudflare IPs, your domain is proxied through Cloudflare."

# Check Cloudflare configuration
echo -e "\n🌐 Checking Cloudflare configuration..."
curl -s -I https://cda-transparencia.org -H "CF-Connecting-IP: 1.2.3.4" | grep -i "cf-ray|server|via"

echo -e "\n📋 Next steps:"
echo "1. If using GitHub Pages: Point your domain's A records to GitHub Pages IPs"
echo "2. If using Cloudflare Workers: Ensure your domain is proxied through Cloudflare"
echo "3. Add SSL certificate through Cloudflare (automatic when proxied)"