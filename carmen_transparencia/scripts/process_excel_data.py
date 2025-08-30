
import pandas as pd
import click
import psycopg2
from psycopg2.extras import execute_values
import re

# Database connection details (replace with your actual configuration)
DB_CONFIG = {
    "host": "localhost",
    "port": 5432,
    "dbname": "transparency_portal_db",
    "user": "postgres",
    "password": ""
}

DATA_CATEGORIES = {
  "SALARIES": 'salaries',
  "EXPENSES": 'operational_expenses',
  "CONTRACTS": 'public_tenders',
  "DEBTS": 'municipal_debt',
  "INVESTMENTS": 'investments_assets',
  "TREASURY": 'treasury_movements',
  "DECLARATIONS": 'property_declarations'
}

def normalize_header(header):
    return re.sub(r'_+', '_', re.sub(r'[^a-z0-9]', '_', header.lower().replace('ñ', 'n'))).strip('_')

@click.command()
@click.argument('file_path', type=click.Path(exists=True))
@click.argument('category')
@click.argument('year')
def process_excel_data(file_path, category, year):
    """Processes an Excel file and saves the data to the database."""
    if category.upper() not in DATA_CATEGORIES:
        click.echo(f"Invalid category: {category}")
        return

    df = pd.read_excel(file_path)
    df.columns = [normalize_header(col) for col in df.columns]
    df['category'] = category
    df['year'] = year
    df['source_file'] = 'excel_import'

    with psycopg2.connect(**DB_CONFIG) as conn:
        with conn.cursor() as cur:
            table_name = f"processed_{DATA_CATEGORIES[category.upper()]}"
            columns = df.columns.tolist()
            query = f"INSERT INTO {table_name} ({', '.join(columns)}) VALUES %s"
            values = [tuple(row) for row in df.itertuples(index=False)]
            execute_values(cur, query, values)
            click.echo(f"Inserted {len(df)} records into {table_name}")

if __name__ == '__main__':
    process_excel_data()
