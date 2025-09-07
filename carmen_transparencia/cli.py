# cli.py
"""
Command-line interface using Click.
"""

import click
import json
import asyncio
from datetime import datetime
from .system import IntegratedTransparencySystem

@click.group()
def cli() -> None:
    """Integrated Transparency System for Carmen de Areco."""
    pass

@cli.command()
def run_analysis():
    """
    Run the complete, integrated transparency analysis.
    """
    click.secho("🚀 Starting comprehensive transparency analysis...", fg="blue")
    
    system = IntegratedTransparencySystem()
    
    try:
        results = asyncio.run(system.run_comprehensive_analysis())
        
        click.secho("\n📊 ANALYSIS COMPLETED", fg="green", bold=True)
        click.secho(f"🏛️  Municipality: Carmen de Areco", fg="green")
        click.secho(f"⚠️  Risk Level: {results['overall_risk_level'].upper()}", fg="yellow")
        click.secho(f"📋 Corruption Cases Tracked: {results['corruption_cases_tracked']}", fg="green")
        
        # Generate and save report
        report = system.generate_transparency_report(results)
        
        report_path = system.data_dir / f"transparency_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.md"
        with open(report_path, 'w', encoding='utf-8') as f:
            f.write(report)
        
        results_path = system.data_dir / f"analysis_results_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(results_path, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False, default=str)
        
        click.secho(f"\n📄 Report generated: {report_path}", fg="cyan")
        click.secho(f"📈 Detailed results (JSON): {results_path}", fg="cyan")

        if results['overall_risk_level'] in ['critical', 'high']:
            click.secho(f"\n🚨 ALERTA {results['overall_risk_level'].upper()}", fg="red", bold=True)
            click.secho("Recomendaciones prioritarias:", fg="red")
            for i, rec in enumerate(results.get('recommendations', [])[:5], 1):
                click.secho(f"{i}. {rec}", fg="red")

    except Exception as e:
        click.secho(f"❌ Error during analysis: {e}", fg="red", bold=True)
        raise click.ClickException(f"Comprehensive analysis failed: {e}")

if __name__ == '__main__':
    cli()
