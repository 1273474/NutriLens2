import { Router, Request, Response } from 'express';
import { authenticateToken, generateToken, AuthRequest } from '../middleware/auth';
import storageService from '../services/storage';
import ruleEngine from '../services/ruleEngine';

const router = Router();

// Register new user
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name, healthConditions = [], allergies = [] } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Check if user already exists
    const existingUser = await storageService.getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    // Validate health conditions and allergies
    const validation = ruleEngine.validateUserProfile(healthConditions, allergies);
    if (!validation.valid) {
      return res.status(400).json({ error: 'Invalid health conditions or allergies', details: validation.errors });
    }

    // Create user
    const user = await storageService.createUser({
      email,
      password,
      name,
      healthConditions,
      allergies,
    });

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name || undefined,
    });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        healthConditions: user.healthConditions,
        allergies: user.allergies,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login user
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await storageService.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Validate password
    const isValidPassword = await storageService.validatePassword(user, password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name || undefined,
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        healthConditions: user.healthConditions,
        allergies: user.allergies,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user profile
router.get('/profile', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = await storageService.getUserById(req.user!.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        healthConditions: user.healthConditions,
        allergies: user.allergies,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { name, healthConditions, allergies } = req.body;

    // Validate health conditions and allergies if provided
    if (healthConditions || allergies) {
      const currentUser = await storageService.getUserById(req.user!.id);
      if (!currentUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      const newConditions = healthConditions || currentUser.healthConditions || [];
      const newAllergies = allergies || currentUser.allergies || [];

      const validation = ruleEngine.validateUserProfile(newConditions, newAllergies);
      if (!validation.valid) {
        return res.status(400).json({ error: 'Invalid health conditions or allergies', details: validation.errors });
      }
    }

    // Update user
    const updatedUser = await storageService.updateUserProfile(req.user!.id, {
      name,
      healthConditions,
      allergies,
    });

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        healthConditions: updatedUser.healthConditions,
        allergies: updatedUser.allergies,
        updatedAt: updatedUser.updatedAt,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get available health conditions and allergies
router.get('/reference-data', async (req: Request, res: Response) => {
  try {
    const [healthConditions, allergyTypes] = await Promise.all([
      storageService.getHealthConditions(),
      storageService.getAllergyTypes(),
    ]);

    res.json({
      healthConditions,
      allergyTypes,
    });
  } catch (error) {
    console.error('Get reference data error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user statistics
router.get('/stats', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const stats = await storageService.getUserStats(req.user!.id);
    res.json(stats);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 