# Azure AD B2C Quick Start

## Current Status: Mock Mode ✅

The app is currently running in **mock mode** which works without any Azure AD B2C setup.

## Testing Now (No Setup Required)

1. Open `http://localhost:3000`
2. Click **Sign In** button
3. Choose any provider (Google, Apple, Microsoft, Discord, Facebook)
4. **Mock user is created instantly** - no redirect!
5. User name appears in header
6. Click user menu → **Sign Out** to test logout

## How It Works

The app detects mock mode when `VITE_AZURE_AD_CLIENT_ID` starts with `mock-`. This allows development without Azure setup.

### Mock Mode Benefits
- ✅ Test UI/UX immediately
- ✅ No cloud configuration needed
- ✅ Works offline
- ✅ Fast iteration
- ✅ Perfect for frontend development

## Switching to Real Azure AD B2C

When you're ready for production authentication:

### 1. Create Azure AD B2C Tenant (15 minutes)

See full guide: `infrastructure/AZURE_AD_B2C_SETUP.md`

Quick steps:
1. Go to [Azure Portal](https://portal.azure.com)
2. Create Azure AD B2C resource
3. Register your application
4. Configure identity providers
5. Create user flow

### 2. Update Environment Variables

Edit `frontend/.env`:
```env
VITE_AZURE_AD_CLIENT_ID=<your-real-client-id>
VITE_AZURE_AD_AUTHORITY=https://your-tenant.b2clogin.com/your-tenant.onmicrosoft.com/B2C_1_signupsignin
VITE_REDIRECT_URI=http://localhost:3000
```

### 3. Restart Frontend

```bash
cd frontend
npm run dev
```

### 4. Test Real Authentication

1. Click Sign In
2. You'll be redirected to Azure AD B2C
3. Choose a provider
4. Complete authentication
5. Redirected back with real user data

## Architecture Overview

```
┌─────────────┐         ┌─────────────────┐         ┌──────────────┐
│   Frontend  │────────>│  Azure AD B2C   │────────>│   Google     │
│   (React)   │<────────│  (Handles all   │<────────│   Facebook   │
└─────────────┘         │   OAuth flows)  │         │   Apple      │
                        └─────────────────┘         │   Microsoft  │
                                                      │   Discord    │
                                                      └──────────────┘
```

### What Azure AD B2C Does
1. **Centralized OAuth** - One integration for all providers
2. **Token Management** - Issues and validates JWT tokens
3. **User Management** - Stores user profiles
4. **Security** - CSRF protection, token validation
5. **Compliance** - GDPR, SOC 2, ISO certified

## Current Implementation

### Files Modified
- ✅ `src/contexts/AuthContext.tsx` - MSAL integration
- ✅ `src/config/authConfig.ts` - Azure AD B2C config
- ✅ `src/vite-env.d.ts` - TypeScript definitions
- ✅ `.env` - Environment variables (mock mode)

### Dependencies Added
- ✅ `@azure/msal-browser` - Microsoft Authentication Library
- ✅ `@azure/msal-react` - React hooks for MSAL

### Features Working
- ✅ Mock authentication (current)
- ✅ Sign in with 5 providers
- ✅ Sign out
- ✅ Session persistence
- ✅ Auto redirect handling
- ✅ Error handling

## Development Workflow

### Phase 1: Frontend Development (Current)
- Use mock mode
- Build UI/UX
- Test user flows
- No cloud required

### Phase 2: Azure AD B2C Setup
- Create B2C tenant
- Configure providers
- Update .env
- Test real OAuth

### Phase 3: Production
- Add production redirect URIs
- Deploy to Azure Static Web Apps
- Configure custom domain
- Enable monitoring

## Testing Checklist

### Mock Mode (Current) ✅
- [ ] Sign in with Google - creates mock user
- [ ] Sign in with Apple - creates mock user
- [ ] Sign in with Microsoft - creates mock user
- [ ] Sign in with Discord - creates mock user
- [ ] Sign in with Facebook - creates mock user
- [ ] User name appears in header
- [ ] Sign out clears session
- [ ] Page refresh preserves session
- [ ] Dark mode works with auth

### Real Azure AD B2C (After Setup)
- [ ] Redirect to Azure AD B2C
- [ ] Choose identity provider
- [ ] Complete OAuth flow
- [ ] Redirect back with real user data
- [ ] Token validation
- [ ] Session expiry handling
- [ ] Sign out calls Azure

## Cost

**Azure AD B2C:** FREE for first 50,000 monthly active users

Perfect for:
- MVP and early stage
- Small to medium apps
- Cost-effective scaling

## Next Steps

1. **Continue development** in mock mode
2. **Build features** (stats, levels, social)
3. **Set up Azure AD B2C** when ready for beta testing
4. **Deploy to production** with real authentication

## Need Help?

- **Mock mode issues**: Check browser console for errors
- **Azure AD B2C setup**: See `infrastructure/AZURE_AD_B2C_SETUP.md`
- **TypeScript errors**: Run `npm run build` to check
- **Environment variables**: Restart dev server after .env changes

## Pro Tips

1. **Develop in mock mode** - faster iteration
2. **Test with real OAuth** before production
3. **Use domain hints** to show specific provider
4. **Enable logging** in MSAL for debugging
5. **Store tokens securely** - never in localStorage for production

---

**You're all set!** The app is running with mock authentication. Test the sign-in flow now at http://localhost:3000
