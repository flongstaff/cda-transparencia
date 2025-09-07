import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';
const JWT_EXPIRES_IN = '1h'; // Access token expiration
const REFRESH_TOKEN_EXPIRES_IN = '7d'; // Refresh token expiration

// Interface for JWT payload
interface JwtPayload {
  id: string;
  email: string;
  role?: string;
}

// Generate access token
export const generateAccessToken = (user: User): { token: string; expiresAt: Date } => {
  const payload: JwtPayload = {
    id: user._id.toString(),
    email: user.email,
    role: user.role
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  
  // Calculate expiration time
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1);

  return { token, expiresAt };
};

// Generate refresh token
export const generateRefreshToken = (userId: string): { refreshToken: string; expiresAt: Date } => {
  const payload = { id: userId };
  
  const refreshToken = jwt.sign(payload, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN });
  
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  return { refreshToken, expiresAt };
};

// Verify JWT token
export const verifyToken = (token: string): { valid: boolean; payload?: JwtPayload; error?: string } => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    
    return { 
      valid: true, 
      payload: decoded 
    };
  } catch (error) {
    return { 
      valid: false, 
      error: error instanceof Error ? error.message : 'Token verification failed' 
    };
  }
};

// Verify refresh token
export const verifyRefreshToken = (token: string): { valid: boolean; userId?: string; error?: string } => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    
    return {
      valid: true,
      userId: decoded.id
    };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Refresh token verification failed'
    };
  }
};
