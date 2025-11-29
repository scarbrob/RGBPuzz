# Quick Start Commands

## Development

### Start Everything (Recommended)
```powershell
# Terminal 1 - Frontend
cd c:\Repos\rgbpuzz\frontend
npm run dev

# Terminal 2 - API
cd c:\Repos\rgbpuzz\api
npm run start
```

### Or use the setup script
```powershell
cd c:\Repos\rgbpuzz
.\setup.ps1
```

## First Time Setup

```powershell
cd c:\Repos\rgbpuzz

# Install all dependencies
cd shared && npm install && npm run build
cd ../frontend && npm install
cd ../api && npm install
```

## Useful Commands

```powershell
# Build everything for production
cd c:\Repos\rgbpuzz
cd shared && npm run build
cd ../frontend && npm run build
cd ../api && npm run build

# Run linting
cd frontend && npm run lint

# Preview production build
cd frontend && npm run preview
```

## Troubleshooting

### "Cannot find module" errors
```powershell
# Clean install
cd shared && Remove-Item -Recurse -Force node_modules && npm install
cd ../frontend && Remove-Item -Recurse -Force node_modules && npm install
cd ../api && Remove-Item -Recurse -Force node_modules && npm install
```

### Port already in use
```powershell
# Check what's using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F
```

### Azure Functions not starting
```powershell
# Install Azure Functions Core Tools
npm install -g azure-functions-core-tools@4 --unsafe-perm true
```

## URLs

**Development:**
- Frontend: http://localhost:3000
- API: http://localhost:7071
- API Health: http://localhost:7071/api/daily-challenge

**Production:**
- Website: **rgbpuzz.com** (ready to deploy)
- API: https://rgbpuzz.com/api (deployed ✅)
- API Health: https://rgbpuzz.com/api/daily-challenge

---

**RGBPuzz** - Open source daily puzzle game  
Created by Benjamin Scarbrough | [GitHub](https://github.com/scarbrob/RGBPuzz) | MIT License
