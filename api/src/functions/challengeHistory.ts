import { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getAllDailyChallenges } from '../utils/database';

/**
 * GET /api/challenges/history
 * Returns all previous daily challenges (for premium users)
 */
export async function getChallengeHistory(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    // TODO: Add authentication check for premium users
    // const user = await authenticateUser(request);
    // if (!user.isPremium) {
    //   return { status: 403, jsonBody: { error: 'Premium subscription required' } };
    // }
    
    const challenges = await getAllDailyChallenges();
    
    return {
      status: 200,
      jsonBody: {
        challenges: challenges.map(c => ({
          date: c.date,
          colorTokens: c.colorTokens,
          maxAttempts: c.maxAttempts,
        })),
      },
    };
  } catch (error) {
    context.error('Error fetching challenge history:', error);
    return {
      status: 500,
      jsonBody: { error: 'Internal server error' },
    };
  }
}
