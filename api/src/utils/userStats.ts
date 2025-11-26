import { TableClient } from '@azure/data-tables';

let tableClient: TableClient | null = null;

// ==================== ENTITY INTERFACES ====================

export interface UserStatsEntity {
  partitionKey: string; // 'users'
  rowKey: string; // userId
  userId: string;
  email: string;
  displayName?: string;
  createdAt: Date;
  lastActive: Date;
  
  // Daily Challenge Stats
  dailyStreak: number;
  longestStreak: number;
  lastDailyPlayed: string; // YYYY-MM-DD
  dailyWinRate: number; // percentage
  totalDailyPlayed: number;
  totalDailyWins: number;
  averageDailyAttempts: number;
  
  // Level Stats
  totalLevelsAttempted: number;
  totalLevelsSolved: number;
  levelSolveRate: number; // percentage of all 400 levels (100 per difficulty)
  averageLevelAttempts: number;
  totalLevelAttempts: number;
  
  // Per-difficulty stats
  easySolved: number;
  easyAttempted: number;
  easyTotalAttempts: number; // total attempts across all easy levels
  easyFastestTime?: number; // milliseconds
  mediumSolved: number;
  mediumAttempted: number;
  mediumTotalAttempts: number; // total attempts across all medium levels
  mediumFastestTime?: number; // milliseconds
  hardSolved: number;
  hardAttempted: number;
  hardTotalAttempts: number; // total attempts across all hard levels
  hardFastestTime?: number; // milliseconds
  insaneSolved: number;
  insaneAttempted: number;
  insaneTotalAttempts: number; // total attempts across all insane levels
  insaneFastestTime?: number; // milliseconds
}

export interface DailyAttemptEntity {
  partitionKey: string; // 'daily-attempts'
  rowKey: string; // `${userId}-${date}`
  userId: string;
  date: string; // YYYY-MM-DD
  attempts: number;
  solved: boolean;
  solveTime?: number; // milliseconds
  timestamp: Date;
}

export interface LevelAttemptEntity {
  partitionKey: string; // 'level-attempts'
  rowKey: string; // `${userId}-${difficulty}-${level}`
  userId: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'insane';
  level: number;
  attempts: number;
  solved: boolean;
  bestTime?: number; // milliseconds
  firstAttemptDate: Date;
  lastAttemptDate: Date;
  solvedDate?: Date;
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Initialize the table client
 */
export function getStatsTableClient(): TableClient {
  if (tableClient) {
    return tableClient;
  }

  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  const tableName = 'UserStats';

  if (!connectionString) {
    throw new Error('AZURE_STORAGE_CONNECTION_STRING is not set');
  }

  tableClient = TableClient.fromConnectionString(connectionString, tableName);

  return tableClient;
}

/**
 * Initialize stats tables
 */
export async function initializeStatsTables(): Promise<void> {
  const tables = ['UserStats', 'DailyAttempts', 'LevelAttempts'];
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;

  if (!connectionString) {
    throw new Error('AZURE_STORAGE_CONNECTION_STRING is not set');
  }

  for (const tableName of tables) {
    const client = TableClient.fromConnectionString(connectionString, tableName);

    try {
      await client.createTable();
      console.log(`Table ${tableName} created or already exists`);
    } catch (error: any) {
      if (error.statusCode === 409) {
        console.log(`Table ${tableName} already exists`);
      } else {
        throw error;
      }
    }
  }
}

/**
 * Get or create user stats
 */
export async function getUserStats(userId: string, email: string, displayName?: string): Promise<UserStatsEntity> {
  const client = getStatsTableClient();
  
  try {
    const entity = await client.getEntity<UserStatsEntity>('users', userId);
    
    // Migrate existing users to new schema if needed
    let needsUpdate = false;
    
    if (entity.easyTotalAttempts === undefined) {
      entity.easyTotalAttempts = 0;
      needsUpdate = true;
    }
    if (entity.mediumTotalAttempts === undefined) {
      entity.mediumTotalAttempts = 0;
      needsUpdate = true;
    }
    if (entity.hardTotalAttempts === undefined) {
      entity.hardTotalAttempts = 0;
      needsUpdate = true;
    }
    if (entity.insaneTotalAttempts === undefined) {
      entity.insaneTotalAttempts = 0;
      needsUpdate = true;
    }
    
    // Update last active
    entity.lastActive = new Date();
    
    // Use Replace mode to ensure new fields are added
    await client.updateEntity(entity, needsUpdate ? 'Replace' : 'Merge');
    
    return entity;
  } catch (error: any) {
    if (error.statusCode === 404) {
      // Create new user stats
      const newStats: UserStatsEntity = {
        partitionKey: 'users',
        rowKey: userId,
        userId,
        email,
        displayName,
        createdAt: new Date(),
        lastActive: new Date(),
        
        // Daily stats
        dailyStreak: 0,
        longestStreak: 0,
        lastDailyPlayed: '',
        dailyWinRate: 0,
        totalDailyPlayed: 0,
        totalDailyWins: 0,
        averageDailyAttempts: 0,
        
        // Level stats
        totalLevelsAttempted: 0,
        totalLevelsSolved: 0,
        levelSolveRate: 0,
        averageLevelAttempts: 0,
        totalLevelAttempts: 0,
        
        // Per-difficulty
        easySolved: 0,
        easyAttempted: 0,
        easyTotalAttempts: 0,
        easyFastestTime: undefined,
        mediumSolved: 0,
        mediumAttempted: 0,
        mediumTotalAttempts: 0,
        mediumFastestTime: undefined,
        hardSolved: 0,
        hardAttempted: 0,
        hardTotalAttempts: 0,
        hardFastestTime: undefined,
        insaneSolved: 0,
        insaneAttempted: 0,
        insaneTotalAttempts: 0,
        insaneFastestTime: undefined,
      };
      
      await client.createEntity(newStats);
      return newStats;
    }
    throw error;
  }
}

/**
 * Update daily challenge stats after an attempt
 */
export async function updateDailyStats(
  userId: string,
  date: string,
  attempts: number,
  solved: boolean,
  solveTime?: number
): Promise<void> {
  // Record the attempt
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  if (!connectionString) {
    throw new Error('AZURE_STORAGE_CONNECTION_STRING is not set');
  }
  
  const attemptsClient = TableClient.fromConnectionString(connectionString, 'DailyAttempts');

  const attemptEntity: DailyAttemptEntity = {
    partitionKey: 'daily-attempts',
    rowKey: `${userId}-${date}`,
    userId,
    date,
    attempts,
    solved,
    solveTime,
    timestamp: new Date(),
  };

  await attemptsClient.upsertEntity(attemptEntity, 'Replace');

  // Update user stats
  const statsClient = getStatsTableClient();
  const stats = await statsClient.getEntity<UserStatsEntity>('users', userId);

  // Check if this is a new daily play
  const isNewDaily = stats.lastDailyPlayed !== date;

  if (isNewDaily) {
    stats.totalDailyPlayed++;
    
    // Update streak
    const lastDate = new Date(stats.lastDailyPlayed || '2000-01-01');
    const currentDate = new Date(date);
    const daysDiff = Math.floor((currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff === 1) {
      // Consecutive day
      stats.dailyStreak++;
    } else if (daysDiff > 1) {
      // Streak broken
      stats.dailyStreak = 1;
    }
    // If same day (daysDiff === 0), keep streak as is

    stats.longestStreak = Math.max(stats.longestStreak, stats.dailyStreak);
    stats.lastDailyPlayed = date;
  }

  if (solved) {
    stats.totalDailyWins++;
  }

  // Calculate win rate
  stats.dailyWinRate = stats.totalDailyPlayed > 0 
    ? (stats.totalDailyWins / stats.totalDailyPlayed) * 100 
    : 0;

  // Update average attempts (cumulative moving average)
  const totalAttempts = (stats.averageDailyAttempts * (stats.totalDailyPlayed - 1)) + attempts;
  stats.averageDailyAttempts = totalAttempts / stats.totalDailyPlayed;

  await statsClient.updateEntity(stats, 'Replace');
}

/**
 * Update level stats after an attempt
 */
export async function updateLevelStats(
  userId: string,
  difficulty: 'easy' | 'medium' | 'hard' | 'insane',
  level: number,
  attempts: number,
  solved: boolean,
  solveTime?: number
): Promise<void> {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  if (!connectionString) {
    throw new Error('AZURE_STORAGE_CONNECTION_STRING is not set');
  }

  // Record the level attempt
  const attemptsClient = TableClient.fromConnectionString(connectionString, 'LevelAttempts');

  const rowKey = `${userId}-${difficulty}-${level}`;
  let levelAttempt: LevelAttemptEntity;
  let isNewLevel = false;
  let wasAlreadySolved = false;

  try {
    levelAttempt = await attemptsClient.getEntity<LevelAttemptEntity>('level-attempts', rowKey);
    
    // Existing level - track if it was already solved
    wasAlreadySolved = levelAttempt.solved;
    
    // Update existing attempt
    levelAttempt.attempts = attempts;
    levelAttempt.lastAttemptDate = new Date();
    
    if (solved && !levelAttempt.solved) {
      // First time solving
      levelAttempt.solved = true;
      levelAttempt.solvedDate = new Date();
    }
    
    if (solveTime && (!levelAttempt.bestTime || solveTime < levelAttempt.bestTime)) {
      levelAttempt.bestTime = solveTime;
    }
    
    await attemptsClient.updateEntity(levelAttempt, 'Replace');
  } catch (error: any) {
    if (error.statusCode === 404) {
      // Create new level attempt
      isNewLevel = true;
      levelAttempt = {
        partitionKey: 'level-attempts',
        rowKey,
        userId,
        difficulty,
        level,
        attempts,
        solved,
        bestTime: solveTime,
        firstAttemptDate: new Date(),
        lastAttemptDate: new Date(),
        solvedDate: solved ? new Date() : undefined,
      };
      
      await attemptsClient.createEntity(levelAttempt);
    } else {
      throw error;
    }
  }

  // Update user stats
  const statsClient = getStatsTableClient();
  const stats = await statsClient.getEntity<UserStatsEntity>('users', userId);

  // Update difficulty-specific stats
  const difficultyAttemptedKey = `${difficulty}Attempted` as keyof UserStatsEntity;
  const difficultySolvedKey = `${difficulty}Solved` as keyof UserStatsEntity;
  
  if (typeof stats[difficultyAttemptedKey] === 'number') {
    const previousAttempted = stats[difficultyAttemptedKey] as number;
    const previousSolved = stats[difficultySolvedKey] as number;
    
    // Only increment attempted count if this is a new level
    if (isNewLevel) {
      (stats as any)[difficultyAttemptedKey] = previousAttempted + 1;
      stats.totalLevelsAttempted++;
    }
    
    // Only increment solved count if this is the first time solving
    if (solved && !wasAlreadySolved) {
      (stats as any)[difficultySolvedKey] = previousSolved + 1;
      stats.totalLevelsSolved++;
    }
  }

  // Calculate solve rate as percentage of all 400 available levels (100 per difficulty)
  const totalAvailableLevels = 400;
  stats.levelSolveRate = (stats.totalLevelsSolved / totalAvailableLevels) * 100;

  // Update total attempts
  stats.totalLevelAttempts += attempts;

  // Calculate average attempts
  stats.averageLevelAttempts = stats.totalLevelsAttempted > 0
    ? stats.totalLevelAttempts / stats.totalLevelsAttempted
    : 0;

  // Update difficulty-specific total attempts
  const difficultyTotalAttemptsKey = `${difficulty}TotalAttempts` as keyof UserStatsEntity;
  if (typeof stats[difficultyTotalAttemptsKey] === 'number') {
    (stats as any)[difficultyTotalAttemptsKey] = (stats[difficultyTotalAttemptsKey] as number) + attempts;
  }

  // Update difficulty-specific fastest solve time (based on the level's best time when solved)
  if (solved && levelAttempt.bestTime) {
    const difficultyFastestKey = `${difficulty}FastestTime` as keyof UserStatsEntity;
    const currentFastest = stats[difficultyFastestKey] as number | undefined;
    if (!currentFastest || levelAttempt.bestTime < currentFastest) {
      (stats as any)[difficultyFastestKey] = levelAttempt.bestTime;
    }
  }

  await statsClient.updateEntity(stats, 'Replace');
}

/**
 * Get user's level progress for a specific difficulty
 */
export async function getUserLevelProgress(
  userId: string,
  difficulty: 'easy' | 'medium' | 'hard' | 'insane'
): Promise<LevelAttemptEntity[]> {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  if (!connectionString) {
    throw new Error('AZURE_STORAGE_CONNECTION_STRING is not set');
  }

  // Validate inputs to prevent injection
  const validDifficulties = ['easy', 'medium', 'hard', 'insane'];
  if (!validDifficulties.includes(difficulty)) {
    throw new Error('Invalid difficulty level');
  }
  
  // Sanitize userId (Azure Table Storage row keys can contain alphanumeric, hyphen, underscore)
  if (!/^[a-zA-Z0-9_-]+$/.test(userId)) {
    throw new Error('Invalid userId format');
  }

  const client = TableClient.fromConnectionString(connectionString, 'LevelAttempts');

  // Use safe filter construction - escape single quotes in userId
  const escapedUserId = userId.replace(/'/g, "''");
  const entities = client.listEntities<LevelAttemptEntity>({
    queryOptions: {
      filter: `PartitionKey eq 'level-attempts' and userId eq '${escapedUserId}' and difficulty eq '${difficulty}'`,
    },
  });

  const progress: LevelAttemptEntity[] = [];
  for await (const entity of entities) {
    progress.push(entity);
  }

  return progress;
}
