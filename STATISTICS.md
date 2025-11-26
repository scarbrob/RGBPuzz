# Statistics System

This document describes how the statistics tracking system works in RGBPuzz.

## Overview

The statistics system tracks user performance across two game modes:
- **Daily Challenges**: Tracks streaks, win rates, and average attempts
- **Level Mode**: Tracks completion rates, solve times, and per-difficulty statistics

## Architecture

### Backend (`api/src/`)

**Database Tables (Azure Table Storage):**
- `UserStats`: Aggregate statistics per user
- `DailyAttempts`: Individual daily challenge attempts
- `LevelAttempts`: Individual level attempts and progress

**API Endpoints:**
- `GET /api/user/stats` - Get user statistics
  - Query params: `userId`, `email`, `displayName`
  - Returns: Complete UserStats object
  
- `POST /api/user/daily-stats` - Update daily challenge statistics
  - Body: `{ userId, date, attempts, solved, solveTime? }`
  - Updates streaks automatically
  
- `POST /api/user/level-stats` - Update level statistics
  - Body: `{ userId, difficulty, level, attempts, solved, solveTime? }`
  - Updates per-difficulty stats

**Key Functions (`api/src/utils/userStats.ts`):**
- `getUserStats()` - Get or create user stats
- `updateDailyStats()` - Update after daily challenge (calculates streaks)
- `updateLevelStats()` - Update after level completion
- `initializeStatsTables()` - Create database tables

### Frontend (`frontend/src/`)

**Statistics Service (`services/statsService.ts`):**
- `updateDailyStats()` - Call after daily challenge completion
- `updateLevelStats()` - Call after level completion

**Pages:**
- `StatsPage.tsx` - Display statistics dashboard
- `DailyChallengePage.tsx` - Calls `updateDailyStats()` on win/loss
- `LevelPlayPage.tsx` - Calls `updateLevelStats()` on completion

## Statistics Tracked

### Daily Challenge Stats
- `dailyStreak` - Current consecutive days played and won
- `longestStreak` - Best streak ever achieved
- `dailyWinRate` - Percentage of daily challenges won
- `totalDailyPlayed` - Total daily challenges attempted
- `totalDailyWins` - Total daily challenges won
- `averageDailyAttempts` - Average number of attempts per daily challenge

### Level Mode Stats
- `totalLevelsAttempted` - Total levels tried
- `totalLevelsSolved` - Total levels completed
- `levelSolveRate` - Percentage of levels solved
- `averageLevelAttempts` - Average attempts per level
- `totalLevelAttempts` - Total attempts across all levels
- `fastestSolveTime` - Fastest level completion time (milliseconds)

### Per-Difficulty Stats
For each difficulty (easy, medium, hard, insane):
- `{difficulty}Solved` - Levels completed
- `{difficulty}Attempted` - Levels tried
- Success rate calculated as `solved / attempted * 100`

## Implementation Details

### Streak Calculation
Streaks are calculated based on consecutive days with at least one win:
1. Check if today's date matches last play date
2. If consecutive and won today, increment streak
3. If gap in days or lost today, reset streak to 0 or 1
4. Update longest streak if current exceeds it

### Moving Averages
Attempts are tracked using weighted moving averages:
- Daily attempts: `(currentAvg * totalPlayed + newAttempts) / (totalPlayed + 1)`
- Level attempts: `(currentAvg * totalAttempts + newAttempts) / (totalAttempts + 1)`

### Authentication
Statistics are only tracked for authenticated users:
- Check `user` from `AuthContext`
- Pass `user.id`, `user.email` to stats functions
- Stats updates fail silently for unauthenticated users (logged to console)

## Setup Instructions

### 1. Initialize Database Tables

Make a GET request to initialize the stats tables:
```bash
curl http://localhost:7071/api/admin/init-db
```

Or navigate to: `http://localhost:7071/api/admin/init-db`

This creates:
- `UserStats` table
- `DailyAttempts` table
- `LevelAttempts` table

### 2. Configure Storage Connection

Ensure your `api/local.settings.json` has:
```json
{
  "Values": {
    "AZURE_STORAGE_CONNECTION_STRING": "UseDevelopmentStorage=true"
  }
}
```

For Azurite (local development):
```bash
# Install Azurite
npm install -g azurite

# Start Azurite
azurite --location ./azurite-data
```

### 3. Test the System

1. Sign in to the app (mock mode works)
2. Complete a daily challenge or level
3. Check the stats page (`/stats`)
4. Verify stats are updating

## API Examples

### Get User Stats
```typescript
const response = await fetch(
  `http://localhost:7071/api/user/stats?userId=${userId}&email=${email}`,
  { method: 'GET' }
)
const stats = await response.json()
```

### Update Daily Stats (Win)
```typescript
await fetch('http://localhost:7071/api/user/daily-stats', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user123',
    date: '2025-11-25',
    attempts: 3,
    solved: true,
    solveTime: 45000 // 45 seconds
  })
})
```

### Update Level Stats
```typescript
await fetch('http://localhost:7071/api/user/level-stats', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user123',
    difficulty: 'medium',
    level: 5,
    attempts: 4,
    solved: true,
    solveTime: 62000 // 1 minute 2 seconds
  })
})
```

## Testing

### Manual Testing Checklist

Daily Challenges:
- [ ] Complete a daily challenge (win) - verify streak increments
- [ ] Fail a daily challenge (lose) - verify win rate updates
- [ ] Complete challenges on consecutive days - verify streak continues
- [ ] Skip a day - verify streak resets
- [ ] Check stats page shows correct daily stats

Level Mode:
- [ ] Complete a level - verify solve count increments
- [ ] Attempt a level multiple times - verify attempts tracked
- [ ] Complete levels of different difficulties - verify per-difficulty stats
- [ ] Check stats page shows correct level stats

### Common Issues

**Stats not updating:**
- Check browser console for errors
- Verify user is authenticated (`user` exists in AuthContext)
- Check API is running (`http://localhost:7071`)
- Verify database tables exist (call `/api/admin/init-db`)

**Streak not incrementing:**
- Ensure dates are in ISO format (`YYYY-MM-DD`)
- Check timezone handling (all dates use UTC)
- Verify consecutive days (no gaps)

**Data not persisting:**
- Check Azure Storage connection
- Verify Azurite is running (local dev)
- Check `local.settings.json` configuration

## Production Deployment

For production:
1. Set up Azure Table Storage account
2. Configure connection string in Azure Function App settings
3. Run `/api/admin/init-db` once to create tables
4. Monitor with Azure Application Insights

## Future Enhancements

Potential improvements:
- Leaderboards (daily/weekly)
- Achievement system
- Social sharing
- Historical trends and graphs
- Export stats as JSON/CSV
- Stats comparison with friends
