import { Router } from 'express';
import { AuthService } from '../services/auth.service';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();
const authService = new AuthService();

// POST /api/auth/register - User registration
router.post('/register', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    
    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await authService.registerUser(email, password, role);
    
    res.status(201).json({
      message: 'User registered successfully',
      data: result
    });
    
  } catch (error) {
    if (error instanceof Error) {
      res.status(error.statusCode || 500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Registration failed' });
    }
  }
});

// POST /api/auth/login - User login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await authService.loginUser(email, password);
    
    res.json({
      message: 'Login successful',
      data: result
    });
    
  } catch (error) {
    if (error instanceof Error) {
      res.status(error.statusCode || 500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Login failed' });
    }
  }
});

// POST /api/auth/refresh - Token refresh
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    // Implement retry logic up to 3 times
    let attempts = 0;
    const maxAttempts = 3;
    let result;
    
    while (attempts < maxAttempts) {
      try {
        result = await authService.refreshToken(refreshToken);
        
        // If successful, break out of the loop
        if (result) {
          break;
        }
      } catch (error) {
        attempts++;
        
        // If we've reached maximum attempts, return error
        if (attempts >= maxAttempts) {
          throw new Error('Maximum retry attempts reached');
        }
        
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 100 * Math.pow(2, attempts)));
      }
    }

    if (!result) {
      return res.status(401).json({ error: 'Could not refresh token after maximum attempts' });
    }

    res.json({
      message: 'Token refreshed successfully',
      data: result
    });
    
  } catch (error) {
    if (error instanceof Error && error.message.includes('Maximum retry attempts reached')) {
      res.status(401).json({ error: 'Authentication failed after maximum retry attempts' });
    } else if (error instanceof Error) {
      res.status(401).json({ error: 'Invalid refresh token' });
    } else {
      res.status(500).json({ error: 'Token refresh failed' });
    }
  }
});

// GET /api/auth/profile - Get user profile (protected route)
router.get('/profile', authenticate, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Send user information
    res.json({
      message: 'User profile retrieved successfully',
      data: {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role
      }
    });
    
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve profile' });
  }
});

// POST /api/auth/logout - User logout
router.post('/logout', authenticate, async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    // Implement logout with refresh token validation
    await authService.logoutUser(refreshToken);
    
    res.json({ message: 'Logout successful' });
    
  } catch (error) {
    if (error instanceof Error) {
      res.status(error.statusCode || 500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Logout failed' });
    }
  }
});

// GET /api/auth/health - Health check
router.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

export default router;
