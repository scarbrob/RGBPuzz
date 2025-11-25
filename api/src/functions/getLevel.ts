import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { generateRandomColors, createColorToken } from '../utils/colorGenerator';

/**
 * GET /api/level/{levelId}
 * Returns a specific level challenge
 */
export async function getLevel(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const levelId = request.params.levelId;
    
    if (!levelId) {
      return {
        status: 400,
        jsonBody: { error: 'Level ID required' },
      };
    }
    
    // TODO: Fetch level configuration from database
    // For now, generate based on level ID
    const levelNum = parseInt(levelId);
    const difficulty = levelNum <= 3 ? 'easy' : levelNum <= 10 ? 'medium' : 'hard';
    const colorCount = levelNum <= 3 ? 3 : levelNum <= 10 ? 5 : 7;
    const theme = levelNum % 3 === 0 ? 'reds' : levelNum % 3 === 1 ? 'blues' : 'greens';
    
    const salt = process.env.DAILY_CHALLENGE_SALT || 'default-salt';
    const colors = generateRandomColors(colorCount, theme);
    
    const colorTokens = colors.map((color, index) => ({
      id: `level-${levelId}-color-${index}`,
      hash: createColorToken(color, index, salt + levelId),
      hex: `#${color.r.toString(16).padStart(2, '0')}${color.g.toString(16).padStart(2, '0')}${color.b.toString(16).padStart(2, '0')}`,
    }));
    
    const shuffled = [...colorTokens].sort(() => Math.random() - 0.5);
    
    return {
      status: 200,
      jsonBody: {
        levelId,
        difficulty,
        colorCount,
        theme,
        colorTokens: shuffled,
        maxAttempts: colorCount,
      },
    };
  } catch (error) {
    context.error('Error fetching level:', error);
    return {
      status: 500,
      jsonBody: { error: 'Internal server error' },
    };
  }
}

app.http('getLevel', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'level/{levelId}',
  handler: getLevel,
});
