import { updateDailyStats } from '../utils/userStats';
import { validateUserId, validateDate, validateAttempts, validateSolveTime } from '../middleware/validation';
import { checkRateLimit, rateLimitConfigs, getClientIdentifier, createRateLimitResponse } from '../middleware/rateLimit';
import { addCorsHeaders, handleCorsPreflightOptions } from '../middleware/cors';
import { requireAuth } from '../middleware/auth';

interface UpdateDailyStatsRequest {
  userId: string;
  date: string;
  attempts: number;
  solved: boolean;
  solveTime?: number;
  boardState?: any[];
  attemptHistory?: any[];
}

/**
 * POST /api/user/daily-stats
 * Update daily challenge statistics
 */
export async function updateDailyStatsHandler(request: any, context: any) {
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return handleCorsPreflightOptions();
  }

  try {
    // Rate limiting
    const clientId = getClientIdentifier(request);
    const rateLimitResult = checkRateLimit(clientId, rateLimitConfigs.updateStats);
    if (!rateLimitResult.allowed) {
      return addCorsHeaders(createRateLimitResponse(rateLimitResult, rateLimitConfigs.updateStats.maxRequests));
    }

    const body = await request.json() as UpdateDailyStatsRequest;
    const { userId, date, attempts, solved, solveTime, boardState, attemptHistory } = body;

    // Authentication (if enabled)
    const authResult = await requireAuth(request, userId);
    if (authResult.error) {
      return addCorsHeaders({
        status: 403,
        jsonBody: { error: authResult.error },
      });
    }

    if (!userId || !date || attempts === undefined || solved === undefined) {
      return addCorsHeaders({
        status: 400,
        jsonBody: { error: 'userId, date, attempts, and solved are required' },
      });
    }

    // Validate inputs
    const userIdError = validateUserId(userId);
    if (userIdError) {
      return addCorsHeaders({
        status: 400,
        jsonBody: { error: userIdError.message, field: userIdError.field },
      });
    }

    const dateError = validateDate(date);
    if (dateError) {
      return addCorsHeaders({
        status: 400,
        jsonBody: { error: dateError.message, field: dateError.field },
      });
    }

    const attemptsError = validateAttempts(attempts);
    if (attemptsError) {
      return addCorsHeaders({
        status: 400,
        jsonBody: { error: attemptsError.message, field: attemptsError.field },
      });
    }

    if (solveTime !== undefined) {
      const solveTimeError = validateSolveTime(solveTime);
      if (solveTimeError) {
        return addCorsHeaders({
          status: 400,
          jsonBody: { error: solveTimeError.message, field: solveTimeError.field },
        });
      }
    }

    await updateDailyStats(userId, date, attempts, solved, solveTime, boardState, attemptHistory);

    return addCorsHeaders({
      status: 200,
      jsonBody: { success: true, message: 'Daily stats updated' },
    });
  } catch (error) {
    console.error('Error updating daily stats:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update daily stats';
    return addCorsHeaders({
      status: 500,
      jsonBody: { error: 'Failed to update daily stats', details: errorMessage },
    });
  }
}
