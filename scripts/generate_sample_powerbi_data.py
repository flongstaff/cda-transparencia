#!/usr/bin/env python3
"""
Power BI Sample Data Generator
Generates sample Power BI data for testing the frontend components
"""

import json
import random
import os
from datetime import datetime, timedelta
from pathlib import Path

def generate_sample_powerbi_data():
    """Generate sample Power BI data"""
    
    # Create sample datasets
    datasets = [
        {
            "name": "Presupuesto Municipal 2025",
            "id": "dataset_2025_budget",
            "table_count": 5
        },
        {
            "name": "Ejecución Presupuestaria 2024-2025",
            "id": "dataset_2024_2025_execution",
            "table_count": 4
        },
        {
            "name": "Ingresos y Recursos 2023-2025",
            "id": "dataset_2023_2025_revenue",
            "table_count": 3
        }
    ]
    
    # Create sample tables
    tables = [
        {
            "name": "Presupuesto_por_Departamento",
            "column_count": 8,
            "row_count": 245
        },
        {
            "name": "Ejecucion_Mensual",
            "column_count": 12,
            "row_count": 365
        },
        {
            "name": "Ingresos_Tributarios",
            "column_count": 6,
            "row_count": 180
        },
        {
            "name": "Gastos_por_Categoria",
            "column_count": 10,
            "row_count": 457
        }
    ]
    
    # Create sample financial data
    categories = [
        "Salud", "Educación", "Infraestructura", "Servicios Públicos",
        "Administración General", "Desarrollo Social", "Seguridad", "Cultura"
    ]
    
    subcategories = {
        "Salud": ["Hospitales y Centros de Salud", "Programas Sanitarios", "Medicamentos"],
        "Educación": ["Escuelas Primarias", "Jardines de Infantes", "Educación Técnica"],
        "Infraestructura": ["Pavimentación y Caminos", "Obras Públicas", "Mantenimiento"],
        "Servicios Públicos": ["Agua y Cloacas", "Electricidad", "Iluminación Pública"],
        "Administración General": ["Oficinas Municipales", "Gastos Administrativos", "Tecnología"],
        "Desarrollo Social": ["Programas Sociales", "Deportes", "Cultura"],
        "Seguridad": ["Policía y Bomberos", "Seguridad Ciudadana", "Emergencias"],
        "Cultura": ["Bibliotecas y Centros Culturales", "Eventos Culturales", "Patrimonio"]
    }
    
    departments = [
        "Salud", "Educación", "Infraestructura", "Servicios Públicos",
        "Administración General", "Desarrollo Social", "Seguridad", "Cultura"
    ]
    
    # Generate sample financial records
    financial_data = []
    records_sample = []
    
    total_budget = 850000000  # 850 million ARS
    allocated_total = 0
    
    for category in categories:
        # Allocate budget to each category (30-20-15-12-11-12-11-9%)
        category_percentages = {
            "Salud": 30, "Educación": 20, "Infraestructura": 15, 
            "Servicios Públicos": 12, "Administración General": 11,
            "Desarrollo Social": 12, "Seguridad": 11, "Cultura": 9
        }
        
        category_budget = int(total_budget * category_percentages[category] / 100)
        allocated_total += category_budget
        
        # Generate subcategories for this category
        for subcategory in subcategories[category]:
            subcategory_budget = int(category_budget * random.uniform(0.2, 0.5))
            executed_amount = int(subcategory_budget * random.uniform(0.85, 1.05))
            
            record = {
                "category": category,
                "subcategory": subcategory,
                "budgeted": subcategory_budget,
                "executed": executed_amount,
                "difference": executed_amount - subcategory_budget,
                "percentage": round((executed_amount / subcategory_budget) * 100, 2) if subcategory_budget > 0 else 0,
                "year": 2025,
                "quarter": random.choice(["Q1", "Q2", "Q3", "Q4"]),
                "department": random.choice(departments),
                "project": f"Proyecto {random.randint(1, 100)} - {subcategory}"
            }
            
            financial_data.append(record)
            records_sample.append({
                "source": f"Power BI Report - {category} - {subcategory}",
                "data": record
            })
    
    # Create extraction report
    extraction_report = {
        "report_date": datetime.now().isoformat(),
        "summary": {
            "datasets_extracted": len(datasets),
            "tables_extracted": len(tables),
            "records_extracted": len(financial_data),
            "records_saved": len(financial_data),
            "financial_records": len(financial_data)
        },
        "data_sources": {
            "browser_simulation": "Power BI dashboard access",
            "alternative_sources": ["Municipal website", "PDF documents"],
            "api_exploration": ["https://carmendeareco.gob.ar/api/transparencia"]
        },
        "methodology": [
            "Browser simulation to access Power BI data",
            "Alternative source exploration",
            "API endpoint discovery",
            "Multiple bypass techniques"
        ]
    }
    
    # Create the complete data structure
    powerbi_data = {
        "timestamp": datetime.now().isoformat(),
        "extraction_report": extraction_report,
        "extracted_data": {
            "datasets": datasets,
            "tables": tables,
            "records_sample": records_sample[:100],  # Limit to 100 records
            "financial_data": financial_data
        },
        "raw_data_available": len(financial_data) > 100
    }
    
    return powerbi_data

def save_sample_data():
    """Save sample Power BI data to file"""
    
    # Create directory if it doesn't exist
    data_dir = Path("data/powerbi_extraction")
    data_dir.mkdir(parents=True, exist_ok=True)
    
    # Generate sample data
    powerbi_data = generate_sample_powerbi_data()
    
    # Save to file
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = data_dir / f"powerbi_data_{timestamp}.json"
    
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(powerbi_data, f, ensure_ascii=False, indent=2, default=str)
    
    # Also create a "latest" symlink/file
    latest_file = data_dir / "powerbi_data_latest.json"
    if latest_file.exists():
        latest_file.unlink()
    filename.rename(latest_file)
    
    print(f"✅ Sample Power BI data generated and saved to: {latest_file}")
    print(f"   - Datasets: {len(powerbi_data['extracted_data']['datasets'])}")
    print(f"   - Tables: {len(powerbi_data['extracted_data']['tables'])}")
    print(f"   - Records: {len(powerbi_data['extracted_data']['records_sample'])}")
    print(f"   - Financial Data Points: {len(powerbi_data['extracted_data']['financial_data'])}")

if __name__ == "__main__":
    save_sample_data()