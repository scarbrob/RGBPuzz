import { TableClient } from '@azure/data-tables';

let tableClient: TableClient | null = null;
let dailyAttemptsClient: TableClient | null = null;
let levelAttemptsClient: TableClient | null = null;

/**
 * Safely create a TableClient with better error handling
 */
function createTableClient(connectionString: string, tableName: string): TableClient {
  try {
    const client = TableClient.fromConnectionString(connectionString, tableName);
    
    if (!client) {
      throw new Error(`TableClient.fromConnectionString returned ${typeof client} for table ${tableName}`);
    }
    
    // Try to access a property to verify the object is valid
    if (typeof client.tableName !== 'string') {
      throw new Error(`TableClient for ${tableName} is invalid - missing tableName property`);
    }
    
    return client;
  } catch (error: any) {
    throw new Error(`Failed to create TableClient for ${tableName}: ${error.message}`);
  }
}

// ==================== ENTITY INTERFACES ====================

export interface UserStatsEntity {
  partitionKey: string; // 'users'
  rowKey: string; // userId
  userId: string;
  email: string;
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
  fastestDailyTime?: number; // milliseconds - best time on any daily challenge
  
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
  solveTime?: number; // milliseconds - accumulated active time on puzzle
  timestamp: Date;
  boardState?: string; // JSON stringified array of color objects
  attemptHistory?: string; // JSON stringified attempt history
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
  boardState?: string; // JSON stringified array of color objects
  attemptHistory?: string; // JSON stringified attempt history
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

  tableClient = createTableClient(connectionString, tableName);

  return tableClient;
}

/**
 * Get daily attempts table client
 */
export function getDailyAttemptsClient(): TableClient {
  if (dailyAttemptsClient) {
    return dailyAttemptsClient;
  }

  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  if (!connectionString) {
    throw new Error('AZURE_STORAGE_CONNECTION_STRING is not set');
  }

  dailyAttemptsClient = createTableClient(connectionString, 'DailyAttempts');
  return dailyAttemptsClient;
}

/**
 * Get level attempts table client
 */
export function getLevelAttemptsClient(): TableClient {
  if (levelAttemptsClient) {
    return levelAttemptsClient;
  }

  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  if (!connectionString) {
    throw new Error('AZURE_STORAGE_CONNECTION_STRING is not set');
  }

  levelAttemptsClient = createTableClient(connectionString, 'LevelAttempts');
  return levelAttemptsClient;
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
    } catch (error: any) {
      if (error.statusCode !== 409) {
        throw error;
      }
    }
  }
}

/**
 * Get or create user stats
 */
export async function getUserStats(userId: string, email: string): Promise<UserStatsEntity> {
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
  solveTime?: number,
  boardState?: any[],
  attemptHistory?: any[]
): Promise<void> {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  if (!connectionString) {
    throw new Error('AZURE_STORAGE_CONNECTION_STRING is not set');
  }
  
  // Record the attempt
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
    boardState: boardState ? JSON.stringify(boardState) : undefined,
    attemptHistory: attemptHistory ? JSON.stringify(attemptHistory) : undefined,
  };

  await attemptsClient.upsertEntity(attemptEntity, 'Replace');

  // Clean up old daily attempts (keep only today's)
  try {
    const oldAttempts = attemptsClient.listEntities<DailyAttemptEntity>({
      queryOptions: {
        filter: `PartitionKey eq 'daily-attempts' and userId eq '${userId.replace(/'/g, "''")}' and date ne '${date}'`,
      },
    });

    for await (const oldAttempt of oldAttempts) {
      await attemptsClient.deleteEntity('daily-attempts', oldAttempt.rowKey);
    }
  } catch (error) {
    // Log but don't fail if cleanup fails
    console.warn('Failed to clean up old daily attempts:', error);
  }

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
    
    // Update fastest daily time if this is faster
    if (solveTime !== undefined) {
      if (!stats.fastestDailyTime || solveTime < stats.fastestDailyTime) {
        stats.fastestDailyTime = solveTime;
      }
    }
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
  solveTime?: number,
  boardState?: any[],
  attemptHistory?: any[]
): Promise<void> {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  if (!connectionString) {
    throw new Error('AZURE_STORAGE_CONNECTION_STRING is not set');
  }

  // Record the level attempt - consolidated per user
  const attemptsClient = TableClient.fromConnectionString(connectionString, 'LevelAttempts');

  const rowKey = userId;
  let userLevels: any;
  let isNewLevel = false;
  let wasAlreadySolved = false;

  try {
    const entity = await attemptsClient.getEntity('level-attempts', rowKey);
    userLevels = entity.levels ? JSON.parse(entity.levels as string) : {};
  } catch (error: any) {
    if (error.statusCode === 404) {
      userLevels = {};
    } else {
      throw error;
    }
  }

  // Track state changes
  const levelKey = `${difficulty}-${level}`;
  const existingLevel = userLevels[levelKey];
  
  if (!existingLevel) {
    isNewLevel = true;
  } else {
    wasAlreadySolved = existingLevel.solved;
  }

  // Update or create level attempt
  userLevels[levelKey] = {
    difficulty,
    level,
    attempts,
    solved: solved || (existingLevel?.solved || false),
    bestTime: solveTime && (!existingLevel?.bestTime || solveTime < existingLevel.bestTime) 
      ? solveTime 
      : existingLevel?.bestTime,
    firstAttemptDate: existingLevel?.firstAttemptDate || new Date().toISOString(),
    lastAttemptDate: new Date().toISOString(),
    solvedDate: solved && !existingLevel?.solved ? new Date().toISOString() : existingLevel?.solvedDate,
    boardState,
    attemptHistory,
  };

  // Save consolidated entity
  await attemptsClient.upsertEntity({
    partitionKey: 'level-attempts',
    rowKey,
    userId,
    levels: JSON.stringify(userLevels),
    lastUpdated: new Date(),
  }, 'Replace');

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
  const currentLevelBestTime = userLevels[levelKey]?.bestTime;
  if (solved && currentLevelBestTime) {
    const difficultyFastestKey = `${difficulty}FastestTime` as keyof UserStatsEntity;
    const currentFastest = stats[difficultyFastestKey] as number | undefined;
    if (!currentFastest || currentLevelBestTime < currentFastest) {
      (stats as any)[difficultyFastestKey] = currentLevelBestTime;
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

  // Validate inputs
  const validDifficulties = ['easy', 'medium', 'hard', 'insane'];
  if (!validDifficulties.includes(difficulty)) {
    throw new Error('Invalid difficulty level');
  }
  
  if (!/^[a-zA-Z0-9._-]+$/.test(userId)) {
    throw new Error('Invalid userId format');
  }

  const client = TableClient.fromConnectionString(connectionString, 'LevelAttempts');

  try {
    const entity = await client.getEntity('level-attempts', userId);
    const userLevels = entity.levels ? JSON.parse(entity.levels as string) : {};
    
    // Filter and convert to array for this difficulty
    const progress: LevelAttemptEntity[] = [];
    for (const [key, levelData] of Object.entries(userLevels)) {
      const level = levelData as any;
      if (level.difficulty === difficulty) {
        progress.push({
          partitionKey: 'level-attempts',
          rowKey: `${userId}-${level.difficulty}-${level.level}`,
          userId,
          difficulty: level.difficulty,
          level: level.level,
          attempts: level.attempts,
          solved: level.solved,
          bestTime: level.bestTime,
          firstAttemptDate: new Date(level.firstAttemptDate),
          lastAttemptDate: new Date(level.lastAttemptDate),
          solvedDate: level.solvedDate ? new Date(level.solvedDate) : undefined,
          boardState: level.boardState ? JSON.stringify(level.boardState) : undefined,
          attemptHistory: level.attemptHistory ? JSON.stringify(level.attemptHistory) : undefined,
        });
      }
    }
    
    return progress;
  } catch (error: any) {
    if (error.statusCode === 404) {
      return [];
    }
    throw error;
  }
}
