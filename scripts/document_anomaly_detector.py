#!/usr/bin/env python3
"""
Document Anomaly Detector for Carmen de Areco
Specifically detects irregularities in paperwork such as:
- Signature mismatches
- Unauthorized signatories
- Missing documentation
- Duplicate paperwork
"""

import pandas as pd
import numpy as np
from pathlib import Path
import sqlite3
import hashlib
import re
from datetime import datetime
import logging
from typing import Dict, List, Optional, Tuple
import json

class DocumentAnomalyDetector:
    """Detects anomalies in municipal paperwork and documentation"""
    
    def __init__(self, data_dir="data/document_analysis"):
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(parents=True, exist_ok=True)
        
        # Setup logging
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
        
        # Database setup
        self.db_path = self.data_dir / "document_anomalies.db"
        self._initialize_database()
        
        # Known authorized signatories (would be populated from official sources)
        self.authorized_signatories = self._load_authorized_signatories()
        
        # Document type patterns
        self.document_patterns = {
            'budget_execution': ['ejecucion', 'gastos', 'presupuesto'],
            'contract': ['contrato', 'licitacion', 'adjudicacion'],
            'salary': ['sueldo', 'salario', 'remuneracion', 'escalafon'],
            'ordinance': ['ordenanza', 'decreto', 'resolucion'],
            'declaration': ['declaracion', 'patrimonial', 'jurada']
        }
    
    def _initialize_database(self):
        """Initialize database for storing document anomalies"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.executescript('''
            CREATE TABLE IF NOT EXISTS document_signatures (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                document_id TEXT,
                document_type TEXT,
                signatory_name TEXT,
                signatory_title TEXT,
                signature_hash TEXT,
                document_date TEXT,
                processed_date TEXT,
                file_path TEXT
            );
            
            CREATE TABLE IF NOT EXISTS signature_anomalies (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                anomaly_type TEXT,
                document_id TEXT,
                description TEXT,
                severity TEXT,
                evidence TEXT,
                detected_date TEXT,
                reviewed BOOLEAN DEFAULT FALSE
            );
            
            CREATE TABLE IF NOT EXISTS document_metadata (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                filename TEXT,
                file_hash TEXT UNIQUE,
                document_type TEXT,
                creation_date TEXT,
                modification_date TEXT,
                file_size INTEGER,
                page_count INTEGER,
                extracted_text_hash TEXT
            );
        ''')
        
        conn.commit()
        conn.close()
    
    def _load_authorized_signatories(self) -> Dict[str, str]:
        """Load list of authorized municipal signatories"""
        # In a real implementation, this would come from official sources
        # For now, we'll use sample data
        return {
            "Intendente Municipal": "Miguel Ángel Galli",
            "Secretario de Hacienda": "Carlos Rodríguez",
            "Director de Obras Públicas": "Roberto Fernández",
            "Director de Servicios Públicos": "María Elena González",
            "Jefe de Compras": "Jorge Pérez"
        }
    
    def extract_document_metadata(self, file_path: str) -> Dict:
        """Extract metadata from document"""
        path = Path(file_path)
        
        # Calculate file hash
        file_hash = self._calculate_file_hash(file_path)
        
        metadata = {
            'filename': path.name,
            'file_hash': file_hash,
            'file_size': path.stat().st_size,
            'creation_date': datetime.fromtimestamp(path.stat().st_ctime).isoformat(),
            'modification_date': datetime.fromtimestamp(path.stat().st_mtime).isoformat(),
            'document_type': self._classify_document_type(path.name)
        }
        
        # For PDFs, extract additional metadata
        if path.suffix.lower() == '.pdf':
            try:
                import fitz  # PyMuPDF
                doc = fitz.open(file_path)
                metadata['page_count'] = doc.page_count
                metadata['title'] = doc.metadata.get('title', '')
                metadata['author'] = doc.metadata.get('author', '')
                metadata['subject'] = doc.metadata.get('subject', '')
                doc.close()
            except Exception as e:
                self.logger.warning(f"Could not extract PDF metadata: {e}")
        
        return metadata
    
    def _calculate_file_hash(self, file_path: str) -> str:
        """Calculate SHA256 hash of file"""
        sha256_hash = hashlib.sha256()
        with open(file_path, "rb") as f:
            for byte_block in iter(lambda: f.read(4096), b""):
                sha256_hash.update(byte_block)
        return sha256_hash.hexdigest()
    
    def _classify_document_type(self, filename: str) -> str:
        """Classify document type based on filename"""
        filename_lower = filename.lower()
        
        for doc_type, patterns in self.document_patterns.items():
            if any(pattern in filename_lower for pattern in patterns):
                return doc_type
        
        return "other"
    
    def extract_signatures_from_text(self, text: str, document_id: str) -> List[Dict]:
        """Extract signature information from document text"""
        signatures = []
        
        # Pattern for signatures in Argentine documents
        # This is a simplified pattern - real implementation would be more sophisticated
        signature_patterns = [
            r'(?:Firma|Fdo\.|Firmado por):\s*([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)*)',
            r'(?:Intendente|Secretario|Director|Jefe)\s*:\s*([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)*)',
            r'([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)*)\s*\n\s*(?:Intendente|Secretario|Director|Jefe)'
        ]
        
        for pattern in signature_patterns:
            matches = re.findall(pattern, text, re.MULTILINE | re.IGNORECASE)
            for match in matches:
                signatures.append({
                    'document_id': document_id,
                    'signatory_name': match.strip(),
                    'signatory_title': self._infer_title(match.strip()),
                    'signature_text': match,
                    'extracted_date': datetime.now().isoformat()
                })
        
        return signatures
    
    def _infer_title(self, signatory_name: str) -> str:
        """Infer title from signatory name"""
        # In a real implementation, this would use a more sophisticated approach
        name_lower = signatory_name.lower()
        
        title_mapping = {
            'galli': 'Intendente Municipal',
            'rodriguez': 'Secretario de Hacienda',
            'fernandez': 'Director de Obras Públicas',
            'gonzalez': 'Director de Servicios Públicos',
            'perez': 'Jefe de Compras'
        }
        
        for name_part, title in title_mapping.items():
            if name_part in name_lower:
                return title
        
        return "Funcionario Municipal"
    
    def detect_signature_anomalies(self, signatures: List[Dict]) -> List[Dict]:
        """Detect anomalies in document signatures"""
        anomalies = []
        
        for signature in signatures:
            signatory_name = signature['signatory_name']
            signatory_title = signature['signatory_title']
            document_id = signature['document_id']
            
            # Check if signatory is authorized
            authorized = False
            correct_title = None
            
            for title, name in self.authorized_signatories.items():
                if name.lower() == signatory_name.lower():
                    authorized = True
                    correct_title = title
                    break
            
            # Unauthorized signatory
            if not authorized:
                anomalies.append({
                    'anomaly_type': 'unauthorized_signatory',
                    'document_id': document_id,
                    'description': f"Documento firmado por {signatory_name} quien no está autorizado",
                    'severity': 'high',
                    'evidence': f"Firma encontrada: {signatory_name}",
                    'detected_date': datetime.now().isoformat()
                })
            
            # Title mismatch
            elif correct_title and signatory_title != correct_title:
                anomalies.append({
                    'anomaly_type': 'title_mismatch',
                    'document_id': document_id,
                    'description': f"Firma de {signatory_name} con título incorrecto: {signatory_title} (debería ser {correct_title})",
                    'severity': 'medium',
                    'evidence': f"Título en documento: {signatory_title}, Título autorizado: {correct_title}",
                    'detected_date': datetime.now().isoformat()
                })
        
        return anomalies
    
    def detect_document_anomalies(self, file_path: str) -> Dict:
        """Detect all types of anomalies in a document"""
        self.logger.info(f"🔍 Analyzing document: {file_path}")
        
        # Extract metadata
        metadata = self.extract_document_metadata(file_path)
        
        # Save metadata to database
        self._save_document_metadata(metadata)
        
        # Extract text content (simplified - would use OCR for scanned docs)
        text_content = ""
        file_path_obj = Path(file_path)
        
        if file_path_obj.suffix.lower() == '.pdf':
            try:
                import fitz  # PyMuPDF
                doc = fitz.open(file_path)
                for page in doc:
                    text_content += page.get_text()
                doc.close()
            except Exception as e:
                self.logger.error(f"Could not extract text from PDF: {e}")
        elif file_path_obj.suffix.lower() == '.txt':
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    text_content = f.read()
            except Exception as e:
                self.logger.error(f"Could not read text file: {e}")
        
        # Extract signatures
        signatures = self.extract_signatures_from_text(text_content, metadata['file_hash'])
        
        # Save signatures to database
        for signature in signatures:
            self._save_signature(signature)
        
        # Detect signature anomalies
        signature_anomalies = self.detect_signature_anomalies(signatures)
        
        # Save anomalies to database
        for anomaly in signature_anomalies:
            self._save_anomaly(anomaly)
        
        # Detect other document anomalies
        other_anomalies = self._detect_other_anomalies(file_path, metadata, text_content)
        
        # Combine all anomalies
        all_anomalies = signature_anomalies + other_anomalies
        
        # Create report
        report = {
            'document_id': metadata['file_hash'],
            'filename': metadata['filename'],
            'document_type': metadata['document_type'],
            'analysis_date': datetime.now().isoformat(),
            'signatures_found': len(signatures),
            'anomalies_detected': len(all_anomalies),
            'anomalies': all_anomalies,
            'signatures': signatures,
            'metadata': metadata
        }
        
        # Save report
        report_file = self.data_dir / f"anomaly_report_{metadata['file_hash'][:8]}.json"
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(report, f, ensure_ascii=False, indent=2)
        
        self.logger.info(f"✅ Analysis complete. Found {len(all_anomalies)} anomalies.")
        return report
    
    def _detect_other_anomalies(self, file_path: str, metadata: Dict, text_content: str) -> List[Dict]:
        """Detect other types of document anomalies"""
        anomalies = []
        document_id = metadata['file_hash']
        
        # Check for missing dates
        date_patterns = [r'\d{1,2}/\d{1,2}/\d{4}', r'\d{4}-\d{2}-\d{2}']
        dates_found = []
        for pattern in date_patterns:
            dates_found.extend(re.findall(pattern, text_content))
        
        if not dates_found:
            anomalies.append({
                'anomaly_type': 'missing_dates',
                'document_id': document_id,
                'description': "Documento no contiene fechas identificables",
                'severity': 'medium',
                'evidence': "No se encontraron patrones de fecha en el documento",
                'detected_date': datetime.now().isoformat()
            })
        
        # Check for missing document numbers (for official documents)
        if metadata['document_type'] in ['ordinance', 'contract']:
            number_patterns = [r'(?:N[°º]|Nro\.?|Número)\s*:?\s*[\d\-/]+']
            numbers_found = []
            for pattern in number_patterns:
                numbers_found.extend(re.findall(pattern, text_content, re.IGNORECASE))
            
            if not numbers_found:
                anomalies.append({
                    'anomaly_type': 'missing_document_number',
                    'document_id': document_id,
                    'description': "Documento oficial sin número identificable",
                    'severity': 'high',
                    'evidence': f"Documento tipo {metadata['document_type']} no contiene número oficial",
                    'detected_date': datetime.now().isoformat()
                })
        
        # Check for duplicate content (plagiarism/duplication)
        content_hash = hashlib.md5(text_content.encode()).hexdigest()
        if self._is_duplicate_content(content_hash, document_id):
            anomalies.append({
                'anomaly_type': 'duplicate_content',
                'document_id': document_id,
                'description': "Contenido del documento es duplicado de otro documento",
                'severity': 'medium',
                'evidence': f"Hash de contenido coincide con otro documento: {content_hash[:8]}",
                'detected_date': datetime.now().isoformat()
            })
        
        return anomalies
    
    def _is_duplicate_content(self, content_hash: str, document_id: str) -> bool:
        """Check if content is duplicate of another document"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT COUNT(*) FROM document_metadata 
            WHERE extracted_text_hash = ? AND file_hash != ?
        ''', (content_hash, document_id))
        
        count = cursor.fetchone()[0]
        conn.close()
        
        return count > 0
    
    def _save_document_metadata(self, metadata: Dict):
        """Save document metadata to database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT OR IGNORE INTO document_metadata 
            (filename, file_hash, document_type, creation_date, modification_date, file_size, page_count)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            metadata['filename'],
            metadata['file_hash'],
            metadata['document_type'],
            metadata['creation_date'],
            metadata['modification_date'],
            metadata['file_size'],
            metadata.get('page_count', 0)
        ))
        
        conn.commit()
        conn.close()
    
    def _save_signature(self, signature: Dict):
        """Save signature information to database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO document_signatures 
            (document_id, document_type, signatory_name, signatory_title, signature_hash, document_date, processed_date, file_path)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            signature['document_id'],
            '',  # Would be populated in real implementation
            signature['signatory_name'],
            signature['signatory_title'],
            '',  # Would calculate actual signature hash
            '',  # Would extract document date
            signature['extracted_date'],
            ''   # Would store file path
        ))
        
        conn.commit()
        conn.close()
    
    def _save_anomaly(self, anomaly: Dict):
        """Save anomaly to database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO signature_anomalies 
            (anomaly_type, document_id, description, severity, evidence, detected_date)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            anomaly['anomaly_type'],
            anomaly['document_id'],
            anomaly['description'],
            anomaly['severity'],
            anomaly['evidence'],
            anomaly['detected_date']
        ))
        
        conn.commit()
        conn.close()
    
    def analyze_document_batch(self, document_paths: List[str]) -> Dict:
        """Analyze a batch of documents for anomalies"""
        self.logger.info(f"🔍 Analyzing batch of {len(document_paths)} documents...")
        
        results = {
            'analysis_date': datetime.now().isoformat(),
            'total_documents': len(document_paths),
            'processed_documents': 0,
            'anomalies_found': 0,
            'document_reports': [],
            'summary': {}
        }
        
        anomalies_by_type = {}
        
        for file_path in document_paths:
            try:
                report = self.detect_document_anomalies(file_path)
                results['document_reports'].append(report)
                results['processed_documents'] += 1
                results['anomalies_found'] += report['anomalies_detected']
                
                # Count anomalies by type
                for anomaly in report['anomalies']:
                    anomaly_type = anomaly['anomaly_type']
                    if anomaly_type not in anomalies_by_type:
                        anomalies_by_type[anomaly_type] = 0
                    anomalies_by_type[anomaly_type] += 1
                    
            except Exception as e:
                self.logger.error(f"Failed to analyze {file_path}: {e}")
                results['document_reports'].append({
                    'filename': Path(file_path).name,
                    'error': str(e)
                })
        
        # Create summary
        results['summary'] = {
            'anomalies_by_type': anomalies_by_type,
            'success_rate': results['processed_documents'] / results['total_documents'] if results['total_documents'] > 0 else 0,
            'average_anomalies_per_document': results['anomalies_found'] / results['processed_documents'] if results['processed_documents'] > 0 else 0
        }
        
        # Save batch results
        batch_report_file = self.data_dir / f"batch_analysis_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(batch_report_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
        
        self.logger.info(f"✅ Batch analysis complete. Found {results['anomalies_found']} anomalies in {results['processed_documents']} documents.")
        return results
    
    def generate_anomaly_report(self) -> Dict:
        """Generate comprehensive anomaly report"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Get all anomalies
        cursor.execute('''
            SELECT anomaly_type, COUNT(*) as count, severity
            FROM signature_anomalies 
            GROUP BY anomaly_type, severity
            ORDER BY count DESC
        ''')
        
        anomaly_stats = cursor.fetchall()
        
        # Get recent anomalies
        cursor.execute('''
            SELECT * FROM signature_anomalies 
            WHERE detected_date >= datetime('now', '-30 days')
            ORDER BY detected_date DESC
            LIMIT 50
        ''')
        
        recent_anomalies = cursor.fetchall()
        
        conn.close()
        
        report = {
            'report_date': datetime.now().isoformat(),
            'summary': {
                'total_anomalies': sum(count for _, count, _ in anomaly_stats),
                'anomalies_by_type': {atype: sum(count for at, count, _ in anomaly_stats if at == atype) 
                                    for atype, _, _ in set((at, _, _) for at, _, _ in anomaly_stats)},
                'severity_distribution': {
                    'high': sum(count for _, count, severity in anomaly_stats if severity == 'high'),
                    'medium': sum(count for _, count, severity in anomaly_stats if severity == 'medium'),
                    'low': sum(count for _, count, severity in anomaly_stats if severity == 'low')
                }
            },
            'recent_anomalies': [
                {
                    'id': anomaly[0],
                    'type': anomaly[1],
                    'document_id': anomaly[2],
                    'description': anomaly[3],
                    'severity': anomaly[4],
                    'evidence': anomaly[5],
                    'detected_date': anomaly[6]
                }
                for anomaly in recent_anomalies
            ]
        }
        
        # Save report
        report_file = self.data_dir / f"comprehensive_anomaly_report_{datetime.now().strftime('%Y%m%d')}.json"
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(report, f, ensure_ascii=False, indent=2)
        
        return report

if __name__ == "__main__":
    detector = DocumentAnomalyDetector()
    
    # Example usage:
    # To analyze a single document:
    # report = detector.detect_document_anomalies("/path/to/document.pdf")
    
    # To analyze a batch of documents:
    # document_paths = ["/path/to/doc1.pdf", "/path/to/doc2.pdf"]
    # batch_report = detector.analyze_document_batch(document_paths)
    
    print(f"Document Anomaly Detector initialized.")
    print(f"Database: {detector.db_path}")
    print(f"Data directory: {detector.data_dir}")