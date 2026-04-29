# RGBPuzz 🎨

> A daily color-sorting puzzle game where players arrange colors by their RGB values without seeing the actual numbers.

**Like Wordle, but with colors!**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-blue)](https://reactjs.org/)
[![Azure](https://img.shields.io/badge/Azure-Static_Web_Apps-blue)](https://azure.microsoft.com/)

---

## 🎮 Game Concept

**RGBPuzz** challenges players to sort colors by their RGB values (R×65536 + G×256 + B) without seeing the actual numbers. It combines visual perception with logical reasoning for a unique daily puzzle experience.

### Core Features

- 🗓️ **Daily Challenge** - New puzzle every day at midnight UTC
- 🌈 **Spectrum Daily** - Sort by hue instead of RGB value
- 🎯 **Limited Attempts** - 5 tries to get it right
- 🔒 **Hidden Values** - RGB numbers never exposed (even in network requests!)
- 📊 **Level Mode** - 400 progressive RGB levels across 4 difficulties
- 🌈 **Spectrum Levels** - 400 hue-sorting levels across 4 difficulties
- 📈 **Stats Tracking** - Streaks, win rates, and per-mode statistics
- 🔗 **Social Sharing** - Share results like Wordle
- 🎨 **Drag & Drop** - Intuitive touch/mouse interface
- ⚡ **Loading Skeleton** - Smooth UX during cold starts
- 🎆 **Confetti** - Celebration animation on puzzle solve

### Why It's Unique

- ✅ **Novel Mechanic**: Sorting by hidden mathematical values
- ✅ **Daily Habit**: NYT Games-style engagement model
- ✅ **Educational**: Teaches RGB color system
- ✅ **Universal**: Colors transcend language barriers
- ✅ **Accessible**: Simple rules, deep strategy

---

## 🏗️ Architecture

### Technology Stack

**Frontend**
- React 18 + TypeScript
- Vite 7.2.4 (build tool, includes esbuild 0.25.12)
- Tailwind CSS (styling)
- dnd-kit (drag & drop)
- React Router 6 (navigation, v7-ready)

**Backend**
- Azure Functions (serverless)
- Node.js 18 + TypeScript
- Crypto API (RGB value protection)

**Database**
- localStorage / sessionStorage (client-side only)
- No server-side user data storage

**Authentication**
- No account required — all data stored locally
- No personal information collected

**Hosting**
- Azure Static Web Apps (frontend) - **Deployed at rgbpuzz.com**
- Azure Functions (API) - **Deployed at api.rgbpuzz.com/api**
- Flex Consumption Plan (serverless)
- Est. Cost: $10-30/month

### Security Feature 🔒

Colors are generated server-side from daily seeds. Clients receive:
- Hex color for display (`#ff6b6b`)
- Cryptographic hash for validation

RGB values are **NEVER** sent to the client, preventing inspection or exploitation.

---

## 📁 Project Structure

```
rgbpuzz/
├── frontend/              # React application
│   ├── src/
│   │   ├── components/   # ColorBoard, ColorTile, Header, Confetti, etc.
│   │   ├── pages/        # Home, Daily, Levels, Spectrum, Stats
│   │   ├── hooks/        # useGameState, useDailyStats
│   │   ├── types/        # Shared frontend types
│   │   ├── contexts/     # ThemeContext
│   │   ├── config/       # API configuration
│   │   └── App.tsx
│   └── package.json
│
├── api/                  # Azure Functions
│   ├── src/
│   │   ├── functions/   # API endpoints (daily, level, spectrum, validate)
│   │   ├── middleware/  # CORS, rate limiting, validation
│   │   └── utils/       # Color generation (RGB + HSL)
│   ├── warmup/            # Timer-triggered keep-alive
│   └── package.json
│
├── shared/              # Shared TypeScript types
│   └── src/
│       ├── types.ts    # Interfaces
│       ├── constants.ts # Game configuration
│       └── crypto.ts   # Client-side decryption
│
├── .github/workflows/  # CI/CD pipelines
│
└── Documentation
    ├── README.md              # This file
    ├── DEVELOPMENT.md         # Dev setup guide
    ├── QUICKSTART.md          # Quick commands
    ├── ROADMAP.md             # Feature roadmap
    ├── DESIGN.md              # UI/UX mockups
    ├── PROJECT_SUMMARY.md     # Executive summary
    └── DEPLOYMENT.md          # Azure deployment
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Azure Functions Core Tools v4 *(optional)*

### Installation

**Option 1: Automated Setup**
```bash
cd rgbpuzz
./setup.ps1  # PowerShell
```

**Option 2: Manual Setup**
```bash
# Install dependencies
cd rgbpuzz/shared
npm install && npm run build

cd ../frontend
npm install

cd ../api
npm install
```

### Run Development Servers

**Terminal 1 - Frontend:**
```bash
cd rgbpuzz/frontend
npm run dev
```
→ Opens at http://localhost:3000

**Terminal 2 - API:**
```bash
cd rgbpuzz/api
npm run start
```
→ Runs at http://localhost:7071

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [DEVELOPMENT.md](DEVELOPMENT.md) | Full development guide, API docs, troubleshooting |
| [QUICKSTART.md](QUICKSTART.md) | Quick commands and common tasks |
| [ROADMAP.md](ROADMAP.md) | Feature roadmap and development phases |
| [DESIGN.md](DESIGN.md) | UI/UX mockups and design system |
| [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) | Executive summary and strategy |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Azure deployment guide |

---

## 🎯 Development Status

### ✅ Production Ready - Core Game Complete!

**Completed Features:**
- ✅ Full game implementation (Daily + Spectrum Daily + 800 Levels)
- ✅ Frontend connected to API with real-time validation
- ✅ Statistics tracking (streaks, fastest times, progress) — stored locally
- ✅ API deployed to Azure Functions (Flex Consumption)
- ✅ Frontend deployed to Azure Static Web Apps
- ✅ Loading skeleton UI for better cold start UX
- ✅ Responsive UI with dark/light themes
- ✅ Session persistence (local storage)
- ✅ Privacy Policy & Terms of Service
- ✅ Share functionality (Wordle-style results)
- ✅ Security: esbuild 0.25.12, React Router v7-ready
- ✅ SEO: Comprehensive meta tags, sitemap, robots.txt

**Production Ready:**
- ✅ Backend: **Deployed** at https://api.rgbpuzz.com/api
- ✅ Frontend: **Deployed** at https://rgbpuzz.com
- ✅ Database: localStorage / sessionStorage (client-side)
- ✅ No authentication required
- ✅ CI/CD: GitHub Actions for automated deployment

**Next Steps:**
- Deploy frontend to production (Azure Static Web Apps)
- Make repository public
- Launch marketing campaign

*See [ROADMAP.md](ROADMAP.md) for detailed feature list*

---

## 🎨 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/daily-challenge` | GET | Get today's RGB color puzzle |
| `/api/validate-solution` | POST | Check user's answer |
| `/api/level` | GET | Get RGB level by difficulty + number |
| `/api/spectrum-daily` | GET | Get today's spectrum (hue) puzzle |
| `/api/spectrum-level` | GET | Get spectrum level by difficulty + number |

*Full API documentation in [DEVELOPMENT.md](DEVELOPMENT.md)*

---

## 🎯 Project Goals

### Open Source Portfolio Project
- 🎨 Build an engaging daily puzzle game
- 💻 Demonstrate full-stack development skills
- 🌟 Foster open source community (MIT License)
- 📈 Target: 10k+ monthly active users
- 🚀 Launching at **rgbpuzz.com**

### Why RGBPuzz Stands Out
1. ✅ Proven daily puzzle model (like Wordle)
2. ✅ Unique mechanic with no competitors
3. ✅ Educational value (RGB color theory)
4. ✅ Mobile-friendly, accessible design
5. ✅ Universal appeal (no language barrier)

*See [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) for full details*

---

## 🤝 Contributing

Contributions are welcome! This is an open source project.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

For bug reports or feature requests, please [open an issue](https://github.com/scarbrob/RGBPuzz/issues).

---

## 📊 Tech Highlights

- **TypeScript** throughout for type safety
- **Serverless** architecture (scalable, cost-effective)
- **Cryptographic security** (no RGB value leaks)
- **Responsive design** (mobile-first)
- **Drag & Drop** with dnd-kit (touch + mouse)
- **Daily deterministic generation** (same puzzle for all users)

---

## 📄 License

MIT License

See [LICENSE](LICENSE) for details

---

## 🙏 Acknowledgments

- Inspired by Wordle and NYT Games
- Built for potential acquisition by NYT
- Color theory and RGB education focus

---

## 📧 Contact

Questions? [Open an issue](https://github.com/scarbrob/RGBPuzz/issues) on GitHub!

**Created by the RGBPuzz Team**

**Made with 🎨 and ❤️**
