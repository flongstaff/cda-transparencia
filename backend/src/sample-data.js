// Sample data for testing the backend API
const sampleData = {
  propertyDeclarations: [
    {
      year: 2024,
      official_name: "Juan Pérez",
      role: "Intendente",
      cuil: "20-12345678-9",
      declaration_date: "2024-03-15",
      status: "published",
      uuid: "DDJJ-2024-001",
      observations: "Declaración presentada dentro del plazo establecido",
      public_verification: "Verificada por Contraloría",
      critical_review: "Sin observaciones relevantes"
    },
    {
      year: 2024,
      official_name: "María González",
      role: "Secretaria de Hacienda",
      cuil: "27-87654321-0",
      declaration_date: "2024-03-20",
      status: "published",
      uuid: "DDJJ-2024-002",
      observations: "Declaración presentada dentro del plazo",
      public_verification: "Verificada por Contraloría",
      critical_review: "Bienes inmuebles declarados consistentes con el cargo"
    }
  ],
  
  salaries: [
    {
      year: 2024,
      official_name: "Juan Pérez",
      role: "Intendente",
      basic_salary: 450000.00,
      adjustments: "Ajuste por paritarias 2024: +15%",
      deductions: "SOMA: 3%, IPS: 11%",
      net_salary: 387000.00,
      inflation_rate: 12.5
    },
    {
      year: 2024,
      official_name: "María González",
      role: "Secretaria de Hacienda",
      basic_salary: 320000.00,
      adjustments: "Ajuste por paritarias 2024: +15%",
      deductions: "SOMA: 3%, IPS: 11%",
      net_salary: 275200.00,
      inflation_rate: 12.5
    }
  ],
  
  publicTenders: [
    {
      year: 2024,
      title: "Construcción de nuevo centro comunitario",
      description: "Licitación para la construcción de un centro comunitario en el barrio San Martín",
      budget: 15000000.00,
      awarded_to: "Constructora ABC S.A.",
      award_date: "2024-02-10",
      execution_status: "in_progress",
      delay_analysis: "Sin demoras significativas reportadas"
    },
    {
      year: 2024,
      title: "Reparación de red de agua potable",
      description: "Reparación y mantenimiento de la red de agua potable en zona sur",
      budget: 8500000.00,
      awarded_to: "Servicios Hídricos S.R.L.",
      award_date: "2024-01-25",
      execution_status: "completed",
      delay_analysis: "Finalizado dentro del plazo establecido"
    }
  ],
  
  financialReports: [
    {
      year: 2024,
      quarter: 1,
      report_type: "budget_execution",
      income: 425000000.00,
      expenses: 380000000.00,
      balance: 45000000.00,
      execution_percentage: 92.5
    },
    {
      year: 2024,
      quarter: 2,
      report_type: "budget_execution",
      income: 450000000.00,
      expenses: 410000000.00,
      balance: 40000000.00,
      execution_percentage: 94.2
    }
  ],
  
  treasuryMovements: [
    {
      date: "2024-01-15",
      description: "Ingresos por impuestos municipales",
      category: "revenue",
      amount: 125000000.00,
      balance: 425000000.00,
      debt_tracking: "Sin movimientos de deuda"
    },
    {
      date: "2024-01-20",
      description: "Pago de sueldos personal municipal",
      category: "operational_expenses",
      amount: -85000000.00,
      balance: 340000000.00,
      debt_tracking: "Sin movimientos de deuda"
    }
  ],
  
  feesRights: [
    {
      year: 2024,
      category: "tasas_municipales",
      description: "Recaudación por tasas de servicios municipales",
      revenue: 75000000.00,
      collection_efficiency: 89.5
    },
    {
      year: 2024,
      category: "derechos_urbanos",
      description: "Recaudación por derechos de ocupación y uso del espacio público",
      revenue: 42000000.00,
      collection_efficiency: 92.3
    }
  ],
  
  operationalExpenses: [
    {
      year: 2024,
      category: "sueldos_personal",
      description: "Remuneraciones al personal municipal",
      amount: 280000000.00,
      administrative_analysis: "Dentro del presupuesto aprobado"
    },
    {
      year: 2024,
      category: "mantenimiento_infraestructura",
      description: "Mantenimiento de edificios y espacios públicos",
      amount: 65000000.00,
      administrative_analysis: "Eficiente distribución de recursos"
    }
  ],
  
  municipalDebt: [
    {
      year: 2024,
      debt_type: "prestamo_banco",
      description: "Préstamo para financiamiento de obras públicas",
      amount: 50000000.00,
      interest_rate: 8.5,
      due_date: "2029-06-30",
      status: "active"
    },
    {
      year: 2024,
      debt_type: "anticipo_tesoreria",
      description: "Anticipo de tesorería para cobertura de gastos operativos",
      amount: 15000000.00,
      interest_rate: 12.0,
      due_date: "2024-12-31",
      status: "active"
    }
  ],
  
  investmentsAssets: [
    {
      year: 2024,
      asset_type: "inmueble",
      description: "Edificio municipal sede",
      value: 120000000.00,
      depreciation: 24000000.00,
      location: "Av. Mitre 123, Carmen de Areco"
    },
    {
      year: 2024,
      asset_type: "maquinaria",
      description: "Equipamiento vial y herramientas",
      value: 45000000.00,
      depreciation: 9000000.00,
      location: "Depósito municipal"
    }
  ],
  
  financialIndicators: [
    {
      year: 2024,
      indicator_name: "indice_transparencia",
      value: 8.7,
      description: "Índice de transparencia municipal (escala 1-10)",
      comparison_previous_year: 12.5
    },
    {
      year: 2024,
      indicator_name: "solvencia_financiera",
      value: 1.8,
      description: "Ratio de solvencia (activos totales / pasivos totales)",
      comparison_previous_year: 5.3
    }
  ]
};

module.exports = sampleData;