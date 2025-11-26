# Microsoft Entra External ID Setup Guide

**Note:** As of May 1, 2025, Azure AD B2C is no longer available for new tenants. This guide covers **Microsoft Entra External ID**, the replacement service for managing external identities.

Learn more: https://aka.ms/EEIDOverview

## Why Microsoft Entra External ID?

Microsoft Entra External ID (formerly Azure AD B2C) provides enterprise-grade authentication for customer-facing applications:
- **Single configuration** for all OAuth providers
- **Built-in security** (CSRF protection, token validation, MFA)
- **Scalability** (handles millions of users)
- **Compliance** (GDPR, SOC 2, ISO 27001)
- **Reduced complexity** (no need to manage individual OAuth flows)
- **User management** (self-service, profiles, password reset)
- **Improved developer experience** with modern APIs

## Prerequisites

1. Azure subscription
2. Azure CLI installed
3. Node.js 18+
4. Basic understanding of OAuth 2.0

## Step 1: Create Microsoft Entra External ID Tenant

### Via Azure Portal

1. Go to [Azure Portal](https://portal.azure.com)
2. Click **Create a resource**
3. Search for **Microsoft Entra External ID**
4. Click **Create**
5. Select **Create a new External ID tenant**
6. Fill in:
   - Tenant name: `RGBPuzz`
   - Initial domain name: `rgbpuzz` (will be rgbpuzz.onmicrosoft.com)
   - Country/Region: Your location
   - Subscription: Select your subscription
7. Click **Review + create**
8. Wait for deployment (2-3 minutes)
9. Switch to your new tenant (top-right tenant switcher)

### Key Differences from Azure AD B2C

- **Simplified pricing**: Free tier includes 50,000 MAUs (Monthly Active Users)
- **Modern UI**: Updated portal experience
- **Better developer tools**: Improved APIs and SDK support
- **Native MSAL support**: Built for MSAL.js 2.0+
- **Conditional Access**: More granular security policies

## Step 2: Register Application

1. In your External ID tenant, go to **Microsoft Entra External ID** service
2. Click **App registrations** → **New registration**
3. Fill in:
   - Name: `RGBPuzz Web App`
   - Supported account types: **Accounts in any organizational directory (Any Microsoft Entra ID tenant - Multitenant) and personal Microsoft accounts (e.g. Skype, Xbox)**
   - Redirect URI: 
     - Platform: **Web**
     - URI: `https://your-production-domain.azurestaticapps.net`
4. Click **Register**
5. Copy the **Application (client) ID** - this is your `VITE_AZURE_AD_CLIENT_ID`
6. Go to **Expose an API**:
   - Click **Add a scope**
   - Accept the default Application ID URI or customize it (e.g., `api://your-client-id`)
   - Click **Save and continue**
   - Add a scope:
     - Scope name: `access_as_user`
     - Who can consent: **Admins and users**
     - Admin consent display name: `Access RGBPuzz as user`
     - Admin consent description: `Allow the application to access RGBPuzz on behalf of the signed-in user`
     - User consent display name: `Access RGBPuzz as you`
     - User consent description: `Allow RGBPuzz to access your profile and game data`
     - State: **Enabled**
   - Click **Add scope**
7. Go to **Authentication**:
   - Enable **Access tokens** and **ID tokens**
   - Add logout URL: `https://your-production-domain.azurestaticapps.net`
   - (Optional for local dev) Add redirect URI: `http://localhost:3000`
8. Go to **API permissions**:
   - Click **Add a permission**
   - Select **Microsoft Graph**
   - Select **Delegated permissions**
   - Add: `openid`, `offline_access`, `profile`, `email`
   - Click **Add permissions**
   - Click **Grant admin consent for [your tenant]** (if you have admin rights)

## Step 3: Configure Identity Providers

### 3.1 Google

1. Get Google OAuth credentials:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create OAuth 2.0 credentials
   - Add redirect URI: `https://rgbpuzz.b2clogin.com/rgbpuzz.onmicrosoft.com/oauth2/authresp`

2. In Azure AD B2C:
   - Go to **Identity providers** → **New OpenID Connect provider**
   - Name: `Google`
   - Metadata URL: `https://accounts.google.com/.well-known/openid-configuration`
   - Client ID: Your Google client ID
   - Client secret: Your Google client secret
   - Scope: `openid profile email`
   - Response type: `code`
   - Response mode: `form_post`
   - Domain hint: `google.com`

### 3.2 Microsoft (Personal Accounts)

1. In Azure AD B2C:
   - Go to **Identity providers**
   - Click **Microsoft Account** (built-in)
   - Enter:
     - Client ID: (from Microsoft app registration)
     - Client secret: (from Microsoft app registration)
   - Domain hint: `microsoft.com`

### 3.3 Facebook

1. Get Facebook App credentials:
   - Go to [Facebook Developers](https://developers.facebook.com/)
   - Create an app
   - Add **Facebook Login** product
   - Get App ID and App Secret

2. In Azure AD B2C:
   - Go to **Identity providers** → **Facebook**
   - Enter:
     - Client ID: Facebook App ID
     - Client secret: Facebook App Secret
   - Domain hint: `facebook.com`

### 3.4 Apple

1. Get Apple credentials:
   - Go to [Apple Developer](https://developer.apple.com/)
   - Create Services ID
   - Generate client secret (JWT)

2. In Azure AD B2C:
   - Go to **Identity providers** → **Apple**
   - Enter:
     - Client ID: Apple Services ID
     - Client secret: Generated JWT
   - Domain hint: `appleid.apple.com`

### 3.5 Discord (Custom OpenID Connect)

1. Get Discord OAuth credentials:
   - Go to [Discord Developer Portal](https://discord.com/developers/applications)
   - Create application
   - Get Client ID and Client Secret

2. In Azure AD B2C:
   - Go to **Identity providers** → **New OpenID Connect provider**
   - Name: `Discord`
   - Metadata URL: `https://discord.com/.well-known/openid-configuration`
   - Client ID: Discord Client ID
   - Client secret: Discord Client Secret
   - Scope: `identify email`
   - Response type: `code`
   - Domain hint: `discord.com`

## Step 4: Create User Flow

1. In Azure AD B2C, go to **User flows**
2. Click **New user flow**
3. Select **Sign up and sign in**
4. Choose version: **Recommended**
5. Name: `B2C_1_signupsignin`
6. Select identity providers:
   - ☑ Google
   - ☑ Microsoft Account
   - ☑ Facebook
   - ☑ Apple
   - ☑ Discord
7. User attributes (data to collect):
   - ☑ Display Name
   - ☑ Email Address
8. Application claims (data to return):
   - ☑ Display Name
   - ☑ Email Addresses
   - ☑ Identity Provider
   - ☑ User's Object ID
9. Click **Create**

## Step 5: Configure Application

### Frontend (.env)

```env
# Azure AD B2C Configuration
VITE_AZURE_AD_CLIENT_ID=your-application-client-id-here
VITE_AZURE_AD_AUTHORITY=https://rgbpuzz.b2clogin.com/rgbpuzz.onmicrosoft.com/B2C_1_signupsignin
VITE_REDIRECT_URI=http://localhost:3000

# API Configuration
VITE_API_BASE_URL=http://localhost:7071/api
```

### authConfig.ts (already configured)

The `msalConfig` in `src/config/authConfig.ts` uses these environment variables automatically.

## Step 6: Test Locally

1. Restart frontend to pick up new environment variables:
```bash
cd frontend
npm run dev
```

2. Open `http://localhost:3000`
3. Click **Sign In**
4. Click any provider button
5. You'll be redirected to Azure AD B2C
6. Choose an identity provider (Google, Facebook, etc.)
7. Complete authentication
8. You'll be redirected back to your app with user data

## Step 7: Add Production Redirect URIs

For production deployment:

1. Go to **App registrations** → Your app → **Authentication**
2. Add production redirect URIs:
   - `https://your-production-domain.com`
3. Add to each identity provider's settings:
   - Google: Add `https://your-production-domain.com` to authorized redirect URIs
   - Facebook: Add to Valid OAuth Redirect URIs
   - etc.

4. Update production environment variables:
```env
VITE_AZURE_AD_CLIENT_ID=same-client-id
VITE_AZURE_AD_AUTHORITY=https://rgbpuzz.b2clogin.com/rgbpuzz.onmicrosoft.com/B2C_1_signupsignin
VITE_REDIRECT_URI=https://your-production-domain.com
```

## Step 8: Backend Integration (Optional)

To validate tokens on the backend:

```typescript
import { CognitoJwtVerifier } from "aws-jwt-verify"
// Or use @azure/msal-node for Node.js

// Validate JWT token from frontend
const verifyToken = async (token: string) => {
  const verifier = CognitoJwtVerifier.create({
    userPoolId: "rgbpuzz",
    clientId: process.env.AZURE_AD_CLIENT_ID,
    tokenUse: "id",
  })
  
  const payload = await verifier.verify(token)
  return payload
}
```

## Troubleshooting

### "AADB2C90057: The provided application is not configured"
- Ensure your client ID is correct
- Check that the user flow name matches exactly

### "AADB2C90273: The identity provider 'Google' is not configured"
- Configure Google identity provider in Azure AD B2C
- Ensure it's enabled in your user flow

### "Redirect URI mismatch"
- Add redirect URI to app registration
- Add same URI to each identity provider
- Use exact match (including http:// or https://)

### "CORS errors"
- Azure AD B2C handles CORS automatically
- If issues persist, check browser console for specific errors

### Mock mode not working
- Check that `VITE_AZURE_AD_CLIENT_ID` starts with `mock-`
- Restart frontend dev server after changing .env

## Cost Estimation

- **Free tier**: First 50,000 monthly active users (MAU)
- **Premium P1**: $0.00325 per MAU after 50k
- **Premium P2**: $0.0133 per MAU (advanced security)

For small to medium apps, B2C is essentially **free**.

## Security Best Practices

1. **Never commit** `.env` files to version control
2. **Use HTTPS** in production (required by OAuth)
3. **Validate tokens** on backend for API calls
4. **Enable MFA** for sensitive operations
5. **Set token lifetime** appropriately (default: 1 hour)
6. **Monitor** sign-ins in Azure Portal
7. **Enable logging** to Azure Application Insights

## Next Steps

After Azure AD B2C is working:

1. **Store user data** in Cosmos DB
2. **Implement token refresh** for long sessions
3. **Add profile management** (update display name, etc.)
4. **Implement authorization** (roles, permissions)
5. **Add social features** (friends, sharing)
6. **Create admin panel** for user management

## Resources

- [Azure AD B2C Documentation](https://docs.microsoft.com/en-us/azure/active-directory-b2c/)
- [MSAL.js Documentation](https://github.com/AzureAD/microsoft-authentication-library-for-js)
- [B2C Pricing](https://azure.microsoft.com/en-us/pricing/details/active-directory-b2c/)
- [Custom Policies](https://docs.microsoft.com/en-us/azure/active-directory-b2c/custom-policy-overview) (advanced)

## Comparison: Direct OAuth vs Azure AD B2C

| Feature | Direct OAuth | Azure AD B2C |
|---------|-------------|--------------|
| Setup Complexity | High (5 integrations) | Medium (1 integration) |
| Code Maintenance | High (manage 5 SDKs) | Low (1 SDK - MSAL) |
| Security | Manual implementation | Enterprise-grade |
| Scalability | Need to handle yourself | Handles millions |
| Cost | Free (DIY) | Free up to 50k users |
| User Management | Build yourself | Built-in |
| MFA | Build yourself | Built-in |
| Compliance | Your responsibility | Microsoft handles |
| **Recommended** | Small projects | **Production apps** |

**Verdict: Azure AD B2C is strongly recommended for production applications.**
