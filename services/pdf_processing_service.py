#!/usr/bin/env python3
"""
Unified PDF Processing Service
Eliminates redundancy between multiple PDF processing implementations
"""

import pandas as pd
import pdfplumber
import tabula
import camelot
import fitz  # PyMuPDF
import json
import re
from pathlib import Path
from typing import Dict, List, Any, Optional
from datetime import datetime
import logging

class UnifiedPDFProcessor:
    """Single robust PDF processor that selects the best method based on document analysis"""
    
    def __init__(self, output_dir="data/processed_documents"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Setup logging
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
        
        # Document type patterns
        self.document_patterns = {
            "budget_execution": {
                "keywords": ["ejecucion", "presupuesto", "devengado", "pagado", "comprometido"],
                "headers": ["partida", "denominacion", "credito", "devengado", "pagado"]
            },
            "balance_sheet": {
                "keywords": ["balance", "activo", "pasivo", "patrimonio"],
                "headers": ["concepto", "ejercicio", "anterior", "actual"]
            },
            "salary_report": {
                "keywords": ["sueldo", "salario", "remuneracion", "personal"],
                "headers": ["apellido", "nombre", "cargo", "basico", "adicionales", "total"]
            },
            "contract": {
                "keywords": ["contrato", "licitacion", "adjudicacion", "proveedor"],
                "headers": ["proveedor", "objeto", "monto", "fecha", "numero"]
            }
        }
    
    def classify_document(self, pdf_path: str) -> str:
        """Classify document type based on content analysis"""
        try:
            # Extract text from first few pages
            text = ""
            with pdfplumber.open(pdf_path) as pdf:
                for i, page in enumerate(pdf.pages[:3]):  # First 3 pages
                    text += page.extract_text() or ""
            
            # Convert to lowercase for matching
            text_lower = text.lower()
            
            # Score each document type
            scores = {}
            for doc_type, patterns in self.document_patterns.items():
                keyword_score = sum(1 for keyword in patterns["keywords"] if keyword in text_lower)
                header_score = sum(1 for header in patterns["headers"] if header in text_lower)
                scores[doc_type] = keyword_score + header_score
            
            # Return the document type with highest score
            if scores:
                return max(scores, key=scores.get)
            
        except Exception as e:
            self.logger.warning(f"Could not classify document {pdf_path}: {e}")
        
        return "unknown"
    
    def extract_with_tabula(self, pdf_path: str) -> List[pd.DataFrame]:
        """Extract tables using tabula-py"""
        try:
            dfs = tabula.read_pdf(pdf_path, pages="all", multiple_tables=True)
            if dfs:
                # Filter out empty dataframes
                return [df for df in dfs if not df.empty]
        except Exception as e:
            self.logger.warning(f"Tabula extraction failed for {pdf_path}: {e}")
        return []
    
    def extract_with_camelot(self, pdf_path: str) -> List[pd.DataFrame]:
        """Extract tables using camelot"""
        try:
            tables = camelot.read_pdf(pdf_path, pages="all")
            if tables:
                return [table.df for table in tables]
        except Exception as e:
            self.logger.warning(f"Camelot extraction failed for {pdf_path}: {e}")
        return []
    
    def extract_with_pdfplumber(self, pdf_path: str) -> List[pd.DataFrame]:
        """Extract tables using pdfplumber"""
        tables = []
        try:
            with pdfplumber.open(pdf_path) as pdf:
                for page in pdf.pages:
                    page_tables = page.extract_tables()
                    for table in page_tables:
                        if table and len(table) > 1:  # At least header and one row
                            df = pd.DataFrame(table[1:], columns=table[0])
                            tables.append(df)
        except Exception as e:
            self.logger.warning(f"PDFPlumber extraction failed for {pdf_path}: {e}")
        return tables
    
    def extract_with_pymupdf(self, pdf_path: str) -> List[pd.DataFrame]:
        """Extract tables using PyMuPDF"""
        tables = []
        try:
            doc = fitz.open(pdf_path)
            for page_num in range(len(doc)):
                page = doc.load_page(page_num)
                page_tables = page.find_tables()
                for table in page_tables:
                    table_data = table.extract()
                    if table_data and len(table_data) > 1:
                        df = pd.DataFrame(table_data[1:], columns=table_data[0])
                        tables.append(df)
            doc.close()
        except Exception as e:
            self.logger.warning(f"PyMuPDF extraction failed for {pdf_path}: {e}")
        return tables
    
    def select_best_method(self, pdf_path: str, document_type: str) -> str:
        """Select the best extraction method based on document type"""
        # Method preferences by document type
        preferences = {
            "budget_execution": ["tabula", "camelot", "pdfplumber"],
            "balance_sheet": ["pdfplumber", "tabula", "camelot"],
            "salary_report": ["tabula", "pdfplumber", "camelot"],
            "contract": ["camelot", "tabula", "pdfplumber"],
            "unknown": ["tabula", "pdfplumber", "camelot", "pymupdf"]
        }
        
        return preferences.get(document_type, preferences["unknown"])
    
    def process_pdf(self, pdf_path: str) -> Dict[str, Any]:
        """Process PDF using the most appropriate method"""
        self.logger.info(f"Processing PDF: {pdf_path}")
        
        # Classify document
        document_type = self.classify_document(pdf_path)
        self.logger.info(f"Document classified as: {document_type}")
        
        # Select extraction methods
        methods = self.select_best_method(pdf_path, document_type)
        self.logger.info(f"Using extraction methods: {methods}")
        
        # Try each method in order of preference
        results = {
            "filename": Path(pdf_path).name,
            "document_type": document_type,
            "extraction_results": {},
            "best_method": None,
            "tables": [],
            "metadata": {}
        }
        
        for method in methods:
            tables = []
            if method == "tabula":
                tables = self.extract_with_tabula(pdf_path)
            elif method == "camelot":
                tables = self.extract_with_camelot(pdf_path)
            elif method == "pdfplumber":
                tables = self.extract_with_pdfplumber(pdf_path)
            elif method == "pymupdf":
                tables = self.extract_with_pymupdf(pdf_path)
            
            results["extraction_results"][method] = {
                "success": len(tables) > 0,
                "table_count": len(tables),
                "tables": [df.to_dict('records') for df in tables if not df.empty]
            }
            
            # If we got tables, this is our best method
            if len(tables) > 0:
                results["best_method"] = method
                results["tables"] = [df.to_dict('records') for df in tables if not df.empty]
                break
        
        # Extract metadata
        try:
            with fitz.open(pdf_path) as doc:
                results["metadata"] = {
                    "page_count": doc.page_count,
                    "title": doc.metadata.get("title", ""),
                    "author": doc.metadata.get("author", ""),
                    "creation_date": doc.metadata.get("creationDate", ""),
                    "file_size": Path(pdf_path).stat().st_size
                }
        except Exception as e:
            self.logger.warning(f"Could not extract metadata: {e}")
        
        # Save results
        output_file = self.output_dir / f"{Path(pdf_path).stem}_extraction.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
        
        self.logger.info(f"Extraction complete. Best method: {results['best_method']}")
        return results
    
    def process_batch(self, pdf_paths: List[str]) -> Dict[str, Any]:
        """Process a batch of PDFs"""
        self.logger.info(f"Processing batch of {len(pdf_paths)} PDFs")
        
        batch_results = {
            "processed_at": datetime.now().isoformat(),
            "total_documents": len(pdf_paths),
            "successful": 0,
            "failed": 0,
            "results": []
        }
        
        for pdf_path in pdf_paths:
            try:
                result = self.process_pdf(pdf_path)
                batch_results["results"].append(result)
                batch_results["successful"] += 1
            except Exception as e:
                self.logger.error(f"Failed to process {pdf_path}: {e}")
                batch_results["failed"] += 1
                batch_results["results"].append({
                    "filename": Path(pdf_path).name,
                    "error": str(e)
                })
        
        # Save batch results
        batch_file = self.output_dir / f"batch_extraction_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(batch_file, 'w', encoding='utf-8') as f:
            json.dump(batch_results, f, ensure_ascii=False, indent=2)
        
        self.logger.info(f"Batch processing complete: {batch_results['successful']}/{batch_results['total_documents']} successful")
        return batch_results

if __name__ == "__main__":
    # Example usage
    processor = UnifiedPDFProcessor()
    
    # Process a single PDF
    # results = processor.process_pdf("/path/to/document.pdf")
    
    # Process a batch of PDFs
    # pdf_paths = ["/path/to/doc1.pdf", "/path/to/doc2.pdf"]
    # batch_results = processor.process_batch(pdf_paths)
    
    print("Unified PDF Processor initialized")
    print(f"Output directory: {processor.output_dir}")