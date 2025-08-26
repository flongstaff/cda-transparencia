# Transparency Portal

A comprehensive system for municipal transparency data processing and visualization.

## Installation

To install the package, run the following command in the root of the project:

```bash
pip install .
```

This will install the `transparency-portal` package and its command-line interface.

## Usage

The `transparency-portal` package provides a command-line interface (CLI) to interact with the system.

### Scrape Data

To scrape data from various sources, use the `scrape` subcommand:

```bash
# Scrape the Boletín Oficial
transparency-portal scrape boletin-oficial

# Scrape the official municipal websites
transparency-portal scrape official-site

# Scrape a full website
transparency-portal scrape full-site --base_url https://example.com
```

### Process Data

To process the scraped data, use the `process` subcommand:

```bash
# Process local data files
transparency-portal process local-data <input_dir> <output_dir>

# Process local documents
transparency-portal process local-documents <input_dir> <output_dir>
```

### Populate Database

To populate the database with the processed data, use the `populate` subcommand:

```bash
# Populate the database from a CSV file
transparency-portal populate from-csv <file_path> <table_name>
```

## Contributing

Contributions are welcome! Please read the contributing guidelines before submitting a pull request.
