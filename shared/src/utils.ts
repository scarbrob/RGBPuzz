import { RGBColor } from './types';

/**
 * Calculate RGB value for sorting (R * 65536 + G * 256 + B)
 */
export function rgbToValue(color: RGBColor): number {
  return color.r * 65536 + color.g * 256 + color.b;
}

/**
 * Convert RGB to hex string for display
 */
export function rgbToHex(color: RGBColor): string {
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`;
}

/**
 * Convert RGB to CSS string
 */
export function rgbToCss(color: RGBColor): string {
  return `rgb(${color.r}, ${color.g}, ${color.b})`;
}

/**
 * Get today's date as ISO string (YYYY-MM-DD)
 */
export function getTodayDateString(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

/**
 * Calculate color distance (for hint system if implemented)
 */
export function colorDistance(c1: RGBColor, c2: RGBColor): number {
  const dr = c1.r - c2.r;
  const dg = c1.g - c2.g;
  const db = c1.b - c2.b;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}
