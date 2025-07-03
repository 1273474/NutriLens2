import { pgTable, serial, text, timestamp, jsonb, boolean, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  name: text('name'),
  healthConditions: jsonb('health_conditions').$type<string[]>(),
  allergies: jsonb('allergies').$type<string[]>(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Nutrition analysis table
export const nutritionAnalysis = pgTable('nutrition_analysis', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  imageUrl: text('image_url'),
  ingredients: jsonb('ingredients').$type<string[]>(),
  harmfulFlags: jsonb('harmful_flags').$type<Record<string, boolean>>(),
  nutrition: jsonb('nutrition').$type<{
    calories?: number;
    fat?: number;
    sugar?: number;
    protein?: number;
    carbs?: number;
    sodium?: number;
  }>(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Avoidance plans table
export const avoidancePlans = pgTable('avoidance_plans', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  planText: text('plan_text').notNull(),
  analysisId: integer('analysis_id').references(() => nutritionAnalysis.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
});

// Health conditions reference table
export const healthConditions = pgTable('health_conditions', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description'),
  harmfulIngredients: jsonb('harmful_ingredients').$type<string[]>(),
});

// Allergy types reference table
export const allergyTypes = pgTable('allergy_types', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description'),
  commonNames: jsonb('common_names').$type<string[]>(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  nutritionAnalysis: many(nutritionAnalysis),
  avoidancePlans: many(avoidancePlans),
}));

export const nutritionAnalysisRelations = relations(nutritionAnalysis, ({ one, many }) => ({
  user: one(users, {
    fields: [nutritionAnalysis.userId],
    references: [users.id],
  }),
  avoidancePlans: many(avoidancePlans),
}));

export const avoidancePlansRelations = relations(avoidancePlans, ({ one }) => ({
  user: one(users, {
    fields: [avoidancePlans.userId],
    references: [users.id],
  }),
  analysis: one(nutritionAnalysis, {
    fields: [avoidancePlans.analysisId],
    references: [nutritionAnalysis.id],
  }),
}));

// Types for TypeScript
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type NutritionAnalysis = typeof nutritionAnalysis.$inferSelect;
export type NewNutritionAnalysis = typeof nutritionAnalysis.$inferInsert;
export type AvoidancePlan = typeof avoidancePlans.$inferSelect;
export type NewAvoidancePlan = typeof avoidancePlans.$inferInsert;
export type HealthCondition = typeof healthConditions.$inferSelect;
export type AllergyType = typeof allergyTypes.$inferSelect; 