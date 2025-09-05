#!/usr/bin/env python3
"""
Base Audit Component Class for Carmen de Areco Transparency Audit System
This provides a standardized base class for all audit components.
"""

import logging
import json
from abc import ABC, abstractmethod
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any, Optional


class AuditComponent(ABC):
    """Base class for all audit components"""
    
    def __init__(self, name: str, output_dir: str = "data/audit_results"):
        self.name = name
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Setup logging
        self.logger = self._setup_logger()
        
        # Initialize component
        self._initialize()
    
    def _setup_logger(self) -> logging.Logger:
        """Setup component-specific logger"""
        logger = logging.getLogger(f"{self.__class__.__name__}")
        logger.setLevel(logging.INFO)
        
        # Prevent adding multiple handlers if logger already exists
        if not logger.handlers:
            handler = logging.StreamHandler()
            formatter = logging.Formatter(
                '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
            )
            handler.setFormatter(formatter)
            logger.addHandler(handler)
        
        return logger
    
    def _initialize(self):
        """Initialize component-specific resources"""
        pass
    
    @abstractmethod
    def run(self) -> Dict[str, Any]:
        """Run the component and return results"""
        pass
    
    def save_results(self, results: Dict[str, Any], filename: Optional[str] = None) -> Path:
        """Save results to JSON file"""
        if filename is None:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"{self.name}_results_{timestamp}.json"
        
        filepath = self.output_dir / filename
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(results, f, ensure_ascii=False, indent=2, default=str)
        
        self.logger.info(f"Results saved to {filepath}")
        return filepath
    
    def load_results(self, filename: str) -> Dict[str, Any]:
        """Load results from JSON file"""
        filepath = self.output_dir / filename
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    def log_info(self, message: str):
        """Log info message"""
        self.logger.info(message)
    
    def log_warning(self, message: str):
        """Log warning message"""
        self.logger.warning(message)
    
    def log_error(self, message: str):
        """Log error message"""
        self.logger.error(message)

    def log_debug(self, message: str):
        """Log debug message"""
        self.logger.debug(message)


class DataProcessor(AuditComponent):
    """Base class for data processing components"""
    
    def __init__(self, name: str, output_dir: str = "data/audit_results"):
        super().__init__(name, output_dir)
        self.data_sources = []
    
    @abstractmethod
    def process_data(self, data: Any) -> Any:
        """Process input data and return results"""
        pass
    
    def add_data_source(self, source: str):
        """Add a data source to the processor"""
        self.data_sources.append(source)
        self.log_info(f"Added data source: {source}")
    
    def run(self) -> Dict[str, Any]:
        """Run the data processor"""
        try:
            results = self.process_data(None)
            return {"success": True, "data": results}
        except Exception as e:
            self.log_error(f"Data processing failed: {e}")
            return {"success": False, "error": str(e)}


class Analyzer(AuditComponent):
    """Base class for analysis components"""
    
    def __init__(self, name: str, output_dir: str = "data/audit_results"):
        super().__init__(name, output_dir)
        self.thresholds = {}
    
    @abstractmethod
    def analyze(self, data: Any) -> Dict[str, Any]:
        """Analyze data and return findings"""
        pass
    
    def set_threshold(self, key: str, value: float):
        """Set a threshold for analysis"""
        self.thresholds[key] = value
        self.log_info(f"Set threshold {key} = {value}")
    
    def run(self) -> Dict[str, Any]:
        """Run the analyzer"""
        try:
            results = self.analyze(None)
            return {"success": True, "data": results}
        except Exception as e:
            self.log_error(f"Analysis failed: {e}")
            return {"success": False, "error": str(e)}


class Monitor(AuditComponent):
    """Base class for monitoring components"""
    
    def __init__(self, name: str, output_dir: str = "data/audit_results"):
        super().__init__(name, output_dir)
        self.targets = []
    
    @abstractmethod
    def monitor(self) -> Dict[str, Any]:
        """Monitor targets and return status"""
        pass
    
    def add_target(self, target: str):
        """Add a target to monitor"""
        self.targets.append(target)
        self.log_info(f"Added monitoring target: {target}")
    
    def run(self) -> Dict[str, Any]:
        """Run the monitor"""
        try:
            results = self.monitor()
            return {"success": True, "data": results}
        except Exception as e:
            self.log_error(f"Monitoring failed: {e}")
            return {"success": False, "error": str(e)}


class Reporter(AuditComponent):
    """Base class for reporting components"""
    
    def __init__(self, name: str, output_dir: str = "data/audit_results"):
        super().__init__(name, output_dir)
        self.report_formats = ['json']
    
    @abstractmethod
    def generate_report(self, data: Any) -> Dict[str, Any]:
        """Generate report from data"""
        pass
    
    def export_report(self, report: Dict[str, Any], format: str = 'json') -> Path:
        """Export report in specified format"""
        if format not in self.report_formats:
            raise ValueError(f"Unsupported format: {format}")
        
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"{self.name}_report_{timestamp}.{format}"
        filepath = self.output_dir / filename
        
        if format == 'json':
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(report, f, ensure_ascii=False, indent=2, default=str)
        
        self.log_info(f"Report exported to {filepath}")
        return filepath
    
    def run(self) -> Dict[str, Any]:
        """Run the reporter"""
        try:
            results = self.generate_report(None)
            return {"success": True, "data": results}
        except Exception as e:
            self.log_error(f"Report generation failed: {e}")
            return {"success": False, "error": str(e)}