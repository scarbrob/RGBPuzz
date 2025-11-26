import { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getUserStatsHandler } from './getUserStatsHandler';
import { handleCorsPreflightOptions } from '../middleware/cors';

/**
 * GET /api/user/stats
 * Returns user statistics
 */
export async function getUserStats(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return handleCorsPreflightOptions();
  }
  
  return getUserStatsHandler(request, context);
}
