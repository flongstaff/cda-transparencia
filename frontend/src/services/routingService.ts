/**
 * Routing Service - Enhanced routing with data passing and state management
 * No page reloads, seamless navigation with data context preservation
 */

import { NavigateFunction } from 'react-router-dom';

export interface NavigationOptions {
  year?: number;
  category?: string;
  search?: string;
  preserveState?: boolean;
  section?: string;
  scrollTo?: string;
}

export interface RouteConfig {
  path: string;
  title: string;
  description: string;
  category: 'financial' | 'transparency' | 'data' | 'information' | 'administrative';
  dataRequirements: string[];
  permissions?: string[];
}

export class RoutingService {
  private static instance: RoutingService;
  private navigator: NavigateFunction | null = null;

  private routes: RouteConfig[] = [
    // Financial Routes
    {
      path: '/budget',
      title: 'Presupuesto Municipal',
      description: 'Información presupuestaria y ejecución de gastos',
      category: 'financial',
      dataRequirements: ['budget_data', 'execution_data']
    },
    {
      path: '/treasury',
      title: 'Tesorería',
      description: 'Estado financiero y movimientos de caja',
      category: 'financial',
      dataRequirements: ['treasury_data', 'cash_flow']
    },
    {
      path: '/expenses',
      title: 'Gastos Municipales',
      description: 'Análisis detallado de gastos por categoría',
      category: 'financial',
      dataRequirements: ['expenses_data', 'categories']
    },
    {
      path: '/debt',
      title: 'Deuda Municipal',
      description: 'Estado de la deuda pública municipal',
      category: 'financial',
      dataRequirements: ['debt_data', 'payment_schedule']
    },
    {
      path: '/investments',
      title: 'Inversiones',
      description: 'Proyectos de inversión y obras públicas',
      category: 'financial',
      dataRequirements: ['investment_data', 'projects']
    },
    {
      path: '/infrastructure',
      title: 'Infraestructura',
      description: 'Seguimiento de proyectos de infraestructura',
      category: 'financial',
      dataRequirements: ['infrastructure_data', 'project_status']
    },

    // Administrative Routes
    {
      path: '/salaries',
      title: 'Sueldos y Salarios',
      description: 'Información sobre remuneraciones del personal municipal',
      category: 'administrative',
      dataRequirements: ['salary_data', 'staff_info']
    },
    {
      path: '/contracts',
      title: 'Contratos y Licitaciones',
      description: 'Procesos de contratación y licitaciones públicas',
      category: 'administrative',
      dataRequirements: ['contracts_data', 'bidding_process']
    },

    // Transparency Routes
    {
      path: '/documents',
      title: 'Documentos Oficiales',
      description: 'Acceso a documentos y normativas municipales',
      category: 'transparency',
      dataRequirements: ['documents_data', 'pdf_metadata']
    },
    {
      path: '/reports',
      title: 'Informes y Reportes',
      description: 'Informes oficiales y reportes de gestión',
      category: 'transparency',
      dataRequirements: ['reports_data', 'audit_reports']
    },
    {
      path: '/audits',
      title: 'Auditorías',
      description: 'Resultados de auditorías y controles',
      category: 'transparency',
      dataRequirements: ['audit_data', 'findings']
    },
    {
      path: '/transparency',
      title: 'Portal de Transparencia',
      description: 'Información de transparencia activa',
      category: 'transparency',
      dataRequirements: ['transparency_data', 'public_info']
    },
    {
      path: '/property-declarations',
      title: 'Declaraciones Juradas',
      description: 'Declaraciones juradas patrimoniales',
      category: 'transparency',
      dataRequirements: ['declarations_data'],
      permissions: ['view_declarations']
    },

    // Data Routes
    {
      path: '/database',
      title: 'Base de Datos',
      description: 'Acceso a datos estructurados',
      category: 'data',
      dataRequirements: ['database_access', 'metadata']
    },
    {
      path: '/all-charts',
      title: 'Visualizaciones',
      description: 'Gráficos y visualizaciones de datos',
      category: 'data',
      dataRequirements: ['chart_data', 'visualization_config']
    },
    {
      path: '/search',
      title: 'Búsqueda',
      description: 'Búsqueda avanzada en todos los datos',
      category: 'data',
      dataRequirements: ['search_index', 'metadata']
    },
    {
      path: '/dashboard',
      title: 'Dashboard Completo',
      description: 'Vista integral de todos los datos municipales',
      category: 'data',
      dataRequirements: ['all_data', 'summary_data']
    },

    // Information Routes
    {
      path: '/about',
      title: 'Acerca de',
      description: 'Información sobre el portal',
      category: 'information',
      dataRequirements: []
    },
    {
      path: '/contact',
      title: 'Contacto',
      description: 'Información de contacto',
      category: 'information',
      dataRequirements: []
    }
  ];

  private constructor() {}

  public static getInstance(): RoutingService {
    if (!RoutingService.instance) {
      RoutingService.instance = new RoutingService();
    }
    return RoutingService.instance;
  }

  public setNavigator(navigate: NavigateFunction) {
    this.navigator = navigate;
  }

  /**
   * Navigate to a route with enhanced options
   */
  public navigateTo(path: string, options: NavigationOptions = {}) {
    if (!this.navigator) {
      console.error('Navigator not set. Call setNavigator first.');
      return;
    }

    // Build query parameters
    const searchParams = new URLSearchParams();

    if (options.year) {
      searchParams.set('year', options.year.toString());
    }

    if (options.category) {
      searchParams.set('category', options.category);
    }

    if (options.search) {
      searchParams.set('q', options.search);
    }

    if (options.section) {
      searchParams.set('section', options.section);
    }

    // Build final URL
    let finalPath = path;
    if (searchParams.toString()) {
      finalPath += `?${searchParams.toString()}`;
    }

    if (options.scrollTo) {
      finalPath += `#${options.scrollTo}`;
    }

    // Navigate without reloading
    this.navigator(finalPath, {
      replace: !options.preserveState
    });

    // Handle scrolling if specified
    if (options.scrollTo) {
      setTimeout(() => {
        const element = document.getElementById(options.scrollTo!);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }

  /**
   * Get route configuration
   */
  public getRouteConfig(path: string): RouteConfig | undefined {
    return this.routes.find(route => route.path === path);
  }

  /**
   * Get routes by category
   */
  public getRoutesByCategory(category: RouteConfig['category']): RouteConfig[] {
    return this.routes.filter(route => route.category === category);
  }

  /**
   * Build breadcrumb for current route
   */
  public buildBreadcrumb(currentPath: string): Array<{ title: string; path: string }> {
    const breadcrumb = [
      { title: 'Inicio', path: '/' }
    ];

    const route = this.getRouteConfig(currentPath);
    if (route) {
      // Add category level
      const categoryRoutes = this.getRoutesByCategory(route.category);
      if (categoryRoutes.length > 1) {
        breadcrumb.push({
          title: this.getCategoryTitle(route.category),
          path: `#${route.category}`
        });
      }

      // Add current page
      breadcrumb.push({
        title: route.title,
        path: currentPath
      });
    }

    return breadcrumb;
  }

  /**
   * Get category title
   */
  private getCategoryTitle(category: RouteConfig['category']): string {
    const titles = {
      financial: 'Información Financiera',
      transparency: 'Transparencia',
      data: 'Datos y Visualizaciones',
      information: 'Información General',
      administrative: 'Gestión Administrativa'
    };

    return titles[category] || category;
  }

  /**
   * Check if route requires specific data
   */
  public getDataRequirements(path: string): string[] {
    const route = this.getRouteConfig(path);
    return route?.dataRequirements || [];
  }

  /**
   * Check if user has permissions for route
   */
  public hasPermissions(path: string, userPermissions: string[] = []): boolean {
    const route = this.getRouteConfig(path);
    if (!route?.permissions || route.permissions.length === 0) {
      return true; // No permissions required
    }

    return route.permissions.every(permission =>
      userPermissions.includes(permission)
    );
  }

  /**
   * Get all available routes
   */
  public getAllRoutes(): RouteConfig[] {
    return [...this.routes];
  }

  /**
   * Search routes by title or description
   */
  public searchRoutes(query: string): RouteConfig[] {
    const lowerQuery = query.toLowerCase();
    return this.routes.filter(route =>
      route.title.toLowerCase().includes(lowerQuery) ||
      route.description.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Generate sitemap
   */
  public generateSitemap(): { [category: string]: RouteConfig[] } {
    const sitemap: { [category: string]: RouteConfig[] } = {};

    this.routes.forEach(route => {
      if (!sitemap[route.category]) {
        sitemap[route.category] = [];
      }
      sitemap[route.category].push(route);
    });

    return sitemap;
  }
}

// Export singleton instance
export const routingService = RoutingService.getInstance();
export default routingService;