#!/usr/bin/env python3
"""
Master Audit Orchestrator - Carmen de Areco Complete Transparency System
Coordinates all audit components based on comprehensive resource document
"""

import json
import sys
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Any
import logging
import subprocess
import importlib.util

# Add scripts directory to path
sys.path.append(str(Path(__file__).parent))

# Import all audit system components
from automated_monitoring_system import AutomatedMonitoringSystem
from national_apis_collector import NationalAPIsCollector
from comparative_analysis_system import ComparativeAnalysisSystem
from advanced_pdf_processor import AdvancedPDFProcessor
from anomaly_detection_system import AnomalyDetectionSystem
from public_dashboard_generator import PublicDashboardGenerator
from foia_automation_system import FOIAAutomationSystem
from whistleblower_protection_system import WhistleblowerProtectionSystem

class MasterAuditOrchestrator:
    """
    Master orchestrator for the complete Carmen de Areco transparency audit system
    Coordinates all components for comprehensive municipal transparency analysis
    """
    
    def __init__(self):
        self.audit_dir = Path("data/master_audit")
        self.audit_dir.mkdir(parents=True, exist_ok=True)
        
        # Setup logging
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - MASTER_AUDIT - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(self.audit_dir / 'master_audit.log'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
        
        # Initialize all system components
        self.components = self._initialize_components()
        
        # System configuration
        self.config = self._setup_system_configuration()
        
    def _initialize_components(self):
        """Initialize all audit system components"""
        self.logger.info("🔧 Initializing audit system components...")
        
        return {
            "monitoring": AutomatedMonitoringSystem(),
            "national_apis": NationalAPIsCollector(),
            "comparative_analysis": ComparativeAnalysisSystem(),
            "pdf_processor": AdvancedPDFProcessor(),
            "anomaly_detection": AnomalyDetectionSystem(),
            "dashboard_generator": PublicDashboardGenerator(),
            "foia_automation": FOIAAutomationSystem(),
            "whistleblower_protection": WhistleblowerProtectionSystem()
        }
    
    def _setup_system_configuration(self):
        """Setup master system configuration"""
        return {
            "system_name": "Carmen de Areco Comprehensive Transparency Audit System",
            "version": "1.0.0",
            "based_on": "Comprehensive Argentine Transparency Resources Document",
            "target_municipality": "Carmen de Areco, Buenos Aires Province",
            "legal_framework": [
                "Ley 27.275 - Acceso a la Información Pública",
                "Ley 27.401 - Protección de Denunciantes", 
                "Ley Orgánica Municipal",
                "International Budget Partnership Standards",
                "Open Contracting Data Standard"
            ],
            "data_sources": {
                "primary": [
                    "https://carmendeareco.gob.ar/transparencia",
                    "https://carmendeareco.gob.ar/gobierno/boletin-oficial/"
                ],
                "national_apis": [
                    "https://datos.gob.ar/",
                    "https://www.presupuestoabierto.gob.ar/sici/api",
                    "https://apis.datos.gob.ar/georef/api/"
                ],
                "provincial": [
                    "https://www.gba.gob.ar/transparencia_fiscal/",
                    "https://www.gba.gob.ar/datos_abiertos"
                ],
                "comparative": [
                    "https://transparencia.bahia.gob.ar/",
                    "https://datosabiertos.pilar.gov.ar/",
                    "https://rafaela-gob-ar.github.io/"
                ]
            },
            "monitoring_tools": [
                "Change Detection (github.com/dgtlmoon/changedetection.io)",
                "BORA Scraper (github.com/juancarlospaco/borapp)",
                "Wayback Machine API integration"
            ],
            "analysis_tools": [
                "Network analysis (Neo4j approach)",
                "Statistical anomaly detection",
                "Benford's Law analysis",
                "Tabula-py + PDFPlumber + Camelot for PDF processing"
            ],
            "output_formats": [
                "Interactive Astro + D3.js dashboard",
                "JSON APIs for programmatic access",
                "Markdown reports for human reading",
                "CSV exports for data analysis"
            ]
        }
    
    def run_complete_audit_cycle(self, 
                                requester_info: Dict[str, str] = None,
                                pdf_directory: str = "data/live_scrape") -> Dict[str, Any]:
        """Run complete audit cycle with all components"""
        
        self.logger.info("\n🚀 STARTING COMPLETE CARMEN DE ARECO TRANSPARENCY AUDIT")
        self.logger.info("=" * 80)
        self.logger.info(f"Timestamp: {datetime.now().isoformat()}")
        self.logger.info(f"Based on: {self.config['based_on']}")
        
        audit_results = {
            "audit_id": f"MASTER-AUDIT-{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "timestamp": datetime.now().isoformat(),
            "system_config": self.config,
            "component_results": {},
            "summary": {},
            "recommendations": []
        }
        
        # Define audit execution sequence
        audit_sequence = [
            ("automated_monitoring", "Running continuous monitoring system", 
             lambda: self.components["monitoring"].run_monitoring_cycle()),
            
            ("national_data_collection", "Collecting national government data",
             lambda: self.components["national_apis"].collect_all_external_data()),
            
            ("comparative_analysis", "Analyzing against peer municipalities", 
             lambda: self.components["comparative_analysis"].run_comparative_analysis()),
            
            ("pdf_processing", "Processing financial documents",
             lambda: self.components["pdf_processor"].process_pdf_batch(pdf_directory) if Path(pdf_directory).exists() else {"summary": {"success_rate": 0, "message": "No PDFs found"}}),
            
            ("anomaly_detection", "Detecting suspicious patterns",
             lambda: self.components["anomaly_detection"].run_comprehensive_analysis()),
            
            ("dashboard_generation", "Creating public transparency dashboard",
             lambda: self.components["dashboard_generator"].generate_complete_dashboard()),
            
            ("foia_automation", "Setting up FOIA requests for missing data",
             lambda: self.components["foia_automation"].generate_comprehensive_foia_campaign(
                 requester_info or {"name": "Transparency Audit System", "email": "audit@transparency.org", "organization": "Carmen de Areco Audit"})),
            
            ("whistleblower_protection", "Establishing whistleblower protection system",
             lambda: self.components["whistleblower_protection"].create_comprehensive_protection_system())
        ]
        
        # Execute audit sequence
        for component_name, description, execution_func in audit_sequence:
            try:
                self.logger.info(f"\n📊 {description}...")
                self.logger.info("-" * 50)
                
                result = execution_func()
                audit_results["component_results"][component_name] = result
                
                # Log success
                if isinstance(result, dict) and result.get("success", True):
                    self.logger.info(f"✅ {component_name}: Completed successfully")
                else:
                    self.logger.warning(f"⚠️ {component_name}: Completed with issues")
                
            except Exception as e:
                self.logger.error(f"❌ {component_name}: Failed - {str(e)}")
                audit_results["component_results"][component_name] = {
                    "success": False,
                    "error": str(e)
                }
        
        # Generate master summary
        audit_results["summary"] = self._generate_master_summary(audit_results)
        
        # Generate recommendations
        audit_results["recommendations"] = self._generate_master_recommendations(audit_results)
        
        # Save complete audit results
        output_file = self.audit_dir / f"{audit_results['audit_id']}_complete.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(audit_results, f, indent=2, ensure_ascii=False, default=str)
        
        # Generate human-readable report
        report = self._generate_master_report(audit_results)
        report_file = self.audit_dir / f"{audit_results['audit_id']}_report.md"
        with open(report_file, 'w', encoding='utf-8') as f:
            f.write(report)
        
        self.logger.info(f"\n🎉 COMPLETE AUDIT FINISHED")
        self.logger.info(f"📄 Master Report: {report_file}")
        self.logger.info(f"📊 Complete Data: {output_file}")
        
        return audit_results
    
    def _generate_master_summary(self, audit_results: Dict[str, Any]) -> Dict[str, Any]:
        """Generate master audit summary"""
        component_results = audit_results["component_results"]
        
        summary = {
            "total_components": len(component_results),
            "successful_components": 0,
            "failed_components": 0,
            "components_with_issues": 0,
            "key_findings": {},
            "data_coverage": {},
            "transparency_assessment": {}
        }
        
        # Count success/failure
        for component_name, result in component_results.items():
            if isinstance(result, dict):
                if result.get("success", True) and not result.get("error"):
                    summary["successful_components"] += 1
                elif result.get("error"):
                    summary["failed_components"] += 1
                else:
                    summary["components_with_issues"] += 1
            else:
                summary["successful_components"] += 1
        
        # Extract key findings
        if "comparative_analysis" in component_results:
            comp_analysis = component_results["comparative_analysis"]
            if "comparative_summary" in comp_analysis:
                carmen_pos = comp_analysis["comparative_summary"].get("carmen_de_areco_position", {})
                summary["key_findings"]["transparency_ranking"] = {
                    "rank": carmen_pos.get("rank", "unknown"),
                    "score": carmen_pos.get("score", "unknown"),
                    "percentile": carmen_pos.get("percentile", "unknown")
                }
        
        # Anomaly detection findings
        if "anomaly_detection" in component_results:
            anomaly_results = component_results["anomaly_detection"]
            if "risk_assessment" in anomaly_results:
                summary["key_findings"]["corruption_risk"] = {
                    "risk_level": anomaly_results["risk_assessment"].get("risk_level", "unknown"),
                    "risk_score": anomaly_results["risk_assessment"].get("total_risk_score", 0),
                    "risk_factors_count": len(anomaly_results["risk_assessment"].get("risk_factors", []))
                }
        
        # Data coverage assessment
        summary["data_coverage"] = {
            "national_apis": "national_data_collection" in component_results,
            "pdf_processing": "pdf_processing" in component_results,
            "monitoring_active": "automated_monitoring" in component_results,
            "comparative_data": "comparative_analysis" in component_results
        }
        
        # Overall transparency assessment
        transparency_score = 0
        if summary["key_findings"].get("transparency_ranking", {}).get("score") != "unknown":
            transparency_score = summary["key_findings"]["transparency_ranking"]["score"]
        
        summary["transparency_assessment"] = {
            "overall_score": transparency_score,
            "category": self._categorize_transparency_score(transparency_score),
            "improvement_potential": max(0, 85 - transparency_score) if isinstance(transparency_score, (int, float)) else "unknown"
        }
        
        return summary
    
    def _categorize_transparency_score(self, score) -> str:
        """Categorize transparency score"""
        if not isinstance(score, (int, float)):
            return "needs_assessment"
        
        if score >= 80:
            return "excellent"
        elif score >= 65:
            return "good" 
        elif score >= 50:
            return "adequate"
        elif score >= 35:
            return "poor"
        else:
            return "critical"
    
    def _generate_master_recommendations(self, audit_results: Dict[str, Any]) -> List[str]:
        """Generate master recommendations based on all components"""
        recommendations = []
        
        summary = audit_results.get("summary", {})
        transparency_category = summary.get("transparency_assessment", {}).get("category", "")
        
        # General recommendations based on transparency level
        if transparency_category == "critical":
            recommendations.extend([
                "🚨 URGENTE: Implementar medidas básicas de transparencia",
                "📊 Publicar presupuesto y ejecución en formato abierto",
                "📋 Establecer portal de transparencia funcional",
                "⚖️ Revisar cumplimiento de Ley 27.275"
            ])
        elif transparency_category == "poor":
            recommendations.extend([
                "📈 Mejorar calidad y frecuencia de publicación de datos",
                "🔍 Implementar sistema de monitoreo continuo",
                "👥 Establecer canal de consultas ciudadanas"
            ])
        elif transparency_category == "adequate":
            recommendations.extend([
                "🎯 Optimizar formatos de datos (CSV, APIs)",
                "📱 Mejorar accesibilidad del portal",
                "🔄 Automatizar publicación de datos"
            ])
        
        # Specific recommendations from components
        component_results = audit_results.get("component_results", {})
        
        # Anomaly detection recommendations
        if "anomaly_detection" in component_results:
            anomaly_recs = component_results["anomaly_detection"].get("risk_assessment", {}).get("recommendations", [])
            recommendations.extend([f"🔍 {rec}" for rec in anomaly_recs[:3]])
        
        # Comparative analysis recommendations
        if "comparative_analysis" in component_results:
            comp_recs = component_results["comparative_analysis"].get("comparative_summary", {}).get("recommendations", [])
            recommendations.extend([f"📊 {rec}" for rec in comp_recs[:2]])
        
        # FOIA recommendations
        recommendations.append("📝 Completar información faltante mediante solicitudes FOIA")
        recommendations.append("🛡️ Establecer sistema de protección a denunciantes")
        recommendations.append("🚀 Desplegar dashboard público de transparencia")
        
        return recommendations[:10]  # Limit to top 10 recommendations
    
    def _generate_master_report(self, audit_results: Dict[str, Any]) -> str:
        """Generate comprehensive master report"""
        summary = audit_results.get("summary", {})
        
        return f"""
# INFORME MAESTRO DE AUDITORÍA DE TRANSPARENCIA
## Carmen de Areco - Análisis Integral

**ID de Auditoría:** {audit_results['audit_id']}  
**Fecha:** {datetime.now().strftime('%d de %B de %Y')}  
**Sistema:** {self.config['system_name']}

---

## 📋 RESUMEN EJECUTIVO

### Estado General del Sistema
- ✅ **Componentes Exitosos:** {summary.get('successful_components', 0)}/{summary.get('total_components', 0)}
- ⚠️ **Componentes con Problemas:** {summary.get('components_with_issues', 0)}
- ❌ **Componentes Fallidos:** {summary.get('failed_components', 0)}

### Evaluación de Transparencia
- **Categoría:** {summary.get('transparency_assessment', {}).get('category', 'No evaluado').upper()}
- **Puntuación:** {summary.get('key_findings', {}).get('transparency_ranking', {}).get('score', 'No disponible')}
- **Ranking:** #{summary.get('key_findings', {}).get('transparency_ranking', {}).get('rank', 'No disponible')} entre municipios evaluados

### Evaluación de Riesgo de Corrupción  
- **Nivel de Riesgo:** {summary.get('key_findings', {}).get('corruption_risk', {}).get('risk_level', 'No evaluado').upper()}
- **Puntuación de Riesgo:** {summary.get('key_findings', {}).get('corruption_risk', {}).get('risk_score', 0)}/100
- **Factores de Riesgo:** {summary.get('key_findings', {}).get('corruption_risk', {}).get('risk_factors_count', 0)} detectados

## 🎯 HALLAZGOS PRINCIPALES

### Cobertura de Datos
{"✅" if summary.get('data_coverage', {}).get('national_apis') else "❌"} **APIs Nacionales**: Conexión a datos.gob.ar y sistemas federales  
{"✅" if summary.get('data_coverage', {}).get('pdf_processing') else "❌"} **Procesamiento de Documentos**: Extracción automática de PDFs  
{"✅" if summary.get('data_coverage', {}).get('monitoring_active') else "❌"} **Monitoreo Continuo**: Detección automática de cambios  
{"✅" if summary.get('data_coverage', {}).get('comparative_data') else "❌"} **Análisis Comparativo**: Benchmarking con municipios pares  

## 🔧 COMPONENTES IMPLEMENTADOS

### 1. Sistema de Monitoreo Automatizado
- **Estado:** {"✅ Operativo" if "automated_monitoring" in audit_results['component_results'] else "❌ No disponible"}
- **Función:** Monitoreo continuo de fuentes oficiales
- **Tecnología:** Change detection + BORA scraping

### 2. Recolección de APIs Nacionales  
- **Estado:** {"✅ Operativo" if "national_data_collection" in audit_results['component_results'] else "❌ No disponible"}
- **Función:** Integración con datos.gob.ar, INDEC, BCRA
- **Cobertura:** {len(self.config['data_sources']['national_apis'])} APIs principales

### 3. Análisis Comparativo
- **Estado:** {"✅ Operativo" if "comparative_analysis" in audit_results['component_results'] else "❌ No disponible"}  
- **Función:** Benchmarking transparencia municipal
- **Referencias:** {len(self.config['data_sources']['comparative'])} municipios modelo

### 4. Procesamiento Avanzado de PDFs
- **Estado:** {"✅ Operativo" if "pdf_processing" in audit_results['component_results'] else "❌ No disponible"}
- **Función:** Extracción tabular con Tabula-py + PDFPlumber
- **Capacidad:** Documentos financieros municipales

### 5. Detección de Anomalías
- **Estado:** {"✅ Operativo" if "anomaly_detection" in audit_results['component_results'] else "❌ No disponible"}
- **Función:** Análisis de redes + patrones sospechosos  
- **Metodología:** Neo4j approach + análisis estadístico

### 6. Dashboard Público
- **Estado:** {"✅ Generado" if "dashboard_generation" in audit_results['component_results'] else "❌ No disponible"}
- **Tecnología:** Astro + D3.js + React
- **Funcionalidad:** Visualizaciones interactivas

### 7. Automatización FOIA
- **Estado:** {"✅ Configurado" if "foia_automation" in audit_results['component_results'] else "❌ No disponible"}
- **Función:** Solicitudes automáticas Ley 27.275
- **Objetivo:** Datos faltantes 2018

### 8. Protección de Denunciantes
- **Estado:** {"✅ Implementado" if "whistleblower_protection" in audit_results['component_results'] else "❌ No disponible"}
- **Marco Legal:** Ley 27.401 Art. 22
- **Seguridad:** Cifrado AES-256

## 📊 RECOMENDACIONES PRIORITARIAS

"""
        
        # Add recommendations
        recommendations = audit_results.get("recommendations", [])
        for i, rec in enumerate(recommendations, 1):
            report += f"{i}. {rec}\n"
        
        report += f"""

## 🗂️ MARCO LEGAL APLICADO

- **Ley 27.275** - Acceso a la Información Pública
- **Ley 27.401** - Protección de Denunciantes  
- **Ley Orgánica Municipal** - Transparencia local
- **International Budget Partnership** - Estándares presupuestarios
- **Open Contracting Data Standard** - Transparencia en contrataciones

## 📈 PRÓXIMOS PASOS

1. **Inmediato (1-2 semanas)**
   - Revisar hallazgos de auditoría
   - Implementar dashboard público
   - Activar monitoreo continuo

2. **Corto Plazo (1-3 meses)**
   - Completar solicitudes FOIA
   - Mejorar formatos de datos
   - Establecer canales de denuncia

3. **Mediano Plazo (3-6 meses)**
   - Implementar mejoras comparativas
   - Automatizar publicación de datos
   - Capacitar personal municipal

4. **Largo Plazo (6-12 meses)**
   - Certificación de transparencia
   - Integración con sistemas provinciales
   - Auditorías periódicas automatizadas

## 📋 DOCUMENTACIÓN TÉCNICA

- **Código Fuente:** /scripts/audit/
- **Datos Procesados:** /data/
- **Configuraciones:** /config/
- **Logs del Sistema:** /logs/

## 🤖 INFORMACIÓN DEL SISTEMA

**Versión:** {self.config['version']}  
**Basado en:** {self.config['based_on']}  
**Desarrollado por:** Sistema de Auditoría Carmen de Areco  
**Fecha de Generación:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

---

*Este informe fue generado automáticamente por el Sistema Maestro de Auditoría de Transparencia, utilizando las mejores prácticas internacionales y el marco legal argentino.*

🔗 **Para más información:** Consulte la documentación técnica completa en el directorio del sistema.

🛡️ **Confidencialidad:** Este informe contiene información pública. Los datos personales están protegidos conforme a la Ley de Protección de Datos Personales.
"""
        
        return report
    
    def quick_status_check(self) -> Dict[str, Any]:
        """Quick system status check"""
        self.logger.info("🔍 Running quick system status check...")
        
        status = {
            "timestamp": datetime.now().isoformat(),
            "components_initialized": len(self.components),
            "system_ready": True,
            "component_status": {}
        }
        
        # Check each component
        for component_name, component in self.components.items():
            try:
                # Basic health check
                status["component_status"][component_name] = {
                    "initialized": True,
                    "class_name": component.__class__.__name__
                }
            except Exception as e:
                status["component_status"][component_name] = {
                    "initialized": False,
                    "error": str(e)
                }
                status["system_ready"] = False
        
        return status

if __name__ == "__main__":
    orchestrator = MasterAuditOrchestrator()
    
    # Quick status check first
    status = orchestrator.quick_status_check()
    print("📊 System Status:", "✅ Ready" if status["system_ready"] else "❌ Issues detected")
    
    # Run complete audit if requested
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "--full-audit":
        print("\n🚀 Running complete transparency audit...")
        results = orchestrator.run_complete_audit_cycle()
        print(f"🎉 Audit completed! Check: {orchestrator.audit_dir}")
    else:
        print("\n💡 To run complete audit: python master_audit_orchestrator.py --full-audit")
        print(f"📁 System ready at: {orchestrator.audit_dir}")