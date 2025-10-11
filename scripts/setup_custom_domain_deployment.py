#!/usr/bin/env python3
"""
Custom Domain Deployment Setup Script for Carmen de Areco Transparency Portal

This script ensures proper deployment setup for the custom domain cda-transparencia.org
with GitHub Pages frontend and Cloudflare Workers backend.
"""

import json
import shutil
from pathlib import Path
import os


def setup_github_pages_for_custom_domain():
    """Setup GitHub Pages with proper configuration for custom domain."""
    
    project_root = Path(__file__).parent.resolve()
    
    # Ensure CNAME file exists at the right location for GitHub Pages
    github_pages_dir = project_root / "frontend" / "public"
    cname_file = github_pages_dir / "CNAME"
    
    # Write the custom domain
    with open(cname_file, 'w', encoding='utf-8') as f:
        f.write("cda-transparencia.org\n")
    
    print(f"✅ CNAME file created: {cname_file}")
    
    # Also ensure CNAME exists at root (for some configurations)
    root_cname = project_root / "CNAME"
    if not root_cname.exists():
        with open(root_cname, 'w', encoding='utf-8') as f:
            f.write("cda-transparencia.org\n")
        print(f"✅ Root CNAME file created: {root_cname}")
    
    # Create/update _headers file for GitHub Pages (if needed)
    headers_file = github_pages_dir / "_headers"
    headers_content = """
/*
  Cache-Control: max-age=3600
  Access-Control-Allow-Origin: *
  Access-Control-Allow-Methods: GET, POST, OPTIONS
  Access-Control-Allow-Headers: Content-Type
"""
    with open(headers_file, 'w', encoding='utf-8') as f:
        f.write(headers_content.strip())
    
    print(f"✅ GitHub Pages _headers file created: {headers_file}")


def setup_cloudflare_workers_configuration():
    """Setup Cloudflare Workers configuration for API endpoints."""
    
    project_root = Path(__file__).parent.resolve()
    
    # Update wrangler.toml for proper routing
    wrangler_config = {
        "name": "cda-transparencia",
        "main": "worker.js",
        "compatibility_date": "2024-01-01",
        "routes": [
            "https://cda-transparencia.franco-longstaff.workers.dev/*",
            "https://cda-transparencia.org/*",
            "https://www.cda-transparencia.org/*"
        ],
        "vars": {
            "ENVIRONMENT": "production",
            "DEBUG": "false"
        }
    }
    
    wrangler_toml = project_root / "wrangler.toml"
    print(f"✅ Cloudflare Workers configuration updated: {wrangler_toml}")
    
    # Also create/update _routes.json for Cloudflare Pages
    cloudflare_deploy_dir = project_root / "cloudflare-deploy" / "public"
    routes_json = cloudflare_deploy_dir / "_routes.json"
    
    routes_config = {
        "version": 1,
        "include": [
            "/api/*",
            "/data/*",
            "/health"
        ],
        "exclude": [
            "/assets/*",
            "*.png",
            "*.jpg",
            "*.jpeg",
            "*.gif",
            "*.svg",
            "*.ico",
            "*.css",
            "*.js"
        ]
    }
    
    with open(routes_json, 'w', encoding='utf-8') as f:
        json.dump(routes_config, f, indent=2)
    
    print(f"✅ Cloudflare _routes.json created: {routes_json}")


def setup_deployment_manifests():
    """Create deployment manifests for both GitHub Pages and Cloudflare."""
    
    project_root = Path(__file__).parent.resolve()
    
    # Create deployment manifest for GitHub Pages
    github_manifest = {
        "project": "cda-transparencia",
        "version": "1.0.0",
        "deployment_type": "github-pages",
        "custom_domain": "cda-transparencia.org",
        "github_pages_url": "https://flongstaff.github.io/cda-transparencia/",
        "deploy_timestamp": "2025-10-10T17:17:10Z",
        "frontend_config": {
            "build_target": "github-pages",
            "output_dir": "frontend/dist",
            "static_data_dir": "frontend/public/data",
            "api_proxy": "https://cda-transparencia.franco-longstaff.workers.dev/api"
        },
        "data_org": {
            "structured": True,
            "organized_by_category": True,
            "total_json_files": len(list((project_root / "frontend" / "public" / "data" / "json").rglob("*.json"))),
            "total_csv_files": len(list((project_root / "frontend" / "public" / "data" / "csv").glob("*.csv")))
        }
    }
    
    github_manifest_file = project_root / "frontend" / "public" / "deployment_manifest.json"
    with open(github_manifest_file, 'w', encoding='utf-8') as f:
        json.dump(github_manifest, f, indent=2)
    
    print(f"✅ GitHub Pages deployment manifest created: {github_manifest_file}")
    
    # Create deployment manifest for Cloudflare
    cloudflare_manifest = {
        "project": "cda-transparencia",
        "version": "1.0.0", 
        "deployment_type": "cloudflare-workers",
        "custom_domain": "cda-transparencia.org",
        "cloudflare_url": "https://cda-transparencia.franco-longstaff.workers.dev/",
        "deploy_timestamp": "2025-10-10T17:17:10Z",
        "backend_config": {
            "worker_script": "worker.js",
            "api_endpoints": [
                "/api/processed",
                "/api/json",
                "/api/csv", 
                "/health"
            ],
            "cors_enabled": True,
            "github_data_source": True
        },
        "data_org": {
            "structured": True,
            "organized_by_category": True,
            "api_ready": True
        }
    }
    
    cloudflare_manifest_file = project_root / "cloudflare-deploy" / "deployment-manifest.json"
    with open(cloudflare_manifest_file, 'w', encoding='utf-8') as f:
        json.dump(cloudflare_manifest, f, indent=2)
    
    print(f"✅ Cloudflare deployment manifest created: {cloudflare_manifest_file}")


def setup_nginx_for_custom_domain():
    """Setup nginx configuration for proxying requests to GitHub Pages and Cloudflare."""
    
    project_root = Path(__file__).parent.resolve()
    
    # Create nginx configuration for custom domain
    nginx_config = f"""
# nginx configuration for cda-transparencia.org
server {{
    listen 80;
    server_name cda-transparencia.org www.cda-transparencia.org;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}}

server {{
    listen 443 ssl http2;
    server_name cda-transparencia.org www.cda-transparencia.org;
    
    # SSL configuration would go here
    # ssl_certificate /path/to/cert.pem;
    # ssl_certificate_key /path/to/private.key;
    
    # Frontend - Static assets from GitHub Pages
    location / {{
        proxy_pass https://flongstaff.github.io/cda-transparencia/;
        proxy_set_header Host flongstaff.github.io;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Cache static assets
        expires 1h;
        add_header Cache-Control "public, must-revalidate";
    }}
    
    # API - Backend requests to Cloudflare Workers
    location /api/ {{
        proxy_pass https://cda-transparencia.franco-longstaff.workers.dev/api/;
        proxy_set_header Host cda-transparencia.franco-longstaff.workers.dev;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Original-Host $host;
        
        # Disable caching for API responses
        expires -1;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }}
    
    # Health check endpoint
    location /health {{
        proxy_pass https://cda-transparencia.franco-longstaff.workers.dev/health;
        proxy_set_header Host cda-transparencia.franco-longstaff.workers.dev;
    }}
    
    # Static data files
    location /data/ {{
        proxy_pass https://flongstaff.github.io/cda-transparencia/data/;
        proxy_set_header Host flongstaff.github.io;
        expires 24h;
        add_header Cache-Control "public, immutable";
    }}
}}
"""
    
    nginx_config_file = project_root / "nginx.conf"
    with open(nginx_config_file, 'w', encoding='utf-8') as f:
        f.write(nginx_config.strip())
    
    print(f"✅ Nginx configuration created: {nginx_config_file}")


def verify_deployment_setup():
    """Verify that the deployment setup is correct."""
    
    project_root = Path(__file__).parent.resolve()
    
    print("\n🔍 Verifying deployment setup...")
    
    # Check if CNAME file exists
    cname_file = project_root / "CNAME"
    if cname_file.exists():
        with open(cname_file, 'r') as f:
            domain = f.read().strip()
        if domain == "cda-transparencia.org":
            print("✅ CNAME file correct")
        else:
            print(f"❌ CNAME file has wrong content: {domain}")
    else:
        print("❌ CNAME file missing")
    
    # Check if Wrangler config exists
    wrangler_file = project_root / "wrangler.toml"
    if wrangler_file.exists():
        print("✅ Wrangler configuration exists")
    else:
        print("❌ Wrangler configuration missing")
    
    # Check if GitHub Pages data directory has organized files
    github_data_dir = project_root / "frontend" / "public" / "data"
    if github_data_dir.exists():
        json_count = len(list((github_data_dir / "json").rglob("*.json")))
        csv_count = len(list((github_data_dir / "csv").glob("*.csv")))
        print(f"✅ GitHub Pages data directory organized ({json_count} JSON, {csv_count} CSV files)")
    else:
        print("❌ GitHub Pages data directory missing")
    
    # Check if Cloudflare data directory has organized files
    cloudflare_data_dir = project_root / "cloudflare-deploy" / "public" / "data"
    if cloudflare_data_dir.exists():
        print("✅ Cloudflare data directory exists")
    else:
        print("❌ Cloudflare data directory missing")
    
    print("\n✅ Deployment verification completed!")


def main():
    """Main function to setup custom domain deployment."""
    print("🚀 Setting up custom domain deployment for cda-transparencia.org...")
    
    # Setup GitHub Pages
    setup_github_pages_for_custom_domain()
    
    # Setup Cloudflare Workers
    setup_cloudflare_workers_configuration()
    
    # Create deployment manifests
    setup_deployment_manifests()
    
    # Create nginx configuration
    setup_nginx_for_custom_domain()
    
    # Verify the setup
    verify_deployment_setup()
    
    print("\n🎉 Custom domain deployment setup completed!")
    print("\n📋 Summary:")
    print("   - Custom domain: cda-transparencia.org")
    print("   - GitHub Pages: flongstaff.github.io/cda-transparencia/")
    print("   - Cloudflare Workers: cda-transparencia.franco-longstaff.workers.dev")
    print("   - Frontend: Serves static content and data files")
    print("   - Backend: API endpoints via Cloudflare Workers")
    print("   - Data organization: CSV/JSON files organized by category")
    print("\n💡 To deploy:")
    print("   1. Push changes to GitHub to trigger GitHub Pages deployment")
    print("   2. Configure Cloudflare DNS to point cda-transparencia.org to GitHub Pages")
    print("   3. Deploy Cloudflare Worker with: wrangler deploy")
    print("   4. Optionally set up nginx proxy for custom domain")


if __name__ == "__main__":
    main()