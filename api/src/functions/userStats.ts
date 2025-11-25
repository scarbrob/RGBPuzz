import { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

/**
 * GET /api/user/stats
 * Returns user statistics (requires authentication in production)
 */
export async function getUserStats(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    // TODO: Get user ID from authentication token
    // TODO: Query database for user stats
    
    // Mock data for now
    const mockStats = {
      userId: 'mock-user',
      dailyStreak: 7,
      longestStreak: 15,
      totalSolved: 42,
      totalAttempts: 126,
      averageAttempts: 3.0,
      lastPlayed: new Date().toISOString(),
    };
    
    return {
      status: 200,
      jsonBody: mockStats,
    };
  } catch (error) {
    context.error('Error fetching user stats:', error);
    return {
      status: 500,
      jsonBody: { error: 'Internal server error' },
    };
  }
}
