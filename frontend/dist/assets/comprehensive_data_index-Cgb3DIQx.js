const year = 2024;
const municipality = "Carmen de Areco";
const generated_at = "2025-01-10T15:30:00Z";
const financialOverview = { "totalBudget": 2847523e3, "totalExecuted": 2434895e3, "totalRevenue": 2847523e3, "totalDebt": 15643e4, "totalSalaries": 1425e6, "totalContracts": 387425e3, "executionRate": 85.5 };
const budgetBreakdown = [{ "name": "Personal", "budgeted": 15e8, "executed": 1425e6, "execution_rate": 95, "category": "Gastos Corrientes" }, { "name": "Servicios Públicos", "budgeted": 45e7, "executed": 387425e3, "execution_rate": 86.1, "category": "Servicios" }, { "name": "Obras Públicas", "budgeted": 32e7, "executed": 28544e4, "execution_rate": 89.2, "category": "Capital" }, { "name": "Salud y Acción Social", "budgeted": 28e7, "executed": 24235e4, "execution_rate": 86.5, "category": "Servicios Sociales" }, { "name": "Educación y Cultura", "budgeted": 18e7, "executed": 16452e4, "execution_rate": 91.4, "category": "Servicios Sociales" }, { "name": "Seguridad", "budgeted": 117523e3, "executed": 10116e4, "execution_rate": 86.1, "category": "Servicios Públicos" }];
const documents = [{ "id": "doc_2024_001", "title": "Presupuesto Municipal 2024", "category": "Presupuesto", "type": "Ordenanza", "date": "2024-01-15", "file_size": 2.5, "verified": true, "description": "Ordenanza presupuestaria para el ejercicio 2024" }, { "id": "doc_2024_002", "title": "Ejecución Presupuestaria - 1er Trimestre", "category": "Ejecución", "type": "Informe", "date": "2024-03-31", "file_size": 1.8, "verified": true, "description": "Estado de ejecución del presupuesto al primer trimestre" }, { "id": "doc_2024_003", "title": "Escalas Salariales 2024", "category": "Recursos Humanos", "type": "Resolución", "date": "2024-02-15", "file_size": 1.2, "verified": true, "description": "Escalas salariales actualizadas para personal municipal" }, { "id": "doc_2024_004", "title": "Análisis de Deuda Municipal", "category": "Finanzas", "type": "Informe", "date": "2024-06-30", "file_size": 0.9, "verified": true, "description": "Análisis del stock de deuda municipal" }, { "id": "doc_2024_005", "title": "Licitaciones Públicas", "category": "Contrataciones", "type": "Licitación", "date": "2024-08-15", "file_size": 3.2, "verified": true, "description": "Procesos de licitación pública para obras municipales" }];
const dashboard = { "transparency_score": 87, "document_compliance": 92, "financial_health": 85, "recent_financial_movements": [{ "description": "Ingresos Tributarios", "amount": 85e6, "type": "income", "balance": 85e6, "date": "2024-09-01" }, { "description": "Gastos en Personal", "amount": -42e6, "type": "expense", "balance": 43e6, "date": "2024-09-01" }, { "description": "Ingresos No Tributarios", "amount": 28e6, "type": "income", "balance": 71e6, "date": "2024-09-02" }, { "description": "Servicios Públicos", "amount": -185e5, "type": "expense", "balance": 525e5, "date": "2024-09-03" }, { "description": "Coparticipación", "amount": 45e6, "type": "income", "balance": 975e5, "date": "2024-09-05" }, { "description": "Obras Públicas", "amount": -32e6, "type": "expense", "balance": 655e5, "date": "2024-09-10" }] };
const spendingEfficiency = { "overall_score": 85.5, "categories": [{ "name": "Personal", "efficiency": 95, "budget": 15e8, "spent": 1425e6 }, { "name": "Obras Públicas", "efficiency": 89.2, "budget": 32e7, "spent": 28544e4 }, { "name": "Servicios", "efficiency": 86.1, "budget": 45e7, "spent": 387425e3 }] };
const auditOverview = { "total_audits": 4, "completed": 3, "pending": 1, "findings": { "high": 0, "medium": 2, "low": 1 }, "compliance_rate": 94.5 };
const antiCorruption = { "transparency_index": 87, "open_data_score": 92, "citizen_participation": 78, "accountability_measures": 85 };
const analysis = { "salaryData": { "year": 2024, "month": 9, "moduleValue": 45e3, "totalPayroll": 1425e5, "employeeCount": 265, "positions": [{ "code": "ADM-001", "name": "Administrativo Categoría A", "category": "Personal Administrativo", "modules": 8.5, "grossSalary": 382500, "somaDeduction": 15300, "ipsDeduction": 38250, "netSalary": 328950, "employeeCount": 25 }, { "code": "ADM-002", "name": "Administrativo Categoría B", "category": "Personal Administrativo", "modules": 7.2, "grossSalary": 324e3, "somaDeduction": 12960, "ipsDeduction": 32400, "netSalary": 278640, "employeeCount": 35 }, { "code": "OPE-001", "name": "Operario Municipal A", "category": "Personal de Mantenimiento", "modules": 6.8, "grossSalary": 306e3, "somaDeduction": 12240, "ipsDeduction": 30600, "netSalary": 263160, "employeeCount": 45 }, { "code": "OPE-002", "name": "Operario Municipal B", "category": "Personal de Mantenimiento", "modules": 5.9, "grossSalary": 265500, "somaDeduction": 10620, "ipsDeduction": 26550, "netSalary": 228330, "employeeCount": 38 }, { "code": "SAL-001", "name": "Enfermero/a", "category": "Personal de Salud", "modules": 9.2, "grossSalary": 414e3, "somaDeduction": 16560, "ipsDeduction": 41400, "netSalary": 356040, "employeeCount": 18 }, { "code": "SAL-002", "name": "Médico/a", "category": "Personal de Salud", "modules": 12.5, "grossSalary": 562500, "somaDeduction": 22500, "ipsDeduction": 56250, "netSalary": 483750, "employeeCount": 8 }, { "code": "DOC-001", "name": "Maestro/a", "category": "Personal Docente", "modules": 8.8, "grossSalary": 396e3, "somaDeduction": 15840, "ipsDeduction": 39600, "netSalary": 340560, "employeeCount": 32 }, { "code": "FUN-001", "name": "Secretario Municipal", "category": "Funcionarios", "modules": 18, "grossSalary": 81e4, "somaDeduction": 32400, "ipsDeduction": 81e3, "netSalary": 696600, "employeeCount": 4 }, { "code": "FUN-002", "name": "Director de Área", "category": "Funcionarios", "modules": 15.2, "grossSalary": 684e3, "somaDeduction": 27360, "ipsDeduction": 68400, "netSalary": 588240, "employeeCount": 6 }, { "code": "SER-001", "name": "Chofer", "category": "Personal de Servicios", "modules": 6.5, "grossSalary": 292500, "somaDeduction": 11700, "ipsDeduction": 29250, "netSalary": 251550, "employeeCount": 22 }, { "code": "SER-002", "name": "Personal de Limpieza", "category": "Personal de Servicios", "modules": 5.5, "grossSalary": 247500, "somaDeduction": 9900, "ipsDeduction": 24750, "netSalary": 212850, "employeeCount": 32 }] } };
const consistency_check = { "documents_expected": 25, "documents_received": 23, "data_complete": true };
const data_sources = { "debt_analysis": { "type": "debt_management", "description": "Análisis de Deuda y Perfil de Vencimientos", "periods": ["Junio", "Septiembre", "Diciembre"], "documents": [] }, "salary_scales": { "type": "salary_scale_update", "description": "Escalas Salariales Actualizadas", "updates": ["Febrero", "Octubre"], "documents": [] }, "quarterly_budget_execution": { "type": "quarterly_execution", "description": "Ejecución Presupuestaria Trimestral Detallada", "quarters": ["Marzo", "Junio", "3er Trimestre", "4to Trimestre"], "documents": [] }, "gender_perspective_budget": { "type": "gender_budget", "description": "Ejecución de Gastos con Perspectiva de Género", "quarters": ["Marzo", "Junio", "3er Trimestre", "4to Trimestre"], "documents": [] } };
const summary = { "total_documents": 42, "formats": { "pdf": 35, "excel": 7 }, "categories": { "debt_analysis": 5, "salary_scales": 2, "quarterly_execution": 20, "gender_perspective": 4, "caif": 3, "resolutions": 4, "dispositions": 1, "budget_ordinance": 1 } };
const comprehensive_data_index = {
  year,
  municipality,
  generated_at,
  financialOverview,
  budgetBreakdown,
  documents,
  dashboard,
  spendingEfficiency,
  auditOverview,
  antiCorruption,
  analysis,
  consistency_check,
  data_sources,
  summary
};
export {
  analysis,
  antiCorruption,
  auditOverview,
  budgetBreakdown,
  consistency_check,
  dashboard,
  data_sources,
  comprehensive_data_index as default,
  documents,
  financialOverview,
  generated_at,
  municipality,
  spendingEfficiency,
  summary,
  year
};
