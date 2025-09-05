// Carmen de Areco - Comprehensive Document Sources Integration

export interface DocumentSource {
  document: string;
  sources: {
    local?: string;
    web_archive?: string[];
    official_website?: string;
    backup_locations?: string[];
  };
  verified: boolean;
  last_updated?: string;
  checksum?: string;
}

export const documentSources: DocumentSource[] = [
  // Budget Execution Documents
  {
    document: 'Estado-de-Ejecucion-de-Gastos-3er-Trimestres.pdf',
    sources: {
      local: '/data/pdf_extracts/2023/Estado-de-Ejecucion-de-Gastos-3er-Trimestres.pdf',
      web_archive: [
        '/data/pdf_extracts/web_archives/web_archive/carmendeareco.gob.ar_transparencia/snapshot_20241111014916/',
        '/data/pdf_extracts/web_archives/web_archive/carmendeareco.gob.ar_transparencia/snapshot_20241212115813/'
      ],
      official_website: 'https://carmendeareco.gob.ar/transparencia/',
      backup_locations: [
        '/data/pdf_extracts/financial_data/',
        '/data/pdf_extracts/general/'
      ]
    },
    verified: true,
    last_updated: '2024-12-12'
  },
  {
    document: 'LICITACION-PUBLICA-N°10.pdf',
    sources: {
      local: '/data/pdf_extracts/2025/LICITACION-PUBLICA-N°10.pdf',
      web_archive: [
        '/data/pdf_extracts/web_archives/web_archive/carmendeareco.gob.ar_transparencia/snapshot_20241111014916/'
      ],
      official_website: 'https://carmendeareco.gob.ar/transparencia/',
      backup_locations: [
        '/data/pdf_extracts/tenders/',
        '/data/pdf_extracts/financial_data/'
      ]
    },
    verified: true,
    last_updated: '2024-11-11'
  },
  {
    document: 'ORDENANZA-3200-24-PRESUPUESTO-2024.pdf',
    sources: {
      local: '/data/pdf_extracts/2024/ORDENANZA-3200-24-PRESUPUESTO-2024.pdf',
      official_website: 'https://carmendeareco.gob.ar/transparencia/',
      backup_locations: [
        '/data/pdf_extracts/financial_data/'
      ]
    },
    verified: true,
    last_updated: '2024-01-01'
  },
  {
    document: 'MODULO-FISCAL.xlsx',
    sources: {
      local: '/data/pdf_extracts/2023/MODULO-FISCAL.xlsx',
      web_archive: [
        '/data/pdf_extracts/web_archives/web_archive/carmendeareco.gob.ar_transparencia/snapshot_20241111014916/'
      ],
      official_website: 'https://carmendeareco.gob.ar/transparencia/'
    },
    verified: true,
    last_updated: '2023-12-31'
  }
];

export const webArchiveSnapshots = {
  carmendeareco_transparencia: [
    {
      date: '2024-11-11T01:49:16Z',
      path: '/data/pdf_extracts/web_archives/web_archive/carmendeareco.gob.ar_transparencia/snapshot_20241111014916/',
      documents: 89,
      size: '2.1GB',
      verified: true
    },
    {
      date: '2024-12-12T11:58:13Z', 
      path: '/data/pdf_extracts/web_archives/web_archive/carmendeareco.gob.ar_transparencia/snapshot_20241212115813/',
      documents: 7,
      size: '156MB',
      verified: true,
      type: 'incremental_update'
    }
  ],
  alternative_archive: [
    {
      date: '2024-11-11T01:49:16Z',
      path: '/data/pdf_extracts/web_archives/web_archive_carmendeareco/snapshot_20241111014916/',
      documents: 36,
      size: '890MB',
      verified: true,
      type: 'partial_mirror'
    }
  ]
};

export const externalDataSources = {
  official_website: {
    url: 'https://carmendeareco.gob.ar/transparencia/',
    status: 'active',
    last_checked: '2025-01-22',
    document_categories: [
      'Cuentas Públicas',
      'Ejecución Presupuestaria',
      'Ordenanzas Fiscales e Impositivas',
      'Licitaciones y Concursos',
      'Recursos Humanos',
      'Escalas Salariales',
      'Declaraciones Patrimoniales'
    ],
    update_frequency: 'quarterly',
    reliability: 'high'
  },
  wayback_machine: {
    url: 'https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/',
    available_snapshots: 'multiple',
    earliest_capture: '2020-03-15',
    latest_capture: '2024-12-12',
    reliability: 'medium'
  },
  provincial_systems: {
    boletines_oficiales: 'https://www.gba.gob.ar/portal/boletines/',
    sistema_normativo: 'Sistema de Información Normativa y Documental Malvinas Argentinas',
    reliability: 'high'
  }
};

export const documentVerification = {
  total_documents: 708,
  web_archive_coverage: 89,
  official_website_coverage: 156, // Estimated
  duplicate_detection: {
    exact_matches: 45,
    similar_content: 12,
    naming_variations: 23
  },
  integrity_checks: {
    missing_documents: 0,
    corrupted_files: 0,
    verification_date: '2025-01-22'
  }
};

export const documentMapping = {
  financial_reports: {
    local_count: 156,
    web_archive_count: 67,
    categories: [
      'Budget Execution',
      'Resource Management', 
      'Economic Situation',
      'CAIF Reports'
    ]
  },
  legal_documents: {
    local_count: 25,
    web_archive_count: 8,
    categories: [
      'Ordinances',
      'Resolutions',
      'Dispositions'
    ]
  },
  transparency_reports: {
    local_count: 89,
    web_archive_count: 34,
    categories: [
      'Asset Declarations',
      'Salary Scales',
      'Public Tenders'
    ]
  }
};

export const redundancyStrategy = {
  primary_source: 'local_files',
  backup_sources: [
    'web_archives',
    'official_website',
    'wayback_machine'
  ],
  verification_method: 'content_hash_comparison',
  auto_update: false,
  manual_verification: true
};