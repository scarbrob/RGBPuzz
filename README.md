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
- 🎯 **Limited Attempts** - 5 tries to get it right
- 🔒 **Hidden Values** - RGB numbers never exposed (even in network requests!)
- 📊 **Level Mode** - 50+ progressive levels with themes
- 📈 **Stats Tracking** - Streaks, win rates, and achievements
- 🔗 **Social Sharing** - Share results like Wordle
- 🎨 **Drag & Drop** - Intuitive touch/mouse interface

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
- Vite (build tool)
- Tailwind CSS (styling)
- dnd-kit (drag & drop)
- React Router (navigation)

**Backend**
- Azure Functions (serverless)
- Node.js 18 + TypeScript
- Crypto API (RGB value protection)

**Database**
- Azure Table Storage (UserStats, DailyAttempts, LevelAttempts)
- User profiles & stats
- Level progress tracking

**Authentication**
- Microsoft Entra External ID (Azure B2C)
- Microsoft OAuth
- Google OAuth (via Azure B2C)
- Mock mode for development

**Hosting**
- Azure Static Web Apps (frontend) - Ready to deploy
- Azure Functions (API) - **Deployed at rgbpuzz.com**
- Est. Cost: $10-30/month

### Security Feature 🔒

Colors are generated server-side from daily seeds. Clients receive:
- Hex color for display (`#ff6b6b`)
- Cryptographic hash for validation

RGB values are **NEVER** sent to the client, preventing inspection or exploitation.

---

## 📁 Project Structure

```
c:\Repos\rgbpuzz\
├── frontend/              # React application
│   ├── src/
│   │   ├── components/   # ColorBoard, ColorTile, Header
│   │   ├── pages/        # Home, Daily, Levels, Stats
│   │   └── App.tsx
│   └── package.json
│
├── api/                  # Azure Functions
│   ├── src/
│   │   ├── functions/   # API endpoints
│   │   └── utils/       # Color generation logic
│   └── package.json
│
├── shared/              # Shared TypeScript types
│   └── src/
│       ├── types.ts    # Interfaces
│       └── utils.ts    # Shared utilities
│
├── infrastructure/      # Azure deployment configs
├── .github/workflows/  # CI/CD pipelines
│
└── Documentation
    ├── README.md              # This file
    ├── DEVELOPMENT.md         # Dev setup guide
    ├── QUICKSTART.md          # Quick commands
    ├── ROADMAP.md             # Feature roadmap
    ├── DESIGN.md              # UI/UX mockups
    ├── PROJECT_SUMMARY.md     # Executive summary
    └── infrastructure/
        └── DEPLOYMENT.md      # Azure deployment
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Azure Functions Core Tools v4 *(optional)*

### Installation

**Option 1: Automated Setup**
```powershell
cd c:\Repos\rgbpuzz
.\setup.ps1
```

**Option 2: Manual Setup**
```powershell
# Install dependencies
cd c:\Repos\rgbpuzz\shared
npm install && npm run build

cd ../frontend
npm install

cd ../api
npm install
```

### Run Development Servers

**Terminal 1 - Frontend:**
```powershell
cd c:\Repos\rgbpuzz\frontend
npm run dev
```
→ Opens at http://localhost:3000

**Terminal 2 - API:**
```powershell
cd c:\Repos\rgbpuzz\api
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
| [infrastructure/DEPLOYMENT.md](infrastructure/DEPLOYMENT.md) | Azure deployment guide |

---

## 🎯 Development Status

### ✅ Production Ready - Core Game Complete!

**Completed Features:**
- ✅ Full game implementation (Daily + 400 Levels)
- ✅ Frontend connected to API with real-time validation
- ✅ Authentication (Microsoft + Google via Azure B2C)
- ✅ Statistics tracking (streaks, fastest times, progress)
- ✅ API deployed to Azure Functions
- ✅ Responsive UI with dark/light themes
- ✅ Session persistence (authenticated + local)
- ✅ Privacy Policy & Terms of Service
- ✅ Share functionality (Wordle-style results)

**Ready for Launch:**
- 🚀 Backend: **Deployed** at rgbpuzz-api.azurewebsites.net
- 🚀 Frontend: Ready for deployment to **rgbpuzz.com**
- 🚀 Database: Azure Table Storage configured
- 🚀 Auth: Microsoft Entra External ID ready

**Next Steps:**
- Deploy frontend to production (Azure Static Web Apps)
- Make repository public
- Launch marketing campaign

*See [ROADMAP.md](ROADMAP.md) for detailed feature list*

---

## 🎨 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/daily-challenge` | GET | Get today's color puzzle |
| `/api/validate-solution` | POST | Check user's answer |
| `/api/level/{id}` | GET | Get level configuration |
| `/api/user/stats` | GET | Get user statistics |

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

MIT License - Copyright (c) 2025 Benjamin Scarbrough

See [LICENSE](LICENSE) for details

---

## 🙏 Acknowledgments

- Inspired by Wordle and NYT Games
- Built for potential acquisition by NYT
- Color theory and RGB education focus

---

## 📧 Contact

Questions? [Open an issue](https://github.com/scarbrob/RGBPuzz/issues) on GitHub!

**Created by Benjamin Scarbrough**

**Made with 🎨 and ❤️**
