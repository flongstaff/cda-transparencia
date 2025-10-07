/**
 * Comprehensive Error Handler for Carmen de Areco Transparency Portal
 * Provides structured error responses with appropriate HTTP status codes
 */

class ErrorHandler {
  /**
   * Create a standardized error response
   * @param {Error} error - The original error object
   * @param {string} context - Context of where the error occurred
   * @param {number} defaultStatusCode - Default HTTP status code to return
   * @returns {object} - Standardized error response object
   */
  static createErrorResponse(error, context, defaultStatusCode = 500) {
    // Determine the appropriate status code based on error type
    const statusCode = this.getStatusCode(error, defaultStatusCode);
    
    // Create the response object
    const response = {
      success: false,
      error: {
        type: error.name || 'UnknownError',
        message: this.getErrorMessage(error, statusCode),
        timestamp: new Date().toISOString(),
        context: context,
        trace_id: this.generateTraceId() // Unique identifier for tracking this error
      }
    };

    // Include error details in development mode
    if (process.env.NODE_ENV === 'development') {
      response.error.stack = error.stack;
      response.error.original_message = error.message;
    }

    return { response, statusCode };
  }

  /**
   * Determine the appropriate HTTP status code based on the error
   * @param {Error} error - The error object
   * @param {number} defaultStatusCode - Default status code if not otherwise determined
   * @returns {number} - HTTP status code
   */
  static getStatusCode(error, defaultStatusCode = 500) {
    // Check if error has a specific status code property
    if (error.statusCode) {
      return error.statusCode;
    }

    // Check if error is a validation error
    if (error.name === 'ValidationError' || error.name === 'BadRequestError') {
      return 400;
    }

    // Check if error is related to not found resources
    if (error.name === 'NotFoundError' || error.message.includes('not found')) {
      return 404;
    }

    // Check if error is related to unauthorized access
    if (error.name === 'UnauthorizedError' || error.message.toLowerCase().includes('unauthorized')) {
      return 401;
    }

    // Check if error is related to forbidden access
    if (error.name === 'ForbiddenError' || error.message.toLowerCase().includes('forbidden')) {
      return 403;
    }

    // Check if error is related to rate limiting
    if (error.name === 'RateLimitError' || error.message.toLowerCase().includes('rate limit')) {
      return 429;
    }

    // Return the default status code if no specific conditions are met
    return defaultStatusCode;
  }

  /**
   * Format the error message appropriately
   * @param {Error} error - The error object
   * @param {number} statusCode - The HTTP status code
   * @returns {string} - Formatted error message
   */
  static getErrorMessage(error, statusCode) {
    // For 4xx client errors, return the original message
    if (statusCode >= 400 && statusCode < 500) {
      return error.message || 'Client request error';
    }

    // For 5xx server errors, return a generic message in production
    if (process.env.NODE_ENV !== 'development') {
      return statusCode === 500 
        ? 'Internal server error occurred' 
        : 'Server error occurred';
    }

    // In development, return the actual error message
    return error.message || 'Server error occurred';
  }

  /**
   * Generate a unique trace ID for error tracking
   * @returns {string} - Trace ID
   */
  static generateTraceId() {
    return `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Log error to appropriate logging system
   * @param {Error} error - The error object
   * @param {string} context - Context of where the error occurred
   * @param {object} additionalInfo - Additional information to log
   */
  static logError(error, context, additionalInfo = {}) {
    console.error({
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      context: context,
      message: error.message,
      stack: error.stack,
      additional_info: additionalInfo
    });
  }

  /**
   * Handle error in Express middleware context
   * @param {Error} error - The error object
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   * @param {function} next - Express next function
   */
  static handleExpressError(error, req, res, next) {
    const context = `${req.method} ${req.path}`;
    const { response, statusCode } = this.createErrorResponse(error, context, 500);
    
    // Log the error
    this.logError(error, context, {
      url: req.url,
      method: req.method,
      ip: req.ip,
      user_agent: req.get('User-Agent'),
      headers: req.headers
    });
    
    // Send the response
    res.status(statusCode).json(response);
  }
}

module.exports = ErrorHandler;