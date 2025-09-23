#!/usr/bin/env python3
"""
Unified Data Loader for Carmen de Areco Transparency Portal
This script loads and integrates all data sources (JSON, Markdown, PDF references)
for website display.
"""

import json
import os
from pathlib import Path
from typing import Dict, List, Any
import logging
from datetime import datetime

class UnifiedDataLoader:
    """Unified data loader that integrates all sources for website display"""
    
    def __init__(self, data_path: str = "data"):
        self.data_path = Path(data_path)
        self.setup_logging()
        
        # Initialize data stores
        self.json_data = {}
        self.markdown_content = {}
        self.pdf_references = {}
        self.main_report = None
        self.load_all_data()
    
    def setup_logging(self):
        """Setup logging for the data loader"""
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        self.logger = logging.getLogger(__name__)
    
    def load_main_report(self) -> Dict[str, Any]:
        """Load the main multi-source report"""
        main_report_path = self.data_path / "multi_source_report.json"
        if main_report_path.exists():
            try:
                with open(main_report_path, 'r') as f:
                    self.main_report = json.load(f)
                self.logger.info("Main report loaded successfully")
                return self.main_report
            except Exception as e:
                self.logger.error(f"Error loading main report: {e}")
        return None
    
    def load_json_files(self) -> Dict[str, Any]:
        """Load all structured JSON data for charts and visualizations"""
        self.logger.info("Loading JSON files for charts and visualizations...")
        
        # Look for all JSON files in organized_documents directory
        json_dir = self.data_path / "organized_documents" / "json"
        if json_dir.exists():
            json_files = list(json_dir.glob("*.json"))
            self.logger.info(f"Found {len(json_files)} JSON files")
            
            for json_file in json_files:
                try:
                    with open(json_file, 'r') as f:
                        data = json.load(f)
                    
                    # Use filename without extension as key
                    key = json_file.stem
                    self.json_data[key] = data
                    
                    # Special handling for financial reports
                    if "financial" in key.lower() or "budget" in key.lower():
                        self.logger.info(f"Financial data loaded: {key}")
                        
                except Exception as e:
                    self.logger.error(f"Error loading {json_file}: {e}")
        
        # Load financial reports from other locations
        financial_dirs = [
            self.data_path / "organized_analysis" / "financial_oversight",
            self.data_path / "organized_documents"
        ]
        
        for financial_dir in financial_dirs:
            if financial_dir.exists():
                for json_file in financial_dir.glob("**/*.json"):
                    try:
                        with open(json_file, 'r') as f:
                            data = json.load(f)
                        
                        # Use relative path as key
                        key = str(json_file.relative_to(self.data_path))
                        self.json_data[key] = data
                        
                    except Exception as e:
                        self.logger.error(f"Error loading {json_file}: {e}")
        
        return self.json_data
    
    def load_markdown_files(self) -> Dict[str, str]:
        """Load all markdown files for narrative content"""
        self.logger.info("Loading markdown files for narrative content...")
        
        # Look for markdown files in markdown_documents directory
        md_dir = self.data_path / "markdown_documents"
        if md_dir.exists():
            md_files = list(md_dir.glob("**/*.md"))
            self.logger.info(f"Found {len(md_files)} markdown files")
            
            for md_file in md_files:
                try:
                    with open(md_file, 'r') as f:
                        content = f.read()
                    
                    # Use filename without extension as key
                    key = md_file.stem
                    self.markdown_content[key] = content
                    
                    # Log some basic info about the content
                    lines = content.split('\n')
                    self.logger.info(f"Markdown file loaded: {key} ({len(lines)} lines)")
                    
                except Exception as e:
                    self.logger.error(f"Error loading {md_file}: {e}")
        
        return self.markdown_content
    
    def load_pdf_references(self) -> Dict[str, Any]:
        """Load PDF references for document downloads"""
        self.logger.info("Loading PDF references for document access...")
        
        # Look for organized PDFs directory structure
        pdf_dir = self.data_path / "organized_pdfs"
        if pdf_dir.exists():
            # Walk through the organized PDF structure
            pdf_files = []
            
            for root, dirs, files in os.walk(pdf_dir):
                for file in files:
                    if file.endswith('.pdf'):
                        pdf_path = Path(root) / file
                        relative_path = str(pdf_path.relative_to(self.data_path))
                        pdf_files.append(relative_path)
            
            self.pdf_references = {
                "pdf_count": len(pdf_files),
                "pdf_list": pdf_files,
                "structure": self._build_pdf_structure(pdf_dir)
            }
            
            self.logger.info(f"Loaded {len(pdf_files)} PDF references")
        
        return self.pdf_references
    
    def _build_pdf_structure(self, pdf_dir: Path) -> Dict[str, Any]:
        """Build a hierarchical structure of PDF organization"""
        structure = {}
        
        try:
            for year_dir in pdf_dir.iterdir():
                if year_dir.is_dir() and year_dir.name.isdigit():
                    structure[year_dir.name] = {}
                    for category_dir in year_dir.iterdir():
                        if category_dir.is_dir():
                            structure[year_dir.name][category_dir.name] = []
                            for pdf_file in category_dir.glob("*.pdf"):
                                structure[year_dir.name][category_dir.name].append({
                                    "filename": pdf_file.name,
                                    "path": str(pdf_file.relative_to(self.data_path)),
                                    "size": pdf_file.stat().st_size
                                })
        except Exception as e:
            self.logger.error(f"Error building PDF structure: {e}")
        
        return structure
    
    def load_all_data(self):
        """Load all data sources"""
        self.logger.info("Starting unified data loading process...")
        
        # Load main report first
        self.load_main_report()
        
        # Load JSON data for charts
        self.load_json_files()
        
        # Load markdown content for narratives
        self.load_markdown_files()
        
        # Load PDF references
        self.load_pdf_references()
        
        self.logger.info("Data loading complete!")
    
    def get_data_for_charts(self) -> Dict[str, Any]:
        """Get structured data ready for charts and visualizations"""
        # Filter JSON files that are likely to be chart-ready
        chart_ready_data = {}
        
        for key, data in self.json_data.items():
            # Filter out metadata and focus on actual data
            if isinstance(data, list) and len(data) > 0:
                # Check if it looks like financial or structured data
                first_item = data[0]
                if isinstance(first_item, dict):
                    # Look for financial or numerical data
                    financial_fields = ['income', 'expenses', 'balance', 'amount', 'year']
                    if any(field in first_item for field in financial_fields):
                        chart_ready_data[key] = data
                    elif 'data' in first_item or 'items' in first_item:
                        # Data with nested structure
                        chart_ready_data[key] = data
            elif isinstance(data, dict) and 'data' in data:
                chart_ready_data[key] = data['data']
        
        return chart_ready_data
    
    def get_narrative_content(self) -> Dict[str, str]:
        """Get markdown content for narrative sections"""
        return self.markdown_content
    
    def get_document_references(self) -> Dict[str, Any]:
        """Get PDF references for document downloads"""
        return self.pdf_references
    
    def get_main_report_summary(self) -> Dict[str, Any]:
        """Get summary from main report"""
        if self.main_report:
            return {
                "municipality": self.main_report.get("municipality", {}),
                "total_sources": self.main_report.get("sources", {}),
                "timestamp": self.main_report.get("timestamp", "")
            }
        return {}
    
    def generate_data_inventory(self) -> Dict[str, Any]:
        """Generate an inventory of all loaded data"""
        return {
            "timestamp": datetime.now().isoformat(),
            "data_inventory": {
                "json_files": len(self.json_data),
                "markdown_files": len(self.markdown_content),
                "pdf_references": self.pdf_references.get("pdf_count", 0),
                "main_report": self.main_report is not None,
                "data_summary": {
                    "json_files_list": list(self.json_data.keys())[:10],  # First 10
                    "markdown_files_list": list(self.markdown_content.keys())[:10],  # First 10
                    "pdf_structure": self.pdf_references.get("structure", {})
                }
            }
        }

def main():
    """Main function to demonstrate data loading"""
    print("Unified Data Loader for Carmen de Areco Transparency Portal")
    print("=" * 60)
    
    # Initialize data loader
    loader = UnifiedDataLoader()
    
    # Generate inventory
    inventory = loader.generate_data_inventory()
    print(f"\nData Inventory:")
    print(f"  JSON files: {inventory['data_inventory']['json_files']}")
    print(f"  Markdown files: {inventory['data_inventory']['markdown_files']}")
    print(f"  PDF references: {inventory['data_inventory']['pdf_references']}")
    
    # Show main report summary if available
    main_report = loader.get_main_report_summary()
    if main_report:
        print(f"\nMain Report Summary:")
        print(f"  Municipality: {main_report['municipality'].get('name', 'Unknown')}")
        print(f"  Report timestamp: {main_report['timestamp']}")
    
    # Show sample data for charts
    chart_data = loader.get_data_for_charts()
    print(f"\nChart-ready data files: {len(chart_data)}")
    for key in list(chart_data.keys())[:3]:  # Show first 3
        print(f"  - {key}")
    
    # Show sample narrative content
    narrative_content = loader.get_narrative_content()
    print(f"\nNarrative content files: {len(narrative_content)}")
    for key in list(narrative_content.keys())[:3]:  # Show first 3
        print(f"  - {key}")
    
    # Show sample PDF references
    pdf_refs = loader.get_document_references()
    print(f"\nPDF References:")
    print(f"  Total PDFs: {pdf_refs.get('pdf_count', 0)}")
    
    # Save inventory to file
    with open("data/data_inventory.json", "w") as f:
        json.dump(inventory, f, indent=2)
    
    print(f"\nData inventory saved to data/data_inventory.json")
    print("✅ Data loading complete - all sources ready for website display!")

if __name__ == "__main__":
    main()