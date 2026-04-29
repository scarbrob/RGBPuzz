# Development Setup Guide

## Local Development

### Production Status

**RGBPuzz is deployed in production!**
- ✅ API deployed at **api.rgbpuzz.com/api** (Azure Functions)
- ✅ Frontend deployed at **rgbpuzz.com** (Azure Static Web Apps)
- ✅ All features complete (Daily Challenge + 400 Levels)
- ✅ Statistics tracking (local storage)
- ✅ No authentication required — all data stored locally

### Prerequisites

- Node.js 18+ and npm
- Azure Functions Core Tools v4 *(optional, for local API development)*
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/scarbrob/RGBPuzz.git
   cd RGBPuzz
   ```

2. **Install dependencies**
   ```bash
   cd shared && npm install && npm run build
   cd ../frontend && npm install
   cd ../api && npm install
   ```

3. **Configure API environment**
   ```bash
   cd api
   cp local.settings.example.json local.settings.json
   # Edit local.settings.json — set DAILY_CHALLENGE_SALT to any string for dev
   ```

### Running Locally

#### Frontend Development Server

```bash
cd frontend
npm run dev
```

The app will be available at `http://localhost:3000`.
The Vite dev server proxies `/api` requests to `http://localhost:7071`.

#### API Development Server

```bash
cd api
npm run start
```

The API will be available at `http://localhost:7071`.

> **Note:** The frontend can run without the API — it will show an error message if the API is unavailable.

### Project Structure

```
rgbpuzz/
├── frontend/               # React app
│   ├── src/
│   │   ├── components/    # ColorBoard, ColorTile, Header, Footer, etc.
│   │   ├── pages/         # HomePage, DailyChallengePage, LevelsPage, etc.
│   │   ├── contexts/      # ThemeContext
│   │   ├── config/        # API configuration
│   │   ├── App.tsx        # Routes & layout
│   │   └── main.tsx       # Entry point
│   └── package.json
│
├── api/                   # Azure Functions (v3 model)
│   ├── src/
│   │   ├── functions/    # dailyChallenge, validateSolution, getLevel
│   │   ├── middleware/   # cors, rateLimit, validation
│   │   └── utils/        # colorGenerator
│   ├── dailyChallenge/   # v3 function wrapper
│   ├── validateSolution/ # v3 function wrapper
│   ├── getLevel/         # v3 function wrapper
│   └── package.json
│
├── shared/               # Shared TypeScript code
│   └── src/
│       ├── types.ts     # RGBColor interface
│       ├── constants.ts # Game config (difficulties, level count)
│       └── crypto.ts    # Client-side color decryption
│
└── .github/workflows/   # CI/CD pipelines
```

### Available Scripts

#### Frontend
- `npm run dev` — Start dev server (port 3000)
- `npm run build` — TypeScript check + Vite production build
- `npm run preview` — Preview production build
- `npm run lint` — Run ESLint

#### API
- `npm run build` — Compile TypeScript
- `npm run watch` — Watch mode compilation
- `npm run start` — Build + start Azure Functions locally

#### Shared
- `npm run build` — Compile TypeScript
- `npm run watch` — Watch mode compilation

## Game Mechanics

### Daily Challenge
- New puzzle generated daily at midnight UTC
- 5 colors to sort by RGB value
- 5 attempts maximum
- Same puzzle for all users worldwide (deterministic from date + salt)
- Results shareable (Wordle-style emoji grid)

### Level Mode
- 400 levels: 100 per difficulty (Easy, Medium, Hard, Insane)
- Easy: 3 colors, 10 attempts
- Medium: 5 colors, 10 attempts
- Hard: 7 colors, 15 attempts
- Insane: 10 colors, 20 attempts
- Colors get progressively closer in RGB value as levels increase
- Sequential unlock (must complete level N to play level N+1)

### Color Ordering
Colors are sorted by RGB value: `R × 65536 + G × 256 + B`
- Lower values on left, higher on right
- Drag and drop interface for reordering

### Security Model
Colors are generated server-side from deterministic seeds. The client receives:
- Encrypted hex color (XOR cipher with token-derived key) for display
- Cryptographic hash token for validation

The actual RGB values are **never** sent to the client, preventing cheating via network inspection or DevTools.

## API Endpoints

**Production**: `https://api.rgbpuzz.com/api`
**Local**: `http://localhost:7071/api`

### `GET /api/daily-challenge?date=YYYY-MM-DD`
Returns today's challenge with shuffled, encrypted color tokens.

**Response:**
```json
{
  "date": "2026-04-28",
  "colorTokens": [
    { "id": "a1b2c3d4e5f6a7b8", "encrypted": "U2FsdGVk..." }
  ],
  "maxAttempts": 5
}
```

### `POST /api/validate-solution`
Validates user's color ordering.

**Request (daily):**
```json
{
  "mode": "daily",
  "date": "2026-04-28",
  "orderedTokenIds": ["a1b2c3d4e5f6a7b8", "b2c3d4e5f6a7b8c9", ...]
}
```

**Request (level):**
```json
{
  "mode": "level",
  "difficulty": "easy",
  "level": 1,
  "orderedTokenIds": ["a1b2c3d4e5f6a7b8", ...]
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
Returns an RGB level challenge.
- `difficulty`: easy, medium, hard, insane
- `level`: 1-100

### `GET /api/spectrum-daily?date=YYYY-MM-DD`
Returns today's spectrum daily challenge (sort by hue).
Colors are clustered within a 60° hue arc for challenge.

### `GET /api/spectrum-level?difficulty={difficulty}&level={level}`
Returns a spectrum level challenge (sort by hue).
- `difficulty`: easy, medium, hard, insane
- `level`: 1-100

## Data Storage

All user data is stored **client-side only**:
- **localStorage**: Daily stats (RGB + Spectrum), level progress (RGB + Spectrum), theme preference, tutorial state
- **sessionStorage**: In-progress game state (current attempt, colors, history)

No user data is stored on the server. No accounts. No sign-in.

## Testing

```bash
cd frontend
npm run test
```

## Troubleshooting

### Frontend won't start
- Ensure Node.js 18+ is installed
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check port 3000 isn't in use

### API won't start
- Install Azure Functions Core Tools: `npm install -g azure-functions-core-tools@4`
- Ensure `api/local.settings.json` exists (copy from `local.settings.example.json`)
- Check `DAILY_CHALLENGE_SALT` is set in local settings
- Check port 7071 isn't in use

### CORS errors
- In development, Vite proxies `/api` to port 7071 — ensure API is running
- In production, CORS is handled by the `ALLOWED_ORIGINS` environment variable

### Build errors
- Always build `shared` first: `cd shared && npm run build`
- Clean dist folders if TypeScript output is stale: `rm -rf dist`

---

**RGBPuzz** — Open source daily puzzle game
Created by the RGBPuzz Team | [GitHub](https://github.com/scarbrob/RGBPuzz) | MIT License
