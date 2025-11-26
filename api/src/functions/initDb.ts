import { initializeTable } from '../utils/database';
import { initializeStatsTables } from '../utils/userStats';

/**
 * GET /api/db-init
 * Initialize the database tables
 */
export async function initializeDatabase(request: any, context: any) {
  try {
    await initializeTable();
    await initializeStatsTables();
    
    return {
      status: 200,
      jsonBody: { message: 'Database initialized successfully (including stats tables)' },
    };
  } catch (error) {
    console.error('Error initializing database:', error);
    return {
      status: 500,
      jsonBody: { error: 'Failed to initialize database', details: error instanceof Error ? error.message : String(error) },
    };
  }
}
