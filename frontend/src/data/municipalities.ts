import { Municipality, PublicSpending } from '../types';

export const municipalities: Municipality[] = [
  {
    id: 'carmen-de-areco',
    name: 'Carmen de Areco',
    population: 15729,
    budget: 850000000,
    publicEmployees: 420,
    transparencyIndex: 76,
    lastUpdate: '2024-03-20'
  },
  {
    id: 'chacabuco',
    name: 'Chacabuco',
    population: 48703,
    budget: 2100000000,
    publicEmployees: 890,
    transparencyIndex: 68,
    lastUpdate: '2024-03-15'
  },
  {
    id: 'salto',
    name: 'Salto',
    population: 32628,
    budget: 1500000000,
    publicEmployees: 680,
    transparencyIndex: 71,
    lastUpdate: '2024-03-18'
  },
  {
    id: 'san-andres-de-giles',
    name: 'San Andrés de Giles',
    population: 22991,
    budget: 1200000000,
    publicEmployees: 510,
    transparencyIndex: 73,
    lastUpdate: '2024-03-17'
  }
];

export const spendingData: PublicSpending[] = [
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
    category: 'Infraestructura',
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
    category: 'Administración',
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