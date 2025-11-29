import { createHash, randomBytes } from 'crypto';
import { DIFFICULTY_CONFIG } from '../constants';

interface RGBColor {
  r: number;
  g: number;
  b: number;
}

/**
 * Generate a deterministic seed from a date string
 */
export function generateDailySeed(date: string, salt: string): string {
  return createHash('sha256')
    .update(`${date}:${salt}`)
    .digest('hex');
}

/**
 * Generate RGB colors from a seed (deterministic)
 */
export function generateColorsFromSeed(seed: string, count: number): RGBColor[] {
  const colors: RGBColor[] = [];
  const seedBuffer = Buffer.from(seed, 'hex');
  
  for (let i = 0; i < count; i++) {
    const hash = createHash('sha256')
      .update(seedBuffer)
      .update(Buffer.from([i]))
      .digest();
    
    // Shift values away from 0-9 (too dark) and 246-255 (too light)
    colors.push({
      r: 10 + (hash[0] % 236),
      g: 10 + (hash[1] % 236),
      b: 10 + (hash[2] % 236),
    });
  }
  
  return colors;
}

/**
 * Create a hash token for a color (hides RGB values from client)
 */
export function createColorToken(color: RGBColor, index: number, salt: string): string {
  return createHash('sha256')
    .update(`${color.r}:${color.g}:${color.b}:${index}:${salt}`)
    .digest('hex')
    .substring(0, 16);
}

/**
 * Encrypt hex color using XOR cipher with a key derived from the token
 * Returns base64 encoded encrypted value
 */
export function encryptHex(hex: string, token: string): string {
  // Create a key from the token
  const key = createHash('md5').update(token).digest();
  const hexBytes = Buffer.from(hex.replace('#', ''), 'hex');
  
  // XOR each byte with the key
  const encrypted = Buffer.alloc(hexBytes.length);
  for (let i = 0; i < hexBytes.length; i++) {
    encrypted[i] = hexBytes[i] ^ key[i % key.length];
  }
  
  return encrypted.toString('base64');
}

/**
 * Sort colors by RGB value
 */
export function rgbToValue(color: RGBColor): number {
  return color.r * 65536 + color.g * 256 + color.b;
}

/**
 * Deterministic shuffle using a seed
 */
export function deterministicShuffle<T>(array: T[], seed: string): T[] {
  const shuffled = [...array];
  const seedHash = createHash('sha256').update(seed).digest();
  
  // Fisher-Yates shuffle with deterministic random values from seed
  for (let i = shuffled.length - 1; i > 0; i--) {
    // Use hash bytes to generate deterministic "random" index
    const randomByte = seedHash[i % seedHash.length];
    const j = Math.floor((randomByte / 255) * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
}

/**
 * Generate random colors (for level mode)
 */
export function generateRandomColors(count: number, theme?: 'reds' | 'greens' | 'blues'): RGBColor[] {
  const colors: RGBColor[] = [];
  
  for (let i = 0; i < count; i++) {
    const r = theme === 'reds' ? 150 + Math.floor(Math.random() * 105) : Math.floor(Math.random() * 256);
    const g = theme === 'greens' ? 150 + Math.floor(Math.random() * 105) : Math.floor(Math.random() * 256);
    const b = theme === 'blues' ? 150 + Math.floor(Math.random() * 105) : Math.floor(Math.random() * 256);
    
    colors.push({ r, g, b });
  }
  
  return colors;
}

/**
 * Generate evenly spaced colors for level mode
 * Uses DIFFICULTY_CONFIG for color counts
 * @param level - Level number from 1-100, determines spacing between colors
 */
export function generateLevelColors(difficulty: 'easy' | 'medium' | 'hard' | 'insane', level: number): RGBColor[] {
  const count = DIFFICULTY_CONFIG[difficulty].colorCount;
  
  // Calculate the range based on level (1-100)
  // Level 1: max spacing, Level 100: min spacing
  // Start with full RGB range (0-16777215) and narrow down to minimum spacing
  const minSpacingPerColor = 1000; // Minimum RGB value difference at level 100
  const maxRange = 16777215; // Max RGB value (255 * 65536 + 255 * 256 + 255)
  const minRange = minSpacingPerColor * (count - 1);
  
  // Linear interpolation from max to min range based on level
  const range = maxRange - ((maxRange - minRange) * ((level - 1) / 99));
  const spacing = range / (count - 1);
  
  // Use level as seed for deterministic start position
  const seed = createHash('md5').update(`level-${difficulty}-${level}`).digest();
  const startValue = range < maxRange ? (seed[0] * 256 + seed[1]) % (maxRange - range) : 0;
  
  const colors: RGBColor[] = [];
  for (let i = 0; i < count; i++) {
    const rgbValue = Math.floor(startValue + (spacing * i));
    // Shift values to 10-245 range to avoid background colors
    colors.push({
      r: 10 + (Math.floor(rgbValue / 65536) % 236),
      g: 10 + (Math.floor(rgbValue / 256) % 236),
      b: 10 + (rgbValue % 236)
    });
  }
  
  return colors;
}
