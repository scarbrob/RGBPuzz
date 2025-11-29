# RGBPuzz Deployment Guide

## Prerequisites

- Azure subscription
- Azure CLI installed and configured
- Node.js 22+ installed
- Azure Functions Core Tools v4

## Environment Variables

### Backend (Azure Functions)

Configure these in Azure Portal → Function App → Configuration → Application Settings:

```bash
# Required
AZURE_STORAGE_CONNECTION_STRING=<your-storage-connection-string>
DAILY_CHALLENGE_SALT=<secure-random-string>

# CORS Configuration
ALLOWED_ORIGINS=https://your-frontend-domain.azurestaticapps.net

# Microsoft Entra External ID Authentication (Recommended for Production)
ENTRA_ENABLED=true
ENTRA_CLIENT_ID=<your-client-id>
ENTRA_TENANT_NAME=rgbpuzz
ENTRA_DOMAIN=rgbpuzz.b2clogin.com
ENTRA_POLICY=B2C_1_signupsignin
```

### Frontend (Azure Static Web Apps)

Configure these in Azure Portal → Static Web App → Configuration:

```bash
VITE_API_BASE_URL=https://rgbpuzz.com/api
VITE_AZURE_AD_CLIENT_ID=<your-client-id>
VITE_AZURE_AD_AUTHORITY=https://rgbpuzz.b2clogin.com/rgbpuzz.onmicrosoft.com/B2C_1_signupsignin
VITE_REDIRECT_URI=https://your-frontend-domain.azurestaticapps.net
```

## Deployment Steps

### 1. Build Backend

```powershell
cd c:\Repos\rgbpuzz\api
npm install
npm run build
```

### 2. Deploy Backend to Azure Functions

```powershell
# Login to Azure
az login

# Deploy function app
func azure functionapp publish rgbpuzz-api

# Verify deployment
az functionapp show --name rgbpuzz-api --resource-group <your-rg>
```

**Note**: The Flex Consumption plan doesn't support publish profiles. Use service principal authentication for GitHub Actions deployment, or deploy manually with `func azure functionapp publish`.

### 3. Configure Backend Environment Variables

```powershell
# Set CORS origins
az functionapp config appsettings set `
  --name rgbpuzz-api `
  --resource-group <your-rg> `
  --settings "ALLOWED_ORIGINS=https://your-domain.azurestaticapps.net"

# Enable authentication
az functionapp config appsettings set `
  --name rgbpuzz-api `
  --resource-group <your-rg> `
  --settings "ENTRA_ENABLED=true" `
             "ENTRA_CLIENT_ID=<your-client-id>" `
             "ENTRA_TENANT_NAME=rgbpuzz" `
             "ENTRA_DOMAIN=rgbpuzz.b2clogin.com" `
             "ENTRA_POLICY=B2C_1_signupsignin"
```

### 4. Build Frontend

```powershell
cd c:\Repos\rgbpuzz\frontend
npm install
npm run build
```

### 5. Deploy Frontend to Azure Static Web Apps

#### Option A: Azure CLI

```powershell
# Install Static Web Apps CLI
npm install -g @azure/static-web-apps-cli

# Deploy
swa deploy --app-location ./dist `
  --resource-group <your-rg> `
  --name <your-static-web-app-name>
```

#### Option B: GitHub Actions (Recommended)

1. Push code to GitHub
2. Azure Static Web Apps will automatically deploy via GitHub Actions workflow

### 6. Verify Deployment

Test all endpoints:

```powershell
# Public endpoints (should work without auth)
curl https://your-api.azurewebsites.net/api/daily-challenge
curl https://your-api.azurewebsites.net/api/level?difficulty=easy&level=1

# Protected endpoints (should require auth)
curl https://your-api.azurewebsites.net/api/user/stats?userId=test
# Should return 403 without valid token

# With valid token
curl -H "Authorization: Bearer <token>" `
  https://your-api.azurewebsites.net/api/user/stats?userId=<your-user-id>
```

## Security Configuration

### 1. Enable HTTPS Only

```powershell
az functionapp update `
  --name rgbpuzz-api `
  --resource-group <your-rg> `
  --set httpsOnly=true
```

### 2. Configure CORS (Alternative to environment variable)

```powershell
az functionapp cors add `
  --name rgbpuzz-api `
  --resource-group <your-rg> `
  --allowed-origins https://your-domain.azurestaticapps.net
```

### 3. Enable Application Insights

```powershell
# Create Application Insights
az monitor app-insights component create `
  --app rgbpuzz-insights `
  --location eastus2 `
  --resource-group <your-rg>

# Link to Function App
az functionapp config appsettings set `
  --name rgbpuzz-api `
  --resource-group <your-rg> `
  --settings "APPINSIGHTS_INSTRUMENTATIONKEY=<key>"
```

### 4. Configure Managed Identity (Recommended)

```powershell
# Enable system-assigned managed identity
az functionapp identity assign `
  --name rgbpuzz-api `
  --resource-group <your-rg>

# Grant identity access to Key Vault for secrets
az keyvault set-policy `
  --name <your-key-vault> `
  --object-id <identity-principal-id> `
  --secret-permissions get list
```

## Production Checklist

- [ ] **Backend deployed** and accessible
- [ ] **Frontend deployed** and accessible
- [ ] **Environment variables configured** in Azure
- [ ] **CORS origins** set to production domain (not wildcard)
- [ ] **Authentication enabled** (`ENTRA_ENABLED=true`)
- [ ] **HTTPS only** enforced
- [ ] **Application Insights** enabled for monitoring
- [ ] **Rate limiting** tested and working
- [ ] **Authentication flow** tested end-to-end
- [ ] **All public endpoints** return data correctly
- [ ] **Protected endpoints** require valid tokens
- [ ] **Error responses** don't leak sensitive information
- [ ] **Storage connection string** secure and working
- [ ] **Daily challenge salt** configured
- [ ] **Custom domain** configured (optional)
- [ ] **SSL certificate** valid (Azure-managed or custom)

## Monitoring

### View Logs

```powershell
# Function App logs
az functionapp log tail `
  --name rgbpuzz-api `
  --resource-group <your-rg>

# Application Insights queries
az monitor app-insights query `
  --app rgbpuzz-insights `
  --analytics-query "requests | where timestamp > ago(1h) | summarize count() by resultCode"
```

### Monitor Rate Limiting

Query Application Insights for 429 responses:

```kusto
requests
| where resultCode == 429
| summarize count() by operation_Name, bin(timestamp, 5m)
| render timechart
```

### Monitor Authentication Failures

Query Application Insights for 403 responses:

```kusto
requests
| where resultCode == 403
| project timestamp, operation_Name, customDimensions
| order by timestamp desc
```

## Rollback Procedure

### Backend Rollback

```powershell
# List deployment history
az functionapp deployment source show `
  --name rgbpuzz-api `
  --resource-group <your-rg>

# Rollback to previous deployment
az functionapp deployment source sync `
  --name rgbpuzz-api `
  --resource-group <your-rg>
```

### Frontend Rollback

1. Go to Azure Portal → Static Web App → Environments
2. Select previous production deployment
3. Click "Promote to production"

## Troubleshooting

### Issue: CORS errors in browser

**Solution:** Verify `ALLOWED_ORIGINS` includes your frontend domain:

```powershell
az functionapp config appsettings list `
  --name rgbpuzz-api `
  --resource-group <your-rg> `
  --query "[?name=='ALLOWED_ORIGINS'].value"
```

### Issue: Authentication fails with 403

**Solution:** Check Microsoft Entra External ID configuration:

1. Verify `ENTRA_CLIENT_ID` matches your Microsoft Entra External ID app registration
2. Verify frontend is using same client ID in `VITE_AZURE_AD_CLIENT_ID`
3. Check token claims in JWT debugger (jwt.io)
4. Verify `oid` or `sub` claim exists in token

### Issue: Rate limiting not working

**Solution:** Rate limiting uses in-memory storage. If you have multiple instances:

1. Scale down to single instance, or
2. Implement Redis-based rate limiting (see SECURITY.md)

### Issue: 500 errors

**Solution:** Check Application Insights for detailed errors:

```powershell
az monitor app-insights query `
  --app rgbpuzz-insights `
  --analytics-query "exceptions | where timestamp > ago(1h) | project timestamp, type, message"
```

## Development vs Production

### Development (Local)

```bash
# Backend
ALLOWED_ORIGINS=*
ENTRA_ENABLED=false  # Optional: disable auth for testing

# Frontend
VITE_API_BASE_URL=http://localhost:7071/api
VITE_REDIRECT_URI=http://localhost:3000
```

### Production

```bash
# Backend
ALLOWED_ORIGINS=https://your-actual-domain.azurestaticapps.net
ENTRA_ENABLED=true

# Frontend
VITE_API_BASE_URL=https://rgbpuzz.com/api
VITE_REDIRECT_URI=https://your-actual-domain.azurestaticapps.net
```

## Cost Optimization

1. **Azure Functions**: Use Consumption plan for low traffic, Premium for high traffic
2. **Static Web Apps**: Free tier sufficient for most use cases
3. **Application Insights**: Configure sampling to reduce costs
4. **Storage**: Use Blob storage lifecycle policies to archive old data

## Support

For issues or questions:
- Check Application Insights for errors
- Review SECURITY.md for security best practices
- Check Azure Function logs for detailed error messages
- Verify all environment variables are correctly set
