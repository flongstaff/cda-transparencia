// Carmen de Areco - Public Tenders & Contracts Data

export interface Tender {
  id: string;
  number: number;
  title: string;
  description: string;
  category: string;
  status: 'active' | 'closed' | 'awarded';
  openDate: string;
  closeDate?: string;
  estimatedAmount?: number;
  document: string;
  requirements: string[];
}

export const publicTenders: Tender[] = [
  {
    id: 'LP-007-2025',
    number: 7,
    title: 'Licitación Pública N° 7',
    description: 'Licitación para obra pública municipal',
    category: 'Obras Públicas',
    status: 'active',
    openDate: '2025-01-15',
    document: 'LICITACION-PUBLICA-N°7.pdf',
    requirements: [
      'Certificado de antecedentes penales',
      'Constancia de inscripción en AFIP',
      'Póliza de caución',
      'Experiencia mínima en obras similares'
    ]
  },
  {
    id: 'LP-008-2025',
    number: 8,
    title: 'Licitación Pública N° 8',
    description: 'Licitación para infraestructura municipal',
    category: 'Infraestructura',
    status: 'active',
    openDate: '2025-01-20',
    document: 'LICITACION-PUBLICA-N°8.pdf',
    requirements: [
      'Habilitación municipal',
      'Seguro de responsabilidad civil',
      'Capital mínimo requerido',
      'Referencias comerciales'
    ]
  },
  {
    id: 'LP-009-2025',
    number: 9,
    title: 'Licitación Pública N° 9',
    description: 'Contratación de servicios municipales',
    category: 'Servicios',
    status: 'active',
    openDate: '2025-01-25',
    document: 'LICITACION-PUBLICA-N°9.pdf',
    requirements: [
      'Matrícula profesional vigente',
      'Certificado de capacidad técnica',
      'Balance auditado último ejercicio',
      'Declaración jurada de capacidad'
    ]
  },
  {
    id: 'LP-010-2025',
    number: 10,
    title: 'Licitación Pública N° 10',
    description: 'Obra de mejoramiento urbano',
    category: 'Urbanismo',
    status: 'active',
    openDate: '2025-02-01',
    document: 'LICITACION-PUBLICA-N°10.pdf',
    requirements: [
      'Inscripción en registro de contratistas',
      'Certificado de obra similar',
      'Garantía de mantenimiento',
      'Personal técnico especializado'
    ]
  },
  {
    id: 'LP-011-2025',
    number: 11,
    title: 'Licitación Pública N° 11',
    description: 'Adquisición de equipamiento municipal',
    category: 'Equipamiento',
    status: 'active',
    openDate: '2025-02-05',
    document: 'LICITACION-PUBLICA-N°11.pdf',
    requirements: [
      'Certificación ISO de calidad',
      'Garantía extendida de equipos',
      'Servicio técnico local',
      'Entrega en términos acordados'
    ]
  }
];

export const tenderCategories = [
  {
    category: 'Obras Públicas',
    count: 1,
    totalAmount: 50000000,
    description: 'Construcción y reparación de infraestructura'
  },
  {
    category: 'Infraestructura',
    count: 1,
    totalAmount: 75000000,
    description: 'Desarrollo de infraestructura básica'
  },
  {
    category: 'Servicios',
    count: 1,
    totalAmount: 30000000,
    description: 'Contratación de servicios especializados'
  },
  {
    category: 'Urbanismo',
    count: 1,
    totalAmount: 60000000,
    description: 'Mejoramiento del espacio urbano'
  },
  {
    category: 'Equipamiento',
    count: 1,
    totalAmount: 25000000,
    description: 'Adquisición de equipos y maquinaria'
  }
];

export const tenderStatistics = {
  totalActive: 5,
  totalValue: 240000000,
  averageValue: 48000000,
  byStatus: {
    active: 5,
    closed: 0,
    awarded: 0
  },
  byCategory: {
    'Obras Públicas': 1,
    'Infraestructura': 1,
    'Servicios': 1,
    'Urbanismo': 1,
    'Equipamiento': 1
  }
};