// FinancialData.test.ts
// Test file to verify financial data structures and service functions

import { FinancialData, RevenueBySource, ExpenditureByProgram, ConsolidatedData } from './FinancialDataService';

// Mock data for testing
const mockFinancialData: FinancialData = {
  year: 2019,
  title: "Informe Económico 2019",
  revenue: {
    total: {
      budgeted: 243511982.00,
      executed: 234125273.85,
      percentage: 96.15
    },
    current: {
      budgeted: 241879702.14,
      executed: 232492993.99,
      percentage: 96.12
    },
    capital: {
      budgeted: 1632279.86,
      executed: 1632279.86,
      percentage: 100.00
    },
    financial_sources: {
      budgeted: 0.00,
      executed: 0.00,
      percentage: 0.00
    },
    discretionary: {
      budgeted: 185792776.35,
      executed: 176406068.20,
      percentage: 95.00
    },
    earmarked: {
      budgeted: 57719205.65,
      executed: 57719205.65,
      percentage: 100.00
    }
  },
  expenditure: {
    total: {
      budgeted: 271899802.33,
      executed: 266210998.09,
      percentage: 97.91
    },
    personnel: {
      budgeted: 115221488.53,
      executed: 115221488.53,
      percentage: 100.00
    },
    consumables: {
      budgeted: 48292633.90,
      executed: 45006222.39,
      percentage: 93.19
    },
    services: {
      budgeted: 66281069.41,
      executed: 64584379.32,
      percentage: 97.44
    },
    capital_goods: {
      budgeted: 30571005.55,
      executed: 29993727.40,
      percentage: 98.11
    },
    transfers: {
      budgeted: 10376925.15,
      executed: 10248500.66,
      percentage: 98.76
    },
    financial_assets: {
      budgeted: 517575.61,
      executed: 517575.61,
      percentage: 100.00
    },
    debt_service: {
      budgeted: 639104.18,
      executed: 639104.18,
      percentage: 100.00
    }
  },
  financial_position: {
    current_assets: {
      budgeted: 0.00,
      executed: 72871274.53,
      percentage: 0.00
    },
    non_current_assets: {
      budgeted: 0.00,
      executed: 127190883.34,
      percentage: 0.00
    },
    current_liabilities: {
      budgeted: 0.00,
      executed: -5669298.76,
      percentage: 0.00
    },
    non_current_liabilities: {
      budgeted: 0.00,
      executed: -1484819.59,
      percentage: 0.00
    }
  },
  financial_result: {
    operating_result: {
      budgeted: 0.00,
      executed: 832790.44,
      percentage: 0.00
    },
    net_result: {
      budgeted: 0.00,
      executed: -14721351.66,
      percentage: 0.00
    }
  }
};

const mockRevenueBySource: RevenueBySource = {
  year: 2019,
  title: "Ingresos por Fuente 2019",
  sources: [
    {
      source: "provincial_participation",
      type: "taxes",
      description: "Participación Impuestos Provinciales",
      budgeted: 0.00,
      executed: 379449.30,
      percentage: 0.00
    },
    {
      source: "property_tax",
      type: "rural",
      description: "Inmobiliario Rural No Afectado",
      budgeted: 0.00,
      executed: 177861.13,
      percentage: 0.00
    }
  ]
};

const mockExpenditureByProgram: ExpenditureByProgram = {
  year: 2019,
  title: "Gastos por Programa 2019",
  programs: [
    {
      program_code: "1110101000-17",
      program_name: "Planificacion y desarrollo de politicas sociales, salu",
      budgeted: 17185446.15,
      executed: 17143446.15,
      paid: 16736420.07
    }
  ]
};

const mockConsolidatedData: ConsolidatedData = {
  metadata: {
    year: 2019,
    title: "Datos Financieros Consolidados 2019",
    last_updated: "2025-09-27",
    source: "Informe Económico 2019"
  },
  summary: {
    revenue: {
      total: {
        budgeted: 243511982.00,
        executed: 234125273.85,
        percentage: 96.15
      },
      current: {
        budgeted: 241879702.14,
        executed: 232492993.99,
        percentage: 96.12
      },
      capital: {
        budgeted: 1632279.86,
        executed: 1632279.86,
        percentage: 100.00
      }
    },
    expenditure: {
      total: {
        budgeted: 271899802.33,
        executed: 266210998.09,
        percentage: 97.91
      },
      personnel: {
        budgeted: 115221488.53,
        executed: 115221488.53,
        percentage: 100.00
      },
      consumables: {
        budgeted: 48292633.90,
        executed: 45006222.39,
        percentage: 93.19
      }
    },
    financial_result: {
      operating_result: {
        executed: 832790.44
      },
      net_result: {
        executed: -14721351.66
      }
    }
  },
  revenue_by_source: [
    {
      source: "provincial_participation",
      description: "Participación Impuestos Provinciales",
      executed: 379449.30
    }
  ],
  top_expenditure_programs: [
    {
      program_name: "Servicios Urbanos",
      executed: 61327344.23
    }
  ]
};

// Test data structures
console.log("Testing Financial Data Structures:");
console.log("Financial Data:", mockFinancialData);
console.log("Revenue by Source:", mockRevenueBySource);
console.log("Expenditure by Program:", mockExpenditureByProgram);
console.log("Consolidated Data:", mockConsolidatedData);

export {
  mockFinancialData,
  mockRevenueBySource,
  mockExpenditureByProgram,
  mockConsolidatedData
};