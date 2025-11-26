import { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getAllDailyChallenges } from '../utils/database';
import { checkRateLimit, rateLimitConfigs, getClientIdentifier, createRateLimitResponse } from '../middleware/rateLimit';
import { addCorsHeaders, handleCorsPreflightOptions } from '../middleware/cors';

/**
 * GET /api/challenges/history
 * Returns all previous daily challenges (for premium users)
 */
export async function getChallengeHistory(
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
    const rateLimitResult = checkRateLimit(clientId, rateLimitConfigs.getUserStats);
    if (!rateLimitResult.allowed) {
      return addCorsHeaders(createRateLimitResponse(rateLimitResult, rateLimitConfigs.getUserStats.maxRequests));
    }

    // TODO: Add authentication check for premium users
    // const user = await authenticateUser(request);
    // if (!user.isPremium) {
    //   return addCorsHeaders({ status: 403, jsonBody: { error: 'Premium subscription required' } });
    // }
    
    const challenges = await getAllDailyChallenges();
    
    return addCorsHeaders({
      status: 200,
      jsonBody: {
        challenges: challenges.map(c => ({
          date: c.date,
          colorTokens: c.colorTokens,
          maxAttempts: c.maxAttempts,
        })),
      },
    });
  } catch (error) {
    context.error('Error fetching challenge history:', error);
    return addCorsHeaders({
      status: 500,
      jsonBody: { error: 'Internal server error' },
    });
  }
}
