import {
  Home,
  BarChart3,
  DollarSign,
  FileText,
  Shield,
  Database,
  Briefcase,
  AlertTriangle,
  CreditCard,
  Building,
  TrendingUp,
  Award,
  Users,
  User,
  Info,
  Mail,
  PieChart,
  Search,
  Calendar,
  Globe,
  Eye,
  Settings,
  Archive
} from 'lucide-react';

export interface SidebarItem {
  id: string;
  to: string;
  label: string;
  icon: React.ComponentType<any>;
  category?: string;
  children?: SidebarItem[];
  badge?: string;
  description?: string;
}

export const menuItems: SidebarItem[] = [
  // Main Navigation
  {
    id: 'dashboard',
    to: '/',
    label: 'Inicio',
    icon: Home,
    category: 'main',
    description: 'Página principal del portal de transparencia'
  },

  // Financial Management Section
  {
    id: 'financial',
    to: '#',
    label: 'Gestión Financiera',
    icon: DollarSign,
    category: 'financial',
    children: [
      {
        id: 'budget',
        to: '/budget',
        label: 'Presupuesto Municipal',
        icon: CreditCard
      },
      {
        id: 'treasury',
        to: '/treasury',
        label: 'Tesorería',
        icon: Building
      },
      {
        id: 'expenses',
        to: '/expenses',
        label: 'Ejecución de Gastos',
        icon: TrendingUp
      },
      {
        id: 'debt',
        to: '/debt',
        label: 'Deuda Pública',
        icon: AlertTriangle
      },
      {
        id: 'investments',
        to: '/investments',
        label: 'Inversiones',
        icon: Award
      }
    ]
  },

  // Human Resources
  {
    id: 'hr',
    to: '#',
    label: 'Recursos Humanos',
    icon: Users,
    category: 'hr',
    children: [
      {
        id: 'salaries',
        to: '/salaries',
        label: 'Sueldos y Salarios',
        icon: Users
      }
    ]
  },

  // Procurement & Contracts
  {
    id: 'procurement',
    to: '#',
    label: 'Contrataciones',
    icon: Briefcase,
    category: 'procurement',
    children: [
      {
        id: 'contracts',
        to: '/contracts',
        label: 'Contratos y Licitaciones',
        icon: Briefcase
      }
    ]
  },

  // Documents & Reports
  {
    id: 'documents',
    to: '#',
    label: 'Documentos y Reportes',
    icon: FileText,
    category: 'documents',
    children: [
      {
        id: 'documents-library',
        to: '/documents',
        label: 'Biblioteca de Documentos',
        icon: Archive,
        badge: '171'
      },
      {
        id: 'reports',
        to: '/reports',
        label: 'Reportes Oficiales',
        icon: BarChart3
      }
    ]
  },

  // Audit & Oversight
  {
    id: 'oversight',
    to: '#',
    label: 'Auditoría y Control',
    icon: Shield,
    category: 'oversight',
    children: [
      {
        id: 'audits',
        to: '/audits',
        label: 'Auditorías',
        icon: Shield
      },
      {
        id: 'property-declarations',
        to: '/property-declarations',
        label: 'Declaraciones Patrimoniales',
        icon: User
      }
    ]
  },

  // Data & Analytics
  {
    id: 'analytics',
    to: '#',
    label: 'Datos y Análisis',
    icon: PieChart,
    category: 'analytics',
    children: [
      {
        id: 'dashboard-completo',
        to: '/completo',
        label: 'Dashboard Completo',
        icon: Eye
      },
      {
        id: 'database',
        to: '/database',
        label: 'Base de Datos',
        icon: Database
      },
      {
        id: 'all-charts',
        to: '/all-charts',
        label: 'Visualizaciones',
        icon: PieChart
      },
      {
        id: 'data-verification',
        to: '/data-verification',
        label: 'Verificación de Datos',
        icon: Search
      }
    ]
  },

  // Information & Support
  {
    id: 'info',
    to: '#',
    label: 'Información',
    icon: Info,
    category: 'info',
    children: [
      {
        id: 'about',
        to: '/about',
        label: 'Acerca del Portal',
        icon: Info
      },
      {
        id: 'contact',
        to: '/contact',
        label: 'Contacto',
        icon: Mail
      }
    ]
  }
];
