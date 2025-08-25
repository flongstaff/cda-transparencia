import { TimelineEvent } from '../types';

export const timelineEvents: TimelineEvent[] = [
  {
    id: 'event-001',
    date: '2024-01-01',
    title: 'Aprobación del Presupuesto Municipal 2024',
    description: 'Se aprueba la Ordenanza N° 3200/24 del presupuesto municipal para el año 2024',
    category: 'Presupuesto',
    importance: 'high'
  },
  {
    id: 'event-002',
    date: '2024-02-01',
    title: 'Actualización Escala Salarial',
    description: 'Se implementa la nueva escala salarial para el personal municipal',
    category: 'Recursos Humanos',
    importance: 'medium'
  },
  {
    id: 'event-003',
    date: '2024-02-15',
    title: 'Presentación de Declaraciones Juradas 2024',
    description: 'Funcionarios públicos presentan sus declaraciones juradas patrimoniales',
    category: 'Cumplimiento',
    importance: 'high'
  },
  {
    id: 'event-004',
    date: '2024-09-30',
    title: 'Informe de Stock de Deuda',
    description: 'Publicación del análisis de deuda municipal y perfil de vencimientos',
    category: 'Finanzas',
    importance: 'high'
  },
  {
    id: 'event-005',
    date: '2024-10-01',
    title: 'Actualización Escala Salarial Octubre',
    description: 'Nueva actualización de la escala salarial del personal municipal',
    category: 'Recursos Humanos',
    importance: 'medium'
  },
  {
    id: 'event-006',
    date: '2024-12-31',
    title: 'Cierre Presupuestario 2024',
    description: 'Publicación del informe de ejecución de gastos del cuarto trimestre',
    category: 'Presupuesto',
    importance: 'high'
  },
  {
    id: 'event-007',
    date: '2025-01-01',
    title: 'Ordenanza Impositiva 2025',
    description: 'Se aprueba la Ordenanza Impositiva N° 3282/25 para el año fiscal 2025',
    category: 'Tributario',
    importance: 'high'
  },
  {
    id: 'event-008',
    date: '2025-01-15',
    title: 'Licitaciones Públicas 2025',
    description: 'Apertura de nuevas licitaciones públicas N°7 a N°11 para obras de infraestructura',
    category: 'Contrataciones',
    importance: 'medium'
  }
];