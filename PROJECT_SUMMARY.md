# RGBPuzz — Project Summary

## 🎯 Game Concept

**RGBPuzz** is a daily color-sorting puzzle game where players arrange colors by their RGB values without seeing the actual numbers — like Wordle, but with colors!

### Core Mechanics
- **Daily Challenge**: 5 colors, 5 attempts, new puzzle at midnight UTC
- **Level Mode**: 400 progressive levels across 4 difficulties
- **Hidden Values**: Players never see RGB numbers — must rely on visual perception
- **Social Sharing**: Share results as emoji grids (Wordle-style)
- **No Account Required**: All progress stored locally in the browser

### Why It's Unique
- ✅ Novel mechanic: Sorting by hidden mathematical values
- ✅ Daily habit-forming gameplay (NYT Games model)
- ✅ Educational: Teaches RGB color theory
- ✅ Universal: Colors transcend language barriers
- ✅ Simple to learn, challenging to master

## 🏗️ Architecture

### Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, dnd-kit |
| **Backend** | Azure Functions (Node.js 18, TypeScript) |
| **Data** | localStorage / sessionStorage (client-side only) |
| **Hosting** | Azure Static Web Apps + Azure Functions (Flex Consumption) |
| **CI/CD** | GitHub Actions |

### Security Model
Colors are generated server-side from deterministic seeds. Clients receive:
- Encrypted hex values (XOR cipher with token-derived key)
- Cryptographic hash tokens for validation

RGB values are **never** sent to the client, preventing cheating.

### Cost
Estimated $1-10/month (Azure Functions Flex Consumption + Free Static Web Apps).

## 📊 Current Status: Deployed in Production 🚀

- ✅ Frontend: **https://rgbpuzz.com**
- ✅ API: **https://api.rgbpuzz.com/api**
- ✅ Full game: Daily Challenge + 400 Levels
- ✅ Statistics tracking (streaks, win rates, times)
- ✅ Dark/light theme, responsive design
- ✅ SEO optimized (meta tags, OG image, JSON-LD, sitemap)
- ✅ Rate limiting, input validation, CORS
- ✅ 0 npm vulnerabilities
- ✅ MIT License, open source

## 🎮 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/daily-challenge` | GET | Today's color puzzle |
| `/api/validate-solution` | POST | Check user's answer |
| `/api/level` | GET | Get level by difficulty + number |

## 🚀 Getting Started

```bash
git clone https://github.com/scarbrob/RGBPuzz.git
cd RGBPuzz

cd shared && npm install && npm run build
cd ../frontend && npm install
cd ../api && npm install

# Terminal 1
cd frontend && npm run dev

# Terminal 2
cd api && cp local.settings.example.json local.settings.json && npm run start
```

Open http://localhost:3000

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [README.md](README.md) | Project overview |
| [DEVELOPMENT.md](DEVELOPMENT.md) | Development setup & API docs |
| [QUICKSTART.md](QUICKSTART.md) | Quick commands |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Azure deployment guide |
| [ROADMAP.md](ROADMAP.md) | Feature roadmap |
| [DESIGN.md](DESIGN.md) | UI/UX mockups |

## 💡 Key Innovation

```
RGB Value = R × 65536 + G × 256 + B
```

This formula means:
- Colors that look similar can have very different values
- Colors that look different can be close in value
- Players must develop intuition for the mathematical ordering

## 📧 Contact

Questions or bug reports: [Open an issue](https://github.com/scarbrob/RGBPuzz/issues)

**Created by the RGBPuzz Team**

---

**RGBPuzz** — Open source daily puzzle game | MIT License
