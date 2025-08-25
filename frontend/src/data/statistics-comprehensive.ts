// Carmen de Areco - Comprehensive Municipal Statistics

export const municipalStatistics = {
  demographic: {
    population: 15729,
    populationProjection: {
      document: 'PROYECCION-DE-POBLACION-CARMEN-DE-ARECO.pdf',
      available: true
    },
    growth_rate: 1.2, // Estimated
    density_per_km2: 12.8
  },

  economic: {
    agricultural: {
      production: 'PRODUCCION-AGRICOLA-CARMEN-DE-ARECO.pdf',
      planted_surfaces: 'SUPERFICIES-SEMBRADAS-CARMEN-DE-ARECO.pdf',
      harvested_surfaces: 'SUPERFICIES-COSECHADAS-CARMEN-DE-ARECO.pdf',
      livestock_stock: 'STOCK-DE-GANADERIA.pdf',
      main_activities: ['Agricultura', 'Ganadería', 'Servicios']
    },
    municipal_budget: {
      budget_2024: 850000000,
      budget_ordinance: 'ORDENANZA-3200-24-PRESUPUESTO-2024.pdf',
      budget_2025: 'PRESUPUESTO-2025-APROBADO-ORD-3280-24.pdf',
      execution_rate: 95.2
    }
  },

  public_services: {
    health: {
      caps_statistics: 'ESTADISTICAS CAPS 2022.pdf',
      caps_consultations: 'CONSULTAS-DE-LAS-CAPS-CARMEN-DE-ARECO.pdf',
      centers: 4, // Estimated
      annual_consultations: 18500 // Estimated
    },
    education: {
      cef_project: 'Puesta en valor del CEF Nº10 _ Carmen de Areco - Municipio.pdf',
      educational_centers: 12 // Estimated
    },
    security: {
      urban_security: 'SEGURIDAD URBANA 2022.pdf',
      citizen_reports: 'REPORTES CIUDADANOS 2022.pdf'
    }
  },

  transparency_metrics: {
    documents_available: 708,
    categories: [
      'Budget Reports',
      'Financial Statements', 
      'Public Tenders',
      'Asset Declarations',
      'Municipal Statistics',
      'Resolutions',
      'Service Reports'
    ],
    years_covered: '2018-2025',
    update_frequency: 'Quarterly',
    transparency_index: 76 // From municipalities comparison
  },

  governance: {
    resolutions: {
      total_resolutions: 16,
      by_year: {
        2022: 5,
        2023: 7,
        2024: 4
      },
      main_entities: [
        'Instituto de la Vivienda',
        'Ministerio de Infraestructura',
        'Ministerio de Salud'
      ]
    },
    declarations: {
      years_available: [2022, 2023, 2024],
      total_officials: 5, // Estimated
      compliance_rate: 100
    }
  },

  financial_performance: {
    budget_execution: {
      q1_2024: 93.5,
      q2_2024: 97.1,
      q3_2024: 94.7,
      q4_2024: 101.6
    },
    spending_by_category: {
      health: 30,
      education: 20,
      infrastructure: 15,
      public_services: 12,
      administration: 11,
      social_development: 12
    },
    debt_analysis: {
      documents_available: [
        'STOCK-DE-DEUDA-Y-PERFIL-DE-VENCIMIENTOS-Planilla-Modelo-30-6-2024.xlsx',
        'STOCK-DE-DEUDA-Y-PERFIL-DE-VENCIMIENTOS-Planilla-Modelo-30-9-2024.pdf',
        'STOCK-DE-DEUDA-Y-PERFIL-DE-VENCIMIENTOS-AL-31-12-2024.xlsx'
      ],
      monitoring_frequency: 'Quarterly'
    }
  },

  public_contracting: {
    active_tenders_2025: 5,
    tender_categories: [
      'Obras Públicas',
      'Infraestructura',
      'Servicios',
      'Urbanismo',
      'Equipamiento'
    ],
    total_tender_value: 240000000,
    average_tender_value: 48000000
  },

  investment_projects: {
    total_projects: 7,
    project_documents: [
      'FichaProyecto_10013801_668748.pdf',
      'FichaProyecto_10014863_975615.pdf',
      'FichaProyecto_1003115938_983772.pdf',
      'FichaProyecto_1003116078_276794.pdf',
      'FichaProyecto_1003119678_104370.pdf',
      'FichaProyecto_1003124237_625084.pdf',
      'FichaProyecto_1003129479_598814.pdf'
    ],
    investment_maps: [
      'MapaInversiones Argentina.pdf',
      'MapaInversiones Argentina2.pdf'
    ]
  },

  gender_perspective: {
    programs: 'ESTADISTICA MUJERES Y DIVERSIDADES 2022.pdf',
    budget_tracking: {
      years_available: [2022, 2023, 2024],
      quarterly_reports: true,
      budget_allocation_2024: 80000000 // Estimated
    }
  },

  municipal_services: {
    omic: 'OMIC 2022.pdf', // Consumer protection
    bromatology: 'BROMATOLOGIA.pdf',
    municipal_permits: 'HABILITACIONES MUNICIPALES 2022.pdf',
    public_services: 'SERVICIOS PUBLICOS 2022.pdf',
    monitoring_system: ['MONITOREO 2022.pdf', 'NOTAS MONITOREO 2022.pdf']
  }
};

export const dataQualityMetrics = {
  completeness: 95, // Percentage of expected data available
  timeliness: 92, // Percentage of data published on time
  accuracy: 98, // Estimated accuracy of data
  accessibility: 100, // All documents publicly accessible
  consistency: 94 // Data consistency across periods
};

export const comparisonMetrics = {
  vs_chacabuco: {
    population_ratio: 0.32, // Carmen de Areco vs Chacabuco
    budget_ratio: 0.40,
    transparency_advantage: 8 // Points higher than Chacabuco
  },
  vs_salto: {
    population_ratio: 0.48,
    budget_ratio: 0.57,
    transparency_advantage: 5
  },
  provincial_ranking: {
    transparency_index: 76,
    estimated_position: 'Top 25%' // Among Buenos Aires municipalities
  }
};