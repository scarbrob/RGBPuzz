import { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { generateDailySeed, generateSpectrumDailyColors, createColorToken, encryptHex, deterministicShuffle } from '../utils/colorGenerator';
import { validateDate } from '../middleware/validation';
import { checkRateLimit, rateLimitConfigs, getClientIdentifier, createRateLimitResponse } from '../middleware/rateLimit';
import { addCorsHeaders, handleCorsPreflightOptions } from '../middleware/cors';
import { SPECTRUM_DAILY_CONFIG } from '../../../shared/src/constants';

/**
 * GET /api/spectrum-daily?date=YYYY-MM-DD
 * Returns today's spectrum daily challenge (sort by hue).
 * Colors are clustered in a narrow hue arc for challenge.
 */
export async function getSpectrumDaily(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  if (request.method === 'OPTIONS') {
    return handleCorsPreflightOptions();
  }

  try {
    const clientId = getClientIdentifier(request);
    const rateLimitResult = checkRateLimit(clientId, rateLimitConfigs.dailyChallenge);
    if (!rateLimitResult.allowed) {
      return addCorsHeaders(createRateLimitResponse(rateLimitResult, rateLimitConfigs.dailyChallenge.maxRequests));
    }

    const queryDate = request.query?.get('date');
    const today = queryDate || new Date().toISOString().split('T')[0];
    
    if (queryDate) {
      const dateError = validateDate(queryDate);
      if (dateError) {
        return addCorsHeaders({
          status: 400,
          jsonBody: { error: dateError.message, field: dateError.field },
        });
      }
    }
    
    context.log('Generating spectrum daily for date:', today);
    
    const salt = process.env.DAILY_CHALLENGE_SALT;
    if (!salt) throw new Error('DAILY_CHALLENGE_SALT environment variable is required');
    
    // Use different seed prefix so spectrum daily != RGB daily
    const seed = generateDailySeed(today, salt + ':spectrum');
    const colors = generateSpectrumDailyColors(seed, SPECTRUM_DAILY_CONFIG.colorCount, SPECTRUM_DAILY_CONFIG.hueArc);
    
    const colorTokens = colors.map((color, index) => {
      // Use 'spectrumdaily' salt suffix to avoid token collision
      const hash = createColorToken(color, index, salt + 'spectrumdaily');
      const hex = `#${color.r.toString(16).padStart(2, '0')}${color.g.toString(16).padStart(2, '0')}${color.b.toString(16).padStart(2, '0')}`;
      const encryptedHex = encryptHex(hex, hash);
      
      return {
        id: hash,
        encrypted: encryptedHex,
      };
    });
    
    const shuffled = deterministicShuffle(colorTokens, seed);
    
    return addCorsHeaders({
      status: 200,
      jsonBody: {
        date: today,
        mode: 'spectrum-daily',
        colorTokens: shuffled,
        maxAttempts: SPECTRUM_DAILY_CONFIG.maxAttempts,
      },
    });
  } catch (error) {
    context.error('Error generating spectrum daily:', error);
    return addCorsHeaders({
      status: 500,
      jsonBody: { error: 'Internal server error' },
    });
  }
}
