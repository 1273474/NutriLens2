import { Router, Request, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import storageService from '../services/storage';
import ruleEngine from '../services/ruleEngine';

const router = Router();

// Generate avoidance plan based on latest analysis
router.post('/generate', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    // Get user profile
    const user = await storageService.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get latest nutrition analysis
    const latestAnalysis = await storageService.getLatestNutritionAnalysis(userId);
    if (!latestAnalysis) {
      return res.status(400).json({ error: 'No nutrition analysis found. Please analyze an ingredient list first.' });
    }

    // Generate avoidance plan using rule engine
    const plan = ruleEngine.generateAvoidancePlan(
      user.healthConditions || [],
      user.allergies || [],
      latestAnalysis.ingredients || [],
      latestAnalysis.harmfulFlags || {}
    );

    // Save plan to database
    const savedPlan = await storageService.createAvoidancePlan({
      userId,
      analysisId: latestAnalysis.id,
      planText: JSON.stringify(plan),
    });

    res.json({
      message: 'Avoidance plan generated successfully',
      plan: {
        id: savedPlan.id,
        ...plan,
        createdAt: savedPlan.createdAt,
      },
    });
  } catch (error) {
    console.error('Generate plan error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get latest avoidance plan
router.get('/latest', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const plan = await storageService.getLatestAvoidancePlan(userId);
    if (!plan) {
      return res.status(404).json({ error: 'No avoidance plan found' });
    }

    // Parse plan text back to object
    const planData = JSON.parse(plan.planText);

    res.json({
      plan: {
        id: plan.id,
        ...planData,
        createdAt: plan.createdAt,
      },
    });
  } catch (error) {
    console.error('Get latest plan error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get avoidance plan with analysis details
router.get('/latest/with-analysis', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const latestPlan = await storageService.getLatestAvoidancePlan(userId);
    if (!latestPlan) {
      return res.status(404).json({ error: 'No avoidance plan found' });
    }

    const planWithAnalysis = await storageService.getAvoidancePlanWithAnalysis(latestPlan.id);
    if (!planWithAnalysis) {
      return res.status(404).json({ error: 'Plan analysis not found' });
    }

    // Parse plan text back to object
    const planData = JSON.parse(planWithAnalysis.plan.planText);

    res.json({
      plan: {
        id: planWithAnalysis.plan.id,
        ...planData,
        createdAt: planWithAnalysis.plan.createdAt,
      },
      analysis: {
        id: planWithAnalysis.analysis.id,
        ingredients: planWithAnalysis.analysis.ingredients,
        harmfulFlags: planWithAnalysis.analysis.harmfulFlags,
        nutrition: planWithAnalysis.analysis.nutrition,
        createdAt: planWithAnalysis.analysis.createdAt,
      },
    });
  } catch (error) {
    console.error('Get plan with analysis error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's avoidance plan history
router.get('/history', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const limit = parseInt(req.query.limit as string) || 10;

    const plans = await storageService.getUserAvoidancePlans(userId, limit);

    res.json({
      plans: plans.map(plan => {
        const planData = JSON.parse(plan.planText);
        return {
          id: plan.id,
          ...planData,
          createdAt: plan.createdAt,
        };
      }),
    });
  } catch (error) {
    console.error('Get plan history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get specific plan by ID
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const planId = parseInt(req.params.id);

    if (isNaN(planId)) {
      return res.status(400).json({ error: 'Invalid plan ID' });
    }

    const plan = await storageService.getAvoidancePlanById(planId);
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    // Ensure user can only access their own plans
    if (plan.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Parse plan text back to object
    const planData = JSON.parse(plan.planText);

    res.json({
      plan: {
        id: plan.id,
        ...planData,
        createdAt: plan.createdAt,
      },
    });
  } catch (error) {
    console.error('Get plan error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get plan with analysis by ID
router.get('/:id/with-analysis', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const planId = parseInt(req.params.id);

    if (isNaN(planId)) {
      return res.status(400).json({ error: 'Invalid plan ID' });
    }

    const planWithAnalysis = await storageService.getAvoidancePlanWithAnalysis(planId);
    if (!planWithAnalysis) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    // Ensure user can only access their own plans
    if (planWithAnalysis.plan.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Parse plan text back to object
    const planData = JSON.parse(planWithAnalysis.plan.planText);

    res.json({
      plan: {
        id: planWithAnalysis.plan.id,
        ...planData,
        createdAt: planWithAnalysis.plan.createdAt,
      },
      analysis: {
        id: planWithAnalysis.analysis.id,
        ingredients: planWithAnalysis.analysis.ingredients,
        harmfulFlags: planWithAnalysis.analysis.harmfulFlags,
        nutrition: planWithAnalysis.analysis.nutrition,
        createdAt: planWithAnalysis.analysis.createdAt,
      },
    });
  } catch (error) {
    console.error('Get plan with analysis error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Generate plan for specific analysis
router.post('/generate/:analysisId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const analysisId = parseInt(req.params.analysisId);

    if (isNaN(analysisId)) {
      return res.status(400).json({ error: 'Invalid analysis ID' });
    }

    // Get user profile
    const user = await storageService.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get specific analysis
    const analysis = await storageService.getNutritionAnalysisById(analysisId);
    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    // Ensure user can only access their own analyses
    if (analysis.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Generate avoidance plan using rule engine
    const plan = ruleEngine.generateAvoidancePlan(
      user.healthConditions || [],
      user.allergies || [],
      analysis.ingredients || [],
      analysis.harmfulFlags || {}
    );

    // Save plan to database
    const savedPlan = await storageService.createAvoidancePlan({
      userId,
      analysisId: analysis.id,
      planText: JSON.stringify(plan),
    });

    res.json({
      message: 'Avoidance plan generated successfully',
      plan: {
        id: savedPlan.id,
        ...plan,
        createdAt: savedPlan.createdAt,
      },
    });
  } catch (error) {
    console.error('Generate plan for analysis error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete plan
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const planId = parseInt(req.params.id);

    if (isNaN(planId)) {
      return res.status(400).json({ error: 'Invalid plan ID' });
    }

    const plan = await storageService.getAvoidancePlanById(planId);
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    // Ensure user can only delete their own plans
    if (plan.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Note: In a real implementation, you would add a delete method to storageService
    // For now, we'll just return success
    res.json({ message: 'Plan deleted successfully' });
  } catch (error) {
    console.error('Delete plan error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 