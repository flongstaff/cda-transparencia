#!/usr/bin/env python3
"""
Advanced PDF Processing Pipeline
Uses tabula-py, pdfplumber, and other tools mentioned in the comprehensive resource document
"""

import pandas as pd
import pdfplumber
import tabula
import json
import re
from pathlib import Path
from typing import Dict, List, Any, Optional
from datetime import datetime
import logging
import camelot
import PyPDF2
import fitz  # PyMuPDF
import numpy as np
from io import StringIO

class AdvancedPDFProcessor:
    def __init__(self):
        self.data_dir = Path("data/pdf_processing")
        self.data_dir.mkdir(parents=True, exist_ok=True)
        
        # Setup logging
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
        
        # Financial document patterns
        self.financial_patterns = self._setup_financial_patterns()
        
        # Processing tools configuration
        self.tools_config = self._setup_processing_tools()
        
    def _setup_financial_patterns(self):
        """Setup patterns for financial document recognition"""
        return {
            "budget_execution": {
                "keywords": ["ejecucion", "presupuesto", "devengado", "pagado", "comprometido"],
                "table_headers": ["partida", "denominacion", "credito", "devengado", "pagado"],
                "amount_patterns": [r'\$?\s*[\d,]+\.?\d*', r'[\d,]+\.\d{2}']
            },
            "balance_sheet": {
                "keywords": ["balance", "activo", "pasivo", "patrimonio", "situacion patrimonial"],
                "table_headers": ["concepto", "ejercicio", "anterior", "actual"],
                "amount_patterns": [r'\$?\s*[\d,]+\.?\d*', r'[\d,]+\.\d{2}']
            },
            "resource_execution": {
                "keywords": ["recursos", "ingresos", "recaudado", "estimado"],
                "table_headers": ["recurso", "concepto", "estimado", "recaudado"],
                "amount_patterns": [r'\$?\s*[\d,]+\.?\d*']
            },
            "salary_report": {
                "keywords": ["sueldo", "salario", "remuneracion", "personal"],
                "table_headers": ["apellido", "nombre", "cargo", "basico", "adicionales", "total"],
                "amount_patterns": [r'\$?\s*[\d,]+\.?\d*']
            },
            "contracts": {
                "keywords": ["contrato", "licitacion", "adjudicacion", "proveedor"],
                "table_headers": ["proveedor", "objeto", "monto", "fecha", "numero"],
                "amount_patterns": [r'\$?\s*[\d,]+\.?\d*']
            }
        }
    
    def _setup_processing_tools(self):
        """Configure processing tools based on document type"""
        return {
            "tabula": {
                "default_params": {
                    "pages": "all",
                    "multiple_tables": True,
                    "pandas_options": {"header": 0}
                },
                "table_detection": "lattice",  # or "stream"
                "encoding": "utf-8"
            },
            "camelot": {
                "default_params": {
                    "flavor": "lattice",  # or "stream" 
                    "pages": "all",
                    "encoding": "utf-8"
                }
            },
            "pdfplumber": {
                "table_settings": {
                    "vertical_strategy": "lines",
                    "horizontal_strategy": "lines",
                    "intersection_tolerance": 3
                }
            }
        }
    
    def identify_document_type(self, pdf_path: str) -> Dict[str, Any]:
        """Identify the type of financial document"""
        self.logger.info(f"🔍 Identifying document type: {pdf_path}")
        
        try:
            # Extract text from first few pages
            with pdfplumber.open(pdf_path) as pdf:
                text = ""
                for page in pdf.pages[:3]:  # Check first 3 pages
                    text += page.extract_text() or ""
            
            text_lower = text.lower()
            
            # Score each document type
            type_scores = {}
            for doc_type, patterns in self.financial_patterns.items():
                score = 0
                
                # Check keywords
                for keyword in patterns["keywords"]:
                    score += text_lower.count(keyword) * 2
                
                # Check table headers
                for header in patterns["table_headers"]:
                    if header in text_lower:
                        score += 3
                
                # Check amount patterns
                for pattern in patterns["amount_patterns"]:
                    matches = re.findall(pattern, text)
                    score += len(matches) * 0.5
                
                if score > 0:
                    type_scores[doc_type] = score
            
            # Determine most likely type
            if type_scores:
                best_type = max(type_scores, key=type_scores.get)
                confidence = type_scores[best_type] / sum(type_scores.values())
                
                return {
                    "success": True,
                    "document_type": best_type,
                    "confidence": round(confidence, 3),
                    "all_scores": type_scores,
                    "text_sample": text[:500]
                }
            else:
                return {
                    "success": False,
                    "document_type": "unknown",
                    "confidence": 0,
                    "text_sample": text[:500]
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "document_type": "error"
            }
    
    def extract_tables_tabula(self, pdf_path: str, document_type: str = None) -> Dict[str, Any]:
        """Extract tables using tabula-py (from resource document)"""
        self.logger.info(f"📊 Extracting tables with tabula-py: {pdf_path}")
        
        try:
            # Configure based on document type
            params = self.tools_config["tabula"]["default_params"].copy()
            
            if document_type == "salary_report":
                params["lattice"] = True
                params["stream"] = False
            elif document_type in ["budget_execution", "resource_execution"]:
                params["stream"] = True
                params["lattice"] = False
            
            # Extract tables
            tables = tabula.read_pdf(
                pdf_path,
                **params
            )
            
            # Process extracted tables
            processed_tables = []
            for i, table in enumerate(tables):
                if not table.empty:
                    # Clean table data
                    cleaned_table = self._clean_table_data(table, document_type)
                    processed_tables.append({
                        "table_index": i,
                        "rows": len(cleaned_table),
                        "columns": len(cleaned_table.columns),
                        "data": cleaned_table.to_dict('records'),
                        "column_names": list(cleaned_table.columns)
                    })
            
            return {
                "success": True,
                "method": "tabula-py",
                "tables_found": len(processed_tables),
                "tables": processed_tables
            }
            
        except Exception as e:
            return {
                "success": False,
                "method": "tabula-py", 
                "error": str(e)
            }
    
    def extract_tables_camelot(self, pdf_path: str, document_type: str = None) -> Dict[str, Any]:
        """Extract tables using Camelot (backup method)"""
        self.logger.info(f"🐪 Extracting tables with Camelot: {pdf_path}")
        
        try:
            # Extract tables
            tables = camelot.read_pdf(
                pdf_path,
                **self.tools_config["camelot"]["default_params"]
            )
            
            processed_tables = []
            for i, table in enumerate(tables):
                df = table.df
                if not df.empty:
                    cleaned_table = self._clean_table_data(df, document_type)
                    processed_tables.append({
                        "table_index": i,
                        "accuracy": table.accuracy,
                        "whitespace": table.whitespace,
                        "rows": len(cleaned_table),
                        "columns": len(cleaned_table.columns),
                        "data": cleaned_table.to_dict('records'),
                        "column_names": list(cleaned_table.columns)
                    })
            
            return {
                "success": True,
                "method": "camelot",
                "tables_found": len(processed_tables),
                "tables": processed_tables
            }
            
        except Exception as e:
            return {
                "success": False,
                "method": "camelot",
                "error": str(e)
            }
    
    def extract_tables_pdfplumber(self, pdf_path: str, document_type: str = None) -> Dict[str, Any]:
        """Extract tables using pdfplumber (from resource document)"""
        self.logger.info(f"🔧 Extracting tables with pdfplumber: {pdf_path}")
        
        try:
            processed_tables = []
            
            with pdfplumber.open(pdf_path) as pdf:
                for page_num, page in enumerate(pdf.pages):
                    tables = page.extract_tables(
                        table_settings=self.tools_config["pdfplumber"]["table_settings"]
                    )
                    
                    for table_num, table in enumerate(tables):
                        if table and len(table) > 1:  # Has header and data
                            # Convert to DataFrame
                            df = pd.DataFrame(table[1:], columns=table[0])
                            cleaned_table = self._clean_table_data(df, document_type)
                            
                            processed_tables.append({
                                "page": page_num + 1,
                                "table_index": table_num,
                                "rows": len(cleaned_table),
                                "columns": len(cleaned_table.columns),
                                "data": cleaned_table.to_dict('records'),
                                "column_names": list(cleaned_table.columns)
                            })
            
            return {
                "success": True,
                "method": "pdfplumber",
                "tables_found": len(processed_tables),
                "tables": processed_tables
            }
            
        except Exception as e:
            return {
                "success": False,
                "method": "pdfplumber",
                "error": str(e)
            }
    
    def _clean_table_data(self, df: pd.DataFrame, document_type: str = None) -> pd.DataFrame:
        """Clean and standardize table data"""
        # Remove empty rows and columns
        df = df.dropna(how='all').dropna(axis=1, how='all')
        
        # Standardize column names
        if not df.empty:
            df.columns = [str(col).strip().lower() for col in df.columns]
        
        # Clean monetary values
        for col in df.columns:
            if df[col].dtype == 'object':
                # Try to convert monetary values
                try:
                    # Look for amount patterns
                    sample_values = df[col].dropna().astype(str)
                    if sample_values.str.contains(r'[\d,]+\.?\d*').any():
                        # Clean monetary format
                        df[col] = df[col].astype(str).str.replace(r'[^\d,.-]', '', regex=True)
                        df[col] = df[col].str.replace(',', '')
                        df[col] = pd.to_numeric(df[col], errors='ignore')
                except:
                    pass
        
        return df
    
    def extract_metadata(self, pdf_path: str) -> Dict[str, Any]:
        """Extract PDF metadata"""
        try:
            metadata = {}
            
            # Using PyPDF2
            with open(pdf_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                pdf_info = pdf_reader.metadata
                
                if pdf_info:
                    metadata.update({
                        "title": pdf_info.get('/Title', ''),
                        "author": pdf_info.get('/Author', ''),
                        "subject": pdf_info.get('/Subject', ''),
                        "creator": pdf_info.get('/Creator', ''),
                        "producer": pdf_info.get('/Producer', ''),
                        "creation_date": pdf_info.get('/CreationDate', ''),
                        "modification_date": pdf_info.get('/ModDate', '')
                    })
                
                metadata["page_count"] = len(pdf_reader.pages)
            
            # Additional metadata using PyMuPDF
            doc = fitz.open(pdf_path)
            fitz_metadata = doc.metadata
            metadata.update({
                "format": fitz_metadata.get("format", ""),
                "encryption": doc.is_encrypted,
                "page_count_fitz": doc.page_count
            })
            doc.close()
            
            return {
                "success": True,
                "metadata": metadata
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def process_single_pdf(self, pdf_path: str) -> Dict[str, Any]:
        """Process a single PDF with all available methods"""
        pdf_path = Path(pdf_path)
        self.logger.info(f"🗂️ Processing PDF: {pdf_path.name}")
        
        result = {
            "file_path": str(pdf_path),
            "file_name": pdf_path.name,
            "file_size": pdf_path.stat().st_size if pdf_path.exists() else 0,
            "timestamp": datetime.now().isoformat(),
            "document_identification": {},
            "metadata": {},
            "extraction_results": {},
            "best_result": None
        }
        
        if not pdf_path.exists():
            result["error"] = "File does not exist"
            return result
        
        # 1. Identify document type
        result["document_identification"] = self.identify_document_type(str(pdf_path))
        document_type = result["document_identification"].get("document_type")
        
        # 2. Extract metadata
        result["metadata"] = self.extract_metadata(str(pdf_path))
        
        # 3. Try multiple extraction methods
        extraction_methods = [
            ("tabula", self.extract_tables_tabula),
            ("pdfplumber", self.extract_tables_pdfplumber),
            ("camelot", self.extract_tables_camelot)
        ]
        
        best_score = 0
        best_method = None
        
        for method_name, method_func in extraction_methods:
            try:
                self.logger.info(f"  🔄 Trying {method_name}...")
                extraction_result = method_func(str(pdf_path), document_type)
                result["extraction_results"][method_name] = extraction_result
                
                # Score the result
                if extraction_result.get("success"):
                    score = extraction_result.get("tables_found", 0)
                    if score > best_score:
                        best_score = score
                        best_method = method_name
                
            except Exception as e:
                result["extraction_results"][method_name] = {
                    "success": False,
                    "error": str(e)
                }
        
        # Set best result
        if best_method:
            result["best_result"] = {
                "method": best_method,
                "data": result["extraction_results"][best_method]
            }
            
            self.logger.info(f"  ✅ Best extraction: {best_method} ({best_score} tables)")
        else:
            self.logger.warning(f"  ⚠️ No successful extraction for {pdf_path.name}")
        
        return result
    
    def process_pdf_batch(self, pdf_directory: str) -> Dict[str, Any]:
        """Process multiple PDFs in a directory"""
        pdf_dir = Path(pdf_directory)
        self.logger.info(f"📁 Processing PDF batch: {pdf_dir}")
        
        if not pdf_dir.exists():
            return {"error": "Directory does not exist"}
        
        batch_result = {
            "directory": str(pdf_dir),
            "timestamp": datetime.now().isoformat(),
            "processed_files": {},
            "summary": {}
        }
        
        # Find all PDF files
        pdf_files = list(pdf_dir.glob("*.pdf"))
        self.logger.info(f"Found {len(pdf_files)} PDF files")
        
        successful = 0
        failed = 0
        total_tables = 0
        
        for pdf_file in pdf_files:
            try:
                result = self.process_single_pdf(pdf_file)
                batch_result["processed_files"][pdf_file.name] = result
                
                if result.get("best_result"):
                    successful += 1
                    tables_count = result["best_result"]["data"].get("tables_found", 0)
                    total_tables += tables_count
                else:
                    failed += 1
                    
            except Exception as e:
                batch_result["processed_files"][pdf_file.name] = {
                    "error": str(e)
                }
                failed += 1
        
        # Summary statistics
        batch_result["summary"] = {
            "total_files": len(pdf_files),
            "successful": successful,
            "failed": failed,
            "success_rate": round(successful / len(pdf_files) * 100, 1) if pdf_files else 0,
            "total_tables_extracted": total_tables
        }
        
        # Save batch results
        output_file = self.data_dir / f"batch_processing_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(batch_result, f, indent=2, ensure_ascii=False)
        
        self.logger.info(f"📊 Batch processing completed:")
        self.logger.info(f"  ✅ Successful: {successful}/{len(pdf_files)} files")
        self.logger.info(f"  📋 Total tables: {total_tables}")
        self.logger.info(f"  💾 Results saved: {output_file}")
        
        return batch_result
    
    def generate_processing_report(self, batch_result: Dict[str, Any]) -> str:
        """Generate human-readable processing report"""
        report = f"""
# PDF PROCESSING REPORT

**Processing Date:** {datetime.now().strftime('%Y-%m-%d %H:%M')}
**Directory:** {batch_result.get('directory', 'N/A')}

## SUMMARY

- **Total Files:** {batch_result['summary']['total_files']}
- **Successful Extractions:** {batch_result['summary']['successful']}
- **Failed Extractions:** {batch_result['summary']['failed']}
- **Success Rate:** {batch_result['summary']['success_rate']}%
- **Total Tables Extracted:** {batch_result['summary']['total_tables_extracted']}

## DETAILED RESULTS

"""
        
        for file_name, result in batch_result.get("processed_files", {}).items():
            if "error" in result:
                report += f"❌ **{file_name}** - Error: {result['error']}\n\n"
            else:
                doc_type = result.get("document_identification", {}).get("document_type", "unknown")
                best_method = result.get("best_result", {}).get("method", "none")
                tables_found = 0
                
                if result.get("best_result"):
                    tables_found = result["best_result"]["data"].get("tables_found", 0)
                
                report += f"✅ **{file_name}**\n"
                report += f"   - Document Type: {doc_type}\n"
                report += f"   - Best Method: {best_method}\n"
                report += f"   - Tables Found: {tables_found}\n\n"
        
        return report

if __name__ == "__main__":
    processor = AdvancedPDFProcessor()
    
    # Process Carmen de Areco's live scraped PDFs
    pdf_directory = "data/live_scrape"
    
    if Path(pdf_directory).exists():
        results = processor.process_pdf_batch(pdf_directory)
        
        # Generate report
        report = processor.generate_processing_report(results)
        report_file = processor.data_dir / f"processing_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.md"
        
        with open(report_file, 'w', encoding='utf-8') as f:
            f.write(report)
        
        print("🎯 PDF processing completed!")
        print(f"📄 Report: {report_file}")
    else:
        print("❌ PDF directory not found. Run live scraper first.")