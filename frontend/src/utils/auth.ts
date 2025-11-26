import { msalInstance } from '../contexts/AuthContext';

/**
 * Get the current access token from MSAL
 * Returns null if not authenticated or token unavailable
 */
export async function getAccessToken(): Promise<string | null> {
  try {
    const accounts = msalInstance?.getAllAccounts();
    
    if (!accounts || accounts.length === 0) {
      return null;
    }

    const account = accounts[0];
    
    // Try to acquire token silently
    const response = await msalInstance!.acquireTokenSilent({
      scopes: ['openid', 'profile', 'email'],
      account: account,
    });

    return response.accessToken;
  } catch (error) {
    console.warn('Failed to acquire access token:', error);
    return null;
  }
}

/**
 * Create fetch headers with authentication token if available
 */
export async function createAuthHeaders(additionalHeaders?: Record<string, string>): Promise<Record<string, string>> {
  const token = await getAccessToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...additionalHeaders,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}
