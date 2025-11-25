import { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
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
    
    // Create mapping of hash IDs to colors
    const hashToIndex = new Map();
    colors.forEach((color, index) => {
      const hash = createColorToken(color, index, salt);
      hashToIndex.set(hash, index);
    });
    
    // Convert submitted hash IDs to indices
    const submittedIndices = orderedTokenIds.map(hash => hashToIndex.get(hash));
    
    // Check if all hashes are valid
    if (submittedIndices.some(idx => idx === undefined)) {
      return {
        status: 400,
        jsonBody: { error: 'Invalid color tokens' },
      };
    }
    
    // Get the correct order (indices sorted by RGB value)
    const correctOrder = colors
      .map((color, index) => ({ index, value: rgbToValue(color) }))
      .sort((a, b) => a.value - b.value)
      .map(item => item.index);
    
    // Check if user's order matches
    const correct = JSON.stringify(submittedIndices) === JSON.stringify(correctOrder);
    
    // Find which positions are correct
    const correctPositions = submittedIndices
      .map((idx, position) => correctOrder[position] === idx ? position : -1)
      .filter(position => position !== -1);
    
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
