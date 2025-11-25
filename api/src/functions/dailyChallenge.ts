import { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { generateDailySeed, generateColorsFromSeed, createColorToken, encryptHex, deterministicShuffle } from '../utils/colorGenerator';

/**
 * GET /api/daily-challenge?date=YYYY-MM-DD
 * Returns the daily challenge with hashed color tokens
 * If no date is provided, uses the server's current date (UTC)
 * Note: Database storage disabled due to Azure SDK dependency issues
 * The deterministic generation ensures everyone gets the same challenge each day
 */
export async function getDailyChallenge(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    // Get date from query param or use server's current date
    const queryDate = request.query.get('date');
    const today = queryDate || new Date().toISOString().split('T')[0];
    
    context.log('Generating challenge for date:', today);
    
    const salt = process.env.DAILY_CHALLENGE_SALT || 'default-salt';
    const colorCount = 5; // Can be made configurable
    
    // Generate deterministic colors for today
    const seed = generateDailySeed(today, salt);
    const colors = generateColorsFromSeed(seed, colorCount);
    
    // Create tokens with encrypted hex values
    // The hex is encrypted using the token as the key, so it can only be
    // decrypted client-side with the matching token
    const colorTokens = colors.map((color, index) => {
      const hash = createColorToken(color, index, salt);
      const hex = `#${color.r.toString(16).padStart(2, '0')}${color.g.toString(16).padStart(2, '0')}${color.b.toString(16).padStart(2, '0')}`;
      const encryptedHex = encryptHex(hex, hash);
      
      return {
        id: hash,
        encrypted: encryptedHex,
      };
    });
    
    // Deterministically shuffle tokens so they're not in generation order
    // but everyone gets the same shuffle for the same day
    const shuffled = deterministicShuffle(colorTokens, seed);
    
    return {
      status: 200,
      jsonBody: {
        date: today,
        colorTokens: shuffled,
        maxAttempts: colorCount,
      },
    };
  } catch (error) {
    context.error('Error generating daily challenge:', error);
    return {
      status: 500,
      jsonBody: { error: 'Internal server error' },
    };
  }
}
