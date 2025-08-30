#!/usr/bin/env python3
"""
Data Visualization Script
Creates charts and visualizations comparing Power BI and PDF data
"""

import json
import matplotlib.pyplot as plt
import numpy as np
import os
from pathlib import Path
from datetime import datetime

# Set style for better-looking plots
plt.style.use('seaborn-v0_8')

def load_comparison_data():
    """Load the latest comparison data"""
    reports_dir = Path("/Users/flong/Developer/cda-transparencia/data/comparison_reports")
    
    # Find the most recent JSON report
    json_files = list(reports_dir.glob("comparison_report_*.json"))
    if not json_files:
        raise FileNotFoundError("No comparison reports found")
    
    # Sort by modification time and get the most recent
    json_files.sort(key=lambda x: x.stat().st_mtime, reverse=True)
    latest_report = json_files[0]
    
    with open(latest_report, 'r', encoding='utf-8') as f:
        return json.load(f)

def create_budget_execution_chart(comparison_data):
    """Create a chart comparing budgeted vs executed amounts by category"""
    
    categories = [point['category'] for point in comparison_data]
    budgeted = [point['powerbi_budgeted'] for point in comparison_data]
    executed = [point['powerbi_executed'] for point in comparison_data]
    
    # Convert to millions for better readability
    budgeted_millions = [b / 1_000_000 for b in budgeted]
    executed_millions = [e / 1_000_000 for e in executed]
    
    # Set up the bar chart
    x = np.arange(len(categories))
    width = 0.35
    
    fig, ax = plt.subplots(figsize=(12, 8))
    bars1 = ax.bar(x - width/2, budgeted_millions, width, label='Presupuestado', color='#1f77b4', alpha=0.8)
    bars2 = ax.bar(x + width/2, executed_millions, width, label='Ejecutado', color='#2ca02c', alpha=0.8)
    
    # Customize the chart
    ax.set_xlabel('Categorías', fontsize=12)
    ax.set_ylabel('Millones de ARS', fontsize=12)
    ax.set_title('Comparación de Presupuesto vs Ejecución por Categoría', fontsize=14, pad=20)
    ax.set_xticks(x)
    ax.set_xticklabels(categories, rotation=45, ha='right')
    ax.legend()
    
    # Add value labels on bars
    def autolabel(bars, values):
        for bar, value in zip(bars, values):
            height = bar.get_height()
            ax.annotate(f'{value:.1f}M',
                        xy=(bar.get_x() + bar.get_width() / 2, height),
                        xytext=(0, 3),
                        textcoords="offset points",
                        ha='center', va='bottom', fontsize=8)
    
    autolabel(bars1, budgeted_millions)
    autolabel(bars2, executed_millions)
    
    plt.tight_layout()
    return fig

def create_execution_percentage_chart(comparison_data):
    """Create a chart showing execution percentages by category"""
    
    categories = [point['category'] for point in comparison_data]
    percentages = []
    
    for point in comparison_data:
        budgeted = point['powerbi_budgeted']
        executed = point['powerbi_executed']
        if budgeted > 0:
            percentage = (executed / budgeted) * 100
        else:
            percentage = 0
        percentages.append(percentage)
    
    # Create horizontal bar chart
    fig, ax = plt.subplots(figsize=(10, 8))
    y_pos = np.arange(len(categories))
    
    bars = ax.barh(y_pos, percentages, color='#ff7f0e', alpha=0.8)
    
    # Customize the chart
    ax.set_yticks(y_pos)
    ax.set_yticklabels(categories)
    ax.set_xlabel('Porcentaje de Ejecución (%)', fontsize=12)
    ax.set_title('Porcentaje de Ejecución Presupuestaria por Categoría', fontsize=14, pad=20)
    ax.set_xlim(0, 120)
    
    # Add value labels on bars
    for i, (bar, pct) in enumerate(zip(bars, percentages)):
        width = bar.get_width()
        ax.annotate(f'{pct:.1f}%',
                    xy=(width, bar.get_y() + bar.get_height()/2),
                    xytext=(3, 0),
                    textcoords="offset points",
                    ha='left', va='center', fontsize=9)
    
    # Add reference lines for 100% and 80%
    ax.axvline(x=100, color='red', linestyle='--', alpha=0.7, linewidth=1)
    ax.axvline(x=80, color='orange', linestyle='--', alpha=0.7, linewidth=1)
    
    plt.tight_layout()
    return fig

def create_document_count_chart(comparison_data):
    """Create a chart comparing document counts"""
    
    categories = [point['category'] for point in comparison_data]
    pdf_counts = [point['pdf_document_count'] for point in comparison_data]
    
    # Create bar chart
    fig, ax = plt.subplots(figsize=(10, 6))
    x_pos = np.arange(len(categories))
    
    bars = ax.bar(x_pos, pdf_counts, color='#9467bd', alpha=0.8)
    
    # Customize the chart
    ax.set_xlabel('Categorías', fontsize=12)
    ax.set_ylabel('Cantidad de Documentos PDF', fontsize=12)
    ax.set_title('Documentos PDF Disponibles por Categoría', fontsize=14, pad=20)
    ax.set_xticks(x_pos)
    ax.set_xticklabels(categories, rotation=45, ha='right')
    
    # Add value labels on bars
    for bar, count in zip(bars, pdf_counts):
        height = bar.get_height()
        ax.annotate(str(count),
                    xy=(bar.get_x() + bar.get_width() / 2, height),
                    xytext=(0, 3),
                    textcoords="offset points",
                    ha='center', va='bottom', fontsize=9)
    
    plt.tight_layout()
    return fig

def generate_visualizations():
    """Generate all visualizations and save them"""
    
    print("🎨 Generating data visualizations...")
    
    # Load comparison data
    try:
        data = load_comparison_data()
        comparison_points = data.get('comparison_points', [])
    except FileNotFoundError as e:
        print(f"❌ Error: {e}")
        return
    except json.JSONDecodeError as e:
        print(f"❌ Error reading JSON data: {e}")
        return
    
    if not comparison_points:
        print("❌ No comparison data found")
        return
    
    # Create visualizations directory
    viz_dir = Path("/Users/flong/Developer/cda-transparencia/data/visualizations")
    viz_dir.mkdir(exist_ok=True)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    # 1. Budget vs Execution chart
    print("📊 Creating budget vs execution chart...")
    fig1 = create_budget_execution_chart(comparison_points)
    budget_chart_path = viz_dir / f"budget_vs_execution_{timestamp}.png"
    fig1.savefig(budget_chart_path, dpi=300, bbox_inches='tight')
    plt.close(fig1)
    print(f"   Saved to: {budget_chart_path}")
    
    # 2. Execution percentage chart
    print("📈 Creating execution percentage chart...")
    fig2 = create_execution_percentage_chart(comparison_points)
    percentage_chart_path = viz_dir / f"execution_percentage_{timestamp}.png"
    fig2.savefig(percentage_chart_path, dpi=300, bbox_inches='tight')
    plt.close(fig2)
    print(f"   Saved to: {percentage_chart_path}")
    
    # 3. Document count chart
    print("📄 Creating document count chart...")
    fig3 = create_document_count_chart(comparison_points)
    document_chart_path = viz_dir / f"document_counts_{timestamp}.png"
    fig3.savefig(document_chart_path, dpi=300, bbox_inches='tight')
    plt.close(fig3)
    print(f"   Saved to: {document_chart_path}")
    
    print(f"\n✅ All visualizations generated successfully!")
    print(f"   Charts saved to: {viz_dir}")
    
    return [
        budget_chart_path,
        percentage_chart_path,
        document_chart_path
    ]

if __name__ == "__main__":
    generate_visualizations()