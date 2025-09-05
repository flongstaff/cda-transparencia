/**
 * Standardized response handlers for consistent API responses
 */

/**
 * Handle successful API responses
 */
const handleSuccess = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
    timestamp: new Date().toISOString()
  });
};

/**
 * Handle error responses
 */
const handleError = (res, error, message = 'Internal Server Error', statusCode = 500) => {
  console.error('API Error:', error);
  
  return res.status(statusCode).json({
    success: false,
    error: message,
    details: error.message || error,
    timestamp: new Date().toISOString()
  });
};

/**
 * Handle validation errors
 */
const handleValidationError = (res, validationErrors, message = 'Validation Error') => {
  return res.status(400).json({
    success: false,
    error: message,
    validation_errors: validationErrors,
    timestamp: new Date().toISOString()
  });
};

/**
 * Handle not found errors
 */
const handleNotFound = (res, message = 'Resource not found') => {
  return res.status(404).json({
    success: false,
    error: message,
    timestamp: new Date().toISOString()
  });
};

/**
 * Handle unauthorized errors
 */
const handleUnauthorized = (res, message = 'Unauthorized access') => {
  return res.status(401).json({
    success: false,
    error: message,
    timestamp: new Date().toISOString()
  });
};

/**
 * Handle rate limit errors
 */
const handleRateLimit = (res, message = 'Rate limit exceeded') => {
  return res.status(429).json({
    success: false,
    error: message,
    timestamp: new Date().toISOString()
  });
};

module.exports = {
  handleSuccess,
  handleError,
  handleValidationError,
  handleNotFound,
  handleUnauthorized,
  handleRateLimit
};