import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { generateDailySeed, generateColorsFromSeed, createColorToken, rgbToValue } from '../utils/colorGenerator';

interface ValidationRequest {
  date: string;
  orderedTokenIds: string[];
}

/**
 * POST /api/validate-solution
 * Validates the user's color ordering without exposing RGB values
 */
export async function validateSolution(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const body = await request.json() as ValidationRequest;
    const { date, orderedTokenIds } = body;
    
    if (!date || !orderedTokenIds || !Array.isArray(orderedTokenIds)) {
      return {
        status: 400,
        jsonBody: { error: 'Invalid request body' },
      };
    }
    
    const salt = process.env.DAILY_CHALLENGE_SALT || 'default-salt';
    const colorCount = 5;
    
    // Regenerate the same colors from the seed
    const seed = generateDailySeed(date, salt);
    const colors = generateColorsFromSeed(seed, colorCount);
    
    // Create mapping of token IDs to colors
    const tokenToColor = new Map();
    colors.forEach((color, index) => {
      const id = `color-${index}`;
      tokenToColor.set(id, color);
    });
    
    // Get the correct order (sorted by RGB value)
    const correctOrder = colors
      .map((color, index) => ({ id: `color-${index}`, value: rgbToValue(color) }))
      .sort((a, b) => a.value - b.value)
      .map(item => item.id);
    
    // Check if user's order matches
    const correct = JSON.stringify(orderedTokenIds) === JSON.stringify(correctOrder);
    
    // Find which positions are correct
    const correctPositions = orderedTokenIds
      .map((id, index) => correctOrder[index] === id ? index : -1)
      .filter(index => index !== -1);
    
    return {
      status: 200,
      jsonBody: {
        correct,
        correctPositions,
        // Don't send the actual solution until they've used all attempts or won
        solved: correct,
      },
    };
  } catch (error) {
    context.error('Error validating solution:', error);
    return {
      status: 500,
      jsonBody: { error: 'Internal server error' },
    };
  }
}

app.http('validateSolution', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'validate-solution',
  handler: validateSolution,
});
