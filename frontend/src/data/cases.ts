import { CaseRecord } from '../types';

export const cases: CaseRecord[] = [
  {
    id: 'case-001',
    title: 'Irregularidades en Licitación de Obra Pública',
    description: 'Investigación sobre irregularidades en el proceso de licitación para la construcción de infraestructura vial.',
    category: 'Contratación Pública',
    date: '2024-01-15',
    status: 'En Investigación',
    sources: [
      'Expediente Municipal #2024-001',
      'Registro de Licitaciones Públicas',
      'Documentación de Contratistas'
    ],
    confidence: 85,
    relatedDocuments: [
      'Pliego de Licitación',
      'Informes de Evaluación',
      'Documentación de Oferentes'
    ]
  },
  {
    id: 'case-002',
    title: 'Análisis de Gastos en Salud Pública',
    description: 'Evaluación detallada de la distribución y ejecución del presupuesto en el sector salud.',
    category: 'Salud',
    date: '2024-02-20',
    status: 'Completado',
    sources: [
      'Presupuesto Municipal 2024',
      'Informes de Ejecución Presupuestaria',
      'Registros de Compras Hospitalarias'
    ],
    confidence: 95,
    relatedDocuments: [
      'Informe de Auditoría',
      'Facturas y Comprobantes',
      'Reportes de Gestión'
    ]
  },
  {
    id: 'case-003',
    title: 'Revisión de Contrataciones Temporales',
    description: 'Análisis de la contratación de personal temporal en la municipalidad durante el último trimestre.',
    category: 'Recursos Humanos',
    date: '2024-03-10',
    status: 'En Revisión',
    sources: [
      'Registros de RRHH',
      'Contratos Temporales',
      'Planillas de Personal'
    ],
    confidence: 75,
    relatedDocuments: [
      'Contratos Laborales',
      'Evaluaciones de Desempeño',
      'Registros de Asistencia'
    ]
  }
];