import { getUserLevelProgress } from '../utils/userStats';
import { validateUserId, validateDifficulty } from '../middleware/validation';
import { checkRateLimit, rateLimitConfigs, getClientIdentifier, createRateLimitResponse } from '../middleware/rateLimit';
import { addCorsHeaders, handleCorsPreflightOptions } from '../middleware/cors';
import { requireAuth } from '../middleware/auth';

/**
 * GET /api/user/level-progress?userId=xxx&difficulty=easy
 * Get user's level completion progress for a difficulty
 */
export async function getUserLevelProgressHandler(request: any, context: any) {
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return handleCorsPreflightOptions();
  }

  try {
    // Rate limiting
    const clientId = getClientIdentifier(request);
    const rateLimitResult = checkRateLimit(clientId, rateLimitConfigs.getUserStats);
    if (!rateLimitResult.allowed) {
      return addCorsHeaders(createRateLimitResponse(rateLimitResult));
    }

    const userId = request.query.get('userId');
    const difficulty = request.query.get('difficulty');

    // Authentication (if enabled)
    const authResult = await requireAuth(request, userId);
    if (authResult.error) {
      return addCorsHeaders({
        status: 403,
        jsonBody: { error: authResult.error },
      });
    }

    if (!userId || !difficulty) {
      return addCorsHeaders({
        status: 400,
        jsonBody: { error: 'userId and difficulty are required' },
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

    const progress = await getUserLevelProgress(userId, difficulty as 'easy' | 'medium' | 'hard' | 'insane');

    // Convert to a simple map of level -> completion data
    const progressMap: { [level: number]: { solved: boolean; attempts: number; bestTime?: number } } = {};
    
    progress.forEach(p => {
      progressMap[p.level] = {
        solved: p.solved,
        attempts: p.attempts,
        bestTime: p.bestTime,
      };
    });

    return addCorsHeaders({
      status: 200,
      jsonBody: progressMap,
    });
  } catch (error) {
    console.error('Error getting level progress:', error);
    return addCorsHeaders({
      status: 500,
      jsonBody: { error: 'Failed to get level progress' },
    });
  }
}
