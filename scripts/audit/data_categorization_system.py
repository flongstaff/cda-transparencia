#!/usr/bin/env python3
"""
Comprehensive Data Categorization System for Carmen de Areco
Organizes all 150+ documents into meaningful categories for citizen access
"""

import json
import sqlite3
import re
import logging
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional
from collections import defaultdict

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class DataCategorizationSystem:
    """System to categorize and organize municipal documents"""
    
    def __init__(self, data_dir="data"):
        self.data_dir = Path(data_dir)
        self.output_dir = self.data_dir / "categorized_data"
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Database paths
        self.discovery_db = self.data_dir / "enhanced_discovery" / "discovered_documents.db"
        self.powerbi_db = self.data_dir / "powerbi_extraction" / "powerbi_data.db"
        
        # Comprehensive categorization rules
        self.categorization_rules = {
            'budget_and_financial': {
                'keywords': [
                    'presupuesto', 'budget', 'ejecucion', 'execution', 'balance', 
                    'financier', 'gasto', 'expense', 'ingreso', 'income', 'revenue',
                    'tesoreria', 'treasury', 'contabilidad', 'accounting'
                ],
                'subcategories': {
                    'budget_planning': ['presupuesto', 'budget', 'planificacion'],
                    'budget_execution': ['ejecucion', 'execution', 'gastos', 'expenses'],
                    'financial_statements': ['balance', 'estado financiero', 'financial statement'],
                    'revenue': ['ingreso', 'revenue', 'income', 'recursos'],
                    'treasury': ['tesoreria', 'treasury', 'movimiento', 'movement']
                }
            },
            'salaries_and_personnel': {
                'keywords': [
                    'sueldo', 'salary', 'salario', 'remuneracion', 'remuneration',
                    'personal', 'staff', 'empleado', 'employee', 'escala', 'scale',
                    'ddjj', 'declaracion', 'declaration', 'patrimonio', 'assets'
                ],
                'subcategories': {
                    'salary_scales': ['escala', 'scale', 'sueldo', 'salary'],
                    'payroll': ['nomina', 'payroll', 'liquidacion', 'settlement'],
                    'declarations': ['ddjj', 'declaracion', 'declaration', 'patrimonio'],
                    'personnel_structure': ['personal', 'staff', 'organigrama', 'organigram']
                }
            },
            'contracts_and_procurement': {
                'keywords': [
                    'licitacion', 'tender', 'bidding', 'contrato', 'contract',
                    'adjudicacion', 'award', 'compra', 'purchase', 'proveedor',
                    'supplier', 'convenio', 'agreement'
                ],
                'subcategories': {
                    'public_tenders': ['licitacion', 'tender', 'bidding'],
                    'contract_awards': ['adjudicacion', 'award', 'contrato'],
                    'procurement_policies': ['compra', 'purchase', 'adquisicion'],
                    'supplier_database': ['proveedor', 'supplier', 'contratista']
                }
            },
            'infrastructure_and_public_works': {
                'keywords': [
                    'obra', 'work', 'construccion', 'construction', 'pavimentacion',
                    'pavement', 'infraestructura', 'infrastructure', 'proyecto',
                    'project', 'mantenimiento', 'maintenance'
                ],
                'subcategories': {
                    'construction_projects': ['obra', 'construccion', 'proyecto'],
                    'maintenance_works': ['mantenimiento', 'reparacion', 'repair'],
                    'infrastructure_planning': ['planificacion', 'planning', 'desarrollo'],
                    'public_spaces': ['parque', 'plaza', 'avenida', 'street']
                }
            },
            'municipal_governance': {
                'keywords': [
                    'ordenanza', 'ordinance', 'decreto', 'decree', 'resolucion',
                    'resolution', 'sesion', 'session', 'concejo', 'council',
                    'intendente', 'mayor', 'gobierno', 'government'
                ],
                'subcategories': {
                    'ordinances': ['ordenanza', 'ordinance'],
                    'decrees': ['decreto', 'decree'],
                    'council_resolutions': ['resolucion', 'resolution', 'sesion'],
                    'executive_decisions': ['intendente', 'mayor', 'gobierno']
                }
            },
            'transparency_and_reports': {
                'keywords': [
                    'transparencia', 'transparency', 'informe', 'report', 'rendicion',
                    'accountability', 'auditoria', 'audit', 'indicador', 'indicator'
                ],
                'subcategories': {
                    'transparency_reports': ['informe', 'report', 'transparencia'],
                    'performance_indicators': ['indicador', 'indicator', 'kpi'],
                    'audit_reports': ['auditoria', 'audit', 'revision'],
                    'annual_reports': ['anual', 'annual', 'rendicion']
                }
            },
            'general_administration': {
                'keywords': [
                    'administrativo', 'administrative', 'procedimiento', 'procedure',
                    'formulario', 'form', 'trámite', 'process', 'documentacion', 'documentation'
                ],
                'subcategories': {
                    'administrative_procedures': ['procedimiento', 'process', 'trámite'],
                    'forms_and_templates': ['formulario', 'form', 'plantilla'],
                    'organizational_documents': ['organizacion', 'structure', 'organigrama']
                }
            }
        }
        
        # Year extraction patterns
        self.year_patterns = [
            r'\b(20\d{2})\b',  # 2000-2099
            r'\b(19\d{2})\b',  # 1900-1999
            r'(?:^|[-_ ])(\d{2})[-_ ](?:\d{2}|\d{4})(?:$|[-_ ])',  # DD-MM-YY or YY-MM-DD
        ]
    
    def load_all_documents(self) -> List[Dict]:
        """Load all discovered documents from databases"""
        logger.info("📂 Loading all discovered documents")
        
        all_documents = []
        
        # Load from discovery database
        if self.discovery_db.exists():
            try:
                conn = sqlite3.connect(self.discovery_db)
                cursor = conn.cursor()
                
                cursor.execute('''
                    SELECT url, filename, file_size, file_type, category, discovered_date
                    FROM discovered_documents
                    ORDER BY discovered_date DESC
                ''')
                
                rows = cursor.fetchall()
                for row in rows:
                    doc = {
                        'url': row[0],
                        'filename': row[1],
                        'file_size': row[2],
                        'file_type': row[3],
                        'initial_category': row[4],
                        'discovered_date': row[5],
                        'source': 'discovery'
                    }
                    all_documents.append(doc)
                
                conn.close()
                logger.info(f"Loaded {len(rows)} documents from discovery database")
                
            except Exception as e:
                logger.error(f"Error loading from discovery database: {e}")
        
        # Load from PowerBI database
        if self.powerbi_db.exists():
            try:
                conn = sqlite3.connect(self.powerbi_db)
                cursor = conn.cursor()
                
                # Load datasets
                cursor.execute('SELECT dataset_name, dataset_id, extracted_date FROM powerbi_datasets')
                datasets = cursor.fetchall()
                
                for dataset in datasets:
                    doc = {
                        'url': f"powerbi://dataset/{dataset[1]}",
                        'filename': dataset[0],
                        'file_size': 0,
                        'file_type': 'dataset',
                        'initial_category': 'powerbi_data',
                        'discovered_date': dataset[2],
                        'source': 'powerbi'
                    }
                    all_documents.append(doc)
                
                # Load tables
                cursor.execute('''
                    SELECT t.table_name, d.dataset_name, t.column_count, t.row_count, t.id
                    FROM powerbi_tables t
                    JOIN powerbi_datasets d ON t.dataset_id = d.id
                ''')
                tables = cursor.fetchall()
                
                for table in tables:
                    doc = {
                        'url': f"powerbi://table/{table[4]}",
                        'filename': f"{table[1]} - {table[0]}",
                        'file_size': table[2] * table[3] * 100,  # Estimate
                        'file_type': 'table',
                        'initial_category': 'powerbi_data',
                        'discovered_date': datetime.now().isoformat(),
                        'source': 'powerbi'
                    }
                    all_documents.append(doc)
                
                conn.close()
                logger.info(f"Loaded {len(datasets) + len(tables)} items from PowerBI database")
                
            except Exception as e:
                logger.error(f"Error loading from PowerBI database: {e}")
        
        logger.info(f"Total documents loaded: {len(all_documents)}")
        return all_documents
    
    def categorize_documents(self, documents: List[Dict]) -> Dict:
        """Categorize documents using comprehensive rules"""
        logger.info("🏷️ Categorizing documents")
        
        categorized = {
            'by_category': defaultdict(list),
            'by_year': defaultdict(list),
            'by_file_type': defaultdict(list),
            'uncategorized': [],
            'statistics': {}
        }
        
        for doc in documents:
            # Extract year
            year = self._extract_year(doc['filename'])
            if year:
                doc['year'] = year
                categorized['by_year'][year].append(doc)
            else:
                doc['year'] = 'unknown'
                categorized['by_year']['unknown'].append(doc)
            
            # Categorize by file type
            file_type = doc.get('file_type', 'unknown').lower()
            categorized['by_file_type'][file_type].append(doc)
            
            # Apply categorization rules
            category = self._apply_categorization_rules(doc['filename'])
            if category:
                doc['category'] = category
                categorized['by_category'][category].append(doc)
            else:
                doc['category'] = 'uncategorized'
                categorized['uncategorized'].append(doc)
        
        # Calculate statistics
        categorized['statistics'] = {
            'total_documents': len(documents),
            'categorized_documents': len(documents) - len(categorized['uncategorized']),
            'uncategorized_documents': len(categorized['uncategorized']),
            'categories': {cat: len(docs) for cat, docs in categorized['by_category'].items()},
            'years': {year: len(docs) for year, docs in categorized['by_year'].items()},
            'file_types': {ftype: len(docs) for ftype, docs in categorized['by_file_type'].items()}
        }
        
        logger.info(f"Categorized {len(documents)} documents into {len(categorized['by_category'])} categories")
        return categorized
    
    def _extract_year(self, filename: str) -> Optional[int]:
        """Extract year from filename"""
        filename_lower = filename.lower()
        
        for pattern in self.year_patterns:
            matches = re.findall(pattern, filename_lower)
            for match in matches:
                try:
                    year = int(match)
                    # Validate reasonable year range
                    if 1990 <= year <= datetime.now().year + 1:
                        return year
                except:
                    continue
        
        return None
    
    def _apply_categorization_rules(self, filename: str) -> Optional[str]:
        """Apply categorization rules to determine document category"""
        filename_lower = filename.lower()
        
        # Check each main category
        for category, rules in self.categorization_rules.items():
            # Check main keywords
            for keyword in rules['keywords']:
                if keyword in filename_lower:
                    return category
        
        return None
    
    def generate_category_hierarchy(self, categorized_data: Dict) -> Dict:
        """Generate hierarchical category structure"""
        logger.info("🏗️ Generating category hierarchy")
        
        hierarchy = {}
        
        for main_category, docs in categorized_data['by_category'].items():
            if main_category in self.categorization_rules:
                # Add main category
                hierarchy[main_category] = {
                    'name': self._format_category_name(main_category),
                    'count': len(docs),
                    'subcategories': {}
                }
                
                # Add subcategories
                subcat_rules = self.categorization_rules[main_category]['subcategories']
                for subcat_key, subcat_keywords in subcat_rules.items():
                    matching_docs = []
                    for doc in docs:
                        doc_name = doc['filename'].lower()
                        if any(keyword in doc_name for keyword in subcat_keywords):
                            matching_docs.append(doc)
                    
                    if matching_docs:
                        hierarchy[main_category]['subcategories'][subcat_key] = {
                            'name': self._format_subcategory_name(subcat_key),
                            'count': len(matching_docs),
                            'sample_documents': matching_docs[:5]  # Sample documents
                        }
            else:
                # For categories without specific rules
                hierarchy[main_category] = {
                    'name': self._format_category_name(main_category),
                    'count': len(docs),
                    'subcategories': {}
                }
        
        return hierarchy
    
    def _format_category_name(self, category_key: str) -> str:
        """Format category name for display"""
        name_map = {
            'budget_and_financial': 'Presupuesto y Finanzas',
            'salaries_and_personnel': 'Sueldos y Personal',
            'contracts_and_procurement': 'Contratos y Compras',
            'infrastructure_and_public_works': 'Infraestructura y Obras Públicas',
            'municipal_governance': 'Gobierno Municipal',
            'transparency_and_reports': 'Transparencia e Informes',
            'general_administration': 'Administración General',
            'powerbi_data': 'Datos de PowerBI',
            'uncategorized': 'Sin Categorizar'
        }
        
        return name_map.get(category_key, category_key.replace('_', ' ').title())
    
    def _format_subcategory_name(self, subcategory_key: str) -> str:
        """Format subcategory name for display"""
        name_map = {
            'budget_planning': 'Planificación Presupuestaria',
            'budget_execution': 'Ejecución Presupuestaria',
            'financial_statements': 'Estados Financieros',
            'revenue': 'Ingresos',
            'treasury': 'Tesorería',
            'salary_scales': 'Escalas Salariales',
            'payroll': 'Nómina de Sueldos',
            'declarations': 'Declaraciones Juradas',
            'personnel_structure': 'Estructura de Personal',
            'public_tenders': 'Licitaciones Públicas',
            'contract_awards': 'Adjudicaciones',
            'procurement_policies': 'Políticas de Compras',
            'supplier_database': 'Base de Proveedores',
            'construction_projects': 'Proyectos de Construcción',
            'maintenance_works': 'Trabajos de Mantenimiento',
            'infrastructure_planning': 'Planificación de Infraestructura',
            'public_spaces': 'Espacios Públicos',
            'ordinances': 'Ordenanzas',
            'decrees': 'Decretos',
            'council_resolutions': 'Resoluciones del Concejo',
            'executive_decisions': 'Decisiones Ejecutivas',
            'transparency_reports': 'Informes de Transparencia',
            'performance_indicators': 'Indicadores de Desempeño',
            'audit_reports': 'Informes de Auditoría',
            'annual_reports': 'Informes Anuales',
            'administrative_procedures': 'Procedimientos Administrativos',
            'forms_and_templates': 'Formularios y Plantillas',
            'organizational_documents': 'Documentos Organizacionales'
        }
        
        return name_map.get(subcategory_key, subcategory_key.replace('_', ' ').title())
    
    def generate_yearly_analysis(self, categorized_data: Dict) -> Dict:
        """Generate yearly analysis of document availability"""
        logger.info("📅 Generating yearly analysis")
        
        yearly_analysis = {}
        
        for year, docs in categorized_data['by_year'].items():
            if year == 'unknown':
                continue
                
            # Count by category
            category_counts = defaultdict(int)
            for doc in docs:
                category = doc.get('category', 'uncategorized')
                category_counts[category] += 1
            
            # Count by file type
            filetype_counts = defaultdict(int)
            for doc in docs:
                filetype = doc.get('file_type', 'unknown')
                filetype_counts[filetype] += 1
            
            yearly_analysis[year] = {
                'total_documents': len(docs),
                'by_category': dict(category_counts),
                'by_file_type': dict(filetype_counts),
                'data_completeness': self._calculate_completeness(docs)
            }
        
        return yearly_analysis
    
    def _calculate_completeness(self, documents: List[Dict]) -> Dict:
        """Calculate data completeness metrics"""
        if not documents:
            return {'score': 0, 'missing_categories': []}
        
        # Count documents by category
        category_counts = defaultdict(int)
        for doc in documents:
            category = doc.get('category', 'uncategorized')
            category_counts[category] += 1
        
        # Expected categories (based on typical municipal transparency)
        expected_categories = [
            'budget_and_financial',
            'salaries_and_personnel', 
            'contracts_and_procurement',
            'infrastructure_and_public_works',
            'municipal_governance'
        ]
        
        # Calculate completeness score
        available_categories = set(category_counts.keys()) - {'uncategorized'}
        expected_set = set(expected_categories)
        intersection = available_categories.intersection(expected_set)
        
        score = (len(intersection) / len(expected_set)) * 100 if expected_set else 0
        
        missing_categories = list(expected_set - available_categories)
        
        return {
            'score': round(score, 2),
            'missing_categories': missing_categories,
            'available_categories': list(available_categories)
        }
    
    def export_for_frontend(self, categorized_data: Dict, hierarchy: Dict, yearly_analysis: Dict) -> str:
        """Export categorized data for frontend visualization"""
        logger.info("💾 Exporting data for frontend")
        
        export_data = {
            'timestamp': datetime.now().isoformat(),
            'statistics': categorized_data['statistics'],
            'category_hierarchy': hierarchy,
            'yearly_analysis': yearly_analysis,
            'sample_documents': {
                'recent': categorized_data['by_year'].get(str(datetime.now().year), [])[:20],
                'by_category': {cat: docs[:10] for cat, docs in categorized_data['by_category'].items()}
            }
        }
        
        export_file = self.output_dir / f"categorized_data_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(export_file, 'w', encoding='utf-8') as f:
            json.dump(export_data, f, ensure_ascii=False, indent=2, default=str)
        
        logger.info(f"Data exported for frontend: {export_file}")
        return str(export_file)
    
    def generate_categorization_report(self, categorized_data: Dict, hierarchy: Dict, yearly_analysis: Dict) -> Dict:
        """Generate comprehensive categorization report"""
        report = {
            'report_date': datetime.now().isoformat(),
            'summary': {
                'total_documents': categorized_data['statistics']['total_documents'],
                'categorized_documents': categorized_data['statistics']['categorized_documents'],
                'uncategorized_documents': categorized_data['statistics']['uncategorized_documents'],
                'categories_count': len(categorized_data['by_category']),
                'years_covered': len([y for y in categorized_data['by_year'].keys() if y != 'unknown'])
            },
            'category_breakdown': categorized_data['statistics']['categories'],
            'yearly_breakdown': {year: data['total_documents'] for year, data in yearly_analysis.items()},
            'top_categories': sorted(
                categorized_data['statistics']['categories'].items(), 
                key=lambda x: x[1], 
                reverse=True
            )[:10],
            'data_completeness': {
                year: data['data_completeness'] 
                for year, data in yearly_analysis.items() 
                if year != 'unknown'
            }
        }
        
        # Save report
        report_file = self.output_dir / f"categorization_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(report, f, ensure_ascii=False, indent=2, default=str)
        
        logger.info(f"Categorization report generated: {report_file}")
        return report
    
    def print_summary(self, categorized_data: Dict, hierarchy: Dict, report: Dict):
        """Print categorization summary"""
        print("\n" + "="*80)
        print("COMPREHENSIVE DATA CATEGORIZATION SUMMARY")
        print("="*80)
        print(f"Total Documents: {report['summary']['total_documents']}")
        print(f"Categorized Documents: {report['summary']['categorized_documents']}")
        print(f"Uncategorized Documents: {report['summary']['uncategorized_documents']}")
        print(f"Categories: {report['summary']['categories_count']}")
        print(f"Years Covered: {report['summary']['years_covered']}")
        
        print("\nTop Categories:")
        for category, count in report['top_categories']:
            display_name = self._format_category_name(category)
            print(f"  {display_name}: {count}")
        
        print("\nYearly Document Distribution:")
        yearly_sorted = sorted(
            [(year, count) for year, count in report['yearly_breakdown'].items() if year != 'unknown'],
            key=lambda x: x[0]
        )
        for year, count in yearly_sorted[-10:]:  # Last 10 years
            completeness = report['data_completeness'].get(year, {'score': 0})['score']
            print(f"  {year}: {count} documents (Completeness: {completeness}%)")
        
        print("\nCategory Hierarchy:")
        for main_cat, main_data in list(hierarchy.items())[:5]:  # First 5 categories
            display_name = main_data['name']
            count = main_data['count']
            print(f"  {display_name} ({count} documents)")
            for subcat_key, subcat_data in list(main_data['subcategories'].items())[:3]:  # First 3 subcategories
                sub_display = subcat_data['name']
                sub_count = subcat_data['count']
                print(f"    ├── {sub_display}: {sub_count}")
        
        print("="*80)
    
    def run_complete_categorization(self):
        """Run complete data categorization process"""
        logger.info("🏛️ Starting Comprehensive Data Categorization for Carmen de Areco")
        
        # 1. Load all documents
        documents = self.load_all_documents()
        
        if not documents:
            logger.warning("No documents found to categorize")
            return None
        
        # 2. Categorize documents
        categorized_data = self.categorize_documents(documents)
        
        # 3. Generate category hierarchy
        hierarchy = self.generate_category_hierarchy(categorized_data)
        
        # 4. Generate yearly analysis
        yearly_analysis = self.generate_yearly_analysis(categorized_data)
        
        # 5. Generate report
        report = self.generate_categorization_report(categorized_data, hierarchy, yearly_analysis)
        
        # 6. Export for frontend
        export_file = self.export_for_frontend(categorized_data, hierarchy, yearly_analysis)
        
        # 7. Print summary
        self.print_summary(categorized_data, hierarchy, report)
        
        return {
            'categorized_data': categorized_data,
            'hierarchy': hierarchy,
            'yearly_analysis': yearly_analysis,
            'report': report,
            'export_file': export_file
        }

if __name__ == "__main__":
    # Initialize categorization system
    categorizer = DataCategorizationSystem()
    
    # Run complete categorization
    try:
        results = categorizer.run_complete_categorization()
        if results:
            print(f"\n📊 Categorization data exported to: {results['export_file']}")
            print("✅ Comprehensive data categorization completed successfully")
            exit(0)
        else:
            print("❌ No documents to categorize")
            exit(1)
    except Exception as e:
        logger.error(f"❌ Data categorization failed: {e}")
        exit(1)