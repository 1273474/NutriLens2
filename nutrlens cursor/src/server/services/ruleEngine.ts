interface HealthRule {
  condition: string;
  harmfulIngredients: string[];
  recommendations: string[];
  severity: 'low' | 'medium' | 'high';
}

interface AllergyRule {
  allergen: string;
  commonNames: string[];
  symptoms: string[];
  severity: 'mild' | 'moderate' | 'severe';
}

interface AvoidancePlan {
  summary: string;
  harmfulIngredients: string[];
  recommendations: string[];
  alternatives: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

export class RuleEngine {
  private healthRules: HealthRule[] = [
    {
      condition: 'diabetes',
      harmfulIngredients: [
        'sugar', 'high fructose corn syrup', 'dextrose', 'maltose',
        'sucrose', 'glucose', 'fructose', 'lactose', 'maltodextrin',
        'corn syrup', 'agave nectar', 'honey', 'maple syrup'
      ],
      recommendations: [
        'Monitor blood sugar levels after consumption',
        'Consider sugar-free alternatives',
        'Limit portion sizes',
        'Pair with protein to slow sugar absorption'
      ],
      severity: 'high'
    },
    {
      condition: 'hypertension',
      harmfulIngredients: [
        'sodium', 'salt', 'monosodium glutamate', 'msg',
        'sodium nitrate', 'sodium nitrite', 'sodium benzoate',
        'sodium phosphate', 'sodium citrate'
      ],
      recommendations: [
        'Choose low-sodium alternatives',
        'Rinse canned foods to reduce sodium',
        'Use herbs and spices instead of salt',
        'Monitor daily sodium intake'
      ],
      severity: 'high'
    },
    {
      condition: 'heart disease',
      harmfulIngredients: [
        'trans fat', 'hydrogenated oil', 'partially hydrogenated',
        'saturated fat', 'cholesterol', 'sodium'
      ],
      recommendations: [
        'Choose heart-healthy alternatives',
        'Limit saturated and trans fats',
        'Increase fiber intake',
        'Monitor cholesterol levels'
      ],
      severity: 'high'
    },
    {
      condition: 'celiac disease',
      harmfulIngredients: [
        'wheat', 'gluten', 'barley', 'rye', 'malt',
        'modified food starch', 'hydrolyzed vegetable protein'
      ],
      recommendations: [
        'Choose certified gluten-free products',
        'Read labels carefully for hidden gluten',
        'Avoid cross-contamination',
        'Consider certified gluten-free alternatives'
      ],
      severity: 'high'
    },
    {
      condition: 'lactose intolerance',
      harmfulIngredients: [
        'milk', 'lactose', 'whey', 'casein', 'cream',
        'butter', 'cheese', 'yogurt', 'milk solids'
      ],
      recommendations: [
        'Choose lactose-free alternatives',
        'Consider plant-based milk options',
        'Use lactase enzyme supplements',
        'Monitor for digestive symptoms'
      ],
      severity: 'medium'
    }
  ];

  private allergyRules: AllergyRule[] = [
    {
      allergen: 'peanuts',
      commonNames: ['peanut', 'arachis', 'groundnut', 'monkey nut'],
      symptoms: ['Hives', 'Swelling', 'Difficulty breathing', 'Anaphylaxis'],
      severity: 'severe'
    },
    {
      allergen: 'tree nuts',
      commonNames: ['almond', 'walnut', 'cashew', 'pecan', 'pistachio', 'macadamia'],
      symptoms: ['Hives', 'Swelling', 'Difficulty breathing', 'Anaphylaxis'],
      severity: 'severe'
    },
    {
      allergen: 'dairy',
      commonNames: ['milk', 'cheese', 'yogurt', 'cream', 'butter', 'casein', 'whey'],
      symptoms: ['Digestive issues', 'Skin reactions', 'Respiratory problems'],
      severity: 'moderate'
    },
    {
      allergen: 'eggs',
      commonNames: ['egg', 'albumin', 'ovalbumin', 'lysozyme'],
      symptoms: ['Hives', 'Digestive issues', 'Respiratory problems'],
      severity: 'moderate'
    },
    {
      allergen: 'soy',
      commonNames: ['soy', 'soya', 'soybean', 'tofu', 'tempeh', 'miso'],
      symptoms: ['Digestive issues', 'Skin reactions', 'Respiratory problems'],
      severity: 'moderate'
    },
    {
      allergen: 'shellfish',
      commonNames: ['shrimp', 'crab', 'lobster', 'oyster', 'clam', 'mussel'],
      symptoms: ['Hives', 'Swelling', 'Difficulty breathing', 'Anaphylaxis'],
      severity: 'severe'
    }
  ];

  /**
   * Generate personalized avoidance plan based on user conditions and ingredients
   */
  generateAvoidancePlan(
    userConditions: string[],
    userAllergies: string[],
    ingredients: string[],
    harmfulFlags: Record<string, boolean>
  ): AvoidancePlan {
    const harmfulIngredients: string[] = [];
    const recommendations: string[] = [];
    const alternatives: string[] = [];
    let riskLevel: 'low' | 'medium' | 'high' = 'low';

    // Check health conditions
    for (const condition of userConditions) {
      const rule = this.healthRules.find(r => 
        r.condition.toLowerCase() === condition.toLowerCase()
      );

      if (rule) {
        const matchingIngredients = ingredients.filter(ingredient =>
          rule.harmfulIngredients.some(harmful =>
            ingredient.toLowerCase().includes(harmful.toLowerCase())
          )
        );

        if (matchingIngredients.length > 0) {
          harmfulIngredients.push(...matchingIngredients);
          recommendations.push(...rule.recommendations);
          
          if (rule.severity === 'high') {
            riskLevel = 'high';
          } else if (rule.severity === 'medium' && riskLevel !== 'high') {
            riskLevel = 'medium';
          }
        }
      }
    }

    // Check allergies
    for (const allergy of userAllergies) {
      const rule = this.allergyRules.find(r =>
        r.allergen.toLowerCase() === allergy.toLowerCase()
      );

      if (rule) {
        const matchingIngredients = ingredients.filter(ingredient =>
          rule.commonNames.some(name =>
            ingredient.toLowerCase().includes(name.toLowerCase())
          )
        );

        if (matchingIngredients.length > 0) {
          harmfulIngredients.push(...matchingIngredients);
          recommendations.push(
            `AVOID: Contains ${rule.allergen}. Symptoms may include: ${rule.symptoms.join(', ')}`
          );
          
          if (rule.severity === 'severe') {
            riskLevel = 'high';
          } else if (rule.severity === 'moderate' && riskLevel !== 'high') {
            riskLevel = 'medium';
          }
        }
      }
    }

    // Check general harmful flags
    const flaggedIngredients = ingredients.filter(ingredient => harmfulFlags[ingredient]);
    harmfulIngredients.push(...flaggedIngredients);

    // Generate alternatives
    alternatives.push(...this.generateAlternatives(harmfulIngredients, userConditions, userAllergies));

    // Generate summary
    const summary = this.generateSummary(harmfulIngredients, riskLevel, userConditions, userAllergies);

    return {
      summary,
      harmfulIngredients: [...new Set(harmfulIngredients)], // Remove duplicates
      recommendations: [...new Set(recommendations)], // Remove duplicates
      alternatives: [...new Set(alternatives)], // Remove duplicates
      riskLevel
    };
  }

  /**
   * Generate alternative suggestions
   */
  private generateAlternatives(
    harmfulIngredients: string[],
    conditions: string[],
    allergies: string[]
  ): string[] {
    const alternatives: string[] = [];

    // Sugar alternatives for diabetes
    if (conditions.includes('diabetes')) {
      alternatives.push(
        'Stevia', 'Erythritol', 'Monk fruit sweetener', 'Xylitol'
      );
    }

    // Salt alternatives for hypertension
    if (conditions.includes('hypertension')) {
      alternatives.push(
        'Herbs and spices', 'Lemon juice', 'Vinegar', 'Low-sodium soy sauce'
      );
    }

    // Gluten-free alternatives
    if (conditions.includes('celiac disease')) {
      alternatives.push(
        'Rice', 'Quinoa', 'Buckwheat', 'Amaranth', 'Certified gluten-free oats'
      );
    }

    // Dairy alternatives
    if (allergies.includes('dairy') || conditions.includes('lactose intolerance')) {
      alternatives.push(
        'Almond milk', 'Soy milk', 'Oat milk', 'Coconut milk', 'Cashew milk'
      );
    }

    // General healthy alternatives
    alternatives.push(
      'Fresh fruits and vegetables',
      'Lean proteins',
      'Whole grains',
      'Nuts and seeds (if not allergic)',
      'Herbs and spices instead of artificial flavors'
    );

    return alternatives;
  }

  /**
   * Generate summary of the avoidance plan
   */
  private generateSummary(
    harmfulIngredients: string[],
    riskLevel: 'low' | 'medium' | 'high',
    conditions: string[],
    allergies: string[]
  ): string {
    if (harmfulIngredients.length === 0) {
      return 'Great news! No harmful ingredients detected for your health conditions and allergies.';
    }

    const conditionText = conditions.length > 0 ? `health conditions (${conditions.join(', ')})` : '';
    const allergyText = allergies.length > 0 ? `allergies (${allergies.join(', ')})` : '';
    const concerns = [conditionText, allergyText].filter(Boolean).join(' and ');

    const riskText = riskLevel === 'high' 
      ? 'HIGH RISK - Avoid this product'
      : riskLevel === 'medium'
      ? 'MODERATE RISK - Consume with caution'
      : 'LOW RISK - Monitor your response';

    return `This product contains ${harmfulIngredients.length} ingredients that may be harmful for your ${concerns}. ${riskText}. Please review the detailed recommendations below.`;
  }

  /**
   * Get all available health conditions
   */
  getAvailableHealthConditions(): string[] {
    return this.healthRules.map(rule => rule.condition);
  }

  /**
   * Get all available allergies
   */
  getAvailableAllergies(): string[] {
    return this.allergyRules.map(rule => rule.allergen);
  }

  /**
   * Validate user conditions and allergies
   */
  validateUserProfile(conditions: string[], allergies: string[]): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    const availableConditions = this.getAvailableHealthConditions();
    const availableAllergies = this.getAvailableAllergies();

    for (const condition of conditions) {
      if (!availableConditions.includes(condition.toLowerCase())) {
        errors.push(`Unknown health condition: ${condition}`);
      }
    }

    for (const allergy of allergies) {
      if (!availableAllergies.includes(allergy.toLowerCase())) {
        errors.push(`Unknown allergy: ${allergy}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

export default new RuleEngine(); 