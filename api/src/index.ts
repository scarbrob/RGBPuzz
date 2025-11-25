/**
 * Azure Functions entry point
 * Note: Using v3 model with explicit function.json files
 * This file is kept for potential future v4 migration
 */

// Export handlers for use by v3 function wrappers
export { getDailyChallenge } from './functions/dailyChallenge';
export { validateSolution } from './functions/validateSolution';
export { getLevel } from './functions/getLevel';
export { getUserStats } from './functions/userStats';
