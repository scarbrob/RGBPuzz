import { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { generateLevelColors, createColorToken, deterministicShuffle, encryptHex } from '../utils/colorGenerator';

/**
 * GET /api/level?difficulty={difficulty}&level={level}
 * Returns a specific level challenge
 * Difficulty: easy (3 colors), medium (5), hard (7), insane (9)
 * Level: 1-100 for each difficulty
 */
export async function getLevel(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const difficulty = request.query.get('difficulty') as 'easy' | 'medium' | 'hard' | 'insane';
    const levelStr = request.query.get('level');
    
    if (!difficulty || !levelStr) {
      return {
        status: 400,
        jsonBody: { error: 'Difficulty and level required' },
      };
    }
    
    const level = parseInt(levelStr);
    
    if (!['easy', 'medium', 'hard', 'insane'].includes(difficulty)) {
      return {
        status: 400,
        jsonBody: { error: 'Invalid difficulty. Must be easy, medium, hard, or insane' },
      };
    }
    
    if (level < 1 || level > 100) {
      return {
        status: 400,
        jsonBody: { error: 'Level must be between 1 and 100' },
      };
    }
    
    const salt = process.env.DAILY_CHALLENGE_SALT || 'default-salt';
    const colors = generateLevelColors(difficulty, level);
    
    const colorTokens = colors.map((color, index) => {
      const hash = createColorToken(color, index, salt + difficulty + level);
      const hex = `#${color.r.toString(16).padStart(2, '0')}${color.g.toString(16).padStart(2, '0')}${color.b.toString(16).padStart(2, '0')}`;
      return {
        id: hash,
        encrypted: encryptHex(hex, hash),
      };
    });
    
    // Deterministic shuffle based on difficulty and level
    const shuffled = deterministicShuffle(colorTokens, `${difficulty}-${level}`);
    
    return {
      status: 200,
      jsonBody: {
        difficulty,
        level,
        colorCount: colors.length,
        colorTokens: shuffled,
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
