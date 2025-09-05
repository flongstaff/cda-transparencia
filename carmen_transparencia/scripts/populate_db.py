
import json
import click
import psycopg2
from psycopg2.extras import execute_values

# Database connection details (replace with your actual configuration)
DB_CONFIG = {
    "host": "localhost",
    "port": 5432,
    "dbname": "transparency_portal_db",
    "user": "postgres",
    "password": ""
}

@click.command()
@click.argument('json_file', type=click.Path(exists=True))
def populate_db(json_file):
    """Populates the database from a JSON file."""
    with open(json_file, 'r') as f:
        data = json.load(f)

    with psycopg2.connect(**DB_CONFIG) as conn:
        with conn.cursor() as cur:
            # I will not create tables here, as they should be created by the backend models.
            # This script will only insert data into the tables.

            for table_name, records in data.items():
                if records:
                    # The table name in the JSON file is in camelCase, but the table names
                    # in the database are in snake_case. I need to convert the table name.
                    table_name_snake_case = ''.join(['_' + c.lower() if c.isupper() else c for c in table_name]).lstrip('_') + 's'

                    columns = records[0].keys()
                    query = f"INSERT INTO {table_name_snake_case} ({', '.join(columns)}) VALUES %s"
                    values = [[record[column] for column in columns] for record in records]
                    execute_values(cur, query, values)
                    click.echo(f"Inserted {len(records)} records into {table_name_snake_case}")

if __name__ == '__main__':
    populate_db()
