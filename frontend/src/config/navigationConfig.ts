import {
  Home,
  BarChart3,
  FileText,
  Users,
  Building,
  ShieldCheck,
  Database,
  DollarSign,
  TrendingUp,
  PieChart,
  Calendar,
  BookOpen,
  Mail,
  Info,
  Search,
  Shield,
  Globe,
  Eye,
  Activity
} from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  path: string;
  description?: string;
  category?: string;
  priority?: number; // For sorting - higher numbers appear first
}

export interface NavCategory {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  items: NavItem[];
}

// Main navigation items for both navbar and sidebar
export const MAIN_NAV_ITEMS: NavItem[] = [
  {
    id: 'home',
    label: 'Inicio',
    icon: Home,
    path: '/',
    description: 'Página principal del portal',
    priority: 100
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: BarChart3,
    path: '/dashboard',
    description: 'Panel de control integral',
    priority: 90
  },
  {
    id: 'budget',
    label: 'Presupuesto',
    icon: DollarSign,
    path: '/budget',
    description: 'Análisis del presupuesto municipal',
    priority: 85
  },
  {
    id: 'treasury',
    label: 'Tesorería',
    icon: TrendingUp,
    path: '/treasury',
    description: 'Estado de tesorería y flujo de fondos',
    priority: 80
  },
  {
    id: 'expenses',
    label: 'Gastos',
    icon: PieChart,
    path: '/expenses',
    description: 'Ejecución de gastos municipales',
    priority: 75
  },
  {
    id: 'debt',
    label: 'Deuda',
    icon: Calendar,
    path: '/debt',
    description: 'Análisis de deuda pública',
    priority: 70
  },
  {
    id: 'salaries',
    label: 'Salarios',
    icon: Users,
    path: '/salaries',
    description: 'Remuneraciones del personal municipal',
    priority: 65
  },
  {
    id: 'contracts',
    label: 'Contratos',
    icon: Building,
    path: '/contracts',
    description: 'Contrataciones y licitaciones',
    priority: 60
  },
  {
    id: 'documents',
    label: 'Documentos',
    icon: FileText,
    path: '/documents',
    description: 'Biblioteca de documentos oficiales',
    priority: 55
  },
  {
    id: 'audits',
    label: 'Auditorías',
    icon: ShieldCheck,
    path: '/audits',
    description: 'Informes de auditoría y control',
    priority: 50
  },
  {
    id: 'declarations',
    label: 'Declaraciones',
    icon: BookOpen,
    path: '/property-declarations',
    description: 'Declaraciones patrimoniales',
    priority: 45
  },
  {
    id: 'database',
    label: 'Base de Datos',
    icon: Database,
    path: '/database',
    description: 'Acceso a datos estructurados',
    priority: 40
  },
  {
    id: 'about',
    label: 'Acerca de',
    icon: Info,
    path: '/about',
    description: 'Información sobre el portal',
    priority: 30
  },
  {
    id: 'contact',
    label: 'Contacto',
    icon: Mail,
    path: '/contact',
    description: 'Contacto con la municipalidad',
    priority: 20
  }
];

// Organized navigation by categories for sidebar
export const NAV_CATEGORIES: NavCategory[] = [
  {
    id: 'main',
    title: 'Principal',
    icon: Home,
    items: [
      {
        id: 'home',
        label: 'Inicio',
        icon: Home,
        path: '/',
        description: 'Página principal del portal'
      },
      {
        id: 'dashboard',
        label: 'Dashboard Principal',
        icon: BarChart3,
        path: '/dashboard',
        description: 'Panel de control integral'
      }
    ]
  },
  {
    id: 'financial',
    title: 'Finanzas',
    icon: DollarSign,
    items: [
      {
        id: 'budget',
        label: 'Presupuesto',
        icon: DollarSign,
        path: '/budget',
        description: 'Análisis del presupuesto municipal'
      },
      {
        id: 'treasury',
        label: 'Tesorería',
        icon: TrendingUp,
        path: '/treasury',
        description: 'Estado de tesorería y flujo de fondos'
      },
      {
        id: 'expenses',
        label: 'Gastos',
        icon: PieChart,
        path: '/expenses',
        description: 'Ejecución de gastos municipales'
      },
      {
        id: 'debt',
        label: 'Deuda',
        icon: Calendar,
        path: '/debt',
        description: 'Análisis de deuda pública'
      },
      {
        id: 'investments',
        label: 'Inversiones',
        icon: TrendingUp,
        path: '/investments',
        description: 'Proyectos de inversión'
      }
    ]
  },
  {
    id: 'hr',
    title: 'Recursos Humanos',
    icon: Users,
    items: [
      {
        id: 'salaries',
        label: 'Salarios',
        icon: Users,
        path: '/salaries',
        description: 'Remuneraciones del personal municipal'
      }
    ]
  },
  {
    id: 'procurement',
    title: 'Contrataciones',
    icon: Building,
    items: [
      {
        id: 'contracts',
        label: 'Contratos',
        icon: Building,
        path: '/contracts',
        description: 'Contrataciones y licitaciones'
      }
    ]
  },
  {
    id: 'documents',
    title: 'Documentos',
    icon: FileText,
    items: [
      {
        id: 'documents',
        label: 'Biblioteca',
        icon: FileText,
        path: '/documents',
        description: 'Biblioteca de documentos oficiales'
      },
      {
        id: 'reports',
        label: 'Reportes',
        icon: BookOpen,
        path: '/reports',
        description: 'Reportes y estudios especiales'
      },
      {
        id: 'audits',
        label: 'Auditorías',
        icon: ShieldCheck,
        path: '/audits',
        description: 'Informes de auditoría y control'
      },
      {
        id: 'declarations',
        label: 'Declaraciones',
        icon: BookOpen,
        path: '/property-declarations',
        description: 'Declaraciones patrimoniales'
      }
    ]
  },
  {
    id: 'data',
    title: 'Datos',
    icon: Database,
    items: [
      {
        id: 'database',
        label: 'Base de Datos',
        icon: Database,
        path: '/database',
        description: 'Acceso a datos estructurados'
      },
      {
        id: 'charts',
        label: 'Visualizaciones',
        icon: PieChart,
        path: '/all-charts',
        description: 'Todas las visualizaciones de datos'
      }
    ]
  },
  {
    id: 'monitoring',
    title: 'Monitoreo',
    icon: Eye,
    items: [
      {
        id: 'monitoring-dashboard',
        label: 'Dashboard de Monitoreo',
        icon: Eye,
        path: '/monitoring',
        description: 'Sistema de monitoreo OSINT y análisis'
      },
      {
        id: 'open-data-catalog',
        label: 'Catálogo de Datos Abiertos',
        icon: Database,
        path: '/open-data',
        description: 'Catálogo de datos abiertos y reutilizables'
      },
      {
        id: 'audit-dashboard',
        label: 'Auditorías',
        icon: ShieldCheck,
        path: '/audit-dashboard',
        description: 'Panel de auditorías y controles'
      },
      {
        id: 'system-health',
        label: 'Estado del Sistema',
        icon: Activity,
        path: '/system-health',
        description: 'Monitoreo de salud del sistema'
      }
    ]
  },
  {
    id: 'info',
    title: 'Información',
    icon: Info,
    items: [
      {
        id: 'about',
        label: 'Acerca de',
        icon: Info,
        path: '/about',
        description: 'Información sobre el portal'
      },
      {
        id: 'contact',
        label: 'Contacto',
        icon: Mail,
        path: '/contact',
        description: 'Contacto con la municipalidad'
      }
    ]
  }
];