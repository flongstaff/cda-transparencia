import { useEffect } from 'react';

export interface MetricData {
  name: string;
  value: number;
  unit?: string;
  tags?: Record<string, string>;
}

export interface ErrorData {
  error: Error;
  context?: Record<string, any>;
  timestamp: string;
}

export class MonitoringService {
  private static instance: MonitoringService;
  private metrics: MetricData[] = [];
  private errors: ErrorData[] = [];
  private initialized = false;

  private constructor() {}

  public static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  public initialize() {
    if (this.initialized) return;
    
    try {
      this.initializePerformanceMonitoring();
      this.initializeErrorTracking();
      this.initializeUserInteractionTracking();
      
      this.initialized = true;
      console.log('🔍 Monitoring service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize monitoring service:', error);
    }
  }

  private initializePerformanceMonitoring() {
    // Navigation timing
    if (window.performance) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        this.captureMetric({
          name: 'navigation_timing',
          value: navigation.loadEventEnd - navigation.startTime,
          unit: 'ms'
        });
      }
    }

    // Resource timing
    if (window.performance) {
      const resources = performance.getEntriesByType('resource');
      resources.forEach(resource => {
        if (resource.duration > 0) {
          this.captureMetric({
            name: 'resource_timing',
            value: resource.duration,
            unit: 'ms',
            tags: { name: resource.name, type: resource.entryType }
          });
        }
      });
    }
  }

  private initializeErrorTracking() {
    window.addEventListener('error', (event) => {
      this.captureError(event.error, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        message: event.message
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.captureError(event.reason instanceof Error ? event.reason : new Error(String(event.reason)), {
        type: 'unhandledrejection',
        promise: event.promise
      });
    });
  }

  private initializeUserInteractionTracking() {
    // Track clicks
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      this.captureMetric({
        name: 'user_interaction',
        value: 1,
        tags: {
          type: 'click',
          element: target.tagName.toLowerCase(),
          class: target.className
        }
      });
    });

    // Track page visibility
    document.addEventListener('visibilitychange', () => {
      this.captureMetric({
        name: 'page_visibility',
        value: document.visibilityState === 'visible' ? 1 : 0,
        tags: { state: document.visibilityState }
      });
    });
  }

  public initializeWebVitals() {
    // Only initialize if web vitals are available and in a browser environment
    if (typeof window !== 'undefined' && window.performance) {
      try {
        // Dynamically import web-vitals to avoid bundling issues if not used
        // and to ensure functions are available before calling
        import('web-vitals').then(({ getCLS, getFID, getLCP, getTTFB, getINP }) => {
          if (getCLS) {
            getCLS((metric: any) => {
              this.captureMetric({
                name: `web_vitals_cls`,
                value: metric.value,
                unit: 'score'
              });
            });
          }
          if (getFID) {
            getFID((metric: any) => {
              this.captureMetric({
                name: `web_vitals_fid`,
                value: metric.value,
                unit: 'ms'
              });
            });
          }
          if (getLCP) {
            getLCP((metric: any) => {
              this.captureMetric({
                name: `web_vitals_lcp`,
                value: metric.value,
                unit: 'ms'
              });
            });
          }
          if (getTTFB) {
            getTTFB((metric: any) => {
              this.captureMetric({
                name: `web_vitals_ttfb`,
                value: metric.value,
                unit: 'ms'
              });
            });
          }
          if (getINP) {
            getINP((metric: any) => {
              this.captureMetric({
                name: `web_vitals_inp`,
                value: metric.value,
                unit: 'ms'
              });
            });
          }
        }).catch((error) => {
          console.warn('Failed to load web-vitals library:', error);
        });
      } catch (error) {
        console.warn('Failed to initialize Web Vitals:', error);
      }
    }
  }

  public captureMetric(metric: MetricData) {
    const metricData: MetricData = {
      ...metric,
      timestamp: new Date().toISOString()
    };

    this.metrics.push(metricData);

    // Log to console for debugging
    if (import.meta.env.DEV) {
      console.log(`📊 Metric: ${metric.name} = ${metric.value}${metric.unit ? metric.unit : ''}`, metric.tags);
    }
  }

  public captureError(error: Error, context?: Record<string, any>) {
    const errorData: ErrorData = {
      error,
      context,
      timestamp: new Date().toISOString()
    };

    this.errors.push(errorData);

    // Log to console for debugging
    if (import.meta.env.DEV) {
      console.error(`❌ Error captured:`, error);
      if (context) {
        console.error('Context:', context);
      }
    }
  }

  public getMetrics(): MetricData[] {
    return [...this.metrics];
  }

  public getErrors(): ErrorData[] {
    return [...this.errors];
  }

  public clearMetrics() {
    this.metrics = [];
  }

  public clearErrors() {
    this.errors = [];
  }

  public generateReport() {
    return {
      metrics: this.metrics,
      errors: this.errors,
      summary: {
        totalMetrics: this.metrics.length,
        totalErrors: this.errors.length,
        timeRange: {
          start: this.metrics.length > 0 ? this.metrics[0].timestamp : null,
          end: this.metrics.length > 0 ? this.metrics[this.metrics.length - 1].timestamp : null
        }
      }
    };
  }
}

// Export singleton instance
export const monitoring = MonitoringService.getInstance();

// Initialize monitoring when module is imported
if (typeof window !== 'undefined') {
  monitoring.initialize();
  monitoring.initializeWebVitals();
}