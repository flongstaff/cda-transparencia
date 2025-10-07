# National Catalog Integration

## Summary

Successfully integrated the Argentina national open data catalog with Carmen de Areco municipal datasets.

## Statistics

- **Municipal datasets**: 22
- **National datasets**: 1,191
- **Total datasets**: 1,213
- **Themes**: 13

## Updated Files

All three catalog files have been updated with the merged data:

1. [`data/data.json`](data/data.json) - 21MB
2. [`data/main.json`](data/main.json) - 21MB
3. [`public/main-data.json`](public/main-data.json) - 21MB

## Catalog Structure

The merged catalog follows the DCAT standard and includes:

- **Municipal datasets** - Tagged with `source: "municipal"` and `spatial: "Carmen de Areco, Buenos Aires, Argentina"`
- **National datasets** - Tagged with `source: "national"` from datos.gob.ar

## Themes Available

1. Agroganadería, pesca y forestación (agri)
2. Asuntos internacionales (intr)
3. Ciencia y tecnología (tech)
4. Economía y finanzas (econ)
5. Educación, cultura y deportes (educ)
6. Energía (ener)
7. Gobierno y sector público (gove)
8. Justicia, seguridad y legales (just)
9. Medio ambiente (envi)
10. Población y sociedad (soci)
11. Regiones y ciudades (regi)
12. Salud (heal)
13. Transporte (tran)

## Data Source

- **National catalog**: https://datos.gob.ar/data.json
- **Municipal data**: Carmen de Areco transparency portal

## Usage

The merged catalog can be used to:

- Filter datasets by source (municipal vs national)
- Browse all available open data from Carmen de Areco and Argentina
- Access datasets by theme/topic
- Query datasets programmatically via the DCAT-compliant JSON structure

## Script

The merge was performed using [`scripts/merge-national-catalog.js`](scripts/merge-national-catalog.js)

To re-run the merge:

```bash
# Download latest national catalog
curl -s "https://datos.gob.ar/data.json" -o /tmp/datos_gob_ar_catalog.json

# Run merge script
node scripts/merge-national-catalog.js
```
