import { TableClient, AzureNamedKeyCredential } from '@azure/data-tables';

interface DailyChallengeEntity {
  partitionKey: string; // 'challenges'
  rowKey: string; // date (YYYY-MM-DD)
  date: string;
  seed: string;
  colorData: string; // JSON stringified array of colors
  colorTokens: string; // JSON stringified array of encrypted tokens
  maxAttempts: number;
  timestamp?: Date;
}

let tableClient: TableClient | null = null;

/**
 * Initialize the table client
 */
export function getTableClient(): TableClient {
  if (tableClient) {
    return tableClient;
  }

  const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME || 'rgbpuzzstore';
  const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY || '';
  const tableName = 'DailyChallenges';

  if (!accountKey) {
    throw new Error('AZURE_STORAGE_ACCOUNT_KEY is not set');
  }

  const credential = new AzureNamedKeyCredential(accountName, accountKey);
  tableClient = new TableClient(
    `https://${accountName}.table.core.windows.net`,
    tableName,
    credential
  );

  return tableClient;
}

/**
 * Save a daily challenge to the database
 */
export async function saveDailyChallenge(
  date: string,
  seed: string,
  colors: Array<{ r: number; g: number; b: number }>,
  colorTokens: Array<{ id: string; encrypted: string }>,
  maxAttempts: number
): Promise<void> {
  const client = getTableClient();

  const entity: DailyChallengeEntity = {
    partitionKey: 'challenges',
    rowKey: date,
    date,
    seed,
    colorData: JSON.stringify(colors),
    colorTokens: JSON.stringify(colorTokens),
    maxAttempts,
  };

  try {
    await client.upsertEntity(entity, 'Replace');
  } catch (error) {
    console.error('Error saving daily challenge:', error);
    throw error;
  }
}

/**
 * Get a daily challenge from the database
 */
export async function getDailyChallenge(date: string): Promise<{
  date: string;
  seed: string;
  colors: Array<{ r: number; g: number; b: number }>;
  colorTokens: Array<{ id: string; encrypted: string }>;
  maxAttempts: number;
} | null> {
  const client = getTableClient();

  try {
    const entity = await client.getEntity<DailyChallengeEntity>('challenges', date);
    
    return {
      date: entity.date,
      seed: entity.seed,
      colors: JSON.parse(entity.colorData),
      colorTokens: JSON.parse(entity.colorTokens),
      maxAttempts: entity.maxAttempts,
    };
  } catch (error: any) {
    if (error.statusCode === 404) {
      return null;
    }
    console.error('Error getting daily challenge:', error);
    throw error;
  }
}

/**
 * Get all daily challenges (for premium features)
 */
export async function getAllDailyChallenges(): Promise<Array<{
  date: string;
  seed: string;
  colors: Array<{ r: number; g: number; b: number }>;
  colorTokens: Array<{ id: string; encrypted: string }>;
  maxAttempts: number;
}>> {
  const client = getTableClient();

  try {
    const challenges = [];
    const entities = client.listEntities<DailyChallengeEntity>({
      queryOptions: { filter: "PartitionKey eq 'challenges'" }
    });

    for await (const entity of entities) {
      challenges.push({
        date: entity.date,
        seed: entity.seed,
        colors: JSON.parse(entity.colorData),
        colorTokens: JSON.parse(entity.colorTokens),
        maxAttempts: entity.maxAttempts,
      });
    }

    // Sort by date descending (newest first)
    return challenges.sort((a, b) => b.date.localeCompare(a.date));
  } catch (error) {
    console.error('Error getting all daily challenges:', error);
    throw error;
  }
}

/**
 * Initialize the table (create if not exists)
 */
export async function initializeTable(): Promise<void> {
  const client = getTableClient();
  try {
    await client.createTable();
  } catch (error: any) {
    // Ignore error if table already exists
    if (error.statusCode !== 409) {
      console.error('Error creating table:', error);
      throw error;
    }
  }
}
