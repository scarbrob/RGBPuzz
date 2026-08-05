import { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { generateDailySeed, generateColorsFromSeed, generateLevelColors, generateSpectrumLevelColors, generateSpectrumDailyColors, createColorToken, rgbToValue, hueToValue } from '../utils/colorGenerator';
import { validateTokenIds, validateDifficulty, validateLevel, validateSpectrumLevel, validateDate } from '../middleware/validation';
import { checkRateLimit, rateLimitConfigs, getClientIdentifier, createRateLimitResponse } from '../middleware/rateLimit';
import { addCorsHeaders, handleCorsPreflightOptions } from '../middleware/cors';
import { DAILY_CHALLENGE_CONFIG, SPECTRUM_DAILY_CONFIG } from '../../../shared/src/constants';

interface ValidationRequest {
  date?: string;
  mode?: 'daily' | 'level' | 'spectrum' | 'spectrum-daily';
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
  // Handle CORS preflight
  // Echo the caller's own origin. A single joined allowlist string is not a
  // valid Access-Control-Allow-Origin value, so every response needs this.
  const origin = request.headers.get('origin');

  if (request.method === 'OPTIONS') {
    return handleCorsPreflightOptions(origin);
  }
  
  try {
    // Check rate limit
    const clientId = getClientIdentifier(request);
    const rateLimitResult = checkRateLimit(clientId, rateLimitConfigs.validateSolution);
    
    if (!rateLimitResult.allowed) {
      return addCorsHeaders(origin, createRateLimitResponse(rateLimitResult, rateLimitConfigs.validateSolution.maxRequests));
    }
    
    context.log('Validate solution called');
    
    let body: ValidationRequest;
    try {
      body = await request.json() as ValidationRequest;
    } catch {
      context.log('JSON parse error');
      return addCorsHeaders(origin, {
        status: 400,
        jsonBody: { error: 'Invalid JSON in request body' },
      });
    }
    
    const { orderedTokenIds, mode = 'daily', difficulty, level } = body;
    
    // Validate token IDs
    const tokenError = validateTokenIds(orderedTokenIds);
    if (tokenError) {
      return addCorsHeaders(origin, {
        status: 400,
        jsonBody: { error: tokenError.message, field: tokenError.field },
      });
    }
    
    const salt = process.env.DAILY_CHALLENGE_SALT;
    if (!salt) throw new Error('DAILY_CHALLENGE_SALT environment variable is required');
    let colors;
    
    // Generate colors based on mode
    if (mode === 'level' || mode === 'spectrum') {
      if (!difficulty || !level) {
        return addCorsHeaders(origin, {
          status: 400,
          jsonBody: { error: 'Difficulty and level required for level/spectrum mode' },
        });
      }
      
      const difficultyError = validateDifficulty(difficulty);
      if (difficultyError) {
        return addCorsHeaders(origin, {
          status: 400,
          jsonBody: { error: difficultyError.message, field: difficultyError.field },
        });
      }
      
      const levelError = mode === 'spectrum' ? validateSpectrumLevel(level) : validateLevel(level);
      if (levelError) {
        return addCorsHeaders(origin, {
          status: 400,
          jsonBody: { error: levelError.message, field: levelError.field },
        });
      }
      
      if (mode === 'spectrum') {
        context.log(`Validating spectrum level: ${difficulty} ${level}`);
        colors = generateSpectrumLevelColors(difficulty, level);
      } else {
        context.log(`Validating level: ${difficulty} ${level}`);
        colors = generateLevelColors(difficulty, level);
      }
    } else {
      // Daily challenge mode (RGB or spectrum)
      const queryDate = request.query?.get('date');
      const date = body.date || queryDate || new Date().toISOString().split('T')[0];
      
      if (body.date || queryDate) {
        const dateError = validateDate(date);
        if (dateError) {
          return addCorsHeaders(origin, {
            status: 400,
            jsonBody: { error: dateError.message, field: dateError.field },
          });
        }
      }
      
      if (mode === 'spectrum-daily') {
        context.log('Validating spectrum daily for date:', date);
        const seed = generateDailySeed(date, salt + ':spectrum');
        colors = generateSpectrumDailyColors(seed, SPECTRUM_DAILY_CONFIG.colorCount, SPECTRUM_DAILY_CONFIG.hueArc);
      } else {
        context.log('Validating solution for date:', date);
        const colorCount = DAILY_CHALLENGE_CONFIG.colorCount;
        const seed = generateDailySeed(date, salt);
        colors = generateColorsFromSeed(seed, colorCount);
      }
    }
    
    // Create mapping of hash IDs to colors
    const hashToIndex = new Map();
    colors.forEach((color, index) => {
      const saltSuffix = mode === 'spectrum' ? `spectrum${difficulty}${level}` : mode === 'spectrum-daily' ? 'spectrumdaily' : mode === 'level' ? `${difficulty}${level}` : '';
      const hash = createColorToken(color, index, salt + saltSuffix);
      hashToIndex.set(hash, index);
    });
    
    // Convert submitted hash IDs to indices
    const submittedIndices = orderedTokenIds.map(hash => hashToIndex.get(hash));
    
    // Check if all hashes are valid
    if (submittedIndices.some(idx => idx === undefined)) {
      return addCorsHeaders(origin, {
        status: 400,
        jsonBody: { error: 'Invalid color tokens' },
      });
    }
    
    // Get the correct order - use hue sorting for spectrum, RGB for everything else
    const sortFn = (mode === 'spectrum' || mode === 'spectrum-daily') ? hueToValue : rgbToValue;
    const correctOrder = colors
      .map((color, index) => ({ index, value: sortFn(color) }))
      .sort((a, b) => a.value - b.value)
      .map(item => item.index);
    
    // Check if user's order matches
    const correct = submittedIndices.length === correctOrder.length
      && submittedIndices.every((v, i) => v === correctOrder[i]);
    
    // Find which positions are correct
    const correctPositions = submittedIndices
      .map((idx, position) => correctOrder[position] === idx ? position : -1)
      .filter(position => position !== -1);
    
    return addCorsHeaders(origin, {
      status: 200,
      jsonBody: {
        correct,
        correctPositions,
        // Don't send the actual solution until they've used all attempts or won
        solved: correct,
      },
    });
  } catch (error) {
    context.error('Error validating solution:', error);
    return addCorsHeaders(origin, {
      status: 500,
      jsonBody: { error: 'Internal server error' },
    });
  }
}
