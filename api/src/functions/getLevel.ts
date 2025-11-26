import { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { generateLevelColors, createColorToken, deterministicShuffle, encryptHex } from '../utils/colorGenerator';
import { validateDifficulty, validateLevel } from '../middleware/validation';
import { checkRateLimit, rateLimitConfigs, getClientIdentifier, createRateLimitResponse } from '../middleware/rateLimit';
import { addCorsHeaders, handleCorsPreflightOptions } from '../middleware/cors';

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
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return handleCorsPreflightOptions();
  }

  try {
    // Rate limiting
    const clientId = getClientIdentifier(request);
    const rateLimitResult = checkRateLimit(clientId, rateLimitConfigs.getLevel);
    if (!rateLimitResult.allowed) {
      return addCorsHeaders(createRateLimitResponse(rateLimitResult, rateLimitConfigs.getLevel.maxRequests));
    }

    const difficulty = request.query.get('difficulty') as 'easy' | 'medium' | 'hard' | 'insane';
    const levelStr = request.query.get('level');
    
    if (!difficulty || !levelStr) {
      return addCorsHeaders({
        status: 400,
        jsonBody: { error: 'Difficulty and level required' },
      });
    }
    
    // Validate difficulty
    const difficultyError = validateDifficulty(difficulty);
    if (difficultyError) {
      return addCorsHeaders({
        status: 400,
        jsonBody: { error: difficultyError.message, field: difficultyError.field },
      });
    }
    
    const level = parseInt(levelStr);
    
    // Validate level
    const levelError = validateLevel(level);
    if (levelError) {
      return addCorsHeaders({
        status: 400,
        jsonBody: { error: levelError.message, field: levelError.field },
      });
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
    
    return addCorsHeaders({
      status: 200,
      jsonBody: {
        difficulty,
        level,
        colorCount: colors.length,
        colorTokens: shuffled,
      },
    });
  } catch (error) {
    context.error('Error fetching level:', error);
    return addCorsHeaders({
      status: 500,
      jsonBody: { error: 'Internal server error' },
    });
  }
}
