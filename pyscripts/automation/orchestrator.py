#!/usr/bin/env python3
"""
Main Orchestrator for Carmen de Areco Transparency System
Coordinates all services in a modular, efficient architecture
"""

import yaml
import json
import logging
from pathlib import Path
from datetime import datetime
from typing import Dict, Any

# Import services
from services.data_acquisition_service import UnifiedDataAcquisitionService
from services.pdf_processing_service import UnifiedPDFProcessor

class TransparencySystemOrchestrator:
    """Main orchestrator that coordinates all system services"""
    
    def __init__(self, config_path="config/system_config.yaml"):
        # Load configuration
        self.config_path = Path(config_path)
        self.config = self._load_config()
        
        # Setup logging
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        self.logger = logging.getLogger(__name__)
        
        # Initialize services
        self._initialize_services()
        
        self.logger.info("Transparency System Orchestrator initialized")
    
    def _load_config(self) -> Dict[Any, Any]:
        """Load system configuration"""
        try:
            with open(self.config_path, 'r') as f:
                return yaml.safe_load(f)
        except Exception as e:
            self.logger.error(f"Failed to load configuration: {e}")
            # Return default configuration
            return {
                "directories": {
                    "data": "data",
                    "processed": "data/processed"
                }
            }
    
    def _initialize_services(self):
        """Initialize all system services"""
        data_dir = self.config.get("directories", {}).get("data", "data")
        processed_dir = self.config.get("directories", {}).get("processed", "data/processed")
        
        # Initialize data acquisition service
        self.data_acquisition = UnifiedDataAcquisitionService(
            output_dir=f"{data_dir}/acquired"
        )
        
        # Initialize PDF processing service
        self.pdf_processor = UnifiedPDFProcessor(
            output_dir=f"{processed_dir}/pdf_extraction"
        )
        
        self.logger.info("All services initialized")
    
    def run_full_cycle(self) -> Dict[str, Any]:
        """Run complete transparency monitoring cycle"""
        self.logger.info("Starting full transparency monitoring cycle")
        
        results = {
            "cycle_started": datetime.now().isoformat(),
            "phases": {}
        }
        
        try:
            # Phase 1: Data Acquisition
            self.logger.info("Phase 1: Data Acquisition")
            results["phases"]["acquisition"] = "running"
            
            acquisition_results = self.data_acquisition.acquire_all_sources()
            results["acquisition"] = acquisition_results
            results["phases"]["acquisition"] = "completed"
            
            # Phase 2: Document Processing
            self.logger.info("Phase 2: Document Processing")
            results["phases"]["processing"] = "running"
            
            # Get PDF documents from acquisition
            pdf_documents = [
                doc for doc in acquisition_results.get("documents", [])
                if doc.get("url", "").lower().endswith(".pdf")
            ]
            
            if pdf_documents:
                # Download and process PDFs
                processed_documents = []
                for doc in pdf_documents[:5]:  # Limit for testing
                    try:
                        filepath = self.data_acquisition.download_document(doc["url"])
                        if filepath:
                            processing_result = self.pdf_processor.process_pdf(str(filepath))
                            processed_documents.append(processing_result)
                    except Exception as e:
                        self.logger.error(f"Failed to process document {doc['url']}: {e}")
                
                results["processed_documents"] = processed_documents
            
            results["phases"]["processing"] = "completed"
            
            # Phase 3: Analysis (to be implemented)
            self.logger.info("Phase 3: Analysis")
            results["phases"]["analysis"] = "skipped"  # Placeholder
            
            # Phase 4: Reporting (to be implemented)
            self.logger.info("Phase 4: Reporting")
            results["phases"]["reporting"] = "skipped"  # Placeholder
            
        except Exception as e:
            self.logger.error(f"Error in monitoring cycle: {e}")
            results["error"] = str(e)
        
        results["cycle_completed"] = datetime.now().isoformat()
        
        # Save results
        data_dir = Path(self.config.get("directories", {}).get("data", "data"))
        results_file = data_dir / "cycle_results" / f"cycle_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        results_file.parent.mkdir(parents=True, exist_ok=True)
        
        with open(results_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
        
        self.logger.info(f"Monitoring cycle completed. Results saved to: {results_file}")
        return results
    
    def run_continuous_monitoring(self):
        """Run continuous monitoring (placeholder for scheduler integration)"""
        self.logger.info("Starting continuous monitoring")
        
        # This would integrate with a scheduler like APScheduler or Celery
        # For now, we'll just run one cycle
        self.run_full_cycle()
        
        self.logger.info("Continuous monitoring cycle completed")
    
    def get_system_status(self) -> Dict[str, Any]:
        """Get current system status"""
        return {
            "status": "operational",
            "services": {
                "data_acquisition": "ready",
                "pdf_processing": "ready",
                "anomaly_detection": "not_implemented",
                "reporting": "not_implemented"
            },
            "last_updated": datetime.now().isoformat(),
            "config_file": str(self.config_path)
        }

def main():
    """Main entry point"""
    orchestrator = TransparencySystemOrchestrator()
    
    import sys
    if len(sys.argv) > 1:
        command = sys.argv[1]
        
        if command == "full-cycle":
            orchestrator.run_full_cycle()
        elif command == "continuous":
            orchestrator.run_continuous_monitoring()
        elif command == "status":
            status = orchestrator.get_system_status()
            print(json.dumps(status, indent=2))
        else:
            print("Usage: orchestrator.py [full-cycle|continuous|status]")
    else:
        print("Carmen de Areco Transparency System Orchestrator")
        print("Usage: orchestrator.py [full-cycle|continuous|status]")
        print()
        print("Available commands:")
        print("  full-cycle    - Run complete monitoring cycle")
        print("  continuous    - Run continuous monitoring")
        print("  status        - Show system status")

if __name__ == "__main__":
    main()