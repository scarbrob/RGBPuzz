/**
 * CORS configuration for Azure Functions
 */

export const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGINS || '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400', // 24 hours
};

/**
 * Handle CORS preflight requests
 */
export function handleCorsPreflightOptions() {
  return {
    status: 204,
    headers: corsHeaders,
  };
}

/**
 * Add CORS headers to response
 * Note: Origin validation is handled by Azure Functions CORS settings in production
 */
export function addCorsHeaders(response: any, origin?: string) {
  const headers: Record<string, string> = { ...corsHeaders };
  
  // If specific origin provided and validation is enabled, validate it
  if (origin && process.env.ALLOWED_ORIGINS !== '*') {
    if (isOriginAllowed(origin)) {
      headers['Access-Control-Allow-Origin'] = origin;
    } else {
      // Don't include the origin header
      const { 'Access-Control-Allow-Origin': _, ...headersWithoutOrigin } = headers;
      return {
        ...response,
        headers: {
          ...headersWithoutOrigin,
          ...(response.headers || {}),
        },
      };
    }
  }
  
  return {
    ...response,
    headers: {
      ...headers,
      ...(response.headers || {}),
    },
  };
}

/**
 * Validate origin against allowed origins
 */
export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;
  
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['*'];
  
  // If wildcard, allow all
  if (allowedOrigins.includes('*')) {
    return true;
  }
  
  // Check if origin is in allowed list
  return allowedOrigins.some(allowed => {
    // Exact match
    if (allowed === origin) return true;
    
    // Wildcard subdomain match (e.g., *.example.com)
    if (allowed.startsWith('*.')) {
      const domain = allowed.substring(2);
      return origin.endsWith(domain);
    }
    
    return false;
  });
}
