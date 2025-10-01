/**
 * Spanish translations for chart types and descriptions
 * Localization for the Carmen de Areco Transparency Portal
 */

// Spanish mapping chart types to human-readable names
export const CHART_TYPE_NAMES_ES: Record<string, string> = {
  'Budget_Execution': 'Ejecución Presupuestaria',
  'Debt_Report': 'Informe de Deuda',
  'Economic_Report': 'Informe Económico',
  'Education_Data': 'Datos Educativos',
  'Expenditure_Report': 'Informe de Gastos',
  'Financial_Reserves': 'Reservas Financieras',
  'Fiscal_Balance_Report': 'Balance Fiscal',
  'Health_Statistics': 'Estadísticas de Salud',
  'Infrastructure_Projects': 'Proyectos de Infraestructura',
  'Investment_Report': 'Informe de Inversiones',
  'Personnel_Expenses': 'Gastos en Personal',
  'Revenue_Report': 'Informe de Ingresos',
  'Revenue_Sources': 'Fuentes de Ingresos',
  'Quarterly_Execution': 'Ejecución Trimestral',
  'Programmatic_Performance': 'Rendimiento Programático',
  'Gender_Budgeting': 'Presupuesto de Género',
  'Waterfall_Execution': 'Ejecución en Cascada'
};

// Spanish mapping chart types to descriptions
export const CHART_TYPE_DESCRIPTIONS_ES: Record<string, string> = {
  'Budget_Execution': 'Muestra cómo se ejecutó el presupuesto municipal a lo largo del tiempo, comparando lo planificado vs lo ejecutado',
  'Debt_Report': "Detalla las obligaciones de deuda del municipio, tasas de interés y cronogramas de pago",
  'Economic_Report': 'Proporciona indicadores económicos generales para el municipio',
  'Education_Data': 'Rastrea estadísticas educativas, matrícula escolar y gastos en educación',
  'Expenditure_Report': 'Desglose detallado de los gastos municipales por categoría',
  'Financial_Reserves': 'Información sobre reservas financieras y fondos de contingencia',
  'Fiscal_Balance_Report': 'Muestra el balance fiscal (ingresos menos gastos) a lo largo del tiempo',
  'Health_Statistics': 'Estadísticas de salud, datos de centros de salud y gastos médicos',
  'Infrastructure_Projects': 'Detalles de proyectos de infraestructura importantes y su avance',
  'Investment_Report': 'Actividades de inversión y proyectos de gasto de capital',
  'Personnel_Expenses': 'Costos de personal incluyendo salarios, beneficios y niveles de contratación',
  'Revenue_Report': 'Desglose detallado de las fuentes de ingresos municipales',
  'Revenue_Sources': 'Análisis de diferentes corrientes de ingresos y sus contribuciones',
  'Quarterly_Execution': 'Tendencias trimestrales en la ejecución del presupuesto con visualización combinada',
  'Programmatic_Performance': 'Métricas de rendimiento para programas municipales clave e iniciativas',
  'Gender_Budgeting': 'Análisis de perspectiva de género en el presupuestamiento y personal municipal',
  'Waterfall_Execution': 'Visualización acumulativa de la ejecución del presupuesto a través de períodos'
};

// Spanish axis labels for charts
export const AXIS_LABELS_ES: Record<string, string> = {
  'quarter': 'Trimestre',
  'year': 'Año',
  'budgeted': 'Presupuestado',
  'executed': 'Ejecutado',
  'execution_rate': 'Tasa de Ejecución',
  'revenue_percentage': 'Porcentaje de Ingresos',
  'expenditure_percentage': 'Porcentaje de Gastos',
  'amount': 'Monto',
  'percentage': 'Porcentaje',
  'value': 'Valor'
};

export default {
  CHART_TYPE_NAMES_ES,
  CHART_TYPE_DESCRIPTIONS_ES,
  AXIS_LABELS_ES
};