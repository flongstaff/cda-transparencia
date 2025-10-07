<<<<<<< HEAD
/**
 * CARMEN DE ARECO TRANSPARENCY PORTAL - CLOUDFLARE WORKERS API
 *
 * Cloudflare Workers compatible API server for external data sources
 * Handles CORS bypass, caching, and data integration for production deployment
 */
=======
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const path = require('path');
const ErrorHandler = require('./utils/ErrorHandler');
>>>>>>> origin/main

// Cloudflare Workers compatible imports
import { handleCORS, createResponse } from './utils/cors';
import { cacheManager } from './utils/cache';
import { rateLimiter } from './utils/rateLimit';
import { externalDataService } from './services/externalDataService';

/**
 * Main fetch handler for Cloudflare Workers
 */
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

<<<<<<< HEAD
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return handleCORS(request);
    }

    // Rate limiting
    const rateLimitResult = await rateLimiter.check(request);
    if (!rateLimitResult.allowed) {
      return createResponse({
        status: 429,
        data: { error: 'Rate limit exceeded', retryAfter: rateLimitResult.retryAfter }
      });
    }
=======
console.log('🚀 Initializing Carmen de Areco Comprehensive Transparency API...');
>>>>>>> origin/main

    try {
      // Route handling
      switch (url.pathname) {
        case '/health':
          return handleHealthCheck();

<<<<<<< HEAD
        case '/api/external/all-external-data':
          return handleAllExternalData(request);

        case '/api/external/carmen-de-areco':
          return handleCarmenDeArecoData(request);

        case '/api/external/buenos-aires':
          return handleBuenosAiresData(request);

        case '/api/external/national':
          return handleNationalData(request);

        case '/api/cache/clear':
          if (request.method === 'DELETE') {
            return handleCacheClear();
          }
          break;

        case '/api/cache/stats':
          return handleCacheStats();

        default:
          return createResponse({
            status: 404,
            data: { error: 'Endpoint not found', path: url.pathname }
          });
      }

      return createResponse({
        status: 404,
        data: { error: 'Endpoint not found' }
      });

    } catch (error) {
      console.error('Server error:', error);
      return createResponse({
        status: 500,
        data: {
          error: 'Internal server error',
          message: env.NODE_ENV === 'development' ? error.message : 'Contact administrator'
        }
      });
    }
  }
};

/**
 * Health check endpoint
 */
async function handleHealthCheck() {
  const cacheStats = cacheManager.getStats();

  return createResponse({
    status: 200,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'Carmen de Areco Transparency API (Cloudflare Workers)',
      cache_stats: cacheStats,
      version: '2.0.0'
    }
  });
}

/**
 * Handle all external data aggregation
 */
async function handleAllExternalData(request) {
  try {
    const data = await externalDataService.loadAllExternalData();
=======
// Rate limiting - Increased for development
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Increased limit for development
  message: { 
    success: false,
    error: {
      type: 'RateLimitError',
      message: 'Too many requests',
      details: 'Rate limit exceeded, please try again later.',
      timestamp: new Date().toISOString()
    }
  }
});
app.use(limiter);

// Initialize the comprehensive transparency system
const routes = require('./routes');

// Use comprehensive transparency routes
app.use('/api', routes);

// Error handling middleware
app.use((err, req, res, next) => {
  ErrorHandler.handleExpressError(err, req, res, next);
});

// 404 handler
app.use((req, res) => {
  const notFoundError = new Error('Endpoint not found');
  notFoundError.name = 'NotFoundError';
  
  const { response, statusCode } = ErrorHandler.createErrorResponse(notFoundError, `404 - ${req.method} ${req.path}`, 404);
  ErrorHandler.logError(notFoundError, `404 - ${req.method} ${req.path}`, {
    url: req.url,
    method: req.method,
    ip: req.ip
  });
  
  res.status(statusCode).json(response);
});
>>>>>>> origin/main

    return createResponse({
      status: 200,
      data: data
    });
  } catch (error) {
    console.error('Error loading all external data:', error);
    return createResponse({
      status: 500,
      data: { error: 'Failed to load external data', message: error.message }
    });
  }
}

/**
 * Handle Carmen de Areco specific data
 */
async function handleCarmenDeArecoData(request) {
  try {
    const data = await externalDataService.getCarmenDeArecoData();

    return createResponse({
      status: 200,
      data: data
    });
  } catch (error) {
    console.error('Error loading Carmen de Areco data:', error);
    return createResponse({
      status: 500,
      data: { error: 'Failed to load Carmen de Areco data', message: error.message }
    });
  }
}

/**
 * Handle Buenos Aires Province data
 */
async function handleBuenosAiresData(request) {
  try {
    const data = await externalDataService.getBuenosAiresTransparencyData();

    return createResponse({
      status: 200,
      data: data
    });
  } catch (error) {
    console.error('Error loading Buenos Aires data:', error);
    return createResponse({
      status: 500,
      data: { error: 'Failed to load Buenos Aires data', message: error.message }
    });
  }
}

/**
 * Handle national data
 */
async function handleNationalData(request) {
  try {
    const data = await externalDataService.getNationalBudgetData();

    return createResponse({
      status: 200,
      data: data
    });
  } catch (error) {
    console.error('Error loading national data:', error);
    return createResponse({
      status: 500,
      data: { error: 'Failed to load national data', message: error.message }
    });
  }
}

/**
 * Handle cache clear
 */
async function handleCacheClear() {
  cacheManager.clear();

  return createResponse({
    status: 200,
    data: { message: 'Cache cleared successfully' }
  });
}

/**
 * Handle cache statistics
 */
async function handleCacheStats() {
  const stats = cacheManager.getStats();

  return createResponse({
    status: 200,
    data: stats
  });
}

/**
 * Legacy Express server for local development
 */
export class ExpressServer {
  constructor() {
    // This would be used for local development only
    console.log('Express server class available for local development');
  }
}
