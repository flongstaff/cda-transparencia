#!/usr/bin/env python3
"""
Comprehensive Web Data Generator
Creates all data formats needed for charts, components, and web display
"""

import os
import json
import pandas as pd
import logging
from pathlib import Path
from datetime import datetime
from typing import Dict, List

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class ComprehensiveWebDataGenerator:
    def __init__(self, base_dir: str = "."):
        self.base_dir = Path(base_dir)
        self.data_dir = self.base_dir / "frontend" / "public" / "data"
        self.api_dir = self.data_dir / "api"
        self.csv_dir = self.data_dir / "csv"
        self.charts_dir = self.data_dir / "charts"

        # Create charts directory
        self.charts_dir.mkdir(exist_ok=True)

    def load_extracted_data(self) -> pd.DataFrame:
        """Load the extracted transparency data"""
        csv_file = self.csv_dir / "transparency_data_complete.csv"
        if csv_file.exists():
            df = pd.read_csv(csv_file)
            logger.info(f"Loaded {len(df)} rows of transparency data")
            return df
        else:
            logger.error("No transparency data found")
            return pd.DataFrame()

    def create_category_datasets(self, df: pd.DataFrame):
        """Create datasets by category for different chart types"""
        logger.info("🔄 Creating category datasets...")

        categories = {
            "gastos": ["gastos", "egresos", "erogaciones", "pagos", "sueldos"],
            "recursos": ["ingresos", "recursos", "recaudacion", "tasas", "impuestos"],
            "presupuesto": ["presupuesto", "budget", "ejecutado", "devengado"],
            "situacion_economica": ["situacion", "economica", "financiera", "balance"],
            "licitaciones": ["licitacion", "publica", "contrato", "adjudicacion"],
            "caif": ["caif", "centro", "atencion", "integral", "familia"],
            "personal": ["personal", "empleados", "planta", "administrativa"]
        }

        categorized_data = {}

        for category, keywords in categories.items():
            # Filter data by keywords in any text field
            mask = df.apply(lambda row: any(
                any(keyword.lower() in str(cell).lower() for keyword in keywords)
                for cell in row.values if pd.notna(cell)
            ), axis=1)

            category_df = df[mask].copy()

            if not category_df.empty:
                categorized_data[category] = category_df

                # Save category CSV
                csv_file = self.csv_dir / f"category_{category}.csv"
                category_df.to_csv(csv_file, index=False, encoding='utf-8')
                logger.info(f"  ✅ {category}: {len(category_df)} rows")
            else:
                logger.warning(f"  ⚠️  No data found for category: {category}")

        return categorized_data

    def create_time_series_data(self, df: pd.DataFrame):
        """Create time series datasets for trend analysis"""
        logger.info("📈 Creating time series data...")

        # Extract years from filenames and data
        df['year'] = df['source_file'].str.extract(r'(\d{4})')
        df['year'] = pd.to_numeric(df['year'], errors='coerce')

        # Filter valid years
        valid_years = df[df['year'].notna() & (df['year'] >= 2018) & (df['year'] <= 2025)]

        if not valid_years.empty:
            # Group by year
            yearly_summary = []
            for year in sorted(valid_years['year'].unique()):
                year_data = valid_years[valid_years['year'] == year]

                # Count documents, tables, and extract key metrics
                summary = {
                    'year': int(year),
                    'documents_count': year_data['source_file'].nunique(),
                    'tables_count': len(year_data),
                    'revenue_mentions': len(year_data[year_data.apply(
                        lambda row: any('ingreso' in str(cell).lower() or 'recurso' in str(cell).lower()
                                      for cell in row.values if pd.notna(cell)), axis=1)]),
                    'expense_mentions': len(year_data[year_data.apply(
                        lambda row: any('gasto' in str(cell).lower() or 'egreso' in str(cell).lower()
                                      for cell in row.values if pd.notna(cell)), axis=1)]),
                    'last_updated': datetime.now().isoformat()
                }
                yearly_summary.append(summary)

            # Save time series data
            time_series_df = pd.DataFrame(yearly_summary)
            csv_file = self.csv_dir / "time_series_summary.csv"
            time_series_df.to_csv(csv_file, index=False)

            json_file = self.api_dir / "time_series.json"
            with open(json_file, 'w', encoding='utf-8') as f:
                json.dump(yearly_summary, f, indent=2, ensure_ascii=False)

            logger.info(f"  ✅ Time series data: {len(yearly_summary)} years")
            return yearly_summary
        else:
            logger.warning("  ⚠️  No valid time series data found")
            return []

    def create_chart_ready_datasets(self, categorized_data: Dict[str, pd.DataFrame]):
        """Create datasets specifically formatted for different chart types"""
        logger.info("📊 Creating chart-ready datasets...")

        chart_datasets = {}

        for category, df in categorized_data.items():
            if df.empty:
                continue

            # Create summary for pie charts
            source_summary = df['source_file'].value_counts().head(10)
            chart_datasets[f"{category}_pie"] = [
                {"name": source, "value": count}
                for source, count in source_summary.items()
            ]

            # Create data for bar charts (by page number)
            page_summary = df['page_number'].value_counts().sort_index()
            chart_datasets[f"{category}_bar"] = [
                {"page": int(page), "count": int(count)}
                for page, count in page_summary.items()
            ]

            # Create data for line charts (by table number)
            table_summary = df.groupby('table_number').size()
            chart_datasets[f"{category}_line"] = [
                {"table": int(table), "count": int(count)}
                for table, count in table_summary.items()
            ]

        # Save all chart datasets
        charts_file = self.api_dir / "chart_datasets.json"
        with open(charts_file, 'w', encoding='utf-8') as f:
            json.dump(chart_datasets, f, indent=2, ensure_ascii=False)

        logger.info(f"  ✅ Chart datasets: {len(chart_datasets)} datasets created")
        return chart_datasets

    def create_search_index(self, df: pd.DataFrame):
        """Create search index for web components"""
        logger.info("🔍 Creating search index...")

        search_index = []

        for _, row in df.iterrows():
            # Extract meaningful text from each row
            text_fields = []
            for col, value in row.items():
                if pd.notna(value) and str(value).strip():
                    text_fields.append(str(value).strip())

            if text_fields:
                search_entry = {
                    "id": f"{row.get('source_file', 'unknown')}_{row.get('page_number', 0)}_{row.get('table_number', 0)}_{row.get('row_number', 0)}",
                    "source_file": row.get('source_file', ''),
                    "page_number": int(row.get('page_number', 0)),
                    "table_number": int(row.get('table_number', 0)),
                    "content": " ".join(text_fields),
                    "keywords": [word.lower() for word in " ".join(text_fields).split() if len(word) > 3],
                    "category": self.determine_category(" ".join(text_fields)),
                    "extraction_date": row.get('extraction_date', '')
                }
                search_index.append(search_entry)

        # Save search index
        search_file = self.api_dir / "search_index.json"
        with open(search_file, 'w', encoding='utf-8') as f:
            json.dump(search_index, f, indent=2, ensure_ascii=False)

        logger.info(f"  ✅ Search index: {len(search_index)} entries")
        return search_index

    def determine_category(self, text: str) -> str:
        """Determine category based on text content"""
        text_lower = text.lower()

        if any(word in text_lower for word in ["gastos", "egresos", "pagos"]):
            return "gastos"
        elif any(word in text_lower for word in ["ingresos", "recursos", "recaudacion"]):
            return "recursos"
        elif any(word in text_lower for word in ["presupuesto", "ejecutado"]):
            return "presupuesto"
        elif any(word in text_lower for word in ["situacion", "economica", "financiera"]):
            return "situacion_economica"
        elif any(word in text_lower for word in ["licitacion", "contrato"]):
            return "licitaciones"
        elif "caif" in text_lower:
            return "caif"
        elif any(word in text_lower for word in ["personal", "empleados"]):
            return "personal"
        else:
            return "general"

    def create_component_data_files(self, df: pd.DataFrame):
        """Create specific data files for different web components"""
        logger.info("🔧 Creating component-specific data files...")

        components_data = {
            "dashboard_summary": {
                "total_documents": int(df['source_file'].nunique()),
                "total_tables": int(len(df)),
                "total_pages": int(df['page_number'].max()) if not df.empty else 0,
                "extraction_methods": {k: int(v) for k, v in df['extraction_method'].value_counts().to_dict().items()} if 'extraction_method' in df.columns else {},
                "date_range": {
                    "earliest": str(df['extraction_date'].min()) if 'extraction_date' in df.columns else None,
                    "latest": str(df['extraction_date'].max()) if 'extraction_date' in df.columns else None
                },
                "last_updated": datetime.now().isoformat()
            },

            "financial_overview": {
                "revenue_documents": int(len(df[df.apply(
                    lambda row: any('ingreso' in str(cell).lower() or 'recurso' in str(cell).lower()
                                  for cell in row.values if pd.notna(cell)), axis=1)])),
                "expense_documents": int(len(df[df.apply(
                    lambda row: any('gasto' in str(cell).lower() or 'egreso' in str(cell).lower()
                                  for cell in row.values if pd.notna(cell)), axis=1)])),
                "budget_documents": int(len(df[df.apply(
                    lambda row: any('presupuesto' in str(cell).lower()
                                  for cell in row.values if pd.notna(cell)), axis=1)])),
                "last_updated": datetime.now().isoformat()
            },

            "document_types": {k: int(v) for k, v in df['source_file'].apply(
                lambda x: self.categorize_document_type(x) if pd.notna(x) else 'unknown'
            ).value_counts().to_dict().items()}
        }

        # Save component data
        for component, data in components_data.items():
            file_path = self.api_dir / f"{component}.json"
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            logger.info(f"  ✅ {component}.json created")

    def categorize_document_type(self, filename: str) -> str:
        """Categorize document type based on filename"""
        filename_lower = filename.lower()

        if "estado-de-ejecucion-de-gastos" in filename_lower:
            return "Ejecución de Gastos"
        elif "estado-de-ejecucion-de-recursos" in filename_lower:
            return "Ejecución de Recursos"
        elif "situacion-economica" in filename_lower:
            return "Situación Económica"
        elif "cuenta-ahorro" in filename_lower:
            return "Cuenta Ahorro-Inversión"
        elif "licitacion" in filename_lower:
            return "Licitaciones"
        elif "caif" in filename_lower:
            return "CAIF"
        elif "personal" in filename_lower or "administracion" in filename_lower:
            return "Personal y Administración"
        else:
            return "Otros"

    def create_master_api_index(self):
        """Create master API index with all available endpoints"""
        logger.info("📋 Creating master API index...")

        api_files = list(self.api_dir.glob("*.json"))
        csv_files = list(self.csv_dir.glob("*.csv"))

        master_index = {
            "api_version": "1.0",
            "last_updated": datetime.now().isoformat(),
            "total_api_endpoints": len(api_files),
            "total_csv_files": len(csv_files),

            "api_endpoints": {
                file.stem: f"/data/api/{file.name}"
                for file in api_files if file.name != "master_index.json"
            },

            "csv_endpoints": {
                file.stem: f"/data/csv/{file.name}"
                for file in csv_files
            },

            "data_categories": [
                "gastos", "recursos", "presupuesto", "situacion_economica",
                "licitaciones", "caif", "personal"
            ],

            "chart_types_supported": [
                "pie", "bar", "line", "area", "scatter", "treemap", "sankey"
            ],

            "components_supported": [
                "dashboard", "financial_charts", "time_series", "search",
                "document_browser", "category_filters"
            ]
        }

        master_file = self.api_dir / "master_index.json"
        with open(master_file, 'w', encoding='utf-8') as f:
            json.dump(master_index, f, indent=2, ensure_ascii=False)

        logger.info(f"  ✅ Master API index created with {len(master_index['api_endpoints'])} endpoints")

    def run_comprehensive_generation(self):
        """Run the complete data generation process"""
        logger.info("🚀 Starting comprehensive web data generation...")

        # Load extracted data
        df = self.load_extracted_data()
        if df.empty:
            logger.error("❌ No data to process")
            return

        # Create all data formats
        categorized_data = self.create_category_datasets(df)
        time_series_data = self.create_time_series_data(df)
        chart_datasets = self.create_chart_ready_datasets(categorized_data)
        search_index = self.create_search_index(df)
        self.create_component_data_files(df)
        self.create_master_api_index()

        logger.info("✅ Comprehensive web data generation complete!")
        logger.info(f"📁 All data available at: {self.data_dir}")
        logger.info(f"🔗 API endpoints: {len(list(self.api_dir.glob('*.json')))} files")
        logger.info(f"📊 CSV files: {len(list(self.csv_dir.glob('*.csv')))} files")

def main():
    generator = ComprehensiveWebDataGenerator()
    generator.run_comprehensive_generation()

if __name__ == "__main__":
    main()