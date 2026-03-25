import { initializeTable } from '../utils/database';

/**
 * GET /api/db-init
 * Initialize the database tables
 */
export async function initializeDatabase(request: any, context: any) {
  try {
    await initializeTable();

    return {
      status: 200,
      jsonBody: { message: 'Database initialized successfully' },
    };
  } catch (error) {
    console.error('Error initializing database:', error);
    return {
      status: 500,
      jsonBody: { error: 'Failed to initialize database' },
    };
  }
}
