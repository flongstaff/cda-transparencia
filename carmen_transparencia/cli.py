# cli.py
"""
Command-line interface using Click.
"""

import click
import pathlib
import json
import pandas as pd
import sqlite3
import asyncio
from datetime import datetime
from .data_extraction import scrape_live_sync, scrape_wayback_sync
from .processing import (
    convert_docx_to_txt,
    convert_table_pdf_to_csv,
    convert_excel_to_csv,
    convert_excel_to_markdown,
    validate_document_integrity
)
from .database import (
    create_documents_table,
    insert_metadata,
    load_from_csv,
)
from .system import IntegratedTransparencySystem

# Main CLI group
@click.group()
def cli() -> None:
    """Carmen de Areco Transparency Document Scraper and Processor."""
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


# Scrape commands
@cli.group()
def scrape():
    """Scrape documents from various sources."""
    pass

@scrape.command()
@click.option("--output", default="data", type=click.Path(), help="Where to write the scraped files.")
@click.option("--depth", default=1, type=int, help="Crawler depth.")
def live(output: str, depth: int):
    """Scrape live documents from the official website."""
    click.secho("🕷️  Scraping live documents...", fg="blue")
    
    try:
        results = scrape_live_sync(output_dir=output, depth=depth)
        
        for url, path in results:
            click.secho(f"✅ {url} → {path}", fg="green")
        
        click.secho(f"✨ Done! Downloaded {len(results)} documents.", fg="green", bold=True)
        
    except Exception as e:
        click.secho(f"❌ Error: {e}", fg="red")
        raise click.ClickException(f"Scraping failed: {e}")

@scrape.command()
@click.option("--output", default="wayback", type=click.Path(), help="Where to write Wayback snapshots.")
@click.option("--depth", default=1, type=int, help="Crawler depth.")
def wayback(output: str, depth: int):
    """Scrape documents from the Wayback Machine."""
    click.secho("🏛️  Scraping Wayback Machine...", fg="blue")
    
    try:
        results = scrape_wayback_sync(output_dir=output, depth=depth)
        
        for url, path in results:
            click.secho(f"✅ {url} → {path}", fg="green")
        
        click.secho(f"✨ Done! Downloaded {len(results)} documents from Wayback.", fg="green", bold=True)
        
    except Exception as e:
        click.secho(f"❌ Error: {e}", fg="red")
        raise click.ClickException(f"Wayback scraping failed: {e}")

# Process commands
@cli.group()
def process() -> None:
    """Process downloaded documents into structured formats."""
    pass

@process.command()
@click.argument("input_dir", type=click.Path(exists=True))
@click.argument("output_file", type=click.Path())
def documents(input_dir: str, output_file: str):
    """
    Process all documents in input_dir and create a summary JSON. 
    
    INPUT_DIR: Directory containing downloaded documents
    OUTPUT_FILE: JSON file to write the processing results
    """
    input_dir = pathlib.Path(input_dir).resolve()
    output_file = pathlib.Path(output_file).resolve()
    
    click.secho(f"📁 Processing documents in {input_dir}...", fg="blue")
    
    results = []
    processed_count = 0
    
    for file_path in input_dir.iterdir():
        if not file_path.is_file():
            continue
        
        click.echo(f"Processing {file_path.name}...")
        
        # Validate document first
        validation = validate_document_integrity(str(file_path))
        
        result = {
            "original_file": str(file_path),
            "filename": file_path.name,
            "type": file_path.suffix.lower(),
            "size": validation.get('size', 0),
            "valid": validation.get('valid', False),
            "processed_files": []
        }
        
        if not validation.get('valid', False):
            result['error'] = validation.get('error', 'Invalid or unreadable file')
            results.append(result)
            continue
        
        # Process based on file type
        if file_path.suffix.lower() == '.pdf':
            csv_output = input_dir / (file_path.stem + '_tables.csv')
            if convert_table_pdf_to_csv(str(file_path), str(csv_output)):
                result['processed_files'].append({
                    'type': 'csv',
                    'path': str(csv_output)
                })
                processed_count += 1
        
        elif file_path.suffix.lower() == '.docx':
            txt_output = input_dir / (file_path.stem + '.txt')
            if convert_docx_to_txt(str(file_path), str(txt_output)):
                result['processed_files'].append({
                    'type': 'txt',
                    'path': str(txt_output)
                })
                processed_count += 1
        
        elif file_path.suffix.lower() in ['.xlsx', '.xls']:
            csv_output = input_dir / (file_path.stem + '.csv')
            md_content = convert_excel_to_markdown(str(file_path))
            
            if convert_excel_to_csv(str(file_path), str(csv_output)):
                result['processed_files'].append({
                    'type': 'csv',
                    'path': str(csv_output)
                })
            
            if md_content:
                md_output = input_dir / (file_path.stem + '.md')
                with open(md_output, 'w', encoding='utf-8') as f:
                    f.write(md_content)
                result['processed_files'].append({
                    'type': 'markdown',
                    'path': str(md_output)
                })
            
            processed_count += 1
        
        results.append(result)
    
    # Write summary JSON
    summary = {
        "input_directory": str(input_dir),
        "processed_at": pd.Timestamp.now().isoformat(),
        "total_files": len(results),
        "processed_successfully": processed_count,
        "results": results
    }
    
    with open(output_file, "w", encoding="utf-8") as fh:
        json.dump(summary, fh, indent=2, ensure_ascii=False)
    
    click.secho(f"✨ Processing complete!", fg="green", bold=True)
    click.secho(f"📊 Processed {processed_count}/{len(results)} files", fg="green")
    click.secho(f"📄 Summary saved to {output_file}", fg="green")

# Database commands
@cli.group()
def populate():
    """Populate SQLite database from processed data."""
    pass

@populate.command()
@click.argument("file_path", type=click.Path(exists=True))
@click.argument("table_name", type=str)
def from_json(file_path: str, table_name: str):
    """
    Populate database table from JSON file. 
    
    FILE_PATH: Path to JSON file with processed data
    TABLE_NAME: Name of the database table to create/populate
    """
    click.secho(f"📊 Loading data from {file_path}...", fg="blue")
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Create documents table
        create_documents_table()
        
        # Extract document metadata for database
        records = []
        for result in data.get('results', []):
            if result.get('valid', False):
                record = {
                    'filename': result['filename'],
                    'type': result['type'],
                    'size': result['size'],
                    'processed_files_count': len(result.get('processed_files', []))
                }
                records.append(record)
        
        if records:
            df = pd.DataFrame(records)
            df.to_sql(name=table_name, con=sqlite3.connect("audit.db"), 
                     if_exists="replace", index=False)
            
            click.secho(f"✅ Inserted {len(records)} records into table '{table_name}'", fg="green")
        else:
            click.secho("⚠️  No valid records found to insert", fg="yellow")
            
    except Exception as e:
        click.secho(f"❌ Error: {e}", fg="red")
        raise click.ClickException(f"Database population failed: {e}")

@populate.command()
@click.argument("csv_path", type=click.Path(exists=True))
@click.argument("table_name", type=str)
def from_csv(csv_path: str, table_name: str):
    """
    Populate database table from CSV file. 
    
    CSV_PATH: Path to CSV file
    TABLE_NAME: Name of the database table to create/populate
    """
    click.secho(f"📊 Loading CSV data from {csv_path}...", fg="blue")
    
    try:
        df = pd.read_csv(csv_path, dtype=str)
        df.to_sql(name=table_name, con=sqlite3.connect("audit.db"), 
                 if_exists="replace", index=False)
        
        click.secho(f"✅ Inserted {len(df)} records into table '{table_name}'", fg="green")
        
    except Exception as e:
        click.secho(f"❌ Error: {e}", fg="red")
        raise click.ClickException(f"CSV import failed: {e}")

# Utility commands
@cli.command()
@click.argument("directory", type=click.Path(exists=True))
@click.option("--checksums", type=click.Path(exists=True), help="JSON file with expected checksums.")
@click.option("--report", type=click.Path(), help="JSON file to write the validation report.")
def validate(directory: str, checksums: str, report: str):
    """
    Validate all documents in a directory.
    """
    directory = pathlib.Path(directory)
    
    if checksums:
        with open(checksums, 'r') as f:
            expected_checksums = json.load(f)
    else:
        expected_checksums = {}

    click.secho(f"🔍 Validating documents in {directory}...", fg="blue")
    
    valid_count = 0
    total_count = 0
    report_data = []
    
    for file_path in directory.iterdir():
        if file_path.is_file():
            total_count += 1
            expected_checksum = expected_checksums.get(file_path.name)
            validation = validate_document_integrity(str(file_path), expected_checksum)
            report_data.append({
                "file": file_path.name,
                "validation": validation
            })
            
            if validation['valid']:
                if expected_checksum and not validation['checksum_match']:
                    click.secho(f"❌ {file_path.name}: Checksum mismatch", fg="red")
                else:
                    click.secho(f"✅ {file_path.name}", fg="green")
                    valid_count += 1
            else:
                error_msg = validation.get('error', 'Invalid file')
                click.secho(f"❌ {file_path.name}: {error_msg}", fg="red")
    
    if report:
        with open(report, 'w') as f:
            json.dump(report_data, f, indent=2)

    click.secho(f"\n📊 Validation Summary:", fg="blue", bold=True)
    click.secho(f"✅ Valid: {valid_count}/{total_count}", fg="green")
    click.secho(f"❌ Invalid: {total_count - valid_count}/{total_count}", fg="red")


if __name__ == '__main__':
    cli()