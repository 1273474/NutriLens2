import axios from 'axios';

interface OCRResponse {
  generated_text: string;
}

interface ClassificationResponse {
  label: string;
  score: number;
}

interface IngredientAnalysis {
  ingredient: string;
  category: string;
  flagged: boolean;
  confidence: number;
}

export class AIService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api-inference.huggingface.co/models';

  constructor() {
    this.apiKey = process.env.HUGGING_FACE_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('HUGGING_FACE_API_KEY is required');
    }
  }

  private async makeRequest<T>(model: string, data: any): Promise<T> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/${model}`,
        data,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000, // 30 second timeout
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`AI Service Error: ${error.response?.data?.error || error.message}`);
      }
      throw new Error(`AI Service Error: ${error}`);
    }
  }

  /**
   * Extract text from food label image using OCR
   */
  async extractIngredientsFromImage(imageBuffer: Buffer): Promise<string[]> {
    try {
      const base64Image = imageBuffer.toString('base64');
      
      const response = await this.makeRequest<OCRResponse[]>(
        'microsoft/trocr-base-stage1',
        { inputs: `data:image/jpeg;base64,${base64Image}` }
      );

      if (!response || !Array.isArray(response) || response.length === 0) {
        throw new Error('Invalid OCR response');
      }

      const extractedText = response[0]?.generated_text || '';
      
      // Parse ingredients from the extracted text
      return this.parseIngredientsFromText(extractedText);
    } catch (error) {
      console.error('OCR Error:', error);
      throw new Error(`Failed to extract ingredients: ${error}`);
    }
  }

  /**
   * Classify ingredients using NLP model
   */
  async classifyIngredients(ingredients: string[]): Promise<IngredientAnalysis[]> {
    const results: IngredientAnalysis[] = [];

    for (const ingredient of ingredients) {
      try {
        const response = await this.makeRequest<ClassificationResponse[]>(
          'dietkit/food-ingredient-classifier',
          { inputs: ingredient }
        );

        if (response && Array.isArray(response) && response.length > 0) {
          const topResult = response[0];
          results.push({
            ingredient,
            category: topResult.label,
            flagged: this.isHarmfulIngredient(ingredient, topResult.label),
            confidence: topResult.score,
          });
        } else {
          // Fallback for unclassified ingredients
          results.push({
            ingredient,
            category: 'unknown',
            flagged: this.isHarmfulIngredient(ingredient, 'unknown'),
            confidence: 0.5,
          });
        }
      } catch (error) {
        console.error(`Error classifying ingredient ${ingredient}:`, error);
        // Add fallback result
        results.push({
          ingredient,
          category: 'unknown',
          flagged: this.isHarmfulIngredient(ingredient, 'unknown'),
          confidence: 0.0,
        });
      }
    }

    return results;
  }

  /**
   * Parse ingredients from OCR text
   */
  private parseIngredientsFromText(text: string): string[] {
    // Common patterns for ingredient lists
    const patterns = [
      /ingredients?[:\s]+(.*?)(?=\n|$)/i,
      /contains?[:\s]+(.*?)(?=\n|$)/i,
      /(?:^|\n)([^:]*?)(?:,|\.|$)/g,
    ];

    let ingredients: string[] = [];

    // Try different patterns to extract ingredients
    for (const pattern of patterns) {
      const matches = text.match(pattern);
      if (matches) {
        if (pattern.global) {
          // For global regex, collect all matches
          const allMatches = [...text.matchAll(pattern)];
          ingredients = allMatches.map(match => match[1]?.trim()).filter(Boolean);
        } else {
          // For non-global regex, use the first match
          const match = matches[1];
          if (match) {
            ingredients = match.split(/[,;]/).map(item => item.trim()).filter(Boolean);
          }
        }
        break;
      }
    }

    // If no patterns match, split by common delimiters
    if (ingredients.length === 0) {
      ingredients = text
        .split(/[,;.\n]/)
        .map(item => item.trim())
        .filter(item => item.length > 2 && !item.match(/^\d+$/))
        .slice(0, 50); // Limit to 50 ingredients
    }

    return ingredients;
  }

  /**
   * Check if an ingredient is potentially harmful
   */
  private isHarmfulIngredient(ingredient: string, category: string): boolean {
    const harmfulKeywords = [
      'artificial', 'preservative', 'color', 'dye', 'sweetener',
      'hydrogenated', 'trans fat', 'high fructose', 'corn syrup',
      'monosodium glutamate', 'msg', 'bha', 'bht', 'sulfite',
      'nitrate', 'nitrite', 'aspartame', 'saccharin', 'acesulfame',
      'sucralose', 'xylitol', 'sorbitol', 'maltitol', 'erythritol',
      'propylene glycol', 'carrageenan', 'xanthan gum', 'guar gum',
      'cellulose', 'modified starch', 'dextrose', 'maltodextrin',
      'partially hydrogenated', 'interesterified', 'fractionated',
      'bleached', 'enriched', 'fortified', 'natural flavor',
      'artificial flavor', 'spice', 'seasoning', 'extract'
    ];

    const harmfulCategories = [
      'artificial_sweetener', 'preservative', 'artificial_color',
      'thickener', 'emulsifier', 'stabilizer', 'anti_caking_agent'
    ];

    const lowerIngredient = ingredient.toLowerCase();
    const lowerCategory = category.toLowerCase();

    // Check for harmful keywords in ingredient name
    const hasHarmfulKeyword = harmfulKeywords.some(keyword => 
      lowerIngredient.includes(keyword.toLowerCase())
    );

    // Check for harmful categories
    const hasHarmfulCategory = harmfulCategories.some(cat => 
      lowerCategory.includes(cat)
    );

    return hasHarmfulKeyword || hasHarmfulCategory;
  }

  /**
   * Extract nutritional information from text
   */
  extractNutritionInfo(text: string): {
    calories?: number;
    fat?: number;
    sugar?: number;
    protein?: number;
    carbs?: number;
    sodium?: number;
  } {
    const nutrition: any = {};

    // Calories
    const caloriesMatch = text.match(/(\d+)\s*(?:calories?|kcal)/i);
    if (caloriesMatch) {
      nutrition.calories = parseInt(caloriesMatch[1], 10);
    }

    // Fat
    const fatMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:g|grams?)\s*(?:total\s+)?fat/i);
    if (fatMatch) {
      nutrition.fat = parseFloat(fatMatch[1]);
    }

    // Sugar
    const sugarMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:g|grams?)\s*(?:total\s+)?sugars?/i);
    if (sugarMatch) {
      nutrition.sugar = parseFloat(sugarMatch[1]);
    }

    // Protein
    const proteinMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:g|grams?)\s*protein/i);
    if (proteinMatch) {
      nutrition.protein = parseFloat(proteinMatch[1]);
    }

    // Carbohydrates
    const carbsMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:g|grams?)\s*(?:total\s+)?carbohydrates?/i);
    if (carbsMatch) {
      nutrition.carbs = parseFloat(carbsMatch[1]);
    }

    // Sodium
    const sodiumMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:mg|milligrams?)\s*sodium/i);
    if (sodiumMatch) {
      nutrition.sodium = parseFloat(sodiumMatch[1]);
    }

    return nutrition;
  }
}

export default new AIService(); 