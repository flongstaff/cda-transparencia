#!/usr/bin/env python3
"""
Comparative Analysis System for Carmen de Areco
Analyzes transparency and governance metrics against peer municipalities
"""

import requests
import json
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Any, Optional
import pandas as pd
import numpy as np
from bs4 import BeautifulSoup
import time
import logging
from urllib.parse import urljoin, urlparse
import hashlib

class ComparativeAnalysisSystem:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Municipal-Transparency-Comparative-Analysis/1.0'
        })
        
        self.data_dir = Path("data/comparative_analysis")
        self.data_dir.mkdir(parents=True, exist_ok=True)
        
        # Setup logging
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
        
        # Municipality configurations
        self.municipalities = self._setup_municipalities()
        
        # Transparency metrics to evaluate
        self.transparency_metrics = self._setup_transparency_metrics()
        
    def _setup_municipalities(self):
        """Setup municipality data from comprehensive resource list"""
        return {
            "carmen_de_areco": {
                "name": "Carmen de Areco",
                "population": 14000,  # Approximate
                "type": "target",
                "urls": {
                    "main": "https://carmendeareco.gob.ar",
                    "transparency": "https://carmendeareco.gob.ar/transparencia",
                    "official_bulletin": "https://carmendeareco.gob.ar/gobierno/boletin-oficial/"
                }
            },
            
            # Similar size municipalities
            "chacabuco": {
                "name": "Chacabuco", 
                "population": 45000,
                "type": "peer",
                "urls": {
                    "main": "https://chacabuco.gob.ar/",
                    "transparency": "https://chacabuco.gob.ar/transparencia/",
                    "portal": "https://chacabuco.gob.ar/"
                }
            },
            "chivilcoy": {
                "name": "Chivilcoy",
                "population": 65000, 
                "type": "peer",
                "urls": {
                    "main": "https://chivilcoy.gob.ar/",
                    "transparency": "https://chivilcoy.gob.ar/transparencia/",
                    "portal": "https://chivilcoy.gob.ar/"
                }
            },
            "san_antonio_areco": {
                "name": "San Antonio de Areco",
                "population": 25000,
                "type": "peer", 
                "urls": {
                    "main": "https://www.sanantoniodeareco.gob.ar/",
                    "transparency": "https://www.sanantoniodeareco.gob.ar/transparencia/",
                    "portal": "https://www.sanantoniodeareco.gob.ar/"
                }
            },
            "san_andres_giles": {
                "name": "San Andrés de Giles",
                "population": 23000,
                "type": "peer",
                "urls": {
                    "main": "https://www.sag.gob.ar/",
                    "transparency": "https://www.sag.gob.ar/transparencia/",
                    "portal": "https://www.sag.gob.ar/"
                }
            },
            "capitan_sarmiento": {
                "name": "Capitán Sarmiento",
                "population": 14000,
                "type": "peer",
                "urls": {
                    "main": "https://capitansarmiento.gob.ar/",
                    "transparency": "https://capitansarmiento.gob.ar/transparencia/",
                    "portal": "https://capitansarmiento.gob.ar/"
                }
            },
            
            # Best practice models
            "bahia_blanca": {
                "name": "Bahía Blanca",
                "population": 300000,
                "type": "best_practice",
                "urls": {
                    "main": "https://bahia.gob.ar/",
                    "transparency": "https://transparencia.bahia.gob.ar/",
                    "portal": "https://transparencia.bahia.gob.ar/"
                }
            },
            "mar_del_plata": {
                "name": "Mar del Plata",
                "population": 650000,
                "type": "best_practice", 
                "urls": {
                    "main": "https://www.mardelplata.gob.ar/",
                    "transparency": "https://www.mardelplata.gob.ar/transparencia",
                    "open_data": "https://www.mardelplata.gob.ar/datos-abiertos"
                }
            },
            "pilar": {
                "name": "Pilar",
                "population": 350000,
                "type": "best_practice",
                "urls": {
                    "main": "https://pilar.gov.ar/",
                    "transparency": "https://pilar.gov.ar/transparencia/",
                    "open_data": "https://datosabiertos.pilar.gov.ar/"
                }
            },
            "san_isidro": {
                "name": "San Isidro", 
                "population": 290000,
                "type": "best_practice",
                "urls": {
                    "main": "https://www.sanisidro.gob.ar/",
                    "transparency": "https://www.sanisidro.gob.ar/transparencia",
                    "portal": "https://www.sanisidro.gob.ar/"
                }
            },
            "rafaela": {
                "name": "Rafaela",
                "population": 100000,
                "type": "best_practice",
                "urls": {
                    "main": "https://www.rafaela.gob.ar/",
                    "transparency": "https://www.rafaela.gob.ar/transparencia/",
                    "github": "https://rafaela-gob-ar.github.io/"
                }
            }
        }
    
    def _setup_transparency_metrics(self):
        """Define transparency evaluation metrics"""
        return {
            "document_availability": {
                "weight": 25,
                "criteria": {
                    "budget_documents": ["presupuesto", "balance", "ejecucion"],
                    "contracts": ["contrato", "licitacion", "adjudicacion"],
                    "salaries": ["sueldo", "salario", "remuneracion"],
                    "declarations": ["declaracion jurada", "patrimonial"],
                    "ordinances": ["ordenanza", "decreto", "resolucion"]
                }
            },
            "data_format_quality": {
                "weight": 20,
                "criteria": {
                    "machine_readable": [".csv", ".xlsx", ".json", ".xml"],
                    "structured_data": ["tabla", "base de datos", "api"],
                    "searchable": ["buscador", "filtro", "consulta"]
                }
            },
            "timeliness": {
                "weight": 20, 
                "criteria": {
                    "current_year": datetime.now().year,
                    "previous_year": datetime.now().year - 1,
                    "quarterly_reports": "trimestral",
                    "monthly_updates": "mensual"
                }
            },
            "accessibility": {
                "weight": 15,
                "criteria": {
                    "navigation_ease": ["menu", "indice", "navegacion"],
                    "mobile_friendly": ["responsive", "movil"],
                    "search_functionality": ["buscar", "filtrar"]
                }
            },
            "completeness": {
                "weight": 20,
                "criteria": {
                    "multi_year_data": "historico",
                    "detailed_breakdown": "detallado",
                    "explanatory_notes": ["nota", "aclaracion", "metodologia"]
                }
            }
        }
    
    def analyze_municipality_transparency(self, municipality_key: str) -> Dict[str, Any]:
        """Analyze transparency metrics for a single municipality"""
        municipality = self.municipalities[municipality_key]
        self.logger.info(f"🔍 Analyzing {municipality['name']}...")
        
        analysis = {
            "municipality": municipality['name'],
            "timestamp": datetime.now().isoformat(),
            "urls_checked": [],
            "metrics": {},
            "documents_found": [],
            "errors": []
        }
        
        # Check each URL for the municipality
        for url_type, url in municipality['urls'].items():
            try:
                self.logger.info(f"  📊 Checking {url_type}: {url}")
                response = self.session.get(url, timeout=30, allow_redirects=True)
                analysis["urls_checked"].append({
                    "type": url_type,
                    "url": url,
                    "status": response.status_code,
                    "final_url": response.url
                })
                
                if response.status_code == 200:
                    # Analyze page content
                    content_analysis = self._analyze_page_content(url, response.text)
                    analysis["metrics"][url_type] = content_analysis
                    analysis["documents_found"].extend(content_analysis.get("documents", []))
                else:
                    analysis["errors"].append(f"{url_type}: HTTP {response.status_code}")
                
                time.sleep(1.0)  # Rate limiting
                
            except Exception as e:
                error_msg = f"{url_type} ({url}): {str(e)}"
                analysis["errors"].append(error_msg)
                self.logger.error(f"    ❌ {error_msg}")
        
        # Calculate overall transparency score
        analysis["transparency_score"] = self._calculate_transparency_score(analysis)
        
        return analysis
    
    def _analyze_page_content(self, url: str, html_content: str) -> Dict[str, Any]:
        """Analyze HTML content for transparency indicators"""
        soup = BeautifulSoup(html_content, 'html.parser')
        
        analysis = {
            "document_links": 0,
            "pdf_documents": 0,
            "excel_documents": 0,
            "structured_data": 0,
            "financial_keywords": 0,
            "documents": [],
            "transparency_indicators": []
        }
        
        # Find all links
        for link in soup.find_all('a', href=True):
            href = link['href']
            link_text = link.get_text().strip().lower()
            
            # Check for document links
            if any(ext in href.lower() for ext in ['.pdf', '.xlsx', '.xls', '.csv', '.docx']):
                analysis["document_links"] += 1
                
                if '.pdf' in href.lower():
                    analysis["pdf_documents"] += 1
                if any(ext in href.lower() for ext in ['.xlsx', '.xls', '.csv']):
                    analysis["excel_documents"] += 1
                    analysis["structured_data"] += 1
                
                # Check for financial keywords
                financial_keywords = [
                    'presupuesto', 'balance', 'ejecucion', 'contrato', 
                    'licitacion', 'sueldo', 'salario', 'declaracion', 'ordenanza'
                ]
                
                for keyword in financial_keywords:
                    if keyword in link_text or keyword in href.lower():
                        analysis["financial_keywords"] += 1
                        analysis["documents"].append({
                            "url": urljoin(url, href),
                            "text": link_text,
                            "keyword": keyword,
                            "type": self._classify_document_type(href, link_text)
                        })
                        break
        
        # Check for transparency portal indicators
        transparency_indicators = [
            'transparencia', 'datos abiertos', 'open data', 'accountability',
            'presupuesto participativo', 'consulta ciudadana', 'acceso a la informacion'
        ]
        
        page_text = soup.get_text().lower()
        for indicator in transparency_indicators:
            if indicator in page_text:
                analysis["transparency_indicators"].append(indicator)
        
        # Check for structured data formats
        if soup.find('table'):
            analysis["structured_data"] += len(soup.find_all('table'))
        
        return analysis
    
    def _classify_document_type(self, href: str, link_text: str) -> str:
        """Classify document type based on URL and text"""
        combined_text = f"{href} {link_text}".lower()
        
        if any(word in combined_text for word in ['presupuesto', 'budget']):
            return 'budget'
        elif any(word in combined_text for word in ['contrato', 'licitacion', 'contract']):
            return 'contract'
        elif any(word in combined_text for word in ['sueldo', 'salario', 'salary']):
            return 'salary'
        elif any(word in combined_text for word in ['balance', 'financiero', 'financial']):
            return 'financial'
        elif any(word in combined_text for word in ['ordenanza', 'decreto', 'ordinance']):
            return 'legal'
        else:
            return 'other'
    
    def _calculate_transparency_score(self, analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate overall transparency score"""
        score = 0
        max_score = 100
        
        # Document availability score (25 points)
        doc_score = 0
        total_docs = sum(metric.get("document_links", 0) for metric in analysis["metrics"].values())
        financial_docs = sum(metric.get("financial_keywords", 0) for metric in analysis["metrics"].values())
        
        if total_docs > 0:
            doc_score = min(25, (financial_docs / max(1, total_docs)) * 25 + (total_docs / 20) * 5)
        
        # Data format quality (20 points)
        format_score = 0
        structured_docs = sum(metric.get("structured_data", 0) for metric in analysis["metrics"].values())
        excel_docs = sum(metric.get("excel_documents", 0) for metric in analysis["metrics"].values())
        
        if structured_docs > 0 or excel_docs > 0:
            format_score = min(20, (structured_docs * 5) + (excel_docs * 3))
        
        # Accessibility score (15 points)
        access_score = 0
        transparency_indicators = []
        for metric in analysis["metrics"].values():
            transparency_indicators.extend(metric.get("transparency_indicators", []))
        
        access_score = min(15, len(set(transparency_indicators)) * 3)
        
        # Completeness and timeliness (40 points combined)
        # This is simplified - full implementation would check document dates
        completeness_score = min(40, len(analysis.get("documents_found", [])) * 2)
        
        total_score = doc_score + format_score + access_score + completeness_score
        
        return {
            "total_score": round(total_score, 1),
            "max_score": max_score,
            "percentage": round((total_score / max_score) * 100, 1),
            "breakdown": {
                "document_availability": round(doc_score, 1),
                "data_format_quality": round(format_score, 1),
                "accessibility": round(access_score, 1),
                "completeness_timeliness": round(completeness_score, 1)
            }
        }
    
    def run_comparative_analysis(self) -> Dict[str, Any]:
        """Run complete comparative analysis"""
        self.logger.info("\n🏛️ COMPARATIVE TRANSPARENCY ANALYSIS")
        self.logger.info("=" * 50)
        
        results = {
            "timestamp": datetime.now().isoformat(),
            "target_municipality": "Carmen de Areco",
            "analyses": {},
            "comparative_summary": {}
        }
        
        # Analyze each municipality
        for municipality_key, municipality_data in self.municipalities.items():
            try:
                analysis = self.analyze_municipality_transparency(municipality_key)
                results["analyses"][municipality_key] = analysis
                
                score = analysis.get("transparency_score", {}).get("percentage", 0)
                self.logger.info(f"  ✅ {municipality_data['name']}: {score}% transparency score")
                
            except Exception as e:
                self.logger.error(f"  ❌ {municipality_data['name']}: {str(e)}")
                results["analyses"][municipality_key] = {
                    "error": str(e),
                    "municipality": municipality_data['name']
                }
        
        # Generate comparative summary
        results["comparative_summary"] = self._generate_comparative_summary(results["analyses"])
        
        # Save results
        output_file = self.data_dir / f"comparative_analysis_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        
        self.logger.info(f"\n💾 Results saved to: {output_file}")
        
        return results
    
    def _generate_comparative_summary(self, analyses: Dict[str, Any]) -> Dict[str, Any]:
        """Generate comparative summary statistics"""
        summary = {
            "rankings": [],
            "category_averages": {},
            "carmen_de_areco_position": {},
            "recommendations": []
        }
        
        # Extract scores for ranking
        scores = []
        for key, analysis in analyses.items():
            if "error" not in analysis and "transparency_score" in analysis:
                municipality = self.municipalities[key]
                scores.append({
                    "key": key,
                    "name": municipality["name"],
                    "type": municipality["type"],
                    "population": municipality["population"],
                    "score": analysis["transparency_score"]["percentage"],
                    "breakdown": analysis["transparency_score"]["breakdown"]
                })
        
        # Sort by score
        scores.sort(key=lambda x: x["score"], reverse=True)
        summary["rankings"] = scores
        
        # Calculate averages by type
        by_type = {}
        for score in scores:
            score_type = score["type"]
            if score_type not in by_type:
                by_type[score_type] = []
            by_type[score_type].append(score["score"])
        
        for score_type, type_scores in by_type.items():
            summary["category_averages"][score_type] = {
                "average": round(np.mean(type_scores), 1),
                "count": len(type_scores),
                "range": [round(min(type_scores), 1), round(max(type_scores), 1)]
            }
        
        # Find Carmen de Areco's position
        carmen_score = next((s for s in scores if s["key"] == "carmen_de_areco"), None)
        if carmen_score:
            position = scores.index(carmen_score) + 1
            summary["carmen_de_areco_position"] = {
                "rank": position,
                "total_municipalities": len(scores),
                "score": carmen_score["score"],
                "percentile": round((len(scores) - position + 1) / len(scores) * 100, 1)
            }
            
            # Generate recommendations
            peer_avg = summary.get("category_averages", {}).get("peer", {}).get("average", 0)
            best_practice_avg = summary.get("category_averages", {}).get("best_practice", {}).get("average", 0)
            
            if carmen_score["score"] < peer_avg:
                summary["recommendations"].append("Below peer municipality average - focus on basic transparency requirements")
            if carmen_score["score"] < best_practice_avg * 0.7:
                summary["recommendations"].append("Significant gap with best practices - comprehensive transparency program needed")
            
            # Specific recommendations based on breakdown
            breakdown = carmen_score["breakdown"]
            if breakdown["document_availability"] < 15:
                summary["recommendations"].append("Improve document publication - missing key financial documents")
            if breakdown["data_format_quality"] < 10:
                summary["recommendations"].append("Publish data in machine-readable formats (CSV, Excel)")
            if breakdown["accessibility"] < 8:
                summary["recommendations"].append("Enhance website navigation and search functionality")
        
        return summary
    
    def generate_comparison_report(self, results: Dict[str, Any]) -> str:
        """Generate human-readable comparison report"""
        report = f"""
# COMPARATIVE TRANSPARENCY ANALYSIS REPORT
## Carmen de Areco vs Peer Municipalities

**Analysis Date:** {datetime.now().strftime('%Y-%m-%d %H:%M')}

## EXECUTIVE SUMMARY

"""
        
        summary = results.get("comparative_summary", {})
        carmen_pos = summary.get("carmen_de_areco_position", {})
        
        if carmen_pos:
            report += f"""
Carmen de Areco ranks **#{carmen_pos['rank']} out of {carmen_pos['total_municipalities']}** municipalities analyzed.
- **Transparency Score:** {carmen_pos['score']}%
- **Percentile:** {carmen_pos['percentile']}th percentile

"""
        
        # Rankings table
        report += "## MUNICIPALITY RANKINGS\n\n"
        report += "| Rank | Municipality | Type | Population | Score |\n"
        report += "|------|-------------|------|------------|-------|\n"
        
        for i, ranking in enumerate(summary.get("rankings", [])[:10], 1):
            report += f"| {i} | {ranking['name']} | {ranking['type']} | {ranking['population']:,} | {ranking['score']}% |\n"
        
        # Category averages
        report += "\n## CATEGORY AVERAGES\n\n"
        for category, data in summary.get("category_averages", {}).items():
            report += f"- **{category.title()}:** {data['average']}% (n={data['count']})\n"
        
        # Recommendations
        recommendations = summary.get("recommendations", [])
        if recommendations:
            report += "\n## RECOMMENDATIONS FOR CARMEN DE ARECO\n\n"
            for i, rec in enumerate(recommendations, 1):
                report += f"{i}. {rec}\n"
        
        return report

if __name__ == "__main__":
    analyzer = ComparativeAnalysisSystem()
    results = analyzer.run_comparative_analysis()
    
    # Generate and save report
    report = analyzer.generate_comparison_report(results)
    report_file = analyzer.data_dir / f"transparency_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.md"
    
    with open(report_file, 'w', encoding='utf-8') as f:
        f.write(report)
    
    print(f"\n📊 Comparative analysis completed!")
    print(f"📄 Report saved to: {report_file}")
    print(f"📋 Data saved to: data/comparative_analysis/")