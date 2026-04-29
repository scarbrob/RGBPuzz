# RGBPuzz Deployment Guide

## Prerequisites

- Azure subscription
- Azure CLI installed and configured
- Node.js 18+ installed
- Azure Functions Core Tools v4

## Architecture

- **Frontend**: Azure Static Web Apps (`rgbpuzz-web`) → https://rgbpuzz.com
- **Backend**: Azure Functions Flex Consumption (`rgbpuzz-api`) → https://api.rgbpuzz.com
- **Database**: None — all user data stored client-side
- **Authentication**: None required

## Environment Variables

### Backend (Azure Functions)

```bash
DAILY_CHALLENGE_SALT=<secure-random-string>
ALLOWED_ORIGINS=https://rgbpuzz.com
AzureWebJobsStorage=<storage-connection-string>
FUNCTIONS_WORKER_RUNTIME=node
```

### Frontend (build-time)

```bash
VITE_API_BASE_URL=https://api.rgbpuzz.com/api
```

## Deployment Steps

### 1. Build

```bash
cd shared && npm install && npm run build
cd ../api && npm install --omit=dev && npm run build
cd ../frontend && VITE_API_BASE_URL=https://api.rgbpuzz.com/api npm run build
```

### 2. Deploy API

```bash
cd api
func azure functionapp publish rgbpuzz-api --javascript
```

### 3. Deploy Frontend

```bash
swa deploy frontend/dist --deployment-token <token> --env production
```

Or push to main branch for automatic GitHub Actions deployment.

### 4. Verify

```bash
curl https://api.rgbpuzz.com/api/daily-challenge
curl https://api.rgbpuzz.com/api/spectrum-daily
curl "https://api.rgbpuzz.com/api/level?difficulty=easy&level=1"
curl "https://api.rgbpuzz.com/api/spectrum-level?difficulty=easy&level=1"
```

## Cold Start Prevention

- `minimumElasticInstanceCount` set to 1 (always-ready instance)
- Warmup timer function pings endpoints every 4 minutes

## Production Checklist

- [ ] Backend deployed at `api.rgbpuzz.com`
- [ ] Frontend deployed at `rgbpuzz.com`
- [ ] `DAILY_CHALLENGE_SALT` set to secure random string
- [ ] `ALLOWED_ORIGINS` set to `https://rgbpuzz.com`
- [ ] `VITE_API_BASE_URL` set to `https://api.rgbpuzz.com/api` during build
- [ ] HTTPS enforced
- [ ] All 5 HTTP endpoints + warmup timer responding
- [ ] Custom domains configured
- [ ] GitHub Actions workflow has correct `VITE_API_BASE_URL`

## Cost Estimate

- Azure Functions (Flex Consumption + 1 always-ready): ~$5-15/month
- Azure Static Web Apps (Free tier): $0/month
- Azure Storage: ~$1/month
- **Total**: ~$6-16/month

---

**RGBPuzz** — Open source daily puzzle game
Created by the RGBPuzz Team | [GitHub](https://github.com/scarbrob/RGBPuzz) | MIT License
