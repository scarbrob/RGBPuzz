/**
 * API configuration
 * Centralized API base URL to avoid hardcoding throughout the app
 */

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:7071/api';

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
  dailyChallenge: (date: string) => `${API_BASE_URL}/daily-challenge?date=${date}`,
  validateSolution: () => `${API_BASE_URL}/validate-solution`,
  getLevel: (difficulty: string, level: number) => `${API_BASE_URL}/level?difficulty=${difficulty}&level=${level}`,
} as const;
