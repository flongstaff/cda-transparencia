import os
import pandas as pd
from difflib import unified_diff  # For comparing doc versions
import logging
import json
import re

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def detect_anomalies(download_dir='cold_storage/documents/pdf/', output_file='cold_storage/reports/anomalies.csv', processed_data_file='cold_storage/metadata/local_processed_data.json'):
    logger.info("Starting anomaly detection...")
    
    # Ensure output directory exists
    os.makedirs(os.path.dirname(output_file), exist_ok=True)

    # Load processed data (from local_data_processor.py)
    processed_docs = {}
    if os.path.exists(processed_data_file):
        with open(processed_data_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
            for entry in data:
                # Use a unique identifier for each document, e.g., filename or document_number + year
                doc_id = entry['file_path'] # Using full path as ID for now
                processed_docs[doc_id] = entry['parsed_data']
    else:
        logger.warning(f"Processed data file not found: {processed_data_file}. Cannot perform detailed anomaly detection.")
        # Proceed with only file presence check if processed data is not available

    anomalies = []

    # 1. Check for missing/deleted documents based on expected patterns (placeholder)
    # This would require a list of *expected* documents, which we don't have yet.
    # For now, we'll just check if files exist in the download directory.
    logger.info(f"Checking for presence of files in {download_dir}")
    expected_years = range(2018, 2026) # Based on project scope
    
    # This part needs to be more sophisticated, e.g., checking for specific budget/tender files
    # For demonstration, let's assume we expect at least one PDF per year in the download_dir
    found_years = set()
    if os.path.exists(download_dir):
        for f in os.listdir(download_dir):
            if f.endswith('.pdf'):
                # Try to extract year from filename (very basic, needs refinement)
                year_match = re.search(r'(\d{4})', f)
                if year_match:
                    found_years.add(int(year_match.group(1)))

    for year in expected_years:
        if year not in found_years:
            anomalies.append({
                'type': 'Missing Document',
                'description': f'No PDF documents found for year {year} in {download_dir}',
                'severity': 'High',
                'details': f'Consider filing FOIA request for {year} data.'
            })

    # 2. Compare document versions (placeholder)
    # This would involve comparing content of different versions of the same document
    # For example, if we had 2023_budget_v1.pdf and 2023_budget_v2.pdf
    # Or comparing a current document with its Wayback Machine archive
    # This requires a more robust document identification and versioning system.
    logger.info("Skipping document version comparison (not implemented yet).")

    # 3. Flag worrying numbers (placeholder)
    # This would require actual financial data extracted from documents.
    # For example, if 'gastos' > 'ingresos' by >10%
    # This needs structured financial data from the ETL process.
    logger.info("Skipping worrying numbers detection (requires structured financial data).")

    # Example: Flagging based on parsed data (if available)
    for doc_id, parsed_data in processed_docs.items():
        if parsed_data.get('document_type') == 'Public Tender' and parsed_data.get('budget') is not None:
            if parsed_data['budget'] > 100000000: # Example: Flag tenders over 100M
                anomalies.append({
                    'type': 'High Value Tender',
                    'description': f'Public Tender {parsed_data.get('document_number', doc_id)} has a high budget: ${parsed_data['budget']}',
                    'severity': 'Medium',
                    'details': 'Requires further scrutiny.'
                })

    df = pd.DataFrame(anomalies)
    if not df.empty:
        df.to_csv(output_file, index=False)
        logger.info(f"Anomalies report generated: {output_file}")
    else:
        logger.info("No anomalies detected in this run.")
        # Create an empty file to indicate no anomalies
        open(output_file, 'a').close()

if __name__ == "__main__":
    # Ensure cold_storage/reports directory exists
    os.makedirs('cold_storage/reports', exist_ok=True)
    detect_anomalies()
    logger.info("Anomaly detection process completed.")
