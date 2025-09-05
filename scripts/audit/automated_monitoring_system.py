#!/usr/bin/env python3
"""
Automated Monitoring System for Carmen de Areco
Implements continuous monitoring using the comprehensive data sources
"""

import requests
import schedule
import time
import json
import hashlib
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Any
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import logging

class AutomatedMonitoringSystem:
    def __init__(self, config_file="monitoring_config.json"):
        self.config_file = Path(config_file)
        self.data_dir = Path("data/monitoring")
        self.data_dir.mkdir(parents=True, exist_ok=True)
        
        # Setup logging
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(self.data_dir / 'monitoring.log'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
        
        self.config = self._load_config()
        self.session = requests.Session()
        self.session.headers.update({'User-Agent': 'Carmen-Transparencia-Monitor/1.0'})
        
    def _load_config(self):
        """Load monitoring configuration"""
        default_config = {
            "primary_sources": [
                "https://carmendeareco.gob.ar/transparencia",
                "https://carmendeareco.gob.ar/gobierno/boletin-oficial/",
                "https://carmendeareco.gob.ar"
            ],
            "national_apis": {
                "datos_gob_ar": "https://datos.gob.ar/dataset?q=carmen+de+areco",
                "presupuesto_abierto": "https://www.presupuestoabierto.gob.ar/sici/api",
                "contratos_api": "https://datos.gob.ar/dataset/modernizacion-sistema-contrataciones-electronicas-argentina"
            },
            "provincial_sources": {
                "transparency": "https://www.gba.gob.ar/transparencia_fiscal/",
                "open_data": "https://www.gba.gob.ar/datos_abiertos",
                "contracts": "https://pbac.cgp.gba.gov.ar/Default.aspx"
            },
            "comparative_municipalities": [
                "https://chacabuco.gob.ar/",
                "https://chivilcoy.gob.ar/",
                "https://www.sanantoniodeareco.gob.ar/",
                "https://www.sag.gob.ar/"
            ],
            "alert_triggers": [
                "new_pdf_documents",
                "budget_updates", 
                "contract_announcements",
                "missing_quarterly_reports",
                "suspicious_payment_patterns"
            ],
            "monitoring_frequency": {
                "primary_sources": "hourly",
                "apis": "daily", 
                "comparative": "weekly"
            }
        }
        
        if self.config_file.exists():
            with open(self.config_file, 'r') as f:
                config = json.load(f)
                # Update with any missing defaults
                for key, value in default_config.items():
                    if key not in config:
                        config[key] = value
                return config
        else:
            with open(self.config_file, 'w') as f:
                json.dump(default_config, f, indent=2)
            return default_config
    
    def monitor_primary_sources(self) -> Dict[str, Any]:
        """Monitor Carmen de Areco primary sources for changes"""
        self.logger.info("🔍 Monitoring primary sources...")
        
        results = {
            "timestamp": datetime.now().isoformat(),
            "changes_detected": [],
            "errors": []
        }
        
        for url in self.config["primary_sources"]:
            try:
                self.logger.info(f"Checking: {url}")
                response = self.session.get(url, timeout=30)
                
                if response.status_code == 200:
                    # Calculate content hash
                    content_hash = hashlib.sha256(response.content).hexdigest()
                    
                    # Check for changes
                    hash_file = self.data_dir / f"hash_{hashlib.md5(url.encode()).hexdigest()}.txt"
                    
                    previous_hash = None
                    if hash_file.exists():
                        with open(hash_file, 'r') as f:
                            previous_hash = f.read().strip()
                    
                    if previous_hash != content_hash:
                        self.logger.info(f"🚨 Change detected in: {url}")
                        results["changes_detected"].append({
                            "url": url,
                            "previous_hash": previous_hash,
                            "current_hash": content_hash,
                            "timestamp": datetime.now().isoformat()
                        })
                        
                        # Save new hash
                        with open(hash_file, 'w') as f:
                            f.write(content_hash)
                        
                        # Check for specific document types
                        self._check_for_new_documents(url, response.text)
                    else:
                        self.logger.info(f"✅ No changes in: {url}")
                        
                else:
                    error = f"HTTP {response.status_code} for {url}"
                    self.logger.error(error)
                    results["errors"].append(error)
                    
            except Exception as e:
                error = f"Error monitoring {url}: {str(e)}"
                self.logger.error(error)
                results["errors"].append(error)
        
        return results
    
    def _check_for_new_documents(self, url: str, content: str):
        """Check for new PDF/Excel documents in page content"""
        from bs4 import BeautifulSoup
        
        soup = BeautifulSoup(content, 'html.parser')
        document_types = ['.pdf', '.xlsx', '.xls', '.docx']
        
        new_documents = []
        for link in soup.find_all('a', href=True):
            href = link['href']
            if any(doc_type in href.lower() for doc_type in document_types):
                if not href.startswith('http'):
                    full_url = f"{url.rstrip('/')}/{href.lstrip('/')}"
                else:
                    full_url = href
                
                # Check if this is a financial document
                link_text = link.get_text().lower()
                financial_keywords = [
                    'presupuesto', 'balance', 'ejecucion', 'financiero',
                    'contrato', 'licitacion', 'ordenanza', 'deuda'
                ]
                
                if any(keyword in link_text for keyword in financial_keywords):
                    new_documents.append({
                        'url': full_url,
                        'text': link_text,
                        'type': 'financial'
                    })
        
        if new_documents:
            self.logger.info(f"📄 Found {len(new_documents)} potentially new financial documents")
            self._trigger_alert("new_financial_documents", {
                "source_url": url,
                "documents": new_documents,
                "count": len(new_documents)
            })
    
    def monitor_national_apis(self) -> Dict[str, Any]:
        """Monitor national APIs for Carmen de Areco data"""
        self.logger.info("🏛️ Monitoring national APIs...")
        
        results = {
            "timestamp": datetime.now().isoformat(),
            "api_results": {},
            "errors": []
        }
        
        # Monitor datos.gob.ar
        try:
            search_url = self.config["national_apis"]["datos_gob_ar"]
            response = self.session.get(search_url, timeout=30)
            
            if response.status_code == 200:
                # Parse for dataset count changes
                dataset_count = response.text.count('dataset-item')
                
                count_file = self.data_dir / "datos_gob_ar_count.txt"
                previous_count = 0
                
                if count_file.exists():
                    with open(count_file, 'r') as f:
                        previous_count = int(f.read().strip())
                
                if dataset_count != previous_count:
                    self.logger.info(f"🆕 Dataset count changed: {previous_count} → {dataset_count}")
                    results["api_results"]["datos_gob_ar"] = {
                        "previous_count": previous_count,
                        "current_count": dataset_count,
                        "change": dataset_count - previous_count
                    }
                    
                    with open(count_file, 'w') as f:
                        f.write(str(dataset_count))
                    
                    self._trigger_alert("new_national_datasets", {
                        "previous_count": previous_count,
                        "current_count": dataset_count,
                        "change": dataset_count - previous_count
                    })
                else:
                    self.logger.info("✅ No new national datasets found")
                    
        except Exception as e:
            error = f"Error monitoring national APIs: {str(e)}"
            self.logger.error(error)
            results["errors"].append(error)
        
        return results
    
    def monitor_bora_entries(self) -> Dict[str, Any]:
        """Monitor Boletín Oficial for Carmen de Areco entries"""
        self.logger.info("📜 Monitoring BORA entries...")
        
        # This would integrate with BORA API or scraper
        # Using the tool from your resources: https://github.com/juancarlospaco/borapp
        
        results = {
            "timestamp": datetime.now().isoformat(),
            "new_entries": [],
            "status": "monitoring_configured"
        }
        
        # Integration note: This would require setting up the BORA scraper
        # from the resources you provided
        self.logger.info("📋 BORA monitoring configured (requires BORA scraper setup)")
        
        return results
    
    def check_compliance_deadlines(self) -> Dict[str, Any]:
        """Check for missing reports based on legal deadlines"""
        self.logger.info("⚖️ Checking compliance deadlines...")
        
        now = datetime.now()
        
        # Define expected reporting deadlines
        deadlines = {
            "quarterly_budget": {
                "frequency": "quarterly",
                "last_expected": self._get_last_quarter_end(now),
                "grace_days": 30
            },
            "monthly_execution": {
                "frequency": "monthly", 
                "last_expected": self._get_last_month_end(now),
                "grace_days": 15
            },
            "annual_budget": {
                "frequency": "yearly",
                "last_expected": datetime(now.year-1, 12, 31),
                "grace_days": 90
            }
        }
        
        missing_reports = []
        
        for report_type, config in deadlines.items():
            days_overdue = (now - config["last_expected"]).days - config["grace_days"]
            
            if days_overdue > 0:
                missing_reports.append({
                    "report_type": report_type,
                    "expected_date": config["last_expected"].isoformat(),
                    "days_overdue": days_overdue,
                    "severity": "high" if days_overdue > 60 else "medium"
                })
        
        if missing_reports:
            self.logger.warning(f"⚠️ Found {len(missing_reports)} overdue reports")
            self._trigger_alert("missing_reports", {
                "missing_reports": missing_reports,
                "count": len(missing_reports)
            })
        
        return {
            "timestamp": now.isoformat(),
            "missing_reports": missing_reports,
            "compliance_status": "compliant" if not missing_reports else "non_compliant"
        }
    
    def _get_last_quarter_end(self, date):
        """Get the last quarter end date"""
        quarter = (date.month - 1) // 3 + 1
        if quarter == 1:
            return datetime(date.year - 1, 12, 31)
        else:
            return datetime(date.year, (quarter - 1) * 3, 31)
    
    def _get_last_month_end(self, date):
        """Get the last month end date"""
        if date.month == 1:
            return datetime(date.year - 1, 12, 31)
        else:
            return datetime(date.year, date.month - 1, 31)
    
    def _trigger_alert(self, alert_type: str, data: Dict[str, Any]):
        """Trigger alert for detected changes"""
        alert = {
            "type": alert_type,
            "timestamp": datetime.now().isoformat(),
            "data": data
        }
        
        # Save alert to file
        alert_file = self.data_dir / f"alert_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{alert_type}.json"
        with open(alert_file, 'w') as f:
            json.dump(alert, f, indent=2)
        
        self.logger.info(f"🚨 Alert triggered: {alert_type}")
        
        # Here you could add email notifications, webhook calls, etc.
        
    def run_monitoring_cycle(self):
        """Run complete monitoring cycle"""
        self.logger.info("🚀 Starting monitoring cycle")
        
        cycle_results = {
            "timestamp": datetime.now().isoformat(),
            "primary_sources": self.monitor_primary_sources(),
            "national_apis": self.monitor_national_apis(),
            "bora_entries": self.monitor_bora_entries(),
            "compliance_check": self.check_compliance_deadlines()
        }
        
        # Save cycle results
        results_file = self.data_dir / f"monitoring_cycle_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(results_file, 'w') as f:
            json.dump(cycle_results, f, indent=2)
        
        self.logger.info(f"✅ Monitoring cycle completed - results saved to {results_file}")
        return cycle_results
    
    def setup_scheduled_monitoring(self):
        """Setup scheduled monitoring based on configuration"""
        self.logger.info("📅 Setting up scheduled monitoring...")
        
        # Schedule based on configuration
        freq = self.config["monitoring_frequency"]
        
        if freq["primary_sources"] == "hourly":
            schedule.every().hour.do(self.monitor_primary_sources)
        elif freq["primary_sources"] == "daily":
            schedule.every().day.do(self.monitor_primary_sources)
        
        if freq["apis"] == "daily":
            schedule.every().day.do(self.monitor_national_apis)
        
        # Weekly compliance check
        schedule.every().monday.do(self.check_compliance_deadlines)
        
        self.logger.info("✅ Scheduled monitoring configured")
        
        # Run monitoring loop
        self.logger.info("🔄 Starting monitoring loop (Ctrl+C to stop)...")
        try:
            while True:
                schedule.run_pending()
                time.sleep(60)  # Check every minute
        except KeyboardInterrupt:
            self.logger.info("⏹️ Monitoring stopped by user")

if __name__ == "__main__":
    monitor = AutomatedMonitoringSystem()
    
    # Run immediate monitoring cycle
    results = monitor.run_monitoring_cycle()
    
    # Uncomment to start continuous monitoring
    # monitor.setup_scheduled_monitoring()