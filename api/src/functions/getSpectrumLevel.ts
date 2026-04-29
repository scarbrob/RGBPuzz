import { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { generateSpectrumLevelColors, createColorToken, deterministicShuffle, encryptHex } from '../utils/colorGenerator';
import { validateDifficulty } from '../middleware/validation';
import { checkRateLimit, rateLimitConfigs, getClientIdentifier, createRateLimitResponse } from '../middleware/rateLimit';
import { addCorsHeaders, handleCorsPreflightOptions } from '../middleware/cors';
import { SPECTRUM_LEVELS_PER_DIFFICULTY } from '../../../shared/src/constants';

/**
 * GET /api/spectrum-level?difficulty={difficulty}&level={level}
 * Returns a spectrum mode level (sort by hue instead of RGB value)
 */
export async function getSpectrumLevel(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  if (request.method === 'OPTIONS') {
    return handleCorsPreflightOptions();
  }

  try {
    const clientId = getClientIdentifier(request);
    const rateLimitResult = checkRateLimit(clientId, rateLimitConfigs.getLevel);
    if (!rateLimitResult.allowed) {
      return addCorsHeaders(createRateLimitResponse(rateLimitResult, rateLimitConfigs.getLevel.maxRequests));
    }

    const difficulty = request.query?.get('difficulty') as 'easy' | 'medium' | 'hard' | 'insane';
    const levelStr = request.query?.get('level');
    
    if (!difficulty || !levelStr) {
      return addCorsHeaders({
        status: 400,
        jsonBody: { error: 'Difficulty and level required' },
      });
    }
    
    const difficultyError = validateDifficulty(difficulty);
    if (difficultyError) {
      return addCorsHeaders({
        status: 400,
        jsonBody: { error: difficultyError.message, field: difficultyError.field },
      });
    }
    
    const level = parseInt(levelStr);
    if (isNaN(level) || level < 1 || level > SPECTRUM_LEVELS_PER_DIFFICULTY || !Number.isInteger(level)) {
      return addCorsHeaders({
        status: 400,
        jsonBody: { error: `level must be between 1 and ${SPECTRUM_LEVELS_PER_DIFFICULTY}` },
      });
    }
    
    const salt = process.env.DAILY_CHALLENGE_SALT;
    if (!salt) throw new Error('DAILY_CHALLENGE_SALT environment variable is required');
    
    const colors = generateSpectrumLevelColors(difficulty, level);
    
    // Use 'spectrum' prefix in salt to ensure tokens don't collide with RGB levels
    const colorTokens = colors.map((color, index) => {
      const hash = createColorToken(color, index, salt + 'spectrum' + difficulty + level);
      const hex = `#${color.r.toString(16).padStart(2, '0')}${color.g.toString(16).padStart(2, '0')}${color.b.toString(16).padStart(2, '0')}`;
      return {
        id: hash,
        encrypted: encryptHex(hex, hash),
      };
    });
    
    const shuffled = deterministicShuffle(colorTokens, `spectrum-${difficulty}-${level}`);
    
    return addCorsHeaders({
      status: 200,
      jsonBody: {
        difficulty,
        level,
        mode: 'spectrum',
        colorCount: colors.length,
        colorTokens: shuffled,
      },
    });
  } catch (error) {
    context.error('Error fetching spectrum level:', error);
    return addCorsHeaders({
      status: 500,
      jsonBody: { error: 'Internal server error' },
    });
  }
}
