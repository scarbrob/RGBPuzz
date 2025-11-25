import { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { generateDailySeed, generateColorsFromSeed, generateLevelColors, createColorToken, rgbToValue } from '../utils/colorGenerator';

interface ValidationRequest {
  date?: string;
  mode?: 'daily' | 'level';
  difficulty?: 'easy' | 'medium' | 'hard' | 'insane';
  level?: number;
  orderedTokenIds: string[];
}

/**
 * POST /api/validate-solution
 * Validates the user's color ordering without exposing RGB values
 * Supports both daily challenge and level modes
 */
export async function validateSolution(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    context.log('Validate solution called');
    
    let body: ValidationRequest;
    try {
      body = await request.json() as ValidationRequest;
      context.log('Request body:', JSON.stringify(body));
    } catch (parseError) {
      context.error('JSON parse error:', parseError);
      return {
        status: 400,
        jsonBody: { error: 'Invalid JSON in request body' },
      };
    }
    
    const { orderedTokenIds, mode = 'daily', difficulty, level } = body;
    
    if (!orderedTokenIds || !Array.isArray(orderedTokenIds)) {
      return {
        status: 400,
        jsonBody: { error: 'Invalid request body: orderedTokenIds required' },
      };
    }
    
    const salt = process.env.DAILY_CHALLENGE_SALT || 'default-salt';
    let colors;
    
    // Generate colors based on mode
    if (mode === 'level') {
      if (!difficulty || !level) {
        return {
          status: 400,
          jsonBody: { error: 'Difficulty and level required for level mode' },
        };
      }
      
      context.log(`Validating level: ${difficulty} ${level}`);
      colors = generateLevelColors(difficulty, level);
    } else {
      // Daily challenge mode
      const queryDate = request.query.get('date');
      const date = body.date || queryDate || new Date().toISOString().split('T')[0];
      context.log('Validating solution for date:', date);
      
      const colorCount = 5;
      const seed = generateDailySeed(date, salt);
      colors = generateColorsFromSeed(seed, colorCount);
    }
    
    // Create mapping of hash IDs to colors
    const hashToIndex = new Map();
    colors.forEach((color, index) => {
      const saltSuffix = mode === 'level' ? `${difficulty}${level}` : '';
      const hash = createColorToken(color, index, salt + saltSuffix);
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
