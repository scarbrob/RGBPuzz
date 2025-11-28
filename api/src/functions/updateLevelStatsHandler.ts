import { updateLevelStats } from '../utils/userStats';
import { validateUserId, validateDifficulty, validateLevel, validateAttempts, validateSolveTime } from '../middleware/validation';
import { checkRateLimit, rateLimitConfigs, getClientIdentifier, createRateLimitResponse } from '../middleware/rateLimit';
import { addCorsHeaders, handleCorsPreflightOptions } from '../middleware/cors';
import { requireAuth } from '../middleware/auth';

interface UpdateLevelStatsRequest {
  userId: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'insane';
  level: number;
  attempts: number;
  solved: boolean;
  solveTime?: number;
}

/**
 * POST /api/user/level-stats
 * Update level statistics
 */
export async function updateLevelStatsHandler(request: any, context: any) {
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

    const body = await request.json() as UpdateLevelStatsRequest;
    const { userId, difficulty, level, attempts, solved, solveTime } = body;

    // Authentication (if enabled)
    const authResult = await requireAuth(request, userId);
    if (authResult.error) {
      return addCorsHeaders({
        status: 403,
        jsonBody: { error: authResult.error },
      });
    }

    if (!userId || !difficulty || level === undefined || attempts === undefined || solved === undefined) {
      return addCorsHeaders({
        status: 400,
        jsonBody: { error: 'userId, difficulty, level, attempts, and solved are required' },
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

    const difficultyError = validateDifficulty(difficulty);
    if (difficultyError) {
      return addCorsHeaders({
        status: 400,
        jsonBody: { error: difficultyError.message, field: difficultyError.field },
      });
    }

    const levelError = validateLevel(level);
    if (levelError) {
      return addCorsHeaders({
        status: 400,
        jsonBody: { error: levelError.message, field: levelError.field },
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

    await updateLevelStats(userId, difficulty, level, attempts, solved, solveTime);

    return addCorsHeaders({
      status: 200,
      jsonBody: { success: true, message: 'Level stats updated' },
    });
  } catch (error) {
    console.error('Error updating level stats:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update level stats';
    return addCorsHeaders({
      status: 500,
      jsonBody: { error: 'Failed to update level stats', details: errorMessage },
    });
  }
}
