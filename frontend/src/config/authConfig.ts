/**
 * OAuth Configuration for Microsoft Entra External ID
 * 
 * This configuration supports Microsoft identity provider
 * Note: Microsoft Entra External ID is the successor to Azure AD B2C
 * Learn more: https://aka.ms/EEIDOverview
 */

export const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_AD_CLIENT_ID || 'your-client-id',
    authority: import.meta.env.VITE_AZURE_AD_AUTHORITY || 'https://rgbpuzz.ciamlogin.com/e13a9ac4-2458-47a7-8f8f-743e6fd1aeb5',
    knownAuthorities: ['rgbpuzz.ciamlogin.com'],
    redirectUri: import.meta.env.VITE_REDIRECT_URI || 'http://localhost:3000',
    postLogoutRedirectUri: import.meta.env.VITE_REDIRECT_URI || 'http://localhost:3000',
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false,
  },
};

export const loginRequest = {
  scopes: ['openid', 'profile', 'email'],
};
