#!/usr/bin/env python3
"""
Citizen Transparency Dashboard Generator
Creates a public dashboard showing all detected irregularities and document comparisons
"""

import json
import sqlite3
import pandas as pd
from pathlib import Path
from datetime import datetime
from typing import Dict, List
import logging

class CitizenDashboardGenerator:
    """Generates public dashboard for citizen transparency"""
    
    def __init__(self, data_dir="data/dashboard"):
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(parents=True, exist_ok=True)
        
        # Setup logging
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
        
        # Database paths
        self.audit_db = Path("data/master_audit/master_audit.db")
        self.irregularities_db = Path("data/audit_irregularities/irregularities.db")
        self.anomalies_db = Path("data/document_analysis/document_anomalies.db")
        
    def get_recent_irregularities(self, days: int = 30) -> List[Dict]:
        """Get recent financial irregularities"""
        if not self.irregularities_db.exists():
            return []
        
        conn = sqlite3.connect(self.irregularities_db)
        cursor = conn.cursor()
        
        since_date = datetime.now().strftime('%Y-%m-%d')
        results = []
        
        # Get salary irregularities
        try:
            cursor.execute('''
                SELECT official_name, role, declared_salary, estimated_fair_salary, 
                       discrepancy_ratio, year, detection_date, evidence
                FROM salary_irregularities 
                WHERE detection_date >= datetime('now', '-{} days')
                ORDER BY discrepancy_ratio DESC
            '''.format(days))
            
            for row in cursor.fetchall():
                results.append({
                    'type': 'salary_irregularity',
                    'title': f'Alto salario: {row[0]}',
                    'description': f'{row[0]} ({row[1]}) con salario {row[3]:.0f}x el promedio',
                    'severity': 'high' if row[4] > 10 else 'medium',
                    'evidence': row[7],
                    'date': row[6],
                    'details': {
                        'official_name': row[0],
                        'role': row[1],
                        'declared_salary': row[2],
                        'fair_salary': row[3],
                        'discrepancy_ratio': row[4],
                        'year': row[5]
                    }
                })
        except Exception as e:
            self.logger.warning(f"Could not fetch salary irregularities: {e}")
        
        # Get project irregularities
        try:
            cursor.execute('''
                SELECT project_name, budgeted_amount, actual_spent, delay_days, 
                       irregularity_type, detection_date, evidence
                FROM project_irregularities 
                WHERE detection_date >= datetime('now', '-{} days')
                ORDER BY delay_days DESC
            '''.format(days))
            
            for row in cursor.fetchall():
                results.append({
                    'type': 'project_irregularity',
                    'title': f'Proyecto demorado: {row[0]}',
                    'description': f'{row[0]} demorado por {row[3]} días',
                    'severity': 'high' if row[3] > 180 else 'medium',
                    'evidence': row[6],
                    'date': row[5],
                    'details': {
                        'project_name': row[0],
                        'budgeted_amount': row[1],
                        'actual_spent': row[2],
                        'delay_days': row[3],
                        'irregularity_type': row[4]
                    }
                })
        except Exception as e:
            self.logger.warning(f"Could not fetch project irregularities: {e}")
        
        # Get budget discrepancies
        try:
            cursor.execute('''
                SELECT category, budgeted_amount, actual_spent, difference, 
                       difference_percentage, year, detection_date, evidence
                FROM budget_discrepancies 
                WHERE detection_date >= datetime('now', '-{} days')
                ORDER BY difference_percentage DESC
            '''.format(days))
            
            for row in cursor.fetchall():
                results.append({
                    'type': 'budget_discrepancy',
                    'title': f'Discrepancia presupuestaria en {row[0]}',
                    'description': f'{row[6]}: diferencia de {row[4]:.1%} en {row[0]}',
                    'severity': 'high' if abs(row[4]) > 0.3 else 'medium',
                    'evidence': row[7],
                    'date': row[6],
                    'details': {
                        'category': row[0],
                        'budgeted_amount': row[1],
                        'actual_spent': row[2],
                        'difference': row[3],
                        'difference_percentage': row[4],
                        'year': row[5]
                    }
                })
        except Exception as e:
            self.logger.warning(f"Could not fetch budget discrepancies: {e}")
        
        conn.close()
        return results
    
    def get_document_anomalies(self, days: int = 30) -> List[Dict]:
        """Get document anomalies"""
        if not self.anomalies_db.exists():
            return []
        
        conn = sqlite3.connect(self.anomalies_db)
        cursor = conn.cursor()
        
        results = []
        
        # Get signature anomalies
        try:
            cursor.execute('''
                SELECT anomaly_type, document_id, description, severity, evidence, detected_date
                FROM signature_anomalies 
                WHERE detected_date >= datetime('now', '-{} days')
                ORDER BY detected_date DESC
            '''.format(days))
            
            for row in cursor.fetchall():
                results.append({
                    'type': 'document_anomaly',
                    'title': 'Anomalía en documento',
                    'description': row[2],
                    'severity': row[3],
                    'evidence': row[4],
                    'date': row[5],
                    'details': {
                        'anomaly_type': row[0],
                        'document_id': row[1]
                    }
                })
        except Exception as e:
            self.logger.warning(f"Could not fetch document anomalies: {e}")
        
        conn.close()
        return results
    
    def get_system_statistics(self) -> Dict:
        """Get system-wide statistics"""
        stats = {
            'total_irregularities': 0,
            'high_severity_count': 0,
            'medium_severity_count': 0,
            'documents_analyzed': 0,
            'last_updated': datetime.now().isoformat()
        }
        
        # Get irregularity counts
        if self.irregularities_db.exists():
            conn = sqlite3.connect(self.irregularities_db)
            cursor = conn.cursor()
            
            try:
                cursor.execute('SELECT COUNT(*) FROM salary_irregularities')
                stats['total_irregularities'] += cursor.fetchone()[0]
                
                cursor.execute('SELECT COUNT(*) FROM project_irregularities')
                stats['total_irregularities'] += cursor.fetchone()[0]
                
                cursor.execute('SELECT COUNT(*) FROM budget_discrepancies')
                stats['total_irregularities'] += cursor.fetchone()[0]
                
                # Severity counts for salary irregularities
                cursor.execute('''
                    SELECT COUNT(*) FROM salary_irregularities 
                    WHERE discrepancy_ratio > 10
                ''')
                stats['high_severity_count'] += cursor.fetchone()[0]
                
                cursor.execute('''
                    SELECT COUNT(*) FROM salary_irregularities 
                    WHERE discrepancy_ratio <= 10
                ''')
                stats['medium_severity_count'] += cursor.fetchone()[0]
                
                # Severity counts for project irregularities
                cursor.execute('''
                    SELECT COUNT(*) FROM project_irregularities 
                    WHERE delay_days > 180
                ''')
                stats['high_severity_count'] += cursor.fetchone()[0]
                
                cursor.execute('''
                    SELECT COUNT(*) FROM project_irregularities 
                    WHERE delay_days <= 180
                ''')
                stats['medium_severity_count'] += cursor.fetchone()[0]
            except Exception as e:
                self.logger.warning(f"Could not fetch irregularity statistics: {e}")
            
            conn.close()
        
        # Get document analysis stats
        if self.anomalies_db.exists():
            conn = sqlite3.connect(self.anomalies_db)
            cursor = conn.cursor()
            
            try:
                cursor.execute('SELECT COUNT(*) FROM document_metadata')
                stats['documents_analyzed'] = cursor.fetchone()[0]
            except Exception as e:
                self.logger.warning(f"Could not fetch document statistics: {e}")
            
            conn.close()
        
        return stats
    
    def generate_dashboard_data(self) -> Dict:
        """Generate complete dashboard data"""
        self.logger.info("Generating citizen transparency dashboard...")
        
        dashboard_data = {
            'generated_at': datetime.now().isoformat(),
            'municipality': 'Carmen de Areco',
            'statistics': self.get_system_statistics(),
            'recent_irregularities': self.get_recent_irregularities(),
            'document_anomalies': self.get_document_anomalies(),
            'system_status': 'operational'
        }
        
        # Save dashboard data
        dashboard_file = self.data_dir / "dashboard_data.json"
        with open(dashboard_file, 'w', encoding='utf-8') as f:
            json.dump(dashboard_data, f, ensure_ascii=False, indent=2)
        
        self.logger.info(f"Dashboard data generated with {len(dashboard_data['recent_irregularities'])} irregularities")
        return dashboard_data
    
    def generate_html_dashboard(self, dashboard_data: Dict = None) -> str:
        """Generate HTML dashboard for public viewing"""
        if dashboard_data is None:
            dashboard_data = self.generate_dashboard_data()
        
        html_content = f"""
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content content="width=device-width, initial-scale=1.0">
    <title>Portal de Transparencia - Carmen de Areco</title>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}
        
        body {{
            font-family: 'Roboto', sans-serif;
            background-color: #f5f7fa;
            color: #333;
            line-height: 1.6;
        }}
        
        .container {{
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }}
        
        header {{
            background: linear-gradient(135deg, #1a3a6c, #2c5282);
            color: white;
            padding: 2rem 0;
            text-align: center;
            border-radius: 8px;
            margin-bottom: 2rem;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }}
        
        h1 {{
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
        }}
        
        .subtitle {{
            font-size: 1.2rem;
            opacity: 0.9;
        }}
        
        .stats-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-bottom: 2rem;
        }}
        
        .stat-card {{
            background: white;
            border-radius: 8px;
            padding: 1.5rem;
            text-align: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            transition: transform 0.2s;
        }}
        
        .stat-card:hover {{
            transform: translateY(-5px);
        }}
        
        .stat-number {{
            font-size: 2.5rem;
            font-weight: 700;
            color: #1a3a6c;
            margin: 0.5rem 0;
        }}
        
        .stat-label {{
            font-size: 1rem;
            color: #666;
        }}
        
        .section {{
            background: white;
            border-radius: 8px;
            padding: 2rem;
            margin-bottom: 2rem;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }}
        
        .section-title {{
            font-size: 1.8rem;
            color: #1a3a6c;
            margin-bottom: 1.5rem;
            padding-bottom: 0.5rem;
            border-bottom: 2px solid #e2e8f0;
        }}
        
        .irregularity-list {{
            display: grid;
            gap: 1rem;
        }}
        
        .irregularity-card {{
            border-left: 4px solid #e53e3e;
            padding: 1.5rem;
            background: #fff5f5;
            border-radius: 0 8px 8px 0;
        }}
        
        .irregularity-card.high {{
            border-left-color: #e53e3e;
            background: #fff5f5;
        }}
        
        .irregularity-card.medium {{
            border-left-color: #d69e2e;
            background: #fffbeb;
        }}
        
        .irregularity-title {{
            font-size: 1.2rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
            color: #2d3748;
        }}
        
        .irregularity-description {{
            margin-bottom: 1rem;
            color: #4a5568;
        }}
        
        .irregularity-meta {{
            display: flex;
            justify-content: space-between;
            font-size: 0.9rem;
            color: #718096;
        }}
        
        .severity-badge {{
            display: inline-block;
            padding: 0.25rem 0.5rem;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
        }}
        
        .severity-high {{
            background-color: #fed7d7;
            color: #c53030;
        }}
        
        .severity-medium {{
            background-color: #fefcbf;
            color: #b7791f;
        }}
        
        footer {{
            text-align: center;
            padding: 2rem 0;
            color: #718096;
            font-size: 0.9rem;
        }}
        
        .timestamp {{
            text-align: right;
            font-size: 0.9rem;
            color: #718096;
            margin-top: 1rem;
        }}
        
        @media (max-width: 768px) {{
            .container {{
                padding: 10px;
            }}
            
            h1 {{
                font-size: 2rem;
            }}
            
            .stats-grid {{
                grid-template-columns: 1fr 1fr;
            }}
            
            .section {{
                padding: 1rem;
            }}
        }}
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>Portal de Transparencia</h1>
            <div class="subtitle">Municipalidad de Carmen de Areco</div>
        </header>
        
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-number">{dashboard_data['statistics']['total_irregularities']}</div>
                <div class="stat-label">Irregularidades Detectadas</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">{dashboard_data['statistics']['high_severity_count']}</div>
                <div class="stat-label">Alta Prioridad</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">{dashboard_data['statistics']['medium_severity_count']}</div>
                <div class="stat-label">Media Prioridad</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">{dashboard_data['statistics']['documents_analyzed']}</div>
                <div class="stat-label">Documentos Analizados</div>
            </div>
        </div>
        
        <div class="section">
            <h2 class="section-title">Irregularidades Recientes</h2>
            <div class="irregularity-list">
"""

        # Add irregularities
        for irregularity in dashboard_data['recent_irregularities'][:20]:  # Limit to 20 most recent
            html_content += f"""
                <div class="irregularity-card {irregularity['severity']}">
                    <div class="irregularity-title">{irregularity['title']}</div>
                    <div class="irregularity-description">{irregularity['description']}</div>
                    <div class="irregularity-meta">
                        <span class="severity-badge severity-{irregularity['severity']}">{irregularity['severity'].upper()}</span>
                        <span>{irregularity['date'][:10]}</span>
                    </div>
                </div>
"""

        html_content += f"""
            </div>
        </div>
        
        <div class="section">
            <h2 class="section-title">Anomalías en Documentos</h2>
            <div class="irregularity-list">
"""

        # Add document anomalies
        for anomaly in dashboard_data['document_anomalies'][:15]:  # Limit to 15 most recent
            html_content += f"""
                <div class="irregularity-card {anomaly['severity']}">
                    <div class="irregularity-title">{anomaly['title']}</div>
                    <div class="irregularity-description">{anomaly['description']}</div>
                    <div class="irregularity-meta">
                        <span class="severity-badge severity-{anomaly['severity']}">{anomaly['severity'].upper()}</span>
                        <span>{anomaly['date'][:10]}</span>
                    </div>
                </div>
"""

        html_content += f"""
            </div>
        </div>
        
        <div class="timestamp">
            Última actualización: {datetime.fromisoformat(dashboard_data['generated_at']).strftime('%d/%m/%Y %H:%M')}
        </div>
        
        <footer>
            <p>Sistema de Transparencia Automatizado | Carmen de Areco, Buenos Aires</p>
            <p>Los datos se actualizan automáticamente diariamente</p>
        </footer>
    </div>
</body>
</html>
"""
        
        # Save HTML dashboard
        html_file = self.data_dir / "public_dashboard.html"
        with open(html_file, 'w', encoding='utf-8') as f:
            f.write(html_content)
        
        self.logger.info(f"HTML dashboard generated: {html_file}")
        return html_content

if __name__ == "__main__":
    generator = CitizenDashboardGenerator()
    
    # Generate dashboard data
    dashboard_data = generator.generate_dashboard_data()
    
    # Generate HTML dashboard
    html_content = generator.generate_html_dashboard(dashboard_data)
    
    print(f"📊 Citizen dashboard generated!")
    print(f"📁 Data: {generator.data_dir / 'dashboard_data.json'}")
    print(f"🌐 HTML: {generator.data_dir / 'public_dashboard.html'}")
    print(f"📈 Total irregularities: {dashboard_data['statistics']['total_irregularities']}")