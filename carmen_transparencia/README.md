# Carmen de Areco Transparency Scraper

This very small project lets you gather the *"transparencia"* documents from 
the official `carmendeareco.gob.ar` sites (and optionally
`wayback` or `archive.org`).  
The biggest use-case is to audit the budget and spending of the
municipality.

## Install

```bash
git clone https://github.com/<owner>/carmen_transparencia.git
cd carmen_transparencia
pip install -r requirements.txt
```

## Run

```bash
python -m carmen_transparencia.cli <command> [options] 
```

The commands are explained in the next section.

## Commands

 * `live` – scrape current version, i.e.  
   `python -m carmen_transparencia.cli live`.

 * `wayback` – scrape path from the Wayback machine.

 * `process` – take a folder of downloaded documents and return  
   processed tables / markdown / CSV.

 * `populate` – push processed data into the SQLite database.

## Example

```bash
# 1.  Scrape live and write them to ./data
python -m carmen_transparencia.cli live --output data

# 2.  Produce a JSON / CSV summary
python -m carmen_transparencia.cli process --input data --output report.json

# 3.  Populate the DB
python -m carmen_transparencia.cli populate --file report.json --table documents
```

## Run in Docker

```bash
docker build -t carmen_scrape .
docker run --rm carmen_scrape live --output ./data
```

## Test

```bash
pytest tests/test_cli.py
```

## Future

The code is small and modular – you can add more
options (e.g. API server, dashboard, usage analytics).  
Happy hacking!