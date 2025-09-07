import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { CustomError } from '../errors/custom.error';

// Interface for user object in request
interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role?: string;
  };
}

/**
 * Middleware to authenticate requests
 * 
 * Checks for valid JWT token in Authorization header and attaches user information to request
 */
export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new CustomError('Authentication required', 401);
    }

    // Extract token
    const token = authHeader.substring(7); // Remove "Bearer " prefix

    // Verify token
    const verificationResult = verifyToken(token);
    
    if (!verificationResult.valid) {
      throw new CustomError('Invalid or expired token', 401);
    }

    // Attach user information to request
    req.user = {
      id: verificationResult.payload?.id || '',
      email: verificationResult.payload?.email || '',
      role: verificationResult.payload?.role
    };

    // Continue to next middleware/handler
    next();
    
  } catch (error) {
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({
        error: error.message
      });
    } else if (error instanceof Error) {
      res.status(500).json({
        error: 'Authentication failed'
      });
    } else {
      res.status(500).json({
        error: 'Authentication failed'
      });
    }
  }
};

/**
 * Middleware to check if user has a specific role
 * 
 * @param requiredRole - The role that is required for access
 */
export const authorize = (requiredRole: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        throw new CustomError('Authentication required', 401);
      }

      // Check if user has required role
      const hasPermission = req.user.role === requiredRole;
      
      if (!hasPermission) {
        throw new CustomError('Insufficient permissions', 403);
      }

      // Continue to next middleware/handler
      next();
      
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({
          error: error.message
        });
      } else if (error instanceof Error) {
        res.status(500).json({
          error: 'Authorization failed'
        });
      } else {
        res.status(500).json({
          error: 'Authorization failed'
        });
      }
    }
  };
};
