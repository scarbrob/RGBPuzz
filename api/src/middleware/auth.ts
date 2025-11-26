import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

interface DecodedToken {
  sub?: string;
  oid?: string;
  emails?: string[];
  email?: string;
  preferred_username?: string;
  name?: string;
  [key: string]: any;
}

export interface AuthUser {
  userId: string;
  email?: string;
  displayName?: string;
}

// Cache for JWKS client to avoid recreating on every request
let cachedJwksClient: jwksClient.JwksClient | null = null;

/**
 * Get or create JWKS client for Microsoft Entra External ID
 */
function getJwksClient(): jwksClient.JwksClient {
  if (cachedJwksClient) {
    return cachedJwksClient;
  }

  const tenantName = process.env.ENTRA_TENANT_NAME || 'rgbpuzz';
  const domain = process.env.ENTRA_DOMAIN || 'rgbpuzz.b2clogin.com';
  const policy = process.env.ENTRA_POLICY || 'B2C_1_signupsignin';
  
  const jwksUri = `https://${domain}/${tenantName}.onmicrosoft.com/${policy}/discovery/v2.0/keys`;

  cachedJwksClient = jwksClient({
    jwksUri,
    cache: true,
    cacheMaxAge: 86400000, // 24 hours
  });

  return cachedJwksClient;
}

/**
 * Get signing key from JWKS
 */
function getKey(header: any, callback: any) {
  const client = getJwksClient();
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      callback(err);
      return;
    }
    const signingKey = key?.getPublicKey();
    callback(null, signingKey);
  });
}

/**
 * Verify and decode JWT token from Microsoft Entra External ID
 */
export async function verifyToken(token: string): Promise<DecodedToken> {
  return new Promise((resolve, reject) => {
    const clientId = process.env.ENTRA_CLIENT_ID;
    const tenantName = process.env.ENTRA_TENANT_NAME || 'rgbpuzz';
    const domain = process.env.ENTRA_DOMAIN || 'rgbpuzz.b2clogin.com';
    const policy = process.env.ENTRA_POLICY || 'B2C_1_signupsignin';

    if (!clientId) {
      reject(new Error('ENTRA_CLIENT_ID not configured'));
      return;
    }

    const issuer = `https://${domain}/${tenantName}.onmicrosoft.com/${policy}/v2.0/`;

    jwt.verify(
      token,
      getKey,
      {
        audience: clientId,
        issuer: issuer,
        algorithms: ['RS256'],
      },
      (err, decoded) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(decoded as DecodedToken);
      }
    );
  });
}

/**
 * Extract bearer token from Authorization header
 */
export function extractBearerToken(request: any): string | null {
  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
  
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    return null;
  }

  return parts[1];
}

/**
 * Authenticate request and extract user information
 * Returns null if authentication is disabled or token is invalid
 */
export async function authenticateRequest(request: any): Promise<AuthUser | null> {
  // Check if authentication is enabled
  const authEnabled = process.env.ENTRA_ENABLED !== 'false';
  
  if (!authEnabled) {
    // Authentication disabled - return null to allow request through
    return null;
  }

  const token = extractBearerToken(request);
  
  if (!token) {
    throw new Error('No authentication token provided');
  }

  try {
    const decoded = await verifyToken(token);
    
    // Extract user ID (prefer oid, fallback to sub)
    const userId = decoded.oid || decoded.sub;
    
    if (!userId) {
      throw new Error('Token missing user identifier');
    }

    // Extract email (multiple possible claim names)
    const email = decoded.emails?.[0] || decoded.email || decoded.preferred_username;
    
    // Extract display name
    const displayName = decoded.name;

    return {
      userId,
      email,
      displayName,
    };
  } catch (error) {
    throw new Error(`Token verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Middleware to require authentication and validate userId matches authenticated user
 */
export async function requireAuth(
  request: any,
  requestUserId?: string
): Promise<{ authenticated: boolean; user: AuthUser | null; error?: string }> {
  try {
    const user = await authenticateRequest(request);
    
    // If auth is disabled, allow request
    if (user === null) {
      return { authenticated: false, user: null };
    }

    // If requestUserId is provided, verify it matches the authenticated user
    if (requestUserId && user.userId !== requestUserId) {
      return {
        authenticated: true,
        user,
        error: 'Authenticated user does not match requested userId',
      };
    }

    return { authenticated: true, user };
  } catch (error) {
    return {
      authenticated: false,
      user: null,
      error: error instanceof Error ? error.message : 'Authentication failed',
    };
  }
}
