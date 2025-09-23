const year = 2022;
const municipality = "Carmen de Areco";
const data_sources = { "caif": { "type": "financial_planning", "description": "Cuenta de Ahorro, Inversión y Financiamiento", "quarters": ["Q1", "Q2", "Q3", "Q4"], "documents": ["CAIF-1", "CAIF-2", "CAIF-3°TRI-2022", "CAIF-4°TRE-2022"] }, "budget_execution": { "type": "budget_execution", "description": "Estados de Ejecución Presupuestaria", "categories": [{ "name": "Gastos por Finalidad y Función", "quarters": ["Q1", "Q3", "Q4"], "documents": ["ESTADO-DE-EJECUCION-DE-GASTOS-POR-FINALIDAD-Y-FUNCION-1.pdf", "ESTADO-DE-EJECUCION-DE-GASTOS-POR-FINALIDAD-Y-FUNCION-4°TRE-2022.pdf"] }, { "name": "Gastos por Carácter Económico", "quarters": ["Q1", "Q3", "Q4"], "documents": ["ESTADO-DE-EJECUCION-DE-GASTOS-POR-CARACTER-ECONOMICO-1.pdf", "ESTADO-DE-EJECUCION-DE-GASTOS-POR-CARACTER-ECONOMICO-4°TRE-2022.pdf"] }, { "name": "Recursos por Procedencia", "quarters": ["Q1", "Q3", "Q4"], "documents": ["ESTADO-DE-EJECUCION-DE-RECURSOS-POR-PROCEDENCIA-1.pdf", "ESTADO-DE-EJECUCION-DE-RECURSOS-POR-PROCEDENCIA-4°TRE-2022.pdf"] }] }, "statistics": { "type": "municipal_statistics", "description": "Estadísticas y Reportes Municipales", "areas": [{ "name": "Mujeres y Diversidades", "document": "ESTADISTICA MUJERES Y DIVERSIDADES 2022.pdf", "type": "demographic_analysis" }, { "name": "CAPS", "document": "ESTADISTICAS CAPS 2022.pdf", "type": "health_services" }, { "name": "Habilitaciones Municipales", "document": "HABILITACIONES MUNICIPALES 2022.pdf", "type": "municipal_permits" }, { "name": "Seguridad Urbana", "document": "SEGURIDAD URBANA 2022.pdf", "type": "public_safety" }, { "name": "OMIC", "document": "OMIC 2022.pdf", "type": "consumer_protection" }] }, "resolutions": { "type": "administrative_resolutions", "description": "Resoluciones Administrativas", "total": 5, "entities": ["Instituto de la Vivienda", "Ministerio de Producción, Ciencia e Innovación Tecnológica", "Ministerio de Salud", "Ministerio de Infraestructura y Servicios Públicos"], "documents": ["79/2022", "747/2022", "1146/2022", "1279/2022", "1593/2022"] }, "municipal_services": { "type": "public_services", "description": "Servicios Municipales y Monitoreo", "services": [{ "name": "Servicios Públicos", "document": "SERVICIOS PUBLICOS 2022.pdf" }, { "name": "Monitoreo Municipal", "documents": ["MONITOREO 2022.pdf", "NOTAS MONITOREO 2022.pdf"] }, { "name": "Reportes Ciudadanos", "document": "REPORTES CIUDADANOS 2022.pdf" }] }, "gender_perspective": { "type": "gender_budget", "description": "Gastos con Perspectiva de Género", "quarters": ["Q3", "Q4"], "documents": ["ESTADO-DE-EJECUCION-DE-GASTOS-CON-PERSPECTIVA-DE-GENERO-2.pdf", "ESTADO-DE-EJECUCION-DE-GASTOS-CON-PERSPECTIVA-DE-GENERO-3°TRIMESTRE.pdf"] } };
const total_documents = 23;
const live_data_sources = { "api_endpoints": { "gastos_endpoint": "/api/gastos?year=2022", "recursos_endpoint": "/api/ingresos?year=2022", "caif_endpoint": "/api/caif?year=2022", "estadisticas_endpoint": "/api/estadisticas?year=2022" }, "web_sources": { "transparencia_portal": "https://carmendeareco.gob.ar/transparencia?year=2022", "wayback_archive": "https://web.archive.org/web/20220000000000*/https://carmendeareco.gob.ar/transparencia/" } };
const markdown_documentation = { "data_sources": "/docs/DATA_SOURCES.md", "financial_analysis": "/docs/FINANCIAL_ANALYSIS_GUIDE.md", "audit_system": "/docs/AUDIT_SYSTEM_README.md" };
const services_integration = { "recommended_services": ["FinancialDataService", "YearlyDataService", "DataValidationService", "MarkdownDataService"], "api_service": "ApiService", "real_time": false, "caching": true };
const last_updated = "2022-12-31";
const data_index_2022 = {
  year,
  municipality,
  data_sources,
  total_documents,
  live_data_sources,
  markdown_documentation,
  services_integration,
  last_updated
};
export {
  data_sources,
  data_index_2022 as default,
  last_updated,
  live_data_sources,
  markdown_documentation,
  municipality,
  services_integration,
  total_documents,
  year
};
