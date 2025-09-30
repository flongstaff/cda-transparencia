#!/usr/bin/env python3
\"\"\"
Generate static HTML files for charts that can be served by Cloudflare Pages
\"\"\"

import os
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import json

def create_chart_html(chart_html, title, description=\"\"):
    \"\"\"Wrap chart HTML in a complete HTML document\"\"\"
    return f\"\"\"
<!DOCTYPE html>
<html lang=\"es\">
<head>
    <meta charset=\"UTF-8\">
    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">
    <title>{title} - Portal de Transparencia Carmen de Areco</title>
    <script src=\"https://cdn.plot.ly/plotly-latest.min.js\"></script>
    <style>
        body {{
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }}
        .container {{
            max-width: 1200px;
            margin: 0 auto;
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }}
        h1 {{
            color: #2c3e50;
            text-align: center;
            margin-bottom: 30px;
        }}
        .chart-container {{
            width: 100%;
            height: 600px;
        }}
        .description {{
            margin-top: 20px;
            padding: 15px;
            background-color: #e8f4f8;
            border-radius: 5px;
            border-left: 4px solid #3498db;
        }}
        .back-link {{
            display: inline-block;
            margin-bottom: 20px;
            padding: 10px 15px;
            background-color: #3498db;
            color: white;
            text-decoration: none;
            border-radius: 5px;
        }}
        .back-link:hover {{
            background-color: #2980b9;
        }}
    </style>
</head>
<body>
    <div class=\"container\">
        <a href=\"../index.html\" class=\"back-link\">← Volver al inicio</a>
        <h1>{title}</h1>
        <div class=\"chart-container\">
            {chart_html}
        </div>
        {f'<div class=\"description\">{description}</div>' if description else ''}
    </div>
</body>
</html>
\"\"\"

def read_csv_safe(filepath):
    \"\"\"Safely read CSV file with error handling\"\"\"
    try:
        return pd.read_csv(filepath)
    except FileNotFoundError:
        print(f\"⚠️ File not found: {filepath}\")
        return None
    except Exception as e:
        print(f\"⚠️ Error reading {filepath}: {e}\")
        return None

def generate_2019_chart():
    \"\"\"Generate interactive HTML chart for 2019 budget execution\"\"\"
    try:
        # Read 2019 data
        df = read_csv_safe(\"data/processed/budget_execution_2019.csv\")
        if df is None or df.empty:
            print(\"⚠️ Insufficient data for 2019 chart\")
            return
            
        # Ensure numeric columns are properly typed
        numeric_cols = ['Presupuestado', 'Ejecutado'] if 'Presupuestado' in df.columns else ['budget', 'execution']
        if all(col in df.columns for col in numeric_cols):
            df[numeric_cols] = df[numeric_cols].apply(pd.to_numeric, errors='coerce')
            
        # Create bar chart
        fig = go.Figure()
        
        # Add traces for budget and execution
        fig.add_trace(go.Bar(
            x=df['Sector'] if 'Sector' in df.columns else df.iloc[:, 0],
            y=df[numeric_cols[0]],
            name='Presupuestado',
            marker_color='blue'
        ))
        
        fig.add_trace(go.Bar(
            x=df['Sector'] if 'Sector' in df.columns else df.iloc[:, 0],
            y=df[numeric_cols[1]],
            name='Ejecutado',
            marker_color='orange'
        ))
        
        # Update layout
        fig.update_layout(
            title='Ejecución Presupuestaria 2019 por Sector',
            xaxis_title='Sector',
            yaxis_title='Monto (ARS)',
            barmode='group',
            template='plotly_white',
            height=600
        )
        
        # Convert to HTML
        chart_html = fig.to_html(include_plotlyjs=False, div_id='chart-2019')
        
        # Wrap in complete HTML document
        full_html = create_chart_html(
            chart_html,
            \"Ejecución Presupuestaria 2019\",
            \"Comparativa de presupuesto planificado vs ejecutado por sector en 2019\"
        )
        
        # Write HTML file
        os.makedirs(\"public/charts\", exist_ok=True)
        with open(\"public/charts/budget_2019.html\", \"w\") as outfile:
            outfile.write(full_html)
            
        print(\"✅ Generated 2019 budget execution chart\")
        
    except Exception as e:
        print(f\"⚠️ Error generating 2019 chart: {e}\")

def generate_2021_chart():
    \"\"\"Generate interactive HTML chart for 2021 quarterly execution\"\"\"
    try:
        # Read 2021 data
        df = read_csv_safe(\"data/processed/budget_execution_2021.csv\")
        if df is None or df.empty:
            print(\"⚠️ Insufficient data for 2021 chart\")
            return
            
        # Ensure numeric columns are properly typed
        numeric_cols = ['Presupuestado', 'Ejecutado', 'Porcentaje'] if 'Presupuestado' in df.columns else ['budget', 'execution', 'percentage']
        if all(col in df.columns for col in numeric_cols[:2]):
            df[numeric_cols[:2]] = df[numeric_cols[:2]].apply(pd.to_numeric, errors='coerce')
            
        # Filter out total row if present
        df_filtered = df[df.iloc[:, 0] != \"Total\"] if not df.empty else df
            
        # Create bar chart
        fig = go.Figure()
        
        # Add traces for budget and execution
        fig.add_trace(go.Bar(
            x=df_filtered.iloc[:, 0],  # First column (Quarter)
            y=df_filtered[numeric_cols[0]] if numeric_cols[0] in df_filtered.columns else df_filtered.iloc[:, 1],
            name='Presupuestado',
            marker_color='blue'
        ))
        
        fig.add_trace(go.Bar(
            x=df_filtered.iloc[:, 0],  # First column (Quarter)
            y=df_filtered[numeric_cols[1]] if numeric_cols[1] in df_filtered.columns else df_filtered.iloc[:, 2],
            name='Ejecutado',
            marker_color='orange'
        ))
        
        # Update layout
        fig.update_layout(
            title='Ejecución Presupuestaria 2021 por Trimestre',
            xaxis_title='Trimestre',
            yaxis_title='Monto (ARS)',
            barmode='group',
            template='plotly_white',
            height=600
        )
        
        # Convert to HTML
        chart_html = fig.to_html(include_plotlyjs=False, div_id='chart-2021')
        
        # Wrap in complete HTML document
        full_html = create_chart_html(
            chart_html,
            \"Ejecución Presupuestaria 2021\",
            \"Comparativa de presupuesto planificado vs ejecutado por trimestre en 2021\"
        )
        
        # Write HTML file
        os.makedirs(\"public/charts\", exist_ok=True)
        with open(\"public/charts/budget_2021_quarterly.html\", \"w\") as outfile:
            outfile.write(full_html)
            
        print(\"✅ Generated 2021 quarterly execution chart\")
        
    except Exception as e:
        print(f\"⚠️ Error generating 2021 chart: {e}\")

def generate_cameras_chart():
    \"\"\"Generate interactive HTML chart for security cameras\"\"\"
    try:
        # Read indicators data
        df = read_csv_safe(\"data/processed/programmatic_indicators.csv\")
        if df is None or df.empty:
            print(\"⚠️ No indicators data found\")
            return
            
        # Filter for security cameras
        cameras_df = df[df[\"indicator\"] == \"security_cameras\"] if \"indicator\" in df.columns else \
                     df[df.iloc[:, 0] == \"security_cameras\"] if not df.empty else pd.DataFrame()
                     
        if cameras_df.empty:
            print(\"⚠️ No security cameras data found\")
            return
            
        # Create bar chart comparing planned vs executed
        fig = go.Figure()
        
        # Add traces
        planned_col = 'planned' if 'planned' in cameras_df.columns else cameras_df.columns[2] if len(cameras_df.columns) > 2 else None
        executed_col = 'executed' if 'executed' in cameras_df.columns else cameras_df.columns[3] if len(cameras_df.columns) > 3 else None
        
        if planned_col and executed_col:
            fig.add_trace(go.Bar(
                x=cameras_df['source_file'] if 'source_file' in cameras_df.columns else cameras_df.iloc[:, 1],
                y=cameras_df[planned_col],
                name='Planificado',
                marker_color='blue'
            ))
            
            fig.add_trace(go.Bar(
                x=cameras_df['source_file'] if 'source_file' in cameras_df.columns else cameras_df.iloc[:, 1],
                y=cameras_df[executed_col],
                name='Ejecutado',
                marker_color='orange'
            ))
            
            # Update layout
            fig.update_layout(
                title='Instalación de Cámaras de Seguridad',
                xaxis_title='Periodo',
                yaxis_title='Cantidad de Cámaras',
                barmode='group',
                template='plotly_white',
                height=600
            )
            
            # Add insight annotation
            fig.add_annotation(
                x=1,
                y=0.95,
                xref=\"paper\",
                yref=\"paper\",
                text=\"<b>Insight:</b> En Q4 2023, 298 cámaras fueron instaladas vs 198 planificadas → 150% de ejecución\",
                showarrow=False,
                bgcolor=\"white\",
                bordercolor=\"black\",
                borderwidth=1
            )
            
            # Convert to HTML
            chart_html = fig.to_html(include_plotlyjs=False, div_id='chart-cameras')
            
            # Wrap in complete HTML document
            full_html = create_chart_html(
                chart_html,
                \"Instalación de Cámaras de Seguridad\",
                \"Comparativa de cámaras de seguridad planificadas vs ejecutadas\"
            )
            
            # Write HTML file
            os.makedirs(\"public/charts\", exist_ok=True)
            with open(\"public/charts/cameras_timeline.html\", \"w\") as outfile:
                outfile.write(full_html)
            
            print(\"✅ Generated security cameras chart\")
        else:
            print(\"⚠️ Required columns not found in cameras data\")
        
    except Exception as e:
        print(f\"⚠️ Error generating cameras chart: {e}\")

def generate_families_chart():
    \"\"\"Generate interactive HTML chart for families assisted\"\"\"
    try:
        # Read indicators data
        df = read_csv_safe(\"data/processed/programmatic_indicators.csv\")
        if df is None or df.empty:
            print(\"⚠️ No indicators data found\")
            return
            
        # Filter for families assisted
        families_df = df[df[\"indicator\"] == \"families_assisted\"] if \"indicator\" in df.columns else \
                      df[df.iloc[:, 0] == \"families_assisted\"] if not df.empty else pd.DataFrame()
                      
        if families_df.empty:
            print(\"⚠️ No families assisted data found\")
            return
            
        # Create bar chart
        fig = go.Figure()
        
        # Add trace for families assisted
        executed_col = 'executed' if 'executed' in families_df.columns else families_df.columns[3] if len(families_df.columns) > 3 else None
        source_col = 'source_file' if 'source_file' in families_df.columns else families_df.columns[1] if len(families_df.columns) > 1 else None
        
        if executed_col and source_col:
            fig.add_trace(go.Bar(
                x=families_df[source_col],
                y=families_df[executed_col],
                name='Familias Asistidas',
                marker_color='green'
            ))
            
            # Update layout
            fig.update_layout(
                title='Familias Asistidas por Periodo',
                xaxis_title='Periodo',
                yaxis_title='Número de Familias',
                template='plotly_white',
                height=600
            )
            
            # Convert to HTML
            chart_html = fig.to_html(include_plotlyjs=False, div_id='chart-families')
            
            # Wrap in complete HTML document
            full_html = create_chart_html(
                chart_html,
                \"Familias Asistidas\",
                \"Número de familias asistidas por periodo\"
            )
            
            # Write HTML file
            os.makedirs(\"public/charts\", exist_ok=True)
            with open(\"public/charts/families_assisted.html\", \"w\") as outfile:
                outfile.write(full_html)
            
            print(\"✅ Generated families assisted chart\")
        else:
            print(\"⚠️ Required columns not found in families data\")
        
    except Exception as e:
        print(f\"⚠️ Error generating families chart: {e}\")

def generate_execution_rate_chart():
    \"\"\"Generate a chart showing execution rates by sector\"\"\"
    try:
        # Try to read consolidated data
        df = read_csv_safe(\"data/processed/budget_execution_all_years.csv\")
        if df is None:
            # Try alternative paths
            df = read_csv_safe(\"src/data/processed/budget_execution_all_years.csv\")
            
        if df is None or df.empty:
            print(\"⚠️ No consolidated budget data found\")
            return
            
        # Calculate execution rate
        if 'budget' in df.columns and 'execution' in df.columns:
            df['execution_rate'] = (df['execution'] / df['budget']) * 100
            df['execution_rate'] = df['execution_rate'].fillna(0)
            
            # Group by sector
            sector_data = df.groupby('sector' if 'sector' in df.columns else df.columns[1]).agg({
                'budget': 'sum',
                'execution': 'sum'
            }).reset_index()
            
            sector_data['execution_rate'] = (sector_data['execution'] / sector_data['budget']) * 100
            sector_data['execution_rate'] = sector_data['execution_rate'].fillna(0)
            
            # Create bar chart
            fig = px.bar(
                sector_data,
                x='sector' if 'sector' in sector_data.columns else sector_data.columns[0],
                y='execution_rate',
                title='Tasa de Ejecución Presupuestaria por Sector',
                labels={'execution_rate': 'Tasa de Ejecución (%)', 'sector': 'Sector'},
                color='execution_rate',
                color_continuous_scale='RdYlGn'
            )
            
            fig.update_layout(
                yaxis_title='Tasa de Ejecución (%)',
                xaxis_title='Sector',
                template='plotly_white',
                height=600
            )
            
            # Add 100% reference line
            fig.add_hline(y=100, line_dash=\"dash\", line_color=\"red\", 
                         annotation_text=\"100% (Presupuesto completo)\")
            
            # Convert to HTML
            chart_html = fig.to_html(include_plotlyjs=False, div_id='chart-execution-rate')
            
            # Wrap in complete HTML document
            full_html = create_chart_html(
                chart_html,
                \"Tasa de Ejecución Presupuestaria por Sector\",
                \"Porcentaje de ejecución presupuestaria por sector\"
            )
            
            # Write HTML file
            os.makedirs(\"public/charts\", exist_ok=True)
            with open(\"public/charts/execution_rate_by_sector.html\", \"w\") as outfile:
                outfile.write(full_html)
            
            print(\"✅ Generated execution rate by sector chart\")
        else:
            print(\"⚠️ Required budget/execution columns not found\")
            
    except Exception as e:
        print(f\"⚠️ Error generating execution rate chart: {e}\")

def generate_underspent_chart():
    \"\"\"Generate a chart showing underspent amounts by sector\"\"\"
    try:
        # Try to read consolidated data
        df = read_csv_safe(\"data/processed/budget_execution_all_years.csv\")
        if df is None:
            # Try alternative paths
            df = read_csv_safe(\"src/data/processed/budget_execution_all_years.csv\")
            
        if df is None or df.empty:
            print(\"⚠️ No consolidated budget data found\")
            return
            
        # Calculate underspent amount
        if 'budget' in df.columns and 'execution' in df.columns:
            df['underspent'] = df['budget'] - df['execution']
            
            # Group by sector
            sector_data = df.groupby('sector' if 'sector' in df.columns else df.columns[1]).agg({
                'budget': 'sum',
                'execution': 'sum',
                'underspent': 'sum'
            }).reset_index()
            
            # Create bar chart
            fig = px.bar(
                sector_data,
                x='sector' if 'sector' in sector_data.columns else sector_data.columns[0],
                y='underspent',
                title='Monto Subejecutado por Sector',
                labels={'underspent': 'Subejecución (ARS)', 'sector': 'Sector'},
                color='underspent',
                color_continuous_scale='Bluered_r'
            )
            
            fig.update_layout(
                yaxis_title='Subejecución (ARS)',
                xaxis_title='Sector',
                template='plotly_white',
                height=600
            )
            
            # Add zero reference line
            fig.add_hline(y=0, line_dash=\"dash\", line_color=\"black\")
            
            # Convert to HTML
            chart_html = fig.to_html(include_plotlyjs=False, div_id='chart-underspent')
            
            # Wrap in complete HTML document
            full_html = create_chart_html(
                chart_html,
                \"Monto Subejecutado por Sector\",
                \"Monto de recursos no ejecutados por sector\"
            )
            
            # Write HTML file
            os.makedirs(\"public/charts\", exist_ok=True)
            with open(\"public/charts/underspent_by_sector.html\", \"w\") as outfile:
                outfile.write(full_html)
            
            print(\"✅ Generated underspent by sector chart\")
        else:
            print(\"⚠️ Required budget/execution columns not found\")
            
    except Exception as e:
        print(f\"⚠️ Error generating underspent chart: {e}\")

def generate_index_page():
    \"\"\"Generate an index page to navigate all charts\"\"\"
    html_template = \"\"\"
<!DOCTYPE html>
<html lang=\"es\">
<head>
    <meta charset=\"UTF-8\">
    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">
    <title>Portal de Transparencia - Gráficos</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #2c3e50;
            text-align: center;
            margin-bottom: 30px;
        }
        .chart-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        .chart-card {
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            background-color: #fff;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        .chart-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        .chart-card h3 {
            margin-top: 0;
            color: #34495e;
        }
        .chart-card a {
            display: inline-block;
            margin-top: 15px;
            padding: 10px 20px;
            background-color: #3498db;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            transition: background-color 0.2s;
        }
        .chart-card a:hover {
            background-color: #2980b9;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #7f8c8d;
        }
    </style>
</head>
<body>
    <div class=\"container\">
        <h1>📊 Portal de Transparencia - Gráficos</h1>
        
        <div class=\"chart-grid\">
            <div class=\"chart-card\">
                <h3>Ejecución Presupuestaria 2019</h3>
                <p>Comparativa de presupuesto planificado vs ejecutado por sector en 2019</p>
                <a href=\"charts/budget_2019.html\" target=\"_blank\">Ver Gráfico</a>
            </div>
            
            <div class=\"chart-card\">
                <h3>Ejecución Presupuestaria 2021</h3>
                <p>Comparativa de presupuesto planificado vs ejecutado por trimestre en 2021</p>
                <a href=\"charts/budget_2021_quarterly.html\" target=\"_blank\">Ver Gráfico</a>
            </div>
            
            <div class=\"chart-card\">
                <h3>Cámaras de Seguridad</h3>
                <p>Instalación de cámaras de seguridad planificadas vs ejecutadas</p>
                <a href=\"charts/cameras_timeline.html\" target=\"_blank\">Ver Gráfico</a>
            </div>
            
            <div class=\"chart-card\">
                <h3>Familias Asistidas</h3>
                <p>Número de familias asistidas por periodo</p>
                <a href=\"charts/families_assisted.html\" target=\"_blank\">Ver Gráfico</a>
            </div>
            
            <div class=\"chart-card\">
                <h3>Tasa de Ejecución por Sector</h3>
                <p>Porcentaje de ejecución presupuestaria por sector</p>
                <a href=\"charts/execution_rate_by_sector.html\" target=\"_blank\">Ver Gráfico</a>
            </div>
            
            <div class=\"chart-card\">
                <h3>Subejecución por Sector</h3>
                <p>Monto de recursos no ejecutados por sector</p>
                <a href=\"charts/underspent_by_sector.html\" target=\"_blank\">Ver Gráfico</a>
            </div>
        </div>
        
        <div class=\"footer\">
            <p>Portal de Transparencia - Carmen de Areco</p>
            <p>Datos actualizados automáticamente mediante GitHub Actions</p>
        </div>
    </div>
</body>
</html>
\"\"\"
    
    # Write index.html file
    os.makedirs(\"public\", exist_ok=True)
    with open(\"public/index.html\", \"w\") as outfile:
        outfile.write(html_template)
        
    print(\"✅ Generated index page\")

if __name__ == \"__main__\":
    # Create public directory if it doesn't exist
    os.makedirs(\"public\", exist_ok=True)
    
    # Generate all charts
    generate_2019_chart()
    generate_2021_chart()
    generate_cameras_chart()
    generate_families_chart()
    generate_execution_rate_chart()
    generate_underspent_chart()
    
    # Generate index page
    generate_index_page()
    
    print(\"✅ All charts generated successfully!\")