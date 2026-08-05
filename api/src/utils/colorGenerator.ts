import { createHash } from 'crypto';
import { DIFFICULTY_CONFIG, SPECTRUM_DIFFICULTY_CONFIG } from '../../../shared/src/constants';
import { RGBColor } from '../../../shared/src/types';

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
    
    // Map hash bytes to 10-245 range without modulo bias
    // hash[n] is 0-255, we want 10-245 (236 values)
    // Use: Math.floor(hash[n] / 256 * 236) + 10
    colors.push({
      r: Math.floor(hash[0] / 256 * 236) + 10,
      g: Math.floor(hash[1] / 256 * 236) + 10,
      b: Math.floor(hash[2] / 256 * 236) + 10,
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
  
  // Fisher-Yates shuffle with deterministic random values
  // Generate enough bytes by hashing seed + iteration index
  for (let i = shuffled.length - 1; i > 0; i--) {
    // Unique hash per iteration to avoid byte reuse and reduce bias
    const iterHash = createHash('sha256').update(`${seed}:shuffle:${i}`).digest();
    // Use 4 bytes for a 32-bit value to minimize modulo bias
    const rand = (iterHash[0] << 24 | iterHash[1] << 16 | iterHash[2] << 8 | iterHash[3]) >>> 0;
    const j = rand % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
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
    const rgbValue = Math.min(Math.floor(startValue + (spacing * i)), maxRange);
    // Extract raw RGB components (no modulo wrap - clamp to valid range)
    colors.push({
      r: Math.min(Math.max(Math.floor(rgbValue / 65536), 0), 255),
      g: Math.min(Math.max(Math.floor((rgbValue % 65536) / 256), 0), 255),
      b: Math.min(Math.max(rgbValue % 256, 0), 255),
    });
  }
  
  // Verify no two colors share the same hex (safety net)
  const hexSet = new Set(colors.map(c => `${c.r},${c.g},${c.b}`));
  if (hexSet.size < colors.length) {
    // Nudge duplicates by tweaking the blue channel
    const seen = new Set<string>();
    for (const color of colors) {
      let key = `${color.r},${color.g},${color.b}`;
      while (seen.has(key)) {
        color.b = Math.min(color.b + 1, 255);
        key = `${color.r},${color.g},${color.b}`;
      }
      seen.add(key);
    }
  }
  
  return colors;
}

// ==================== SPECTRUM MODE ====================

/**
 * Convert RGB to HSL
 * Returns { h: 0-360, s: 0-100, l: 0-100 }
 */
export function rgbToHsl(color: RGBColor): { h: number; s: number; l: number } {
  const r = color.r / 255;
  const g = color.g / 255;
  const b = color.b / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  
  if (max === min) {
    return { h: 0, s: 0, l: l * 100 };
  }
  
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  
  let h: number;
  switch (max) {
    case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
    case g: h = ((b - r) / d + 2) / 6; break;
    default: h = ((r - g) / d + 4) / 6; break;
  }
  
  return { h: h * 360, s: s * 100, l: l * 100 };
}

/**
 * Convert HSL to RGB
 */
export function hslToRgb(h: number, s: number, l: number): RGBColor {
  h = h / 360;
  s = s / 100;
  l = l / 100;
  
  if (s === 0) {
    const v = Math.round(l * 255);
    return { r: v, g: v, b: v };
  }
  
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };
  
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  
  return {
    r: Math.round(hue2rgb(p, q, h + 1/3) * 255),
    g: Math.round(hue2rgb(p, q, h) * 255),
    b: Math.round(hue2rgb(p, q, h - 1/3) * 255),
  };
}

/**
 * Get hue sort value for a color.
 * Primary sort: hue (0-360). Tiebreaker: lightness.
 */
export function hueToValue(color: RGBColor): number {
  const hsl = rgbToHsl(color);
  return hsl.h * 1000 + hsl.l;
}

/**
 * Generate spectrum level colors - evenly spaced hues with controlled saturation/lightness.
 */
export function generateSpectrumLevelColors(difficulty: 'easy' | 'medium' | 'hard' | 'insane', level: number): RGBColor[] {
  const count = SPECTRUM_DIFFICULTY_CONFIG[difficulty].colorCount;
  
  const minArcPerColor = 3;
  const maxArc = 330;
  const minArc = minArcPerColor * (count - 1);
  
  const arc = maxArc - ((maxArc - minArc) * ((level - 1) / 99));
  const spacing = arc / (count - 1);
  
  const seed = createHash('md5').update(`spectrum-${difficulty}-${level}`).digest();
  const startHue = (seed[0] * 256 + seed[1]) % 360;
  
  const baseSaturation = 70 + (seed[2] % 20);
  const baseLightness = 45 + (seed[3] % 15);
  
  const colors: RGBColor[] = [];
  for (let i = 0; i < count; i++) {
    const hue = (startHue + spacing * i) % 360;
    const satVar = ((seed[4 + i] || seed[i]) % 10) - 5;
    const litVar = ((seed[8 + i] || seed[i + 2]) % 6) - 3;
    const sat = Math.min(Math.max(baseSaturation + satVar, 50), 95);
    const lit = Math.min(Math.max(baseLightness + litVar, 30), 65);
    
    colors.push(hslToRgb(hue, sat, lit));
  }
  
  // Deduplicate
  const seen = new Set<string>();
  for (const color of colors) {
    let key = `${color.r},${color.g},${color.b}`;
    while (seen.has(key)) {
      color.b = Math.min(color.b + 1, 255);
      key = `${color.r},${color.g},${color.b}`;
    }
    seen.add(key);
  }
  
  return colors;
}

/**
 * Generate colors for spectrum daily challenge.
 * Colors are clustered within a narrow hue arc (e.g. 60°) so sorting
 * isn't trivially obvious like red/green/blue would be.
 */
export function generateSpectrumDailyColors(seed: string, count: number, hueArc: number): RGBColor[] {
  const seedBuffer = Buffer.from(seed, 'hex');
  
  // Deterministic start hue from seed
  const startHash = createHash('sha256').update(seedBuffer).update(Buffer.from('hue-start')).digest();
  const startHue = ((startHash[0] * 256 + startHash[1]) % 360);
  
  // Saturation and lightness from seed - vivid but varied
  const baseSat = 65 + (startHash[2] % 25);   // 65-89%
  const baseLit = 45 + (startHash[3] % 15);   // 45-59%
  
  const spacing = hueArc / (count - 1);
  
  const colors: RGBColor[] = [];
  for (let i = 0; i < count; i++) {
    const hash = createHash('sha256')
      .update(seedBuffer)
      .update(Buffer.from([i + 100])) // offset to avoid collision with RGB daily
      .digest();
    
    const hue = (startHue + spacing * i) % 360;
    // Per-color variation in sat/lit for realism
    const satVar = (hash[0] % 12) - 6;  // ±6%
    const litVar = (hash[1] % 8) - 4;   // ±4%
    const sat = Math.min(Math.max(baseSat + satVar, 50), 95);
    const lit = Math.min(Math.max(baseLit + litVar, 30), 65);
    
    colors.push(hslToRgb(hue, sat, lit));
  }
  
  // Deduplicate
  const seen = new Set<string>();
  for (const color of colors) {
    let key = `${color.r},${color.g},${color.b}`;
    while (seen.has(key)) {
      color.b = Math.min(color.b + 1, 255);
      key = `${color.r},${color.g},${color.b}`;
    }
    seen.add(key);
  }
  
  return colors;
}
