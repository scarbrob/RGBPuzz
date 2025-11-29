# Development Setup Guide

## Local Development

### Production Status

**RGBPuzz is production-ready!**
- ✅ API deployed to **rgbpuzz.com/api** (custom domain configured)
- ✅ All features complete (Daily + 400 Levels)
- ✅ Authentication working (Microsoft + Google)
- ✅ Statistics tracking live
- 🚀 Ready for frontend deployment to **rgbpuzz.com**

### Prerequisites

- Node.js 18+ and npm
- Azure Functions Core Tools v4 (for local development)
- Git

### Installation

1. **Clone the repository**
   ```bash
   cd c:\Repos
   git clone <your-repo-url> rgbpuzz
   cd rgbpuzz
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

   Or manually:
   ```bash
   cd shared && npm install
   cd ../frontend && npm install
   cd ../api && npm install
   ```

3. **Build shared types**
   ```bash
   cd shared
   npm run build
   ```

### Running Locally

#### Frontend Development Server

```bash
cd frontend
npm run dev
```

The app will be available at `http://localhost:3000`

#### API Development Server

```bash
cd api
npm run start
```

The API will be available at `http://localhost:7071`

### Project Structure

```
rgbpuzz/
├── frontend/               # React app
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── App.tsx        # Main app component
│   │   └── main.tsx       # Entry point
│   └── package.json
│
├── api/                   # Azure Functions
│   ├── src/
│   │   ├── functions/    # HTTP triggered functions
│   │   └── utils/        # Helper utilities
│   └── package.json
│
├── shared/               # Shared TypeScript types
│   ├── src/
│   │   ├── types.ts     # Interface definitions
│   │   └── utils.ts     # Shared utilities
│   └── package.json
│
└── infrastructure/       # Azure deployment configs
```

### Available Scripts

#### Root Level
- `npm run install:all` - Install all dependencies
- `npm run dev:frontend` - Start frontend dev server
- `npm run dev:api` - Start API dev server
- `npm run build:frontend` - Build frontend for production
- `npm run build:api` - Build API for production

#### Frontend
- `npm run dev` - Start dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

#### API
- `npm run build` - Compile TypeScript
- `npm run watch` - Watch mode compilation
- `npm run start` - Start Azure Functions locally

## Game Mechanics

### Daily Challenge
- New puzzle generated daily at midnight UTC
- 5 colors to sort by RGB value
- 5 attempts maximum
- Results shareable to social media

### Level Mode
- Progressive difficulty (Easy → Expert)
- Themed color challenges (Reds, Blues, Greens, Mixed)
- Star ratings based on performance
- 3 stars = solved in minimum attempts

### Color Ordering
- Colors sorted by RGB value: `R * 65536 + G * 256 + B`
- Lower values on left, higher on right
- Drag and drop interface for reordering

## API Endpoints

**Base URL**: https://rgbpuzz.com/api (Production)  
**Local URL**: http://localhost:7071/api (Development)

### `GET /api/daily-challenge`
Returns today's challenge with shuffled color tokens.

**Response:**
```json
{
  "date": "2025-11-28",
  "colorTokens": [
    { "id": "color-0", "encrypted": "U2FsdGVkX1...", "hex": "#ff6b6b" }
  ],
  "maxAttempts": 5
}
```

### `POST /api/validate-solution`
Validates user's color ordering (Daily or Level mode).

**Request:**
```json
{
  "mode": "daily",
  "date": "2025-11-28",
  "orderedTokenIds": ["color-2", "color-0", "color-1", "color-4", "color-3"]
}
```

**Response:**
```json
{
  "correct": false,
  "correctPositions": [0, 2],
  "solved": false
}
```

### `GET /api/level?difficulty={difficulty}&level={level}`
Returns level challenge (Easy/Medium/Hard/Insane, 1-100).

### `GET /api/user/stats?userId={userId}&email={email}`
Returns user statistics (streaks, win rates, fastest times).

### `POST /api/user/daily-stats`
Updates daily challenge statistics (calculates streaks automatically).

### `POST /api/user/level-stats`
Updates level statistics (tracks progress per difficulty).

### `GET /api/user/level-progress?userId={userId}&difficulty={difficulty}`
Returns level completion progress for a difficulty.

## Testing

```bash
# Frontend tests
cd frontend
npm run test

# API tests (when implemented)
cd api
npm run test
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Test locally
4. Submit a pull request

## Troubleshooting

### Frontend won't start
- Ensure Node.js 18+ is installed
- Delete `node_modules` and reinstall: `npm ci`
- Check port 3000 isn't in use

### API won't start
- Install Azure Functions Core Tools
- Check port 7071 isn't in use
- Verify `local.settings.json` exists in `api/`

### CORS errors
- Ensure API is running on port 7071
- Check `vite.config.ts` proxy configuration

---

**RGBPuzz** - Open source daily puzzle game  
Created by Benjamin Scarbrough | [GitHub](https://github.com/scarbrob/RGBPuzz) | MIT License
