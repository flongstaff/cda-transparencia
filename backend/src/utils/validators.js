/**
 * Validation utilities for API endpoints
 */

/**
 * Validate year parameter
 */
const validateYear = (year) => {
  if (!year || isNaN(year)) {
    return {
      isValid: false,
      message: 'Year is required and must be a number'
    };
  }

  const yearNum = parseInt(year);
  if (yearNum < 2018 || yearNum > 2025) {
    return {
      isValid: false,
      message: 'Year must be between 2018 and 2025'
    };
  }

  return {
    isValid: true,
    year: yearNum
  };
};

/**
 * Validate array of years
 */
const validateYearArray = (years) => {
  if (!Array.isArray(years)) {
    return {
      isValid: false,
      message: 'Years must be provided as an array'
    };
  }

  if (years.length === 0) {
    return {
      isValid: false,
      message: 'At least one year must be provided'
    };
  }

  const invalidYears = years.filter(year => {
    const yearNum = parseInt(year);
    return isNaN(yearNum) || yearNum < 2018 || yearNum > 2025;
  });

  if (invalidYears.length > 0) {
    return {
      isValid: false,
      message: `Invalid years detected: ${invalidYears.join(', ')}. All years must be between 2018 and 2025`
    };
  }

  return {
    isValid: true,
    years: years.map(y => parseInt(y))
  };
};

/**
 * Validate pagination parameters
 */
const validatePagination = (page, limit) => {
  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 10;

  if (pageNum < 1) {
    return {
      isValid: false,
      message: 'Page number must be greater than 0'
    };
  }

  if (limitNum < 1 || limitNum > 100) {
    return {
      isValid: false,
      message: 'Limit must be between 1 and 100'
    };
  }

  return {
    isValid: true,
    page: pageNum,
    limit: limitNum,
    offset: (pageNum - 1) * limitNum
  };
};

/**
 * Validate search query
 */
const validateSearchQuery = (query) => {
  if (!query || typeof query !== 'string') {
    return {
      isValid: false,
      message: 'Search query is required and must be a string'
    };
  }

  if (query.length < 2) {
    return {
      isValid: false,
      message: 'Search query must be at least 2 characters long'
    };
  }

  if (query.length > 100) {
    return {
      isValid: false,
      message: 'Search query must be less than 100 characters'
    };
  }

  return {
    isValid: true,
    query: query.trim()
  };
};

/**
 * Validate email format
 */
const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return {
      isValid: false,
      message: 'Email is required'
    };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      message: 'Invalid email format'
    };
  }

  return {
    isValid: true,
    email: email.toLowerCase().trim()
  };
};

/**
 * Validate required fields
 */
const validateRequiredFields = (data, requiredFields) => {
  const missingFields = [];
  
  requiredFields.forEach(field => {
    if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
      missingFields.push(field);
    }
  });

  if (missingFields.length > 0) {
    return {
      isValid: false,
      message: `Missing required fields: ${missingFields.join(', ')}`
    };
  }

  return {
    isValid: true
  };
};

/**
 * Sanitize input to prevent XSS and injection attacks
 */
const sanitizeInput = (input) => {
  if (typeof input !== 'string') {
    return input;
  }

  return input
    .replace(/[<>]/g, '') // Remove < and > characters
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

/**
 * Validate numeric range
 */
const validateNumericRange = (value, min, max, fieldName = 'Value') => {
  const num = parseFloat(value);
  
  if (isNaN(num)) {
    return {
      isValid: false,
      message: `${fieldName} must be a valid number`
    };
  }

  if (num < min || num > max) {
    return {
      isValid: false,
      message: `${fieldName} must be between ${min} and ${max}`
    };
  }

  return {
    isValid: true,
    value: num
  };
};

module.exports = {
  validateYear,
  validateYearArray,
  validatePagination,
  validateSearchQuery,
  validateEmail,
  validateRequiredFields,
  sanitizeInput,
  validateNumericRange
};