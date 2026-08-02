import { createHash } from 'node:crypto';

export interface RGBColor {
  r: number;
  g: number;
  b: number;
}

/**
 * Mirrors the server's token + XOR-encryption scheme
 * (api/src/utils/colorGenerator.ts) so E2E tests can build realistic API
 * fixtures without hitting the real API.
 */
export function createColorToken(color: RGBColor, index: number, salt: string): string {
  return createHash('sha256')
    .update(`${color.r}:${color.g}:${color.b}:${index}:${salt}`)
    .digest('hex')
    .substring(0, 16);
}

export function encryptHex(hex: string, token: string): string {
  const key = createHash('md5').update(token).digest();
  const hexBytes = Buffer.from(hex.replace('#', ''), 'hex');
  const encrypted = Buffer.alloc(hexBytes.length);
  for (let i = 0; i < hexBytes.length; i++) {
    encrypted[i] = hexBytes[i] ^ key[i % key.length];
  }
  return encrypted.toString('base64');
}

export function toHex(c: RGBColor): string {
  const p = (v: number) => v.toString(16).padStart(2, '0');
  return `#${p(c.r)}${p(c.g)}${p(c.b)}`;
}

export function rgbToValue(c: RGBColor): number {
  return c.r * 65536 + c.g * 256 + c.b;
}

/** Mirrors the server's hue sort used by spectrum modes. */
export function rgbToHsl(color: RGBColor): { h: number; s: number; l: number } {
  const r = color.r / 255;
  const g = color.g / 255;
  const b = color.b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) return { h: 0, s: 0, l: l * 100 };

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  switch (max) {
    case r:
      h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
      break;
    case g:
      h = ((b - r) / d + 2) / 6;
      break;
    default:
      h = ((r - g) / d + 4) / 6;
      break;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

export function hueToValue(c: RGBColor): number {
  const hsl = rgbToHsl(c);
  return hsl.h * 1000 + hsl.l;
}

export interface Fixture {
  colors: RGBColor[];
  /** Tokens in the shuffled order the API returns them. */
  colorTokens: { id: string; encrypted: string }[];
  /** Token ids in correct sorted order — the winning answer. */
  solution: string[];
  maxAttempts: number;
}

interface BuildOptions {
  colors?: RGBColor[];
  salt?: string;
  maxAttempts?: number;
  /** 'rgb' sorts by packed RGB value, 'hue' sorts by HSL hue. */
  sortBy?: 'rgb' | 'hue';
}

/** Deliberately unsorted so the board never starts already solved. */
const RGB_COLORS: RGBColor[] = [
  { r: 200, g: 30, b: 40 },
  { r: 20, g: 60, b: 90 },
  { r: 120, g: 200, b: 10 },
  { r: 60, g: 10, b: 220 },
  { r: 240, g: 240, b: 30 },
];

/** Distinct hues so the hue ordering is unambiguous. */
const HUE_COLORS: RGBColor[] = [
  { r: 220, g: 60, b: 60 }, // ~0deg
  { r: 220, g: 200, b: 60 }, // ~58deg
  { r: 60, g: 200, b: 90 }, // ~143deg
  { r: 60, g: 150, b: 220 }, // ~206deg
  { r: 170, g: 70, b: 210 }, // ~283deg
];

function build(opts: BuildOptions = {}): Fixture {
  const {
    colors = RGB_COLORS,
    salt = 'e2e-salt',
    maxAttempts = 5,
    sortBy = 'rgb',
  } = opts;

  const withMeta = colors.map((color, index) => {
    const id = createColorToken(color, index, salt);
    return { color, index, id, encrypted: encryptHex(toHex(color), id) };
  });

  // Rotate into a presentation order that is definitely not sorted.
  const presented = [2, 0, 4, 1, 3].map((i) => withMeta[i % withMeta.length]);

  const sortFn = sortBy === 'hue' ? hueToValue : rgbToValue;
  const solution = [...withMeta]
    .sort((a, b) => sortFn(a.color) - sortFn(b.color))
    .map((c) => c.id);

  return {
    colors,
    colorTokens: presented.map((c) => ({ id: c.id, encrypted: c.encrypted })),
    solution,
    maxAttempts,
  };
}

/** Daily challenge (RGB value sort, 5 attempts). */
export function buildDailyFixture(salt = 'e2e-salt', maxAttempts = 5): Fixture {
  return build({ salt, maxAttempts, sortBy: 'rgb' });
}

/** Level mode (RGB value sort). Easy difficulty allows 10 attempts. */
export function buildLevelFixture(maxAttempts = 10): Fixture {
  return build({ salt: 'e2e-level', maxAttempts, sortBy: 'rgb' });
}

/** Spectrum level / spectrum daily (hue sort). */
export function buildSpectrumFixture(maxAttempts = 10): Fixture {
  return build({ colors: HUE_COLORS, salt: 'e2e-spectrum', maxAttempts, sortBy: 'hue' });
}
