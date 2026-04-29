# Quick Start Commands

## Development

### Start Everything (Two terminals)
```bash
# Terminal 1 - Frontend
cd frontend
npm run dev

# Terminal 2 - API
cd api
npm run start
```

## First Time Setup

```bash
# Clone and install
git clone https://github.com/scarbrob/RGBPuzz.git
cd RGBPuzz

# Install all dependencies
cd shared && npm install && npm run build
cd ../frontend && npm install
cd ../api && npm install

# Configure API
cd ../api
cp local.settings.example.json local.settings.json
# Edit local.settings.json if needed
```

## Useful Commands

```bash
# Build everything for production
cd shared && npm run build
cd ../api && npm run build
cd ../frontend && npm run build

# Run linting
cd frontend && npm run lint

# Preview production build
cd frontend && npm run preview

# Run tests
cd frontend && npm run test
```

## Troubleshooting

### "Cannot find module" errors
```bash
# Clean install all packages
cd shared && rm -rf node_modules && npm install && npm run build
cd ../frontend && rm -rf node_modules && npm install
cd ../api && rm -rf node_modules && npm install
```

### Port already in use
```bash
# Find what's using a port
lsof -i :3000   # macOS/Linux
netstat -tlnp | grep 3000  # Linux
```

### Azure Functions not starting
```bash
npm install -g azure-functions-core-tools@4
```

## URLs

| Environment | Frontend | API |
|-------------|----------|-----|
| **Development** | http://localhost:3000 | http://localhost:7071 |
| **Production** | https://rgbpuzz.com | https://api.rgbpuzz.com/api |

---

**RGBPuzz** — Open source daily puzzle game
Created by the RGBPuzz Team | [GitHub](https://github.com/scarbrob/RGBPuzz) | MIT License
