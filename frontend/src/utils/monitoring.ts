// Monitoring and Error Tracking Integration
// Sentry-ready error tracking with Checkly monitoring support

interface ErrorContext {
  chartType?: string;
  props?: Record<string, any>;
  userAgent?: string;
  timestamp?: string;
  sessionId?: string;
  userId?: string;
  environment?: string;
}

interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count';
  tags?: Record<string, string>;
  timestamp?: number;
}

interface MonitoringConfig {
  dsn?: string;
  environment?: string;
  release?: string;
  sampleRate?: number;
  enablePerformanceMonitoring?: boolean;
  enableErrorReporting?: boolean;
  maxBreadcrumbs?: number;
}

class MonitoringService {
  private config: MonitoringConfig;
  private isInitialized = false;
  private errorQueue: Array<{ error: Error; context: ErrorContext }> = [];
  private metricsQueue: PerformanceMetric[] = [];
  private sessionId: string;

  constructor(config: MonitoringConfig = {}) {
    this.config = {
      environment: import.meta.env.MODE || 'development',
      release: import.meta.env.VITE_APP_VERSION || '1.0.0',
      sampleRate: 1.0,
      enablePerformanceMonitoring: true,
      enableErrorReporting: true,
      maxBreadcrumbs: 100,
      ...config
    };
    
    this.sessionId = this.generateSessionId();
    this.initialize();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async initialize() {
    try {
      // Initialize Sentry if DSN is provided
      if (this.config.dsn && this.config.enableErrorReporting) {
        await this.initializeSentry();
      }

      // Initialize performance monitoring
      if (this.config.enablePerformanceMonitoring) {
        this.initializePerformanceMonitoring();
      }

      // Initialize Checkly monitoring hooks
      this.initializeChecklyHooks();

      // Process any queued errors/metrics
      this.processQueue();
      
      this.isInitialized = true;
      console.log('🔍 Monitoring service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize monitoring service:', error);
    }
  }

  private async initializeSentry() {
    try {
      // Dynamic import to support tree-shaking
      const Sentry = await import('@sentry/react');
      
      Sentry.init({
        dsn: this.config.dsn,
        environment: this.config.environment,
        release: this.config.release,
        sampleRate: this.config.sampleRate,
        maxBreadcrumbs: this.config.maxBreadcrumbs,
        
        integrations: [
          new Sentry.BrowserTracing({
            // Capture interactions like clicks, form submits
            routingInstrumentation: Sentry.reactRouterV6Instrumentation(
              React.useEffect,
              // @ts-ignore - Router integration
              window.history
            ),
          }),
          new Sentry.Replay({
            // Sample rate for session replays
            sessionSampleRate: 0.1,
            // Sample rate for error replays  
            errorSampleRate: 1.0,
          }),
        ],
        
        tracesSampleRate: this.config.sampleRate,
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0,

        beforeSend: (event, hint) => {
          // Filter out development errors in production
          if (this.config.environment === 'production') {
            const error = hint.originalException;
            if (error?.message?.includes('ChunkLoadError')) {
              // Handle chunk loading errors gracefully
              this.handleChunkError(error);
              return null; // Don't send to Sentry
            }
          }
          return event;
        },

        beforeSendTransaction: (event) => {
          // Filter out noisy transactions
          if (event.transaction?.includes('idle')) {
            return null;
          }
          return event;
        }
      });

      // Set user context
      Sentry.setUser({
        id: this.sessionId,
        username: 'municipal_user',
        email: 'user@carmendeareco.gob.ar'
      });

      // Set initial context
      Sentry.setContext('app', {
        name: 'Carmen de Areco Transparency Portal',
        version: this.config.release,
        environment: this.config.environment
      });

    } catch (error) {
      console.error('Failed to initialize Sentry:', error);
    }
  }

  private initializePerformanceMonitoring() {
    // Web Vitals monitoring
    if ('web-vitals' in window || typeof window !== 'undefined') {
      this.initializeWebVitals();
    }

    // Custom performance observers
    this.initializePerformanceObservers();

    // Chart-specific performance monitoring
    this.initializeChartPerformanceMonitoring();
  }

  private async initializeWebVitals() {
    try {
      const { getCLS, getFID, getFCP, getLCP, getTTFB } = await import('web-vitals');
      
      getCLS((metric) => this.captureMetric({
        name: 'cumulative_layout_shift',
        value: metric.value,
        unit: 'count',
        tags: { type: 'web_vital' }
      }));

      getFID((metric) => this.captureMetric({
        name: 'first_input_delay', 
        value: metric.value,
        unit: 'ms',
        tags: { type: 'web_vital' }
      }));

      getFCP((metric) => this.captureMetric({
        name: 'first_contentful_paint',
        value: metric.value,
        unit: 'ms', 
        tags: { type: 'web_vital' }
      }));

      getLCP((metric) => this.captureMetric({
        name: 'largest_contentful_paint',
        value: metric.value,
        unit: 'ms',
        tags: { type: 'web_vital' }
      }));

      getTTFB((metric) => this.captureMetric({
        name: 'time_to_first_byte',
        value: metric.value,
        unit: 'ms',
        tags: { type: 'web_vital' }
      }));

    } catch (error) {
      console.error('Failed to initialize Web Vitals:', error);
    }
  }

  private initializePerformanceObservers() {
    // Long task observer
    if ('PerformanceObserver' in window) {
      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            this.captureMetric({
              name: 'long_task',
              value: entry.duration,
              unit: 'ms',
              tags: { 
                type: 'performance',
                entryType: entry.entryType 
              }
            });
          });
        });
        longTaskObserver.observe({ entryTypes: ['longtask'] });
      } catch (error) {
        console.error('Failed to initialize long task observer:', error);
      }

      // Navigation timing observer
      try {
        const navigationObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            const navEntry = entry as PerformanceNavigationTiming;
            this.captureMetric({
              name: 'navigation_timing',
              value: navEntry.loadEventEnd - navEntry.navigationStart,
              unit: 'ms',
              tags: { 
                type: 'navigation',
                navigationType: navEntry.type 
              }
            });
          });
        });
        navigationObserver.observe({ entryTypes: ['navigation'] });
      } catch (error) {
        console.error('Failed to initialize navigation observer:', error);
      }
    }
  }

  private initializeChartPerformanceMonitoring() {
    // Hook into chart rendering performance
    window.addEventListener('chartRenderStart', (event: CustomEvent) => {
      const { chartType, timestamp } = event.detail;
      window.performance.mark(`chart-${chartType}-start`);
    });

    window.addEventListener('chartRenderEnd', (event: CustomEvent) => {
      const { chartType, timestamp } = event.detail;
      window.performance.mark(`chart-${chartType}-end`);
      
      try {
        window.performance.measure(
          `chart-${chartType}-render`,
          `chart-${chartType}-start`,
          `chart-${chartType}-end`
        );
        
        const measures = window.performance.getEntriesByName(`chart-${chartType}-render`);
        if (measures.length > 0) {
          const measure = measures[0];
          this.captureMetric({
            name: 'chart_render_time',
            value: measure.duration,
            unit: 'ms',
            tags: { 
              chartType,
              type: 'chart_performance' 
            }
          });
        }
      } catch (error) {
        console.error('Failed to measure chart performance:', error);
      }
    });
  }

  private initializeChecklyHooks() {
    // Checkly-compatible health check endpoint simulation
    window.__CHECKLY_HEALTH__ = {
      status: 'healthy',
      timestamp: Date.now(),
      version: this.config.release,
      environment: this.config.environment,
      sessionId: this.sessionId,
      
      // Chart system health
      charts: {
        loaded: 0,
        failed: 0,
        lastUpdate: Date.now()
      },
      
      // API health
      api: {
        lastSuccessfulCall: null,
        lastFailedCall: null,
        responseTime: null
      }
    };

    // Update health status periodically
    setInterval(() => {
      this.updateHealthStatus();
    }, 30000); // Every 30 seconds

    // Expose monitoring data for Checkly
    window.__CHECKLY_METRICS__ = {
      getMetrics: () => this.getMetricsSummary(),
      getErrors: () => this.getErrorSummary(),
      getPerformance: () => this.getPerformanceSummary()
    };
  }

  private handleChunkError(error: Error) {
    // Handle chunk loading errors gracefully
    console.warn('Chunk loading error detected, attempting recovery:', error.message);
    
    // Attempt to reload the page after a short delay
    setTimeout(() => {
      window.location.reload();
    }, 1000);
    
    // Track chunk errors separately
    this.captureMetric({
      name: 'chunk_load_error',
      value: 1,
      unit: 'count',
      tags: { 
        type: 'error',
        errorType: 'ChunkLoadError'
      }
    });
  }

  private processQueue() {
    // Process queued errors
    this.errorQueue.forEach(({ error, context }) => {
      this.reportError(error, context);
    });
    this.errorQueue = [];

    // Process queued metrics
    this.metricsQueue.forEach((metric) => {
      this.captureMetric(metric);
    });
    this.metricsQueue = [];
  }

  private updateHealthStatus() {
    if (window.__CHECKLY_HEALTH__) {
      window.__CHECKLY_HEALTH__.timestamp = Date.now();
      window.__CHECKLY_HEALTH__.charts.lastUpdate = Date.now();
      
      // Update API health if we have recent data
      const recentApiCalls = this.metricsQueue.filter(
        m => m.name.includes('api_') && Date.now() - (m.timestamp || 0) < 60000
      );
      
      if (recentApiCalls.length > 0) {
        const avgResponseTime = recentApiCalls.reduce((sum, m) => sum + m.value, 0) / recentApiCalls.length;
        window.__CHECKLY_HEALTH__.api.responseTime = avgResponseTime;
        window.__CHECKLY_HEALTH__.api.lastSuccessfulCall = Date.now();
      }
    }
  }

  // Public methods
  public captureError(error: Error, context: ErrorContext = {}) {
    const enrichedContext = {
      ...context,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      userAgent: navigator.userAgent,
      environment: this.config.environment
    };

    if (!this.isInitialized) {
      this.errorQueue.push({ error, context: enrichedContext });
      return;
    }

    this.reportError(error, enrichedContext);
  }

  private reportError(error: Error, context: ErrorContext) {
    try {
      if (this.config.enableErrorReporting && window.Sentry) {
        window.Sentry.withScope((scope) => {
          // Add context to Sentry scope
          Object.entries(context).forEach(([key, value]) => {
            scope.setTag(key, value);
          });
          
          scope.setLevel('error');
          scope.setContext('errorContext', context);
          
          window.Sentry.captureException(error);
        });
      }

      // Also log to console in development
      if (this.config.environment === 'development') {
        console.error('Monitoring - Error captured:', error, context);
      }

      // Update health status
      if (window.__CHECKLY_HEALTH__ && context.chartType) {
        window.__CHECKLY_HEALTH__.charts.failed++;
      }

    } catch (monitoringError) {
      console.error('Failed to report error:', monitoringError);
    }
  }

  public captureMetric(metric: PerformanceMetric) {
    const enrichedMetric = {
      ...metric,
      timestamp: metric.timestamp || Date.now(),
      tags: {
        ...metric.tags,
        sessionId: this.sessionId,
        environment: this.config.environment
      }
    };

    if (!this.isInitialized) {
      this.metricsQueue.push(enrichedMetric);
      return;
    }

    try {
      // Send to monitoring service
      if (window.Sentry) {
        window.Sentry.addBreadcrumb({
          category: 'metric',
          message: `${metric.name}: ${metric.value}${metric.unit}`,
          level: 'info',
          data: enrichedMetric
        });
      }

      // Log in development
      if (this.config.environment === 'development') {
        console.log(`📊 Metric: ${metric.name} = ${metric.value}${metric.unit}`, metric.tags);
      }

      // Update health status for chart metrics
      if (window.__CHECKLY_HEALTH__ && metric.tags?.type === 'chart_performance') {
        window.__CHECKLY_HEALTH__.charts.loaded++;
      }

    } catch (error) {
      console.error('Failed to capture metric:', error);
    }
  }

  public setUser(userData: { id?: string; email?: string; username?: string }) {
    try {
      if (window.Sentry) {
        window.Sentry.setUser(userData);
      }
    } catch (error) {
      console.error('Failed to set user:', error);
    }
  }

  public addBreadcrumb(message: string, category: string = 'custom', data?: any) {
    try {
      if (window.Sentry) {
        window.Sentry.addBreadcrumb({
          message,
          category,
          level: 'info',
          data
        });
      }
    } catch (error) {
      console.error('Failed to add breadcrumb:', error);
    }
  }

  public getMetricsSummary() {
    return {
      sessionId: this.sessionId,
      metricsCount: this.metricsQueue.length,
      environment: this.config.environment,
      timestamp: Date.now()
    };
  }

  public getErrorSummary() {
    return {
      sessionId: this.sessionId,
      errorsCount: this.errorQueue.length,
      environment: this.config.environment,
      timestamp: Date.now()
    };
  }

  public getPerformanceSummary() {
    return {
      sessionId: this.sessionId,
      navigationTiming: performance.timing,
      memory: (performance as any).memory,
      timestamp: Date.now()
    };
  }
}

// Create global monitoring instance
const monitoring = new MonitoringService({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  release: import.meta.env.VITE_APP_VERSION,
  enableErrorReporting: import.meta.env.MODE === 'production',
  enablePerformanceMonitoring: true
});

// Chart-specific error boundary integration
export const withMonitoring = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string
) => {
  return React.forwardRef<any, P>((props, ref) => {
    return React.createElement(WrappedComponent, { ...props, ref });
  });
};

// Performance measurement decorators
export const measurePerformance = (name: string) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const startTime = performance.now();
      
      try {
        const result = await originalMethod.apply(this, args);
        const duration = performance.now() - startTime;
        
        monitoring.captureMetric({
          name: `method_${name}`,
          value: duration,
          unit: 'ms',
          tags: { 
            type: 'method_performance',
            method: propertyKey 
          }
        });
        
        return result;
      } catch (error) {
        monitoring.captureError(error as Error, {
          method: propertyKey,
          args: JSON.stringify(args)
        });
        throw error;
      }
    };
    
    return descriptor;
  };
};

export default monitoring;

// Export for chart components
export { MonitoringService, type ErrorContext, type PerformanceMetric };