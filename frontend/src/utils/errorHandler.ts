/**
 * Error Handling Utilities
 * Comprehensive error handling and user feedback mechanisms
 */

import { DocumentServiceError } from '../types/documents';

// Error severity levels
export type ErrorSeverity = 'info' | 'warning' | 'error' | 'critical';

// User feedback types
export type FeedbackType = 'success' | 'info' | 'warning' | 'error';

// Error context for better error reporting
export interface ErrorContext {
  component: string;
  action: string;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
  url?: string;
  userAgent?: string;
}

// Enhanced error with context
export interface EnhancedError extends Error {
  context?: ErrorContext;
  severity?: ErrorSeverity;
  code?: string;
  originalError?: Error;
}

// User feedback message
export interface UserFeedback {
  type: FeedbackType;
  title: string;
  message: string;
  timestamp: Date;
  duration?: number; // Auto-dismiss after duration (ms)
  action?: {
    label: string;
    handler: () => void;
  };
}

// Error handler configuration
export interface ErrorHandlerConfig {
  enableLogging: boolean;
  enableUserFeedback: boolean;
  enableReporting: boolean;
  reportingEndpoint?: string;
  maxErrorsPerSession: number;
  errorBlacklist: string[];
}

// Default configuration
const DEFAULT_CONFIG: ErrorHandlerConfig = {
  enableLogging: true,
  enableUserFeedback: true,
  enableReporting: false,
  maxErrorsPerSession: 10,
  errorBlacklist: ['AbortError', 'NetworkError'] // Errors to ignore
};

// Error handler class
class ErrorHandler {
  private config: ErrorHandlerConfig;
  private errorCount: number = 0;
  private sessionErrors: EnhancedError[] = [];

  constructor(config: Partial<ErrorHandlerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // Handle an error
  handleError(error: Error | EnhancedError, context?: ErrorContext): void {
    // Check if we've reached the max errors per session
    if (this.errorCount >= this.config.maxErrorsPerSession) {
      console.warn('Max errors per session reached, ignoring further errors');
      return;
    }

    // Create enhanced error if needed
    const enhancedError: EnhancedError = error instanceof Error ? 
      { ...error, context } : 
      new Error(error.message);

    // Add context if provided
    if (context) {
      enhancedError.context = context;
    }

    // Increment error count
    this.errorCount++;
    this.sessionErrors.push(enhancedError);

    // Log error if enabled
    if (this.config.enableLogging) {
      this.logError(enhancedError);
    }

    // Report error if enabled
    if (this.config.enableReporting && this.config.reportingEndpoint) {
      this.reportError(enhancedError);
    }

    // Show user feedback if enabled
    if (this.config.enableUserFeedback) {
      this.showUserFeedback(enhancedError);
    }
  }

  // Log error to console
  private logError(error: EnhancedError): void {
    const timestamp = error.context?.timestamp || new Date();
    const component = error.context?.component || 'Unknown';
    const action = error.context?.action || 'Unknown';
    
    console.error(`[${timestamp.toISOString()}] ${component}:${action}`, error);
    
    // Log additional context if available
    if (error.context) {
      console.debug('Error context:', error.context);
    }
    
    if (error.originalError) {
      console.debug('Original error:', error.originalError);
    }
  }

  // Report error to external service
  private async reportError(error: EnhancedError): Promise<void> {
    if (!this.config.reportingEndpoint) return;
    
    try {
      const errorData = {
        message: error.message,
        stack: error.stack,
        context: error.context,
        severity: error.severity || 'error',
        code: error.code,
        timestamp: new Date().toISOString()
      };
      
      await fetch(this.config.reportingEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(errorData)
      });
    } catch (reportError) {
      console.warn('Failed to report error:', reportError);
    }
  }

  // Show user feedback
  private showUserFeedback(error: EnhancedError): void {
    // For DocumentServiceError, show specific user-friendly messages
    if (error instanceof DocumentServiceError) {
      this.showDocumentServiceError(error);
      return;
    }
    
    // For other errors, show generic message
    const feedback: UserFeedback = {
      type: 'error',
      title: 'Error',
      message: error.message || 'An unexpected error occurred',
      timestamp: new Date()
    };
    
    this.displayFeedback(feedback);
  }

  // Show specific feedback for DocumentServiceError
  private showDocumentServiceError(error: DocumentServiceError): void {
    let feedback: UserFeedback;
    
    switch (error.code) {
      case 'NETWORK_ERROR':
        feedback = {
          type: 'error',
          title: 'Connection Error',
          message: 'Unable to connect to the server. Please check your internet connection and try again.',
          timestamp: new Date(),
          action: {
            label: 'Retry',
            handler: () => window.location.reload()
          }
        };
        break;
        
      case 'NOT_FOUND':
        feedback = {
          type: 'warning',
          title: 'Not Found',
          message: 'The requested resource could not be found.',
          timestamp: new Date()
        };
        break;
        
      case 'PERMISSION_ERROR':
        feedback = {
          type: 'error',
          title: 'Access Denied',
          message: 'You do not have permission to access this resource.',
          timestamp: new Date()
        };
        break;
        
      case 'PARSE_ERROR':
        feedback = {
          type: 'error',
          title: 'Data Error',
          message: 'There was an error processing the data. Please try again later.',
          timestamp: new Date()
        };
        break;
        
      default:
        feedback = {
          type: 'error',
          title: 'Error',
          message: error.message || 'An unexpected error occurred',
          timestamp: new Date()
        };
    }
    
    this.displayFeedback(feedback);
  }

  // Display feedback to user (in a real app, this would show a toast or notification)
  private displayFeedback(feedback: UserFeedback): void {
    // In a real application, you would integrate with a notification system
    // For now, we'll just log to console
    console.log(`[${feedback.type.toUpperCase()}] ${feedback.title}: ${feedback.message}`);
    
    // If there's an action, log it too
    if (feedback.action) {
      console.log(`Action available: ${feedback.action.label}`);
    }
  }

  // Show success feedback
  showSuccess(title: string, message: string, duration?: number): void {
    const feedback: UserFeedback = {
      type: 'success',
      title,
      message,
      timestamp: new Date(),
      duration
    };
    
    this.displayFeedback(feedback);
  }

  // Show info feedback
  showInfo(title: string, message: string, duration?: number): void {
    const feedback: UserFeedback = {
      type: 'info',
      title,
      message,
      timestamp: new Date(),
      duration
    };
    
    this.displayFeedback(feedback);
  }

  // Show warning feedback
  showWarning(title: string, message: string, duration?: number): void {
    const feedback: UserFeedback = {
      type: 'warning',
      title,
      message,
      timestamp: new Date(),
      duration
    };
    
    this.displayFeedback(feedback);
  }

  // Reset error count (useful when starting a new session)
  reset(): void {
    this.errorCount = 0;
    this.sessionErrors = [];
  }

  // Get error statistics
  getStats(): { totalErrors: number; sessionErrors: number } {
    return {
      totalErrors: this.errorCount,
      sessionErrors: this.sessionErrors.length
    };
  }
}

// Create singleton instance
export const errorHandler = new ErrorHandler();

// Hook for React components to use error handling
export const useErrorHandler = () => {
  return {
    handleError: (error: Error, context?: ErrorContext) => errorHandler.handleError(error, context),
    showSuccess: (title: string, message: string, duration?: number) => errorHandler.showSuccess(title, message, duration),
    showInfo: (title: string, message: string, duration?: number) => errorHandler.showInfo(title, message, duration),
    showWarning: (title: string, message: string, duration?: number) => errorHandler.showWarning(title, message, duration)
  };
};

export default errorHandler;