"""
This module contains the command-line interface for the transparency portal.
"""

import asyncio
import click
from .data_extraction import scrape_boletin_oficial, scrape_official_site, scrape_full_site
from .processing import (
    analyze_excel_file,
    check_csv_columns,
    convert_to_markdown,
    detect_anomalies,
    analyze_budget_data,
    process_local_data,
    process_local_documents,
)
from .database import (
    populate_from_csv,
    create_document_registry,
    expand_database_full_period,
    populate_from_preserved,
    populate_existing_data,
    populate_fees_rights,
)

@click.group()
def cli():
    """A command-line interface for the transparency portal."""
    pass

# Scrape subcommand
@cli.group()
def scrape():
    """Scrape data from various sources."""
    pass

@scrape.command()
@click.option('--base_url', default='https://www.boletinoficial.gob.ar/', help='The base URL of the Boletín Oficial.')
@click.option('--storage_dir', default='cold_storage', help='The directory to store the scraped data.')
def boletin_oficial(base_url: str, storage_dir: str):
    """Scrape the Boletín Oficial."""
    click.echo("Scraping the Boletín Oficial...")
    scrape_boletin_oficial(base_url, storage_dir)
    click.echo("Done.")

@scrape.command()
def official_site():
    """Scrape the official municipal websites."""
    click.echo("Scraping the official municipal websites...")
    asyncio.run(scrape_official_site())
    click.echo("Done.")

@scrape.command()
@click.option('--base_url', default='https://carmendeareco.gob.ar/transparencia/', help='The base URL of the website to scrape.')
@click.option('--storage_dir', default='cold_storage', help='The directory to store the scraped data.')
@click.option('--max_depth', default=3, help='The maximum depth for the crawler.')
def full_site(base_url: str, storage_dir: str, max_depth: int):
    """Scrape a full website."""
    click.echo(f"Scraping the full site at {base_url}...")
    asyncio.run(scrape_full_site(base_url, storage_dir, max_depth))
    click.echo("Done.")

# Process subcommand
@cli.group()
def process():
    """Process the scraped data."""
    pass

@process.command()
@click.argument('input_dir')
@click.argument('output_dir')
def local_data(input_dir: str, output_dir: str):
    """Process local data files."""
    click.echo(f"Processing local data from {input_dir}...")
    process_local_data(input_dir, output_dir)
    click.echo("Done.")

@process.command()
@click.argument('input_dir')
@click.argument('output_dir')
def local_documents(input_dir: str, output_dir: str):
    """Process local documents."""
    click.echo(f"Processing local documents from {input_dir}...")
    process_local_documents(input_dir, output_dir)
    click.echo("Done.")

# Populate subcommand
@cli.group()
def populate():
    """Populate the database with the processed data."""
    pass

@populate.command()
@click.argument('file_path')
@click.argument('table_name')
def from_csv(file_path: str, table_name: str):
    """Populate the database from a CSV file."""
    click.echo(f"Populating the database from {file_path}...")
    populate_from_csv(file_path, table_name)
    click.echo("Done.")

if __name__ == '__main__':
    cli()
