/**
 * Rate limiting middleware for Azure Functions
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store (for production, use Redis or Azure Cache)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Note: Automatic cleanup disabled for Azure Functions compatibility
// Old entries will be cleaned up naturally when their time window expires

export interface RateLimitConfig {
  windowMs: number;  // Time window in milliseconds
  maxRequests: number;  // Max requests per window
  keyGenerator?: (request: any) => string;  // Custom key generator
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

/**
 * Check rate limit for a request
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const key = identifier;
  
  // Get or create entry
  let entry = rateLimitStore.get(key);
  
  if (!entry || entry.resetTime < now) {
    // Create new entry
    entry = {
      count: 1,
      resetTime: now + config.windowMs,
    };
    rateLimitStore.set(key, entry);
    
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: entry.resetTime,
    };
  }
  
  // Check if limit exceeded
  if (entry.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
      retryAfter: Math.ceil((entry.resetTime - now) / 1000),
    };
  }
  
  // Increment count
  entry.count++;
  
  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Get client identifier from request
 */
export function getClientIdentifier(request: any): string {
  // Try to get user ID from query params
  const userId = request.query.get('userId');
  if (userId) {
    return `user:${userId}`;
  }
  
  // Fall back to IP address
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown';
  
  return `ip:${ip}`;
}

/**
 * Rate limit configurations for different endpoints
 */
export const rateLimitConfigs = {
  // Strict limit for solution validation (prevent brute force)
  validateSolution: {
    windowMs: 60000, // 1 minute
    maxRequests: 20,  // 20 requests per minute
  },
  
  // More lenient for stats queries
  getUserStats: {
    windowMs: 60000, // 1 minute
    maxRequests: 60,  // 60 requests per minute
  },
  
  // Moderate limit for challenges
  dailyChallenge: {
    windowMs: 60000, // 1 minute
    maxRequests: 30,  // 30 requests per minute
  },
  
  // Moderate limit for level requests
  getLevel: {
    windowMs: 60000, // 1 minute
    maxRequests: 100, // 100 requests per minute
  },
  
  // Strict limit for stat updates
  updateStats: {
    windowMs: 60000, // 1 minute
    maxRequests: 30,  // 30 requests per minute
  },
};

/**
 * Create rate limit response
 */
export function createRateLimitResponse(result: RateLimitResult) {
  return {
    status: 429,
    headers: {
      'Retry-After': result.retryAfter?.toString() || '60',
      'X-RateLimit-Limit': '20',
      'X-RateLimit-Remaining': result.remaining.toString(),
      'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
    },
    jsonBody: {
      error: 'Too many requests',
      message: `Rate limit exceeded. Please try again in ${result.retryAfter} seconds.`,
      retryAfter: result.retryAfter,
    },
  };
}
