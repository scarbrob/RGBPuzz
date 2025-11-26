import { getUserStats } from '../utils/userStats';
import { validateUserId, validateEmail, validateDisplayName } from '../middleware/validation';
import { checkRateLimit, rateLimitConfigs, getClientIdentifier, createRateLimitResponse } from '../middleware/rateLimit';
import { addCorsHeaders } from '../middleware/cors';
import { requireAuth } from '../middleware/auth';

/**
 * GET /api/user/stats
 * Get user statistics
 */
export async function getUserStatsHandler(request: any, context: any) {
  try {
    // Check rate limit
    const clientId = getClientIdentifier(request);
    const rateLimitResult = checkRateLimit(clientId, rateLimitConfigs.getUserStats);
    
    if (!rateLimitResult.allowed) {
      return addCorsHeaders(createRateLimitResponse(rateLimitResult));
    }
    
    // Get userId from query params
    const userId = request.query.get('userId');
    const email = request.query.get('email');
    const displayName = request.query.get('displayName');

    // Authentication (if enabled)
    const authResult = await requireAuth(request, userId);
    if (authResult.error) {
      return addCorsHeaders({
        status: 403,
        jsonBody: { error: authResult.error },
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
    
    const emailError = validateEmail(email);
    if (emailError) {
      return addCorsHeaders({
        status: 400,
        jsonBody: { error: emailError.message, field: emailError.field },
      });
    }
    
    const sanitizedDisplayName = validateDisplayName(displayName);

    const stats = await getUserStats(userId, email, sanitizedDisplayName);

    // Return only stats, exclude personal information
    const sanitizedStats = {
      // Daily Challenge Stats
      dailyStreak: stats.dailyStreak,
      longestStreak: stats.longestStreak,
      dailyWinRate: stats.dailyWinRate,
      totalDailyPlayed: stats.totalDailyPlayed,
      totalDailyWins: stats.totalDailyWins,
      averageDailyAttempts: stats.averageDailyAttempts,
      
      // Level Stats
      totalLevelsAttempted: stats.totalLevelsAttempted,
      totalLevelsSolved: stats.totalLevelsSolved,
      levelSolveRate: stats.levelSolveRate,
      averageLevelAttempts: stats.averageLevelAttempts,
      totalLevelAttempts: stats.totalLevelAttempts,
      
      // Per-difficulty stats
      easySolved: stats.easySolved,
      easyAttempted: stats.easyAttempted,
      easyTotalAttempts: stats.easyTotalAttempts,
      easyFastestTime: stats.easyFastestTime,
      mediumSolved: stats.mediumSolved,
      mediumAttempted: stats.mediumAttempted,
      mediumTotalAttempts: stats.mediumTotalAttempts,
      mediumFastestTime: stats.mediumFastestTime,
      hardSolved: stats.hardSolved,
      hardAttempted: stats.hardAttempted,
      hardTotalAttempts: stats.hardTotalAttempts,
      hardFastestTime: stats.hardFastestTime,
      insaneSolved: stats.insaneSolved,
      insaneAttempted: stats.insaneAttempted,
      insaneTotalAttempts: stats.insaneTotalAttempts,
      insaneFastestTime: stats.insaneFastestTime,
    };

    return addCorsHeaders({
      status: 200,
      jsonBody: sanitizedStats,
    });
  } catch (error) {
    console.error('Error getting user stats:', error);
    return addCorsHeaders({
      status: 500,
      jsonBody: { 
        error: 'Failed to get user stats'
      },
    });
  }
}
