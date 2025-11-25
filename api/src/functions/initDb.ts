import { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { initializeTable } from '../utils/database';

/**
 * GET /api/admin/init-db
 * Initialize the database tables
 */
export async function initializeDatabase(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    await initializeTable();
    
    return {
      status: 200,
      jsonBody: { message: 'Database initialized successfully' },
    };
  } catch (error) {
    context.error('Error initializing database:', error);
    return {
      status: 500,
      jsonBody: { error: 'Failed to initialize database', details: error instanceof Error ? error.message : String(error) },
    };
  }
}
