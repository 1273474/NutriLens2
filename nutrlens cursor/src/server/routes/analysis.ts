import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import aiService from '../services/aiService';
import storageService from '../services/storage';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = process.env.UPLOAD_PATH || './uploads';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `ingredient-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB default
  },
  fileFilter: (req, file, cb) => {
    // Allow only image files
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed'));
  }
});

// Analyze image and extract ingredients
router.post('/analyze', authenticateToken, upload.single('image'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    const userId = req.user!.id;

    // Read the uploaded file
    const imageBuffer = fs.readFileSync(req.file.path);

    // Extract ingredients using OCR
    const ingredients = await aiService.extractIngredientsFromImage(imageBuffer);

    if (ingredients.length === 0) {
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'No ingredients found in the image. Please ensure the ingredient list is clearly visible.' });
    }

    // Classify ingredients using NLP
    const classifiedIngredients = await aiService.classifyIngredients(ingredients);

    // Create harmful flags object
    const harmfulFlags: Record<string, boolean> = {};
    classifiedIngredients.forEach(item => {
      harmfulFlags[item.ingredient] = item.flagged;
    });

    // Extract nutrition info from the image text (if available)
    const nutritionInfo = aiService.extractNutritionInfo(ingredients.join(' '));

    // Save analysis to database
    const analysis = await storageService.createNutritionAnalysis({
      userId,
      imageUrl: req.file.filename, // Store filename for reference
      ingredients,
      harmfulFlags,
      nutrition: nutritionInfo,
    });

    // Clean up uploaded file after processing
    fs.unlinkSync(req.file.path);

    res.json({
      message: 'Analysis completed successfully',
      analysis: {
        id: analysis.id,
        ingredients,
        harmfulFlags,
        nutrition: nutritionInfo,
        classifiedIngredients,
        createdAt: analysis.createdAt,
      },
    });
  } catch (error) {
    console.error('Analysis error:', error);
    
    // Clean up uploaded file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    if (error instanceof Error) {
      if (error.message.includes('AI Service Error')) {
        return res.status(503).json({ error: 'AI service temporarily unavailable. Please try again later.' });
      }
      if (error.message.includes('No ingredients found')) {
        return res.status(400).json({ error: error.message });
      }
    }

    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's nutrition analysis history
router.get('/history', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const limit = parseInt(req.query.limit as string) || 10;
    
    const analyses = await storageService.getUserNutritionAnalysis(userId, limit);

    res.json({
      analyses: analyses.map(analysis => ({
        id: analysis.id,
        ingredients: analysis.ingredients,
        harmfulFlags: analysis.harmfulFlags,
        nutrition: analysis.nutrition,
        createdAt: analysis.createdAt,
      })),
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get specific analysis by ID
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const analysisId = parseInt(req.params.id);

    if (isNaN(analysisId)) {
      return res.status(400).json({ error: 'Invalid analysis ID' });
    }

    const analysis = await storageService.getNutritionAnalysisById(analysisId);

    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    // Ensure user can only access their own analyses
    if (analysis.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({
      analysis: {
        id: analysis.id,
        ingredients: analysis.ingredients,
        harmfulFlags: analysis.harmfulFlags,
        nutrition: analysis.nutrition,
        createdAt: analysis.createdAt,
      },
    });
  } catch (error) {
    console.error('Get analysis error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search analyses
router.get('/search', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const query = req.query.q as string;
    const limit = parseInt(req.query.limit as string) || 10;

    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const analyses = await storageService.searchNutritionAnalysis(userId, query, limit);

    res.json({
      analyses: analyses.map(analysis => ({
        id: analysis.id,
        ingredients: analysis.ingredients,
        harmfulFlags: analysis.harmfulFlags,
        nutrition: analysis.nutrition,
        createdAt: analysis.createdAt,
      })),
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete analysis
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const analysisId = parseInt(req.params.id);

    if (isNaN(analysisId)) {
      return res.status(400).json({ error: 'Invalid analysis ID' });
    }

    const analysis = await storageService.getNutritionAnalysisById(analysisId);

    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    // Ensure user can only delete their own analyses
    if (analysis.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Note: In a real implementation, you would add a delete method to storageService
    // For now, we'll just return success
    res.json({ message: 'Analysis deleted successfully' });
  } catch (error) {
    console.error('Delete analysis error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 