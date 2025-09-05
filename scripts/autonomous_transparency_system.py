#!/usr/bin/env python3
"""
Autonomous Transparency System for Carmen de Areco
Continuously monitors, analyzes, and reports on municipal financial irregularities
"""

import schedule
import time
import logging
from datetime import datetime, timedelta
from pathlib import Path
import json
import sqlite3

from carmen_transparencia.data_extraction import scrape_live_sync
from scripts.osint.municipality_osint_framework import MunicipalityOSINTFramework
from scripts.audit.anomaly_detection_system import AnomalyDetectionSystem
from scripts.audit.comparative_analysis_system import ComparativeAnalysisSystem
from scripts.scrapers.pdf_extractor import ArgentinePDFProcessor
from scripts.scrapers.bora_scraper import BORAScraperCarmenDeAreco
from scripts.audit.financial_irregularity_tracker import FinancialIrregularityTracker

class AutonomousTransparencySystem:
    \"\"\"Main autonomous system orchestrator\"\"\"
    
    def __init__(self, data_dir=\"data/autonomous_system\"):
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(parents=True, exist_ok=True)
        
        # Setup logging
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - AUTONOMOUS_SYSTEM - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(self.data_dir / 'system.log'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
        
        # Initialize components
        self.osint_framework = MunicipalityOSINTFramework(\"Carmen de Areco\")
        self.pdf_processor = ArgentinePDFProcessor(self.data_dir / \"pdf_documents\")
        self.bora_scraper = BORAScraperCarmenDeAreco(self.data_dir / \"bora_documents\")
        self.anomaly_detector = AnomalyDetectionSystem()
        self.comparative_analyzer = ComparativeAnalysisSystem()
        self.irregularity_tracker = FinancialIrregularityTracker(self.data_dir / \"irregularities\")
        
        # Database setup
        self.db_path = self.data_dir / \"autonomous_audit.db\"
        self._initialize_database()
        
        self.logger.info(\"Autonomous Transparency System initialized\")
    
    def _initialize_database(self):
        \"\"\"Initialize the system database\"\"\"
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.executescript('''
            CREATE TABLE IF NOT EXISTS monitoring_runs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                run_timestamp TEXT,
                component TEXT,
                status TEXT,
                details TEXT,
                duration_seconds REAL
            );
            
            CREATE TABLE IF NOT EXISTS detected_irregularities (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                detection_timestamp TEXT,
                irregularity_type TEXT,
                severity TEXT,
                description TEXT,
                evidence TEXT,
                source_document TEXT,
                reviewed BOOLEAN DEFAULT FALSE
            );
            
            CREATE TABLE IF NOT EXISTS document_metadata (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                filename TEXT,
                file_path TEXT,
                document_type TEXT,
                size_bytes INTEGER,
                processed_timestamp TEXT,
                hash TEXT UNIQUE
            );
        ''')
        
        conn.commit()
        conn.close()
    
    def run_osint_monitoring(self):
        \"\"\"Run OSINT monitoring for digital footprint changes\"\"\"
        start_time = time.time()
        self.logger.info(\"🔍 Running OSINT monitoring...\")
        
        try:
            results = self.osint_framework.run_complete_osint_analysis()
            
            # Save results
            timestamp = datetime.now().strftime(\"%Y%m%d_%H%M%S\")
            results_file = self.data_dir / f\"osint_results_{timestamp}.json\"
            with open(results_file, 'w') as f:
                json.dump(results, f, indent=2, default=str)
            
            duration = time.time() - start_time
            self._log_monitoring_run(\"osint\", \"success\", f\"Results saved to {results_file}\", duration)
            
            return results
        except Exception as e:
            duration = time.time() - start_time
            self._log_monitoring_run(\"osint\", \"error\", str(e), duration)
            self.logger.error(f\"OSINT monitoring failed: {e}\")
            return None
    
    def collect_new_documents(self):
        \"\"\"Collect new documents from official sources\"\"\"
        start_time = time.time()
        self.logger.info(\"📄 Collecting new documents...\")
        
        try:
            # Scrape from official website
            scraped_docs = scrape_live_sync(
                output_dir=str(self.data_dir / \"live_scrape\"),
                depth=2
            )
            
            # Process PDFs
            pdf_results = self.pdf_processor.process_pdf_batch([
                {\"url\": url, \"title\": path.name} 
                for url, path in scraped_docs
            ])
            
            # Save document metadata
            self._save_document_metadata(pdf_results)
            
            duration = time.time() - start_time
            self._log_monitoring_run(\"document_collection\", \"success\", 
                                   f\"Collected {len(scraped_docs)} documents\", duration)
            
            return pdf_results
        except Exception as e:
            duration = time.time() - start_time
            self._log_monitoring_run(\"document_collection\", \"error\", str(e), duration)
            self.logger.error(f\"Document collection failed: {e}\")
            return None
    
    def analyze_bora_documents(self):
        \"\"\"Analyze official bulletins for irregularities\"\"\"
        start_time = time.time()
        self.logger.info(\"📖 Analyzing BORA documents...\")
        
        try:
            # Comprehensive scrape
            current_year = datetime.now().year
            years_to_scrape = list(range(current_year-2, current_year+1))
            
            results = self.bora_scraper.comprehensive_scrape(years_to_scrape)
            
            # Save results
            timestamp = datetime.now().strftime(\"%Y%m%d_%H%M%S\")
            results_file = self.data_dir / f\"bora_analysis_{timestamp}.json\"
            self.bora_scraper.save_results(results, f\"bora_analysis_{timestamp}\")
            
            duration = time.time() - start_time
            self._log_monitoring_run(\"bora_analysis\", \"success\", 
                                   f\"Analyzed {results['statistics'].get('total_documents', 0)} documents\", 
                                   duration)
            
            return results
        except Exception as e:
            duration = time.time() - start_time
            self._log_monitoring_run(\"bora_analysis\", \"error\", str(e), duration)
            self.logger.error(f\"BORA analysis failed: {e}\")
            return None
    
    def detect_financial_irregularities(self):
        \"\"\"Detect financial irregularities using multiple methods\"\"\"
        start_time = time.time()
        self.logger.info(\"💰 Detecting financial irregularities...\")
        
        try:
            # Run full audit
            results = self.irregularity_tracker.run_full_audit()
            
            # Save detected irregularities to database
            self._save_irregularities(results)
            
            duration = time.time() - start_time
            self._log_monitoring_run(\"irregularity_detection\", \"success\", 
                                   f\"Detected {results['audit_report']['total_irregularities']} irregularities\", 
                                   duration)
            
            return results
        except Exception as e:
            duration = time.time() - start_time
            self._log_monitoring_run(\"irregularity_detection\", \"error\", str(e), duration)
            self.logger.error(f\"Irregularity detection failed: {e}\")
            return None
    
    def run_comparative_analysis(self):
        \"\"\"Run comparative analysis against peer municipalities\"\"\"
        start_time = time.time()
        self.logger.info(\"📊 Running comparative analysis...\")
        
        try:
            results = self.comparative_analyzer.run_comparative_analysis()
            
            duration = time.time() - start_time
            self._log_monitoring_run(\"comparative_analysis\", \"success\", 
                                   f\"Analyzed {len(results.get('analyses', {}))} municipalities\", 
                                   duration)
            
            return results
        except Exception as e:
            duration = time.time() - start_time
            self._log_monitoring_run(\"comparative_analysis\", \"error\", str(e), duration)
            self.logger.error(f\"Comparative analysis failed: {e}\")
            return None
    
    def _save_document_metadata(self, pdf_results):
        \"\"\"Save document metadata to database\"\"\"
        if not pdf_results or 'results' not in pdf_results:
            return
            
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        for result in pdf_results['results']:
            if 'error' not in result:
                try:
                    cursor.execute('''
                        INSERT OR IGNORE INTO document_metadata 
                        (filename, file_path, document_type, size_bytes, processed_timestamp, hash)
                        VALUES (?, ?, ?, ?, ?, ?)
                    ''', (
                        result.get('filename', ''),
                        result.get('local_path', ''),
                        result.get('document_type', 'unknown'),
                        0,  # Would need to get actual file size
                        datetime.now().isoformat(),
                        ''  # Would need to calculate hash
                    ))
                except Exception as e:
                    self.logger.warning(f\"Failed to save document metadata: {e}\")
        
        conn.commit()
        conn.close()
    
    def _save_irregularities(self, audit_results):
        \"\"\"Save detected irregularities to database\"\"\"
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Save salary irregularities
        for irregularity in audit_results.get('salary_irregularities', []):
            cursor.execute('''
                INSERT INTO detected_irregularities 
                (detection_timestamp, irregularity_type, severity, description, evidence, source_document)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                irregularity.get('detection_date', datetime.now().isoformat()),
                'high_salary',
                'high' if irregularity.get('discrepancy_ratio', 0) > 10 else 'medium',
                f\"High salary for {irregularity.get('official_name', 'Unknown')} - {irregularity.get('role', 'Unknown role')}\",
                irregularity.get('evidence', ''),
                ''
            ))
        
        # Save project irregularities
        for irregularity in audit_results.get('project_irregularities', []):
            cursor.execute('''
                INSERT INTO detected_irregularities 
                (detection_timestamp, irregularity_type, severity, description, evidence, source_document)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                irregularity.get('detection_date', datetime.now().isoformat()),
                'project_delay',
                'high' if irregularity.get('delay_days', 0) > 180 else 'medium',
                f\"Delayed project: {irregularity.get('project_name', 'Unknown project')}\",
                irregularity.get('evidence', ''),
                ''
            ))
        
        # Save budget discrepancies
        for discrepancy in audit_results.get('budget_discrepancies', []):
            cursor.execute('''
                INSERT INTO detected_irregularities 
                (detection_timestamp, irregularity_type, severity, description, evidence, source_document)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                discrepancy.get('detection_date', datetime.now().isoformat()),
                'budget_discrepancy',
                'high' if discrepancy.get('difference_percentage', 0) > 0.5 else 'medium',
                f\"Budget discrepancy in {discrepancy.get('category', 'Unknown category')}\",
                discrepancy.get('evidence', ''),
                ''
            ))
        
        conn.commit()
        conn.close()
    
    def _log_monitoring_run(self, component, status, details, duration):
        \"\"\"Log monitoring run to database\"\"\"
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO monitoring_runs 
            (run_timestamp, component, status, details, duration_seconds)
            VALUES (?, ?, ?, ?, ?)
        ''', (
            datetime.now().isoformat(),
            component,
            status,
            details,
            duration
        ))
        
        conn.commit()
        conn.close()
    
    def generate_daily_report(self):
        \"\"\"Generate daily summary report\"\"\"
        self.logger.info(\"📝 Generating daily report...\")
        
        try:
            # Get recent irregularities
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT irregularity_type, COUNT(*) as count
                FROM detected_irregularities 
                WHERE detection_timestamp >= datetime('now', '-1 day')
                GROUP BY irregularity_type
            ''')
            
            irregularities_summary = cursor.fetchall()
            conn.close()
            
            # Create report
            report = {
                \"report_date\": datetime.now().isoformat(),
                \"summary\": {
                    \"new_irregularities\": dict(irregularities_summary),
                    \"total_irregularities\": sum(count for _, count in irregularities_summary)
                }
            }
            
            # Save report
            timestamp = datetime.now().strftime(\"%Y%m%d\")
            report_file = self.data_dir / f\"daily_report_{timestamp}.json\"
            with open(report_file, 'w') as f:
                json.dump(report, f, indent=2)
            
            self.logger.info(f\"Daily report saved to {report_file}\")
            return report
        except Exception as e:
            self.logger.error(f\"Failed to generate daily report: {e}\")
            return None
    
    def run_full_cycle(self):
        \"\"\"Run complete monitoring cycle\"\"\"
        self.logger.info(\"🔄 Starting full monitoring cycle...\")
        
        # 1. OSINT monitoring
        self.run_osint_monitoring()
        
        # 2. Document collection
        self.collect_new_documents()
        
        # 3. BORA analysis
        self.analyze_bora_documents()
        
        # 4. Financial irregularity detection
        self.detect_financial_irregularities()
        
        # 5. Comparative analysis
        self.run_comparative_analysis()
        
        # 6. Generate daily report
        self.generate_daily_report()
        
        self.logger.info(\"✅ Full monitoring cycle completed\")
    
    def start_continuous_monitoring(self):
        \"\"\"Start continuous monitoring with scheduled runs\"\"\"
        self.logger.info(\"🚀 Starting continuous monitoring system...\")
        
        # Schedule daily full cycle
        schedule.every().day.at(\"02:00\").do(self.run_full_cycle)
        
        # Schedule document collection twice daily
        schedule.every(12).hours.do(self.collect_new_documents)
        
        # Schedule irregularity detection every 6 hours
        schedule.every(6).hours.do(self.detect_financial_irregularities)
        
        # Schedule daily report generation
        schedule.every().day.at(\"23:30\").do(self.generate_daily_report)
        
        self.logger.info(\"📅 Monitoring schedule set:\")
        self.logger.info(\"  - Full cycle: Daily at 02:00\")
        self.logger.info(\"  - Document collection: Every 12 hours\")
        self.logger.info(\"  - Irregularity detection: Every 6 hours\")
        self.logger.info(\"  - Daily report: Daily at 23:30\")
        
        # Run once immediately
        self.run_full_cycle()
        
        # Continuous loop
        while True:
            schedule.run_pending()
            time.sleep(60)  # Check every minute

if __name__ == \"__main__\":
    system = AutonomousTransparencySystem()
    
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == \"--continuous\":
        system.start_continuous_monitoring()
    else:
        system.run_full_cycle()
        print(f\"\\n📁 System data saved to: {system.data_dir}\")
        print(\"💡 To run continuous monitoring: python autonomous_transparency_system.py --continuous\")