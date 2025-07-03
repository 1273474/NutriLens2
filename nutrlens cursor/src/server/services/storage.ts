import { eq, desc, and } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import db from '../database/connection';
import { 
  users, 
  nutritionAnalysis, 
  avoidancePlans, 
  healthConditions, 
  allergyTypes,
  type User,
  type NewUser,
  type NutritionAnalysis,
  type NewNutritionAnalysis,
  type AvoidancePlan,
  type NewAvoidancePlan
} from '../database/schema';

export class StorageService {
  /**
   * User Management
   */
  async createUser(userData: Omit<NewUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    
    const [user] = await db.insert(users).values({
      ...userData,
      password: hashedPassword,
    }).returning();

    return user;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || null;
  }

  async getUserById(id: number): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || null;
  }

  async updateUserProfile(
    userId: number, 
    updates: Partial<Pick<User, 'name' | 'healthConditions' | 'allergies'>>
  ): Promise<User | null> {
    const [user] = await db
      .update(users)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    return user || null;
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password);
  }

  /**
   * Nutrition Analysis Management
   */
  async createNutritionAnalysis(analysisData: Omit<NewNutritionAnalysis, 'id' | 'createdAt'>): Promise<NutritionAnalysis> {
    const [analysis] = await db.insert(nutritionAnalysis).values(analysisData).returning();
    return analysis;
  }

  async getNutritionAnalysisById(id: number): Promise<NutritionAnalysis | null> {
    const [analysis] = await db.select().from(nutritionAnalysis).where(eq(nutritionAnalysis.id, id));
    return analysis || null;
  }

  async getUserNutritionAnalysis(userId: number, limit = 10): Promise<NutritionAnalysis[]> {
    return db
      .select()
      .from(nutritionAnalysis)
      .where(eq(nutritionAnalysis.userId, userId))
      .orderBy(desc(nutritionAnalysis.createdAt))
      .limit(limit);
  }

  async getLatestNutritionAnalysis(userId: number): Promise<NutritionAnalysis | null> {
    const [analysis] = await db
      .select()
      .from(nutritionAnalysis)
      .where(eq(nutritionAnalysis.userId, userId))
      .orderBy(desc(nutritionAnalysis.createdAt))
      .limit(1);

    return analysis || null;
  }

  /**
   * Avoidance Plans Management
   */
  async createAvoidancePlan(planData: Omit<NewAvoidancePlan, 'id' | 'createdAt'>): Promise<AvoidancePlan> {
    const [plan] = await db.insert(avoidancePlans).values(planData).returning();
    return plan;
  }

  async getAvoidancePlanById(id: number): Promise<AvoidancePlan | null> {
    const [plan] = await db.select().from(avoidancePlans).where(eq(avoidancePlans.id, id));
    return plan || null;
  }

  async getUserAvoidancePlans(userId: number, limit = 10): Promise<AvoidancePlan[]> {
    return db
      .select()
      .from(avoidancePlans)
      .where(eq(avoidancePlans.userId, userId))
      .orderBy(desc(avoidancePlans.createdAt))
      .limit(limit);
  }

  async getLatestAvoidancePlan(userId: number): Promise<AvoidancePlan | null> {
    const [plan] = await db
      .select()
      .from(avoidancePlans)
      .where(eq(avoidancePlans.userId, userId))
      .orderBy(desc(avoidancePlans.createdAt))
      .limit(1);

    return plan || null;
  }

  async getAvoidancePlanWithAnalysis(planId: number): Promise<{
    plan: AvoidancePlan;
    analysis: NutritionAnalysis;
  } | null> {
    const result = await db
      .select({
        plan: avoidancePlans,
        analysis: nutritionAnalysis,
      })
      .from(avoidancePlans)
      .innerJoin(nutritionAnalysis, eq(avoidancePlans.analysisId, nutritionAnalysis.id))
      .where(eq(avoidancePlans.id, planId));

    if (result.length === 0) return null;

    return {
      plan: result[0].plan,
      analysis: result[0].analysis,
    };
  }

  /**
   * Reference Data Management
   */
  async getHealthConditions(): Promise<{ id: number; name: string; description: string | null }[]> {
    return db.select({
      id: healthConditions.id,
      name: healthConditions.name,
      description: healthConditions.description,
    }).from(healthConditions);
  }

  async getAllergyTypes(): Promise<{ id: number; name: string; description: string | null }[]> {
    return db.select({
      id: allergyTypes.id,
      name: allergyTypes.name,
      description: allergyTypes.description,
    }).from(allergyTypes);
  }

  /**
   * Statistics and Analytics
   */
  async getUserStats(userId: number): Promise<{
    totalAnalyses: number;
    totalPlans: number;
    lastAnalysisDate: Date | null;
    lastPlanDate: Date | null;
  }> {
    const [analysisCount] = await db
      .select({ count: db.fn.count() })
      .from(nutritionAnalysis)
      .where(eq(nutritionAnalysis.userId, userId));

    const [planCount] = await db
      .select({ count: db.fn.count() })
      .from(avoidancePlans)
      .where(eq(avoidancePlans.userId, userId));

    const lastAnalysis = await this.getLatestNutritionAnalysis(userId);
    const lastPlan = await this.getLatestAvoidancePlan(userId);

    return {
      totalAnalyses: Number(analysisCount.count) || 0,
      totalPlans: Number(planCount.count) || 0,
      lastAnalysisDate: lastAnalysis?.createdAt || null,
      lastPlanDate: lastPlan?.createdAt || null,
    };
  }

  /**
   * Search and Filter
   */
  async searchNutritionAnalysis(
    userId: number,
    query: string,
    limit = 10
  ): Promise<NutritionAnalysis[]> {
    return db
      .select()
      .from(nutritionAnalysis)
      .where(
        and(
          eq(nutritionAnalysis.userId, userId),
          // Note: This is a simple text search. For production, consider using full-text search
          // or a dedicated search service like Elasticsearch
          db.fn.lower(nutritionAnalysis.ingredients).like(`%${query.toLowerCase()}%`)
        )
      )
      .orderBy(desc(nutritionAnalysis.createdAt))
      .limit(limit);
  }

  /**
   * Cleanup and Maintenance
   */
  async deleteOldAnalyses(userId: number, daysOld: number): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await db
      .delete(nutritionAnalysis)
      .where(
        and(
          eq(nutritionAnalysis.userId, userId),
          db.fn.lt(nutritionAnalysis.createdAt, cutoffDate)
        )
      );

    return result.rowCount || 0;
  }

  async deleteUserData(userId: number): Promise<void> {
    // This will cascade delete related data due to foreign key constraints
    await db.delete(users).where(eq(users.id, userId));
  }
}

export default new StorageService(); 