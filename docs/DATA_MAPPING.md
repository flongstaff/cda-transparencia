# Data Mapping

## Key Entities
- **Budget Execution**: From ESTADO-DE-EJECUCION-DE-GASTOS-*.pdf → JSON fields: year, planned, executed, category (infra, personnel).
- **Tenders/Contracts**: From tenders/*.md → Fields: id (e.g., Lic. N°9), amount, vendor, purpose, linked to execution (e.g., infra spend).
- **Financial Situation**: SITUACION-ECONOMICA-FINANCIERA-*.pdf → Fields: revenues, expenses, debt, quarterly.
- **Inventories**: detailed_inventory.json → Fields: asset, value, year.

## Unified Structure (unified_data_structure.json)
- year: Integer (2017–2025)
- category: String (e.g., "infra", "personnel", "remuneraciones", "bienes de capital")
- planned: Number (ARS)
- executed: Number (ARS)
- execution_rate: Number (percentage)
- source: String (e.g., "pdfs/ESTADO-*.pdf")

## Multi-Year Data Coverage
- 2017-2025: Annual budget vs. execution data
- Quarterly: Trimestral execution reports
- Categories: Personnel (remuneraciones), Infrastructure (bienes de capital), Services, Transfers

## Data Quality Indicators
- Verification status: "verified", "processed", "needs review"
- Source reliability: Official municipal sources, validated through cross-referencing
- Update frequency: Quarterly updates aligned with municipal reporting schedule