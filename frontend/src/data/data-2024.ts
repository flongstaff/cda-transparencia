// Carmen de Areco - 2024 Municipal Data

export const debtAnalysis2024 = [
  {
    period: 'Junio 2024',
    documents: [
      '03.01-STOCK-DE-DEUDA-Y-PERFIL-DE-VENCIMIENTOS-Planilla-Modelo-30-6-2024.xlsx',
      '03.01-STOCK-DE-DEUDA-Y-PERFIL-DE-VENCIMIENTOS-Planilla-Modelo-30-6-2024_1.xlsx'
    ],
    format: 'excel',
    type: 'debt_analysis'
  },
  {
    period: 'Septiembre 2024',
    documents: [
      '03.01-STOCK-DE-DEUDA-Y-PERFIL-DE-VENCIMIENTOS-Planilla-Modelo-30-9-2024.pdf',
      '03.01-STOCK-DE-DEUDA-Y-PERFIL-DE-VENCIMIENTOS-Planilla-Modelo-30-9-2024.xlsx'
    ],
    type: 'debt_analysis'
  },
  {
    period: 'Diciembre 2024',
    document: 'STOCK-DE-DEUDA-Y-PERFIL-DE-VENCIMIENTOS-AL-31-12-2024.xlsx',
    format: 'excel',
    type: 'debt_analysis'
  }
];

export const salaryScales2024 = [
  {
    period: 'Febrero 2024',
    document: 'ESCALAS-SALARIALES-FEBRERO-2024.pdf',
    type: 'salary_scale_update'
  },
  {
    period: 'Octubre 2024', 
    document: 'ESCALA-SALARIAL-OCTUBRE-2024.pdf',
    type: 'salary_scale_update'
  }
];

export const quarterlyBudgetExecution2024 = [
  {
    period: 'Marzo 2024',
    categories: [
      'Estado-de-Ejecucion-de-Gastos-por-Caracter-Economico-Marzo.pdf',
      'Estado-de-Ejecucion-de-Gastos-por-Finalidad-y-Funcion-Marzo.pdf',
      'Estado-de-Ejecucion-de-Gastos-por-Fuente-de-Financiamiento-Marzo.pdf',
      'Estado-de-Ejecucion-de-Recursos-por-Caracter-Economico-Marzo.pdf',
      'Estado-de-Ejecucion-de-Recursos-por-Procedencia-Marzo.pdf'
    ]
  },
  {
    period: 'Junio 2024',
    categories: [
      'Estado-de-Ejecucion-de-Gastos-por-Caracter-Economico-Junio.pdf',
      'Estado-de-Ejecucion-de-Gastos-por-Finalidad-y-Funcion-Junio.pdf',
      'Estado-de-Ejecucion-de-Gastos-por-Fuente-de-Financiamiento-Junio.pdf',
      'Estado-de-Ejecucion-de-Recursos-por-Caracter-Economico-Junio.pdf',
      'Estado-de-Ejecucion-de-Recursos-por-Procedencia-Junio.pdf'
    ]
  },
  {
    period: '3er Trimestre 2024',
    categories: [
      'Estado-de-Ejecucion-de-Gastos-por-Caracter-Economico-3er-Trimestres.pdf',
      'Estado-de-Ejecucion-de-Gastos-por-Finalidad-y-Funcion-3er-Trimestres.pdf',
      'Estado-de-Ejecucion-de-Gastos-por-Fuente-de-Financiamiento-3er-Trimestres.pdf',
      'Estado-de-Ejecucion-de-Recursos-por-Caracter-Economico-3er-Trimestre.pdf',
      'Estado-de-Ejecucion-de-Recursos-por-Procedencia-3er-Trimestres.pdf'
    ]
  },
  {
    period: '4to Trimestre 2024',
    categories: [
      'Estado-de-Ejecucion-de-Gastos-por-Caracter-Economico-4to-Trimestre.pdf',
      'Estado-de-Ejecucion-de-Gastos-por-Finalidad-y-Funcion-4toTrimestres.pdf', 
      'Estado-de-Ejecucion-de-Gastos-por-Fuente-de-Financiamiento-4toTrimestres.pdf',
      'Estado-de-Ejecucion-de-Recursos-por-Caracter-Economico-4to-Trimestre.pdf',
      'Estado-de-Ejecucion-de-Recursos-por-Procedencia-4toTrimestres.pdf'
    ]
  }
];

export const genderPerspectiveBudget2024 = [
  {
    period: 'Marzo 2024',
    document: 'Estado-de-Ejecucion-de-Gastos-con-Perspectiva-de-Genero-Marzo.pdf'
  },
  {
    period: 'Junio 2024',
    document: 'Estado-de-Ejecucion-de-Gastos-con-Perspectiva-de-Genero-Junio.pdf'
  },
  {
    period: '3er Trimestre 2024',
    document: 'Estado-de-Ejecucion-de-Gastos-con-Perspectiva-de-Genero-3er-Trimestre.pdf'
  },
  {
    period: '4to Trimestre 2024',
    document: 'Estado-de-Ejecucion-de-Gastos-con-Perspectiva-de-Genero-4to-Trimestre.pdf'
  }
];

export const caifData2024 = [
  {
    period: 'Marzo 2024',
    document: 'Cuenta-Ahorro-Inversion-Financiamiento-Marzo.pdf'
  },
  {
    period: '3er Trimestre 2024',
    document: 'Cuenta-Ahorro-Inversion-Financiamiento-3er-Trimestre.pdf'
  },
  {
    period: '4to Trimestre 2024', 
    document: 'Cuenta-Ahorro-Inversion-Financiamiento-4to-Trimestre.pdf'
  }
];

export const resolutions2024 = [
  {
    number: '466/2024',
    entity: 'Ministerio de Justicia y Derechos Humanos',
    category: 'justice',
    description: 'Resolución de justicia y derechos humanos'
  },
  {
    number: '539/2024',
    entity: 'Ministerio de Infraestructura y Servicios Públicos',
    category: 'infrastructure',
    description: 'Resolución de infraestructura pública'
  },
  {
    number: '867/2024',
    entity: 'Instituto de la Vivienda',
    category: 'housing',
    description: 'Resolución de administración de vivienda',
    duplicates: true // Note: hay dos archivos con el mismo número
  },
  {
    number: '2623/2024',
    entity: 'Instituto de la Vivienda',
    category: 'housing',
    description: 'Resolución de administración de vivienda'
  }
];

export const dispositions2024 = [
  {
    number: '62/2024',
    entity: 'Dirección Provincial de Apoyo y Coordinación Técnico Administrativa del Ministerio de Transporte',
    category: 'transport',
    description: 'Disposición de coordinación técnica en transporte'
  }
];

export const budgetOrdinance2024 = {
  ordinance: 'ORDENANZA-3200-24-PRESUPUESTO-2024.pdf',
  number: '3200/24',
  type: 'municipal_budget',
  description: 'Ordenanza del Presupuesto Municipal 2024',
  approved_date: '2024-01-01'
};