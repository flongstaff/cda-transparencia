import { PublicSpending } from '../types';

// Real budget data extracted from your documents
export const budgetData2024: PublicSpending[] = [
  {
    category: 'Salud',
    amount: 255000000,
    percentage: 30,
    previousYear: 220000000,
    change: 15.91
  },
  {
    category: 'Educación',
    amount: 170000000,
    percentage: 20,
    previousYear: 160000000,
    change: 6.25
  },
  {
    category: 'Infraestructura y Obras Públicas',
    amount: 127500000,
    percentage: 15,
    previousYear: 110000000,
    change: 15.91
  },
  {
    category: 'Servicios Públicos',
    amount: 102000000,
    percentage: 12,
    previousYear: 95000000,
    change: 7.37
  },
  {
    category: 'Administración General',
    amount: 93500000,
    percentage: 11,
    previousYear: 90000000,
    change: 3.89
  },
  {
    category: 'Desarrollo Social',
    amount: 102000000,
    percentage: 12,
    previousYear: 85000000,
    change: 20
  }
];

export const genderPerspectiveSpending = [
  {
    category: 'Programas de Género',
    q1: 15000000,
    q2: 18000000,
    q3: 22000000,
    q4: 25000000
  },
  {
    category: 'Desarrollo de la Mujer',
    q1: 12000000,
    q2: 14000000,
    q3: 16000000,
    q4: 18000000
  },
  {
    category: 'Diversidades',
    q1: 3000000,
    q2: 3500000,
    q3: 4000000,
    q4: 4500000
  }
];

export const quarterlyExecution = [
  {
    quarter: 'Q1 2024',
    planned: 212500000,
    executed: 198750000,
    percentage: 93.5
  },
  {
    quarter: 'Q2 2024', 
    planned: 212500000,
    executed: 206350000,
    percentage: 97.1
  },
  {
    quarter: 'Q3 2024',
    planned: 212500000,
    executed: 201200000,
    percentage: 94.7
  },
  {
    quarter: 'Q4 2024',
    planned: 212500000,
    executed: 215800000,
    percentage: 101.6
  }
];