#!/usr/bin/env python3
\"\"\"
Data Deployment Script for Carmen de Areco Transparency Portal

This script prepares the processed data for deployment to GitHub Pages and Cloudflare.
\"\"\"

import json
import shutil
from pathlib import Path
import logging

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class DataDeployment:
    \"\"\"Class to prepare data for deployment\"\"\"
    
    def __init__(self):
        self.base_dir = Path(__file__).parent.parent
        self.processed_data_dir = self.base_dir / \"data\" / \"processed\"
        self.external_data_dir = self.base_dir / \"src\" / \"data\" / \"downloaded\"
        self.frontend_data_dir = self.base_dir / \"frontend\" / \"src\" / \"data\"
        
        # Define the data that should be available for the frontend
        self.data_files_to_deploy = [
            \"budget_execution_all_years.csv\",
            \"indicators_all_years.csv\",
            \"budget_execution_all_years.json\",
            \"indicators_all_years.json\"
        ]

    def copy_external_data_to_processed(self):
        \"\"\"Copy external data to processed location for deployment\"\"\"
        logger.info(\"Copying external data to processed location...\")
        
        # Create processed directories
        (self.processed_data_dir / \"csvs\").mkdir(parents=True, exist_ok=True)
        (self.processed_data_dir / \"pdfs\").mkdir(parents=True, exist_ok=True)
        
        # Copy CSV files from external to processed
        external_csv_dir = self.external_data_dir / \"csvs\"
        if external_csv_dir.exists():
            for csv_file in external_csv_dir.glob(\"*.csv\"):
                dest_path = self.processed_data_dir / \"csvs\" / csv_file.name
                shutil.copy2(csv_file, dest_path)
                logger.info(f\"Copied CSV {csv_file.name} to processed location\")
        
        # Copy important PDF files to processed location
        external_pdf_dir = self.external_data_dir / \"pdfs\"
        if external_pdf_dir.exists():
            for pdf_file in external_pdf_dir.glob(\"*.pdf\"):
                dest_path = self.processed_data_dir / \"pdfs\" / pdf_file.name
                shutil.copy2(pdf_file, dest_path)
                logger.info(f\"Copied PDF {pdf_file.name} to processed location\")

    def update_frontend_data_index(self):
        \"\"\"Update the comprehensive data index with latest information\"\"\"
        logger.info(\"Updating frontend data index...\")
        
        # Load the existing comprehensive data index
        index_path = self.frontend_data_dir / \"comprehensive_data_index.json\"
        if index_path.exists():
            with open(index_path, 'r', encoding='utf-8') as f:
                data_index = json.load(f)
        else:
            # Create a default structure
            data_index = {
                \"year\": 2025,
                \"municipality\": \"Carmen de Areco\",
                \"generated_at\": \"2025-01-10T15:30:00Z\",
                \"data_sources\": {},
                \"financialOverview\": {},
                \"budgetBreakdown\": [],
                \"documents\": [],
                \"dashboard\": {},
                \"spendingEfficiency\": {},
                \"auditOverview\": {},
                \"antiCorruption\": {},
                \"analysis\": {},
                \"consistency_check\": {},
                \"summary\": {},
                \"last_updated\": \"2025-01-10T15:30:00Z\"
            }
        
        # Update with information about available data
        data_index[\"data_sources\"][\"external_downloaded\"] = {
            \"type\": \"downloaded_municipal_data\",
            \"description\": \"Downloaded municipal data from transparency portal\",
            \"csv_count\": len(list((self.processed_data_dir / \"csvs\").glob(\"*.csv\"))) if (self.processed_data_dir / \"csvs\").exists() else 0,
            \"pdf_count\": len(list((self.processed_data_dir / \"pdfs\").glob(\"*.pdf\"))) if (self.processed_data_dir / \"pdfs\").exists() else 0,
            \"csv_files\": [f.name for f in (self.processed_data_dir / \"csvs\").glob(\"*.csv\")] if (self.processed_data_dir / \"csvs\").exists() else [],
            \"pdf_files\": [f.name for f in (self.processed_data_dir / \"pdfs\").glob(\"*.pdf\")] if (self.processed_data_dir / \"pdfs\").exists() else []
        }
        
        # Save updated index
        with open(index_path, 'w', encoding='utf-8') as f:
            json.dump(data_index, f, ensure_ascii=False, indent=2)
        
        logger.info(f\"Updated comprehensive data index: {index_path}\")

    def copy_data_to_github_pages_location(self):
        \"\"\"Copy data to locations accessible by GitHub Pages\"\"\"
        logger.info(\"Copying data to GitHub Pages accessible locations...\")
        
        # Create data directory in public folder for GitHub Pages
        github_pages_data_dir = self.base_dir / \"public\" / \"data\"
        github_pages_data_dir.mkdir(parents=True, exist_ok=True)
        
        # Create subdirectories
        (github_pages_data_dir / \"csvs\").mkdir(parents=True, exist_ok=True)
        (github_pages_data_dir / \"pdfs\").mkdir(parents=True, exist_ok=True)
        
        # Copy CSV files to GitHub Pages location
        processed_csv_dir = self.processed_data_dir / \"csvs\"
        if processed_csv_dir.exists():
            for csv_file in processed_csv_dir.glob(\"*.csv\"):
                dest_path = github_pages_data_dir / \"csvs\" / csv_file.name
                shutil.copy2(csv_file, dest_path)
                logger.info(f\"Copied {csv_file.name} to GitHub Pages location: {dest_path}\")
        
        # Copy PDF files to GitHub Pages location
        processed_pdf_dir = self.processed_data_dir / \"pdfs\"
        if processed_pdf_dir.exists():
            for pdf_file in processed_pdf_dir.glob(\"*.pdf\"):
                dest_path = github_pages_data_dir / \"pdfs\" / pdf_file.name
                shutil.copy2(pdf_file, dest_path)
                logger.info(f\"Copied {pdf_file.name} to GitHub Pages location: {dest_path}\")

    def update_github_pages_config(self):
        \"\"\"Update GitHub Pages configuration to ensure data paths are correct\"\"\"
        logger.info(\"Updating GitHub Pages configuration...\")
        
        # Update the existing year-specific JSON files with references to new data
        for year in range(2022, 2026):  # 2022 to 2025
            year_data_path = self.frontend_data_dir / f\"data_index_{year}.json\"
            if year_data_path.exists():
                with open(year_data_path, 'r', encoding='utf-8') as f:
                    year_data = json.load(f)
                
                # Add references to the processed data
                if 'data_sources' not in year_data:
                    year_data['data_sources'] = {}
                
                year_data['data_sources']['external_data'] = {
                    \"csv_files\": f\"/data/csvs/\",
                    \"pdf_files\": f\"/data/pdfs/\",
                    \"csv_count\": len(list((self.processed_data_dir / \"csvs\").glob(\"*.csv\"))) if (self.processed_data_dir / \"csvs\").exists() else 0,
                    \"pdf_count\": len(list((self.processed_data_dir / \"pdfs\").glob(\"*.pdf\"))) if (self.processed_data_dir / \"pdfs\").exists() else 0
                }
                
                # Save updated year data
                with open(year_data_path, 'w', encoding='utf-8') as f:
                    json.dump(year_data, f, ensure_ascii=False, indent=2)
                
                logger.info(f\"Updated year {year} data index with external data references\")

    def deploy_for_github_pages(self):
        \"\"\"Deploy data for GitHub Pages\"\"\"
        logger.info(\"Deploying data for GitHub Pages...\")
        
        # Copy external data to processed location
        self.copy_external_data_to_processed()
        
        # Update the comprehensive data index
        self.update_frontend_data_index()
        
        # Copy data to GitHub Pages accessible locations
        self.copy_data_to_github_pages_location()
        
        # Update GitHub Pages configuration
        self.update_github_pages_config()
        
        logger.info(\"GitHub Pages data deployment completed successfully\")

def main():
    \"\"\"Main function to run the data deployment process\"\"\"
    deployer = DataDeployment()
    deployer.deploy_for_github_pages()
    
    print(f\"\\nGitHub Pages data deployment completed!\")
    print(f\"Data copied to GitHub Pages locations:\")
    print(f\"  - {deployer.base_dir}/public/data/\")
    print(f\"Updated data index files in {deployer.frontend_data_dir}/\")

if __name__ == \"__main__\":
    main()