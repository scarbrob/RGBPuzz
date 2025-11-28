import { HttpResponseInit } from '@azure/functions';
import { TableClient } from '@azure/data-tables';
import { validateUserId } from '../middleware/validation';
import { addCorsHeaders, handleCorsPreflightOptions } from '../middleware/cors';
import { checkRateLimit, rateLimitConfigs, getClientIdentifier, createRateLimitResponse } from '../middleware/rateLimit';
import { requireAuth } from '../middleware/auth';

interface DailyAttemptEntity {
  partitionKey: string;
  rowKey: string;
  userId: string;
  date: string;
  attempts: number;
  solved: boolean;
  solveTime?: number;
  timestamp: Date;
  boardState?: string;
  attemptHistory?: string;
}

/**
 * GET /api/daily-attempt?userId={userId}&date={date}
 * Get daily attempt record for a specific date
 */
export async function getDailyAttempt(
  request: any,
  context: any
): Promise<HttpResponseInit> {
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

    const userId = request.query.get('userId');
    const date = request.query.get('date');

    if (!userId || !date) {
      return addCorsHeaders({
        status: 400,
        jsonBody: { error: 'userId and date are required' },
      });
    }

    // Authentication (if enabled)
    const authResult = await requireAuth(request, userId);
    if (authResult.error) {
      return addCorsHeaders({
        status: 403,
        jsonBody: { error: authResult.error },
      });
    }

    // Validate userId
    const userIdError = validateUserId(userId);
    if (userIdError) {
      return addCorsHeaders({
        status: 400,
        jsonBody: { error: userIdError.message },
      });
    }

    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    if (!connectionString) {
      throw new Error('AZURE_STORAGE_CONNECTION_STRING is not set');
    }

    const client = TableClient.fromConnectionString(connectionString, 'DailyAttempts');

    try {
      const entity = await client.getEntity<DailyAttemptEntity>(
        'daily-attempts',
        `${userId}-${date}`
      );

      return addCorsHeaders({
        status: 200,
        jsonBody: {
          attempts: entity.attempts,
          solved: entity.solved,
          solveTime: entity.solveTime,
          timestamp: entity.timestamp,
          boardState: entity.boardState ? JSON.parse(entity.boardState) : undefined,
          attemptHistory: entity.attemptHistory ? JSON.parse(entity.attemptHistory) : undefined,
        },
      });
    } catch (error: any) {
      if (error.statusCode === 404) {
        return addCorsHeaders({
          status: 404,
          jsonBody: { error: 'No attempt found for this date' },
        });
      }
      throw error;
    }
  } catch (error) {
    console.error('Error getting daily attempt:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return addCorsHeaders({
      status: 500,
      jsonBody: { error: 'Internal server error', details: errorMessage },
    });
  }
}
