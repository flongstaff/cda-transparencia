  #!/usr/bin/env python3
  import os
  import json
  import csv
  import glob
  from collections import defaultdict
  from pathlib import Path
  import hashlib

  def load_json_file(file_path):
      \"\"\"Safely load a JSON file, returning empty dict if not found or invalid.\"\"\"
      try:
          with open(file_path, 'r', encoding='utf-8') as f:
              return json.load(f)
      except (FileNotFoundError, json.JSONDecodeError):
          return {}

  def find_all_csv_files():
      \"\"\"Find all CSV files in the project.\"\"\"
      csv_files = []

  Common CSV locations in the project
      csv_paths = [
          'data/processed/budgets',
          'data/processed/csv',
          'data/raw/csv',
          'public/data'
      ]

      for path in csv_paths:
          full_path = os.path.join(os.getcwd(), path)
          if os.path.exists(full_path):
              for root, _, files in os.walk(full_path):
                  for file in files:
                      if file.endswith('.csv'):
                          csv_files.append(os.path.join(root, file))

      return csv_files

  def find_all_pdf_files():
      \"\"\"Find all PDF files in the project.\"\"\"
      pdf_files = []

  Common PDF locations in the project
      pdf_paths = [
          'public/data',
          'data/raw/pdfs',
          'data/processed/pdfs'
      ]

      for path in pdf_paths:
          full_path = os.path.join(os.getcwd(), path)
          if os.path.exists(full_path):
              for root, _, files in os.walk(full_path):
                  for file in files:
                      if file.endswith('.pdf'):
                          pdf_files.append(os.path.join(root, file))

      return pdf_files

  def load_document_datasets():
      \"\"\"Load all document datasets from JSON files.\"\"\"
      datasets = {}

  Load main data files
      main_data_files = [
          'data/main-data.json',
          'data/main.json',
          'data/data.json'
      ]

      for file_path in main_data_files:
          full_path = os.path.join(os.getcwd(), file_path)
          data = load_json_file(full_path)
          if data:
  Use filename without extension as key
              key = os.path.splitext(os.path.basename(file_path))[0]
              datasets[key] = data

      return datasets

  def load_pdf_manifest():
      \"\"\"Load the PDF manifest from public/data.\"\"\"
      manifest_path = os.path.join(os.getcwd(), 'public/data/pdf-manifest.json')
      return load_json_file(manifest_path)

  def create_document_hash(url):
      \"\"\"Create a consistent hash for document identification.\"\"\"
      return hashlib.md5(url.encode()).hexdigest()

  def link_documents_and_files(datasets, pdf_files, csv_files, pdf_manifest):
      \"\"\"Create comprehensive links between documents and processed files.\"\"\"
  Create mappings
      document_links = {}
      pdf_file_map = {}
      csv_file_map = {}

  Map PDF files by their names/paths
      for pdf_file in pdf_files:
          pdf_name = os.path.basename(pdf_file)
          pdf_stem = os.path.splitext(pdf_name)[0]
          pdf_file_map[pdf_stem] = pdf_file

  Map CSV files by their names/paths
      for csv_file in csv_files:
          csv_name = os.path.basename(csv_file)
          csv_stem = os.path.splitext(csv_name)[0]
          if csv_stem not in csv_file_map:
              csv_file_map[csv_stem] = []
          csv_file_map[csv_stem].append(csv_file)

  Process each dataset
      for dataset_name, dataset in datasets.items():
          if isinstance(dataset, list):
              for doc in dataset:
                  process_document(doc, document_links, pdf_file_map, csv_file_map, pdf_manifest)
          elif isinstance(dataset, dict):
  Handle dictionary-based datasets
              for key, value in dataset.items():
                  if isinstance(value, list):
                      for doc in value:
                          process_document(doc, document_links, pdf_file_map, csv_file_map, pdf_manifest)

  Also process the PDF manifest
      if isinstance(pdf_manifest, dict) and 'documents' in pdf_manifest:
          for doc in pdf_manifest['documents']:
              process_document(doc, document_links, pdf_file_map, csv_file_map, pdf_manifest)

      return document_links

  def process_document(doc, document_links, pdf_file_map, csv_file_map, pdf_manifest):
      \"\"\"Process a single document and create links.\"\"\"
  Extract URL or identifier from document
      url = None
      if isinstance(doc, dict):
  Try common field names for URLs
          for field in ['url', 'link', 'pdf_url', 'document_url', 'source']:
              if field in doc:
                  url = doc[field]
                  break

  If no URL found, try to create one from other fields
          if not url:
  Try combining fields to form a URL-like identifier
              if 'year' in doc and 'title' in doc:
                  url = f\"{doc['year']}_{doc['title']}\"
              elif 'id' in doc:
                  url = str(doc['id'])
              elif 'name' in doc:
                  url = str(doc['name'])

      if not url:
  Skip documents without identifiers
          return

  Create document hash for consistent identification
      doc_hash = create_document_hash(str(url))

  Initialize document entry if not exists
      if doc_hash not in document_links:
          document_links[doc_hash] = {
              'original_document': doc,
              'url': url,
              'pdf_path': None,
              'csv_paths': [],
              'processed': False,
              'metadata': {}
          }

  Try to find matching PDF file
      pdf_path = find_matching_pdf(url, pdf_file_map)
      if pdf_path:
          document_links[doc_hash]['pdf_path'] = pdf_path
          document_links[doc_hash]['processed'] = True

  Try to find matching CSV files
      csv_paths = find_matching_csvs(url, csv_file_map)
      if csv_paths:
          document_links[doc_hash]['csv_paths'].extend(csv_paths)
          document_links[doc_hash]['processed'] = True

  def find_matching_pdf(url, pdf_file_map):
      \"\"\"Find a matching PDF file for a document URL.\"\"\"
      url_str = str(url).lower()

  Try direct matching
      for pdf_stem, pdf_path in pdf_file_map.items():
          if pdf_stem.lower() in url_str or url_str in pdf_stem.lower():
              return pdf_path

  Try matching by removing common prefixes/suffixes
      clean_url = url_str.replace('http://', '').replace('https://', '').replace('www.', '')
      clean_url = os.path.splitext(clean_url)[0]  # Remove extension

      for pdf_stem, pdf_path in pdf_file_map.items():
          clean_pdf = pdf_stem.lower().replace('_', '-').replace(' ', '-')
          if clean_pdf in clean_url or clean_url in clean_pdf:
              return pdf_path

      return None

  def find_matching_csvs(url, csv_file_map):
      \"\"\"Find matching CSV files for a document URL.\"\"\"
      url_str = str(url).lower()
      matches = []

  Try direct matching
      for csv_stem, csv_paths in csv_file_map.items():
          if csv_stem.lower() in url_str or url_str in csv_stem.lower():
              matches.extend(csv_paths)

  Try matching by removing common prefixes/suffixes
      clean_url = url_str.replace('http://', '').replace('https://', '').replace('www.', '')
      clean_url = os.path.splitext(clean_url)[0]  # Remove extension

      for csv_stem, csv_paths in csv_file_map.items():
          clean_csv = csv_stem.lower().replace('_', '-').replace(' ', '-')
          if clean_csv in clean_url or clean_url in clean_csv:
              matches.extend(csv_paths)

      return list(set(matches))  # Remove duplicates

  def generate_comprehensive_report(document_links):
      \"\"\"Generate a comprehensive report of all document links.\"\"\"
      report = {
          'total_documents': len(document_links),
          'processed_documents': sum(1 for doc in document_links.values() if doc['processed']),
          'documents_with_pdf': sum(1 for doc in document_links.values() if doc['pdf_path']),
          'documents_with_csv': sum(1 for doc in document_links.values() if doc['csv_paths']),
          'document_details': list(document_links.values())
      }

      return report

  def save_comprehensive_dataset(report):
      \"\"\"Save the comprehensive dataset to files.\"\"\"
      output_dir = os.path.join(os.getcwd(), 'data', 'comprehensive_dataset')
      os.makedirs(output_dir, exist_ok=True)

  Save JSON report
      json_path = os.path.join(output_dir, 'document_links.json')
      with open(json_path, 'w', encoding='utf-8') as f:
          json.dump(report, f, ensure_ascii=False, indent=2)

  Save CSV summary
      csv_path = os.path.join(output_dir, 'document_links_summary.csv')
      with open(csv_path, 'w', newline='', encoding='utf-8') as csvfile:
          fieldnames = ['url', 'pdf_path', 'csv_count', 'processed']
          writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
          writer.writeheader()

          for doc in report['document_details']:
              writer.writerow({
                  'url': doc['url'],
                  'pdf_path': doc['pdf_path'] or '',
                  'csv_count': len(doc['csv_paths']),
                  'processed': doc['processed']
              })

      print(f\"Comprehensive dataset saved to {output_dir}\")
      print(f\"JSON report: {json_path}\")
      print(f\"CSV summary: {csv_path}\")

  def integrate_with_existing_systems(document_links):
      \"\"\"Integrate the document links with existing data systems.\"\"\"
  Update the frontend API data
      api_dir = os.path.join(os.getcwd(), 'scripts', 'frontend', 'public', 'data', 'api')
      os.makedirs(api_dir, exist_ok=True)

  Save as JSON for frontend consumption
      api_json_path = os.path.join(api_dir, 'document_links.json')
      with open(api_json_path, 'w', encoding='utf-8') as f:
          json.dump(list(document_links.values()), f, ensure_ascii=False, indent=2)

  Also save as CSV for easy inspection
      api_csv_path = os.path.join(api_dir, 'document_links.csv')
      with open(api_csv_path, 'w', newline='', encoding='utf-8') as csvfile:
          fieldnames = ['url', 'pdf_path', 'csv_paths', 'processed']
          writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
          writer.writeheader()

          for doc in document_links.values():
              writer.writerow({
                  'url': doc['url'],
                  'pdf_path': doc['pdf_path'] or '',
                  'csv_paths': '; '.join(doc['csv_paths']),
                  'processed': doc['processed']
              })

      print(f\"Frontend API data updated: {api_json_path}\")

  def main():
      print(\"Starting Unified Dataset Linker...\")

  Find all relevant files
      print(\"Finding CSV files...\")
      csv_files = find_all_csv_files()
      print(f\"Found {len(csv_files)} CSV files\")

      print(\"Finding PDF files...\")
      pdf_files = find_all_pdf_files()
      print(f\"Found {len(pdf_files)} PDF files\")

  Load datasets
      print(\"Loading document datasets...\")
      datasets = load_document_datasets()
      print(f\"Loaded {len(datasets)} datasets\")

      print(\"Loading PDF manifest...\")
      pdf_manifest = load_pdf_manifest()

  Create links
      print(\"Linking documents and files...\")
      document_links = link_documents_and_files(datasets, pdf_files, csv_files, pdf_manifest)
      print(f\"Created links for {len(document_links)} documents\")

  Generate reports
      print(\"Generating comprehensive report...\")
      report = generate_comprehensive_report(document_links)

  Save datasets
      print(\"Saving comprehensive dataset...\")
      save_comprehensive_dataset(report)

  Integrate with existing systems
      print(\"Integrating with existing systems...\")
      integrate_with_existing_systems(document_links)

  Print summary
      print(\"\\n=== SUMMARY ===\")
      print(f\"Total documents: {report['total_documents']}\")
      print(f\"Processed documents: {report['processed_documents']}\")
      print(f\"Documents with PDF: {report['documents_with_pdf']}\")
      print(f\"Documents with CSV: {report['documents_with_csv']}\")

      if report['total_documents'] > 0:
          processed_pct = (report['processed_documents'] / report['total_documents']) * 100
          print(f\"Processing rate: {processed_pct:.1f}%\")

      print(\"\\nUnified Dataset Linker completed successfully!\")

  if __name__ == \"__main__\":
      main()