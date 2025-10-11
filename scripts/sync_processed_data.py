#!/usr/bin/env python3
"""
Data Sync Script for Carmen de Areco Transparency Portal

This script ensures that both backend and frontend have access to processed data
from OCR extraction, by syncing the processed data to appropriate public directories.
"""

import json
import shutil
from pathlib import Path
import os


def sync_processed_data():
    """Sync processed data to both backend and frontend locations."""
    
    project_root = Path(__file__).parent.resolve()
    data_dir = project_root / "data"
    frontend_data_dir = project_root / "frontend" / "public" / "data"
    backend_data_dir = project_root / "backend" / "data"
    
    # Source directories for processed data
    ocr_extracted_dir = data_dir / "ocr_extracted"
    processed_dir = data_dir / "processed"
    
    # Create target directories if they don't exist
    frontend_data_dir.mkdir(parents=True, exist_ok=True)
    backend_data_dir.mkdir(parents=True, exist_ok=True)
    
    print("Syncing processed data to frontend and backend...")
    
    # Sync OCR extracted JSON files
    frontend_ocr_json_dir = frontend_data_dir / "ocr_extracted" / "json"
    backend_ocr_json_dir = backend_data_dir / "ocr_extracted" / "json"
    
    frontend_ocr_json_dir.mkdir(parents=True, exist_ok=True)
    backend_ocr_json_dir.mkdir(parents=True, exist_ok=True)
    
    if ocr_extracted_dir.exists():
        for json_file in (ocr_extracted_dir / "json").glob("*.json"):
            frontend_target = frontend_ocr_json_dir / json_file.name
            backend_target = backend_ocr_json_dir / json_file.name
            
            shutil.copy2(json_file, frontend_target)
            shutil.copy2(json_file, backend_target)
            print(f"  Synced: {json_file.name}")
    
    # Sync OCR extracted CSV files
    frontend_ocr_csv_dir = frontend_data_dir / "ocr_extracted" / "csv"
    backend_ocr_csv_dir = backend_data_dir / "ocr_extracted" / "csv"
    
    frontend_ocr_csv_dir.mkdir(parents=True, exist_ok=True)
    backend_ocr_csv_dir.mkdir(parents=True, exist_ok=True)
    
    # Sync from the processed location where CSV files were created
    for csv_file in data_dir.rglob("*.csv"):
        if "processed" in str(csv_file) or "ocr_extracted" in str(csv_file):
            # Copy to frontend
            rel_path = csv_file.relative_to(data_dir)
            frontend_target = frontend_data_dir / "processed_csvs" / rel_path.name
            frontend_target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(csv_file, frontend_target)
            
            # Copy to backend
            backend_target = backend_data_dir / "processed_csvs" / rel_path.name
            backend_target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(csv_file, backend_target)
    
    # Sync processing summary
    summary_file = ocr_extracted_dir / "processing_summary.json"
    if summary_file.exists():
        frontend_summary = frontend_data_dir / "processing_summary.json"
        backend_summary = backend_data_dir / "processing_summary.json"
        
        shutil.copy2(summary_file, frontend_summary)
        shutil.copy2(summary_file, backend_summary)
        print(f"  Synced: processing_summary.json")
    
    # Copy the most important data files to main data locations
    for data_file_name in ["main-data.json", "data.json", "main.json"]:
        source = data_dir / data_file_name
        if source.exists():
            frontend_target = frontend_data_dir / data_file_name
            backend_target = backend_data_dir / data_file_name
            
            shutil.copy2(source, frontend_target)
            shutil.copy2(source, backend_target)
            print(f"  Synced: {data_file_name}")
    
    print(f"\nData sync completed!")
    print(f"Frontend data available at: {frontend_data_dir}")
    print(f"Backend data available at: {backend_data_dir}")


def create_data_access_endpoints():
    """Create API endpoints and documentation for accessing processed data."""
    
    project_root = Path(__file__).parent.resolve()
    api_dir = project_root / "frontend" / "public" / "data" / "api"
    api_dir.mkdir(parents=True, exist_ok=True)
    
    # Create API endpoints documentation
    endpoints_doc = {
        "title": "Carmen de Areco Transparency API",
        "version": "1.0.0",
        "description": "API endpoints for accessing processed data from OCR extraction",
        "endpoints": {
            "ocr_extractions": {
                "path": "/data/ocr_extracted/json/",
                "description": "Access to all OCR extraction results in JSON format",
                "methods": ["GET"],
                "response_format": "application/json"
            },
            "processed_csvs": {
                "path": "/data/processed_csvs/",
                "description": "Access to processed CSV files from PDF extraction",
                "methods": ["GET"],
                "response_format": "text/csv"
            },
            "processing_summary": {
                "path": "/data/processing_summary.json",
                "description": "Summary of the OCR processing workflow",
                "methods": ["GET"],
                "response_format": "application/json"
            },
            "main_data": {
                "path": "/data/main-data.json",
                "description": "Main dataset catalog with extraction metadata",
                "methods": ["GET"],
                "response_format": "application/json"
            }
        },
        "last_updated": "2025-10-10T17:17:10Z"
    }
    
    # Save API documentation
    api_docs_path = api_dir / "documentation.json"
    with open(api_docs_path, 'w', encoding='utf-8') as f:
        json.dump(endpoints_doc, f, indent=2)
    
    print(f"\nAPI endpoints documentation created: {api_docs_path}")
    
    # Create a simple index for easy navigation
    index_content = {
        "title": "Carmen de Areco Transparency Data Index",
        "description": "Index of all available processed data for frontend and backend access",
        "generated_at": "2025-10-10T17:17:10Z",
        "data_sources": {
            "ocr_extractions": {
                "count": len(list((project_root / "data" / "ocr_extracted" / "json").glob("*.json"))),
                "path": "/data/ocr_extracted/json/",
                "format": "json"
            },
            "processed_csvs": {
                "count": len(list((project_root / "data" / "processed").glob("*.csv"))),
                "path": "/data/processed_csvs/",
                "format": "csv"
            },
            "main_data_files": [
                {
                    "name": "main-data.json",
                    "path": "/data/main-data.json",
                    "description": "Main dataset catalog"
                },
                {
                    "name": "data.json", 
                    "path": "/data/data.json",
                    "description": "Primary data catalog"
                },
                {
                    "name": "main.json",
                    "path": "/data/main.json",
                    "description": "Alternative data representation"
                }
            ]
        }
    }
    
    index_path = api_dir / "index.json"
    with open(index_path, 'w', encoding='utf-8') as f:
        json.dump(index_content, f, indent=2)
    
    print(f"Data index created: {index_path}")


def main():
    """Main function to sync data and create API endpoints."""
    print("Preparing data access for backend and frontend...")
    
    # Sync the processed data
    sync_processed_data()
    
    # Create API documentation and endpoints
    create_data_access_endpoints()
    
    print("\nBackend and frontend now have access to processed OCR data!")
    print("Data is available in both frontend/public/data and backend/data directories.")


if __name__ == "__main__":
    main()