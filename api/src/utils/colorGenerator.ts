import { createHash, randomBytes } from 'crypto';

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
    
    colors.push({
      r: hash[0],
      g: hash[1],
      b: hash[2],
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
 * Sort colors by RGB value
 */
export function rgbToValue(color: RGBColor): number {
  return color.r * 65536 + color.g * 256 + color.b;
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
