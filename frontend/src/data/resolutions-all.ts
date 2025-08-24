// Carmen de Areco - Comprehensive Resolutions Database

export interface Resolution {
  number: string;
  year: number;
  entity: string;
  category: string;
  description: string;
  document: string;
  fullDocument?: string;
  province: boolean;
}

export const allResolutions: Resolution[] = [
  // 2022 Resolutions
  {
    number: '79/2022',
    year: 2022,
    entity: 'Instituto de la Vivienda',
    category: 'housing',
    description: 'Resolución de administración general del Instituto de la Vivienda',
    document: 'Resolución 79_2022.pdf',
    fullDocument: 'Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 79_2022 del Administración General del Instituto de la Vivienda.pdf',
    province: true
  },
  {
    number: '747/2022',
    year: 2022,
    entity: 'Ministerio de Producción, Ciencia e Innovación Tecnológica',
    category: 'production_technology',
    description: 'Resolución de producción, ciencia e innovación tecnológica',
    document: 'Resolución 747_2022.pdf',
    fullDocument: 'Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 747_2022 del Ministerio de Producción, Ciencia e Innovación Tecnológica.pdf',
    province: true
  },
  {
    number: '1146/2022',
    year: 2022,
    entity: 'Instituto de la Vivienda',
    category: 'housing',
    description: 'Resolución de administración general del Instituto de la Vivienda',
    document: 'Resolución 1146_2022.pdf',
    fullDocument: 'Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 1146_2022 del Administración General del Instituto de la Vivienda.pdf',
    province: true
  },
  {
    number: '1279/2022',
    year: 2022,
    entity: 'Ministerio de Salud - Subsecretaria Técnica, Administrativa y Legal',
    category: 'health',
    description: 'Resolución de subsecretaría técnica y administrativa de salud',
    document: 'Resolución 1279_2022.pdf',
    fullDocument: 'Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 1279_2022 de la Subsecretaria Técnica, Administrativa y Legal del Ministerio de Salud.pdf',
    province: true
  },
  {
    number: '1593/2022',
    year: 2022,
    entity: 'Ministerio de Infraestructura y Servicios Públicos',
    category: 'infrastructure',
    description: 'Resolución de ministerio de infraestructura y servicios públicos',
    document: 'Resolución 1593_2022.pdf',
    fullDocument: 'Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 1593_2022 del Ministerio de Infraestructura y Servicios Públicos.pdf',
    province: true
  },
  
  // 2023 Resolutions
  {
    number: '297/2023',
    year: 2023,
    entity: 'Ministerio de Hacienda y Finanzas',
    category: 'finance',
    description: 'Resolución de hacienda y finanzas públicas',
    document: 'Resolución 297_2023.pdf',
    fullDocument: 'Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 297_2023 del Ministerio de Hacienda y Finanzas.pdf',
    province: true
  },
  {
    number: '790/2023',
    year: 2023,
    entity: 'Provincial',
    category: 'general',
    description: 'Resolución provincial',
    document: 'Resolución 790_2023.pdf',
    province: true
  },
  {
    number: '828/2023',
    year: 2023,
    entity: 'Organismo Provincial de la Niñez y Adolescencia',
    category: 'social_services',
    description: 'Resolución del organismo provincial de niñez y adolescencia',
    document: 'Resolución 828_2023.pdf',
    fullDocument: 'Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 828_2023 de la Dirección Ejecutiva del Organismo Provincial De La Niñez y Adolescencia.pdf',
    province: true
  },
  {
    number: '1536/2023',
    year: 2023,
    entity: 'Ministerio de Desarrollo de la Comunidad',
    category: 'community_development',
    description: 'Resolución de desarrollo comunitario',
    document: 'Resolución 1536_2023.pdf',
    fullDocument: 'Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 1536_2023 del Ministerio de Desarrollo de la Comunidad.pdf',
    province: true
  },
  {
    number: '1556/2023',
    year: 2023,
    entity: 'Ministerio de Infraestructura y Servicios Públicos',
    category: 'infrastructure',
    description: 'Resolución de infraestructura y servicios públicos',
    document: 'Resolución 1556_2023.pdf',
    fullDocument: 'Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 1556_2023 del Ministerio de Infraestructura y Servicios Públicos.pdf',
    province: true
  },
  {
    number: '1691/2023',
    year: 2023,
    entity: 'Provincial',
    category: 'general',
    description: 'Resolución provincial',
    document: 'Resolución 1691_2023.pdf',
    province: true
  },
  {
    number: '3016/2023',
    year: 2023,
    entity: 'Provincial',
    category: 'general',
    description: 'Resolución provincial',
    document: 'Resolución 3016_2023.pdf',
    province: true
  },

  // 2024 Resolutions
  {
    number: '466/2024',
    year: 2024,
    entity: 'Ministerio de Justicia y Derechos Humanos',
    category: 'justice',
    description: 'Resolución de justicia y derechos humanos',
    document: 'Resolución 466_2024.pdf',
    fullDocument: 'Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 466_2024 del Ministerio de Justicia y Derechos Humanos.pdf',
    province: true
  },
  {
    number: '539/2024',
    year: 2024,
    entity: 'Ministerio de Infraestructura y Servicios Públicos',
    category: 'infrastructure',
    description: 'Resolución de infraestructura y servicios públicos',
    document: 'Resolución 539_2024.pdf',
    fullDocument: 'Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 539_2024 del Ministerio de Infraestructura y Servicios Públicos.pdf',
    province: true
  },
  {
    number: '867/2024',
    year: 2024,
    entity: 'Instituto de la Vivienda',
    category: 'housing',
    description: 'Resolución de administración general del Instituto de la Vivienda',
    document: 'Resolución 867_2024.pdf',
    fullDocument: 'Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 867_2024 del Administración General del Instituto de la Vivienda.pdf',
    province: true
  },
  {
    number: '2623/2024',
    year: 2024,
    entity: 'Instituto de la Vivienda',
    category: 'housing',
    description: 'Resolución de administración general del Instituto de la Vivienda',
    document: 'Resolución 2623_2024.pdf',
    fullDocument: 'Sistema de Información Normativa y Documental Malvinas Argentinas - Resolución 2623_2024 del Administración General del Instituto de la Vivienda.pdf',
    province: true
  }
];

export const resolutionsByCategory = {
  housing: 4,
  infrastructure: 3,
  health: 1,
  production_technology: 1,
  finance: 1,
  social_services: 1,
  community_development: 1,
  justice: 1,
  general: 3
};

export const resolutionsByYear = {
  2022: 5,
  2023: 7,
  2024: 4
};

export const resolutionsByEntity = {
  'Instituto de la Vivienda': 4,
  'Ministerio de Infraestructura y Servicios Públicos': 3,
  'Ministerio de Salud': 1,
  'Ministerio de Producción, Ciencia e Innovación Tecnológica': 1,
  'Ministerio de Hacienda y Finanzas': 1,
  'Organismo Provincial de la Niñez y Adolescencia': 1,
  'Ministerio de Desarrollo de la Comunidad': 1,
  'Ministerio de Justicia y Derechos Humanos': 1,
  'Provincial': 3
};