import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { generateDailySeed, generateColorsFromSeed, createColorToken } from '../utils/colorGenerator';

/**
 * GET /api/daily-challenge
 * Returns the daily challenge with hashed color tokens
 */
export async function getDailyChallenge(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const salt = process.env.DAILY_CHALLENGE_SALT || 'default-salt';
    const colorCount = 5; // Can be made configurable
    
    // Generate deterministic colors for today
    const seed = generateDailySeed(today, salt);
    const colors = generateColorsFromSeed(seed, colorCount);
    
    // Create tokens (hide RGB values from client)
    const colorTokens = colors.map((color, index) => ({
      id: `color-${index}`,
      hash: createColorToken(color, index, salt),
      hex: `#${color.r.toString(16).padStart(2, '0')}${color.g.toString(16).padStart(2, '0')}${color.b.toString(16).padStart(2, '0')}`,
    }));
    
    // Shuffle tokens so they're not in order
    const shuffled = [...colorTokens].sort(() => Math.random() - 0.5);
    
    return {
      status: 200,
      jsonBody: {
        date: today,
        colorTokens: shuffled.map(t => ({ id: t.id, hash: t.hash, hex: t.hex })),
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

app.http('dailyChallenge', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'daily-challenge',
  handler: getDailyChallenge,
});
