# Azure Deployment Configuration

## Prerequisites

1. Azure CLI installed
2. Azure Functions Core Tools v4
3. Node.js 18+ installed
4. Azure subscription

## Setup Steps

### 1. Create Azure Resources

```bash
# Login to Azure
az login

# Create resource group
az group create --name rgbpuzz-rg --location eastus

# Create storage account
az storage account create --name rgbpuzzstore --location eastus --resource-group rgbpuzz-rg --sku Standard_LRS

# Create Cosmos DB account (for user data)
az cosmosdb create --name rgbpuzz-db --resource-group rgbpuzz-rg --default-consistency-level Session

# Create Static Web App with API
az staticwebapp create --name rgbpuzz --resource-group rgbpuzz-rg --location eastus --sku Free

# Create Azure AD B2C tenant (for authentication)
# Follow: https://learn.microsoft.com/azure/active-directory-b2c/tutorial-create-tenant
```

### 2. Configure Environment Variables

Create `.env` file in the root:

```
AZURE_SUBSCRIPTION_ID=your-subscription-id
AZURE_RESOURCE_GROUP=rgbpuzz-rg
AZURE_LOCATION=eastus
COSMOS_DB_CONNECTION_STRING=your-cosmos-connection-string
DAILY_CHALLENGE_SALT=your-random-salt-string
```

### 3. Deploy Frontend

```bash
# Build frontend
cd frontend
npm run build

# Deploy to Azure Static Web Apps
# Either through GitHub Actions (recommended) or Azure CLI
az staticwebapp deploy --name rgbpuzz --source ./dist
```

### 4. Deploy API

```bash
# Build API
cd api
npm run build

# Deploy Functions
func azure functionapp publish rgbpuzz-api
```

## GitHub Actions Setup

The repository includes GitHub Actions workflows for CI/CD:

- `.github/workflows/azure-static-web-apps.yml` - Frontend deployment
- `.github/workflows/azure-functions.yml` - API deployment

Configure the following secrets in GitHub:
- `AZURE_STATIC_WEB_APPS_API_TOKEN`
- `AZURE_FUNCTIONAPP_PUBLISH_PROFILE`
- `COSMOS_DB_CONNECTION_STRING`

## Monitoring

- Application Insights for API monitoring
- Static Web Apps analytics for frontend
- Cosmos DB metrics for database performance

## Cost Estimation

- Azure Static Web Apps (Free tier): $0/month
- Azure Functions (Consumption plan): ~$1-5/month
- Cosmos DB (Serverless): ~$5-20/month
- Azure AD B2C (Free tier): $0 for first 50k MAU

**Total estimated cost: $10-30/month**
