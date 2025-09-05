// Carmen de Areco - Declaraciones Juradas (Asset Declarations) Data

export interface AssetDeclaration {
  year: number;
  document: string;
  location: string;
  status: 'published' | 'pending' | 'updated';
  description: string;
}

export const assetDeclarations: AssetDeclaration[] = [
  {
    year: 2022,
    document: 'ddjj-2022.pdf',
    location: '/data/pdf_extracs/2022/',
    status: 'published',
    description: 'Declaraciones Juradas Patrimoniales de Funcionarios Públicos 2022'
  },
  {
    year: 2023,
    document: 'ddjj-2023.pdf',
    location: '/data/pdf_extracs/2023/',
    status: 'published',
    description: 'Declaraciones Juradas Patrimoniales de Funcionarios Públicos 2023'
  },
  {
    year: 2024,
    document: 'DDJJ-2024.pdf',
    location: '/data/pdf_extracs/2024/',
    status: 'published',
    description: 'Declaraciones Juradas Patrimoniales de Funcionarios Públicos 2024'
  }
];

export const declarationTemplate = {
  document: 'descargar-declaracion-jurada.pdf',
  location: '/data/pdf_extracs/2025/',
  description: 'Formulario para descarga de declaraciones juradas',
  type: 'template'
};

export const declarationLocations = [
  {
    directory: 'main_years',
    path: '/data/pdf_extracts/[year]/',
    files: ['ddjj-2022.pdf', 'ddjj-2023.pdf', 'DDJJ-2024.pdf'],
    description: 'Declaraciones en directorios por año'
  },
  {
    directory: 'financial_data', 
    path: '/data/pdf_extracts/financial_data/',
    files: ['descargar-declaracion-jurada.pdf'],
    description: 'Formularios y plantillas en datos financieros'
  },
  {
    directory: 'salarios_ddj',
    path: '/data/pdf_extracts/Salarios-DDJ/DDJ/CDA/',
    files: ['ddjj-2022.pdf', 'ddjj-2023.pdf', 'DDJJ-2024.pdf'],
    description: 'Copia de declaraciones en directorio de salarios'
  },
  {
    directory: 'declarations_specific',
    path: '/data/pdf_extracts/declarations/',
    files: ['ddjj-2022.pdf', 'ddjj-2023.pdf'],
    description: 'Directorio específico de declaraciones'
  }
];

export const declarationStatistics = {
  totalYears: 3,
  totalLocations: 4,
  duplicateFiles: 6, // Archivos duplicados en diferentes ubicaciones
  uniqueDeclarations: 3,
  coveragePeriod: '2022-2024'
};

export const declarationRequirements = [
  {
    category: 'Funcionarios Obligados',
    requirement: 'Intendente, Secretarios, Subsecretarios',
    frequency: 'Anual'
  },
  {
    category: 'Contenido Mínimo',
    requirement: 'Bienes muebles e inmuebles, ingresos, inversiones',
    frequency: 'Actualización anual'
  },
  {
    category: 'Plazo de Presentación',
    requirement: 'Antes del 31 de mayo de cada año',
    frequency: 'Anual'
  },
  {
    category: 'Publicación',
    requirement: 'Disponible en portal de transparencia',
    frequency: 'Inmediata tras presentación'
  }
];