#!/usr/bin/env python3
"""
Data Organization Script for Carmen de Areco Transparency Portal

This script organizes and sorts all CSV and JSON files for:
1. Frontend (GitHub Pages) - static data files
2. Backend (Cloudflare Workers) - API endpoints
3. GitHub repository - source data
4. Proper deployment for custom domain cda-transparencia.org
"""

import json
import shutil
import os
from pathlib import Path
from datetime import datetime
import hashlib


def create_organized_data_structure():
    """Create organized data structure for all deployment targets."""
    
    project_root = Path(__file__).parent.resolve()
    
    # Define source directories
    source_data_dir = project_root / "data"
    ocr_json_dir = source_data_dir / "ocr_extracted" / "json"
    processed_csv_dir = project_root / "data" / "processed"
    
    # Define target directories for deployment
    github_pages_data_dir = project_root / "frontend" / "public" / "data"
    cloudflare_data_dir = project_root / "cloudflare-deploy" / "public" / "data"
    
    # Create necessary directories
    for dir_path in [
        github_pages_data_dir / "api",
        github_pages_data_dir / "csv",
        github_pages_data_dir / "json",
        github_pages_data_dir / "processed",
        github_pages_data_dir / "raw",
        cloudflare_data_dir / "api",
        cloudflare_data_dir / "csv", 
        cloudflare_data_dir / "json",
        cloudflare_data_dir / "processed"
    ]:
        dir_path.mkdir(parents=True, exist_ok=True)
    
    print("Creating organized data structure...")
    
    # Copy OCR JSON files to both targets with organization by category
    category_mapping = {
        "gasto": "gastos", 
        "budget": "presupuesto",
        "expenditure": "gastos",
        "revenue": "ingresos", 
        "ingresos": "ingresos",
        "licitacion": "licitaciones",
        "tender": "licitaciones",
        "health": "salud",
        "salud": "salud",
        "education": "educacion",
        "educacion": "educacion",
        "security": "seguridad",
        "seguridad": "seguridad",
        "2019": "2019",
        "2020": "2020", 
        "2021": "2021",
        "2022": "2022",
        "2023": "2023",
        "2024": "2024",
        "2025": "2025"
    }
    
    # Copy JSON files to organized directories
    if ocr_json_dir.exists():
        for json_file in ocr_json_dir.glob("*_extraction.json"):
            # Read the JSON to determine category
            try:
                with open(json_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                
                file_content = data.get('extracted_text', '').lower()
                
                # Determine category based on content
                category = "general"
                for keyword, cat in category_mapping.items():
                    if keyword in file_content:
                        category = cat
                        break
                
                # Create subdirectories for each target
                for target_base in [github_pages_data_dir, cloudflare_data_dir]:
                    # Create category directory
                    cat_dir = target_base / "json" / category
                    cat_dir.mkdir(parents=True, exist_ok=True)
                    
                    # Copy to category-specific directory
                    target_file = cat_dir / json_file.name
                    shutil.copy2(json_file, target_file)
                    
                    # Also copy to general JSON directory
                    general_json_dir = target_base / "json" / "all"
                    general_json_dir.mkdir(parents=True, exist_ok=True)
                    shutil.copy2(json_file, general_json_dir / json_file.name)
                    
            except Exception as e:
                print(f"Error processing {json_file.name}: {e}")
    
    # Copy CSV files to organized directories
    for csv_file in source_data_dir.rglob("*.csv"):
        if "processed" in str(csv_file) or "ocr_extracted" in str(csv_file):
            rel_path = csv_file.relative_to(source_data_dir)
            
            # Create subdirectories for each target
            for target_base in [github_pages_data_dir, cloudflare_data_dir]:
                # Copy to CSV directory
                target_csv_dir = target_base / "csv"
                target_csv_dir.mkdir(parents=True, exist_ok=True)
                
                target_file = target_csv_dir / rel_path.name
                shutil.copy2(csv_file, target_file)
                
                # Also copy to processed directory
                processed_csv_dir = target_base / "processed" / "csv"
                processed_csv_dir.mkdir(parents=True, exist_ok=True)
                shutil.copy2(csv_file, processed_csv_dir / rel_path.name)
    
    # Copy main data files to both targets
    main_data_files = ["main-data.json", "data.json", "main.json"]
    for data_file in main_data_files:
        source = source_data_dir / data_file
        if source.exists():
            for target_base in [github_pages_data_dir, cloudflare_data_dir]:
                shutil.copy2(source, target_base / data_file)
    
    print(f"  Organized {len(list(ocr_json_dir.glob('*.json')))} JSON files")
    print(f"  Organized {len(list(source_data_dir.rglob('*.csv')))} CSV files")


def create_api_endpoints():
    """Create API endpoints for both GitHub Pages and Cloudflare."""
    
    project_root = Path(__file__).parent.resolve()
    
    # Define target directories
    github_pages_data_dir = project_root / "frontend" / "public" / "data"
    cloudflare_data_dir = project_root / "cloudflare-deploy" / "public" / "data"
    
    # Create API documentation
    api_structure = {
        "version": "1.0.0",
        "endpoints": {
            # Data endpoints
            "processed_data": {
                "path": "/data/processed",
                "description": "All processed data from OCR extraction",
                "methods": ["GET"],
                "subdirectories": [
                    "csv/", "json/", "text/"
                ]
            },
            "categorized_data": {
                "path": "/data/json/{category}/",
                "description": "Data organized by category (gastos, ingresos, licitaciones, etc.)",
                "methods": ["GET"],
                "categories": ["gastos", "ingresos", "presupuesto", "licitaciones", "salud", "educacion", "seguridad", "2019", "2020", "2021", "2022", "2023", "2024", "2025"]
            },
            "raw_data": {
                "path": "/data/raw/",
                "description": "Original data files",
                "methods": ["GET"]
            },
            "main_catalogs": {
                "path": "/data/{main-data.json|data.json|main.json}",
                "description": "Main data catalogs",
                "methods": ["GET"]
            }
        },
        "last_updated": datetime.now().isoformat(),
        "documentation": "/api/documentation.json"
    }
    
    # Create API documentation for both targets
    for target_base in [github_pages_data_dir, cloudflare_data_dir]:
        api_docs_dir = target_base / "api"
        api_docs_dir.mkdir(parents=True, exist_ok=True)
        
        # Create API documentation
        docs_file = api_docs_dir / "documentation.json"
        with open(docs_file, 'w', encoding='utf-8') as f:
            json.dump(api_structure, f, indent=2)
        
        # Create data index
        data_index = {
            "generated_at": datetime.now().isoformat(),
            "total_json_files": len(list((target_base / "json").rglob("*.json"))),
            "total_csv_files": len(list((target_base / "csv").glob("*.csv"))),
            "categories": [str(p.name) for p in (target_base / "json").iterdir() if p.is_dir()],
            "endpoints": api_structure["endpoints"]
        }
        
        index_file = api_docs_dir / "index.json"
        with open(index_file, 'w', encoding='utf-8') as f:
            json.dump(data_index, f, indent=2)


def prepare_for_deployment():
    """Prepare data for GitHub Pages and Cloudflare deployment."""
    
    project_root = Path(__file__).parent.resolve()
    
    # GitHub Pages target
    github_pages_data_dir = project_root / "frontend" / "public" / "data"
    
    # Cloudflare target
    cloudflare_data_dir = project_root / "cloudflare-deploy" / "public" / "data"
    
    # Create deployment readiness file for both targets
    readiness_info = {
        "deployment_ready": True,
        "timestamp": datetime.now().isoformat(),
        "data_organized": True,
        "api_endpoints_created": True,
        "target_environment": "production",
        "custom_domain": "cda-transparencia.org",
        "github_pages_url": "https://flongstaff.github.io/cda-transparencia/",
        "cloudflare_workers_url": "https://cda-transparencia.franco-longstaff.workers.dev/",
        "data_summary": {
            "json_files_count": len(list((github_pages_data_dir / "json").rglob("*.json"))),
            "csv_files_count": len(list((github_pages_data_dir / "csv").glob("*.csv"))),
            "organized_by_category": True,
            "ready_for_frontend": True,
            "ready_for_backend": True
        }
    }
    
    # Add readiness file to both targets
    for target_base in [github_pages_data_dir, cloudflare_data_dir]:
        readiness_file = target_base / "deployment_ready.json"
        with open(readiness_file, 'w', encoding='utf-8') as f:
            json.dump(readiness_info, f, indent=2)
    
    print("Deployment readiness files created for both targets")
    
    # Create sitemap for GitHub Pages
    sitemap_data = {
        "generated_at": datetime.now().isoformat(),
        "custom_domain": "cda-transparencia.org",
        "pages": [
            "/",
            "/data/",
            "/data/json/",
            "/data/csv/",
            "/data/processed/",
            "/api/documentation.json",
            "/api/index.json"
        ],
        "data_categories": [
            "/data/json/gastos/",
            "/data/json/ingresos/",
            "/data/json/presupuesto/",
            "/data/json/licitaciones/",
            "/data/json/salud/",
            "/data/json/educacion/",
            "/data/json/seguridad/",
            "/data/json/2019/",
            "/data/json/2020/",
            "/data/json/2021/",
            "/data/json/2022/",
            "/data/json/2023/",
            "/data/json/2024/",
            "/data/json/2025/"
        ]
    }
    
    # Save sitemap to main data directories
    for target_base in [github_pages_data_dir, cloudflare_data_dir]:
        sitemap_file = target_base / "sitemap.json"
        with open(sitemap_file, 'w', encoding='utf-8') as f:
            json.dump(sitemap_data, f, indent=2)


def main():
    """Main function to organize data for deployment."""
    print("🚀 Organizing data for Carmen de Areco Transparency Portal deployment...")
    
    # Create organized data structure
    create_organized_data_structure()
    
    # Create API endpoints
    create_api_endpoints()
    
    # Prepare for deployment
    prepare_for_deployment()
    
    print("\n✅ Data organization completed!")
    print("📁 Organized data for:")
    print("   - GitHub Pages (frontend/public/data)")
    print("   - Cloudflare Workers (cloudflare-deploy/public/data)")
    print("   - Custom domain deployment (cda-transparencia.org)")
    print("\n📊 Data structure:")
    print("   - CSV files organized by type")
    print("   - JSON files categorized by content")
    print("   - API endpoints ready for backend")
    print("   - Deployment readiness indicators in place")


if __name__ == "__main__":
    main()