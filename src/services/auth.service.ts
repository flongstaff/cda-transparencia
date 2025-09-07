import { User } from '../models/user.model';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  verifyRefreshToken
} from '../utils/jwt';
import { CustomError } from '../errors/custom.error';

// Interface for authentication response
interface AuthResponse {
  token: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    role?: string;
  };
  expiresAt: Date;
}

// Interface for token refresh response
interface RefreshResponse {
  token: string;
  refreshToken: string;
  expiresAt: Date;
}

// Service class for authentication operations
export class AuthService {
  
  // User registration with validation
  async registerUser(email: string, password: string, role?: string): Promise<AuthResponse> {
    // Validate input
    if (!email || !password) {
      throw new CustomError('Email and password are required', 400);
    }

    if (password.length < 6) {
      throw new CustomError('Password must be at least 6 characters long', 400);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new CustomError('User with this email already exists', 409);
    }

    // Create new user
    const newUser = new User({
      email,
      password,  // Password will be hashed in the model
      role: role || 'user'
    });

    try {
      await newUser.save();
      
      // Generate tokens
      const { token, expiresAt } = generateAccessToken(newUser);
      const { refreshToken } = generateRefreshToken(newUser._id.toString());

      return {
        token,
        refreshToken,
        user: {
          id: newUser._id.toString(),
          email: newUser.email,
          role: newUser.role
        },
        expiresAt
      };
      
    } catch (error) {
      if (error instanceof Error) {
        throw new CustomError(`Registration failed: ${error.message}`, 500);
      }
      throw new CustomError('Registration failed', 500);
    }
  }

  // User login with authentication
  async loginUser(email: string, password: string): Promise<AuthResponse> {
    // Validate input
    if (!email || !password) {
      throw new CustomError('Email and password are required', 400);
    }

    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      throw new CustomError('Invalid credentials', 401);
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new CustomError('Invalid credentials', 401);
    }

    // Generate tokens
    const { token, expiresAt } = generateAccessToken(user);
    const { refreshToken } = generateRefreshToken(user._id.toString());

    return {
      token,
      refreshToken,
      user: {
        id: user._id.toString(),
        email: user.email,
        role: user.role
      },
      expiresAt
    };
  }

  // Refresh authentication tokens
  async refreshToken(refreshToken: string): Promise<RefreshResponse> {
    // Verify refresh token
    const verificationResult = verifyRefreshToken(refreshToken);
    
    if (!verificationResult.valid) {
      throw new CustomError('Invalid refresh token', 401);
    }

    // Look up user by ID from refresh token
    const userId = verificationResult.userId;
    if (!userId) {
      throw new CustomError('Invalid refresh token', 401);
    }

    const user = await User.findById(userId);
    
    if (!user) {
      throw new CustomError('User not found', 404);
    }

    // Generate new access token
    const { token, expiresAt } = generateAccessToken(user);
    
    return {
      token,
      refreshToken: await this.generateNewRefreshToken(userId), // Generate new refresh token
      expiresAt
    };
  }

  // Helper method to generate a new refresh token
  private async generateNewRefreshToken(userId: string): Promise<string> {
    const { refreshToken } = generateRefreshToken(userId);
    return refreshToken;
  }

  // Logout user - would typically invalidate refresh token in a real implementation
  async logoutUser(refreshToken: string): Promise<void> {
    // In a real implementation, we would:
    // 1. Store refresh token in a database with expiration
    // 2. Mark it as revoked when user logs out
    // For now, we'll simply validate and accept the token
    
    const verificationResult = verifyRefreshToken(refreshToken);
    
    if (!verificationResult.valid) {
      throw new CustomError('Invalid refresh token', 401);
    }
    
    // In a production system, we would invalidate the refresh token here
    // But for simplicity in this implementation, we just accept it
    
    return;
  }
}
