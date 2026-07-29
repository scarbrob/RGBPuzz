import { createHash } from 'node:crypto';

export interface RGBColor {
  r: number;
  g: number;
  b: number;
}

/**
 * Mirrors the server's token + XOR-encryption scheme (api/src/utils/colorGenerator.ts)
 * so E2E tests can build realistic API fixtures without hitting the real API.
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

export interface Fixture {
  colors: RGBColor[];
  /** Tokens in the shuffled order the API returns them. */
  colorTokens: { id: string; encrypted: string }[];
  /** Token ids in correct (ascending RGB value) order — the winning answer. */
  solution: string[];
  maxAttempts: number;
}

/**
 * Build a deterministic daily-challenge payload with a known solution.
 * Colors are deliberately NOT in sorted order so the board starts unsolved.
 */
export function buildDailyFixture(salt = 'e2e-salt', maxAttempts = 5): Fixture {
  const colors: RGBColor[] = [
    { r: 200, g: 30, b: 40 },
    { r: 20, g: 60, b: 90 },
    { r: 120, g: 200, b: 10 },
    { r: 60, g: 10, b: 220 },
    { r: 240, g: 240, b: 30 },
  ];

  const withMeta = colors.map((color, index) => {
    const id = createColorToken(color, index, salt);
    return { color, index, id, encrypted: encryptHex(toHex(color), id) };
  });

  // Presentation order (shuffled-ish, definitely not sorted)
  const presented = [withMeta[2], withMeta[0], withMeta[4], withMeta[1], withMeta[3]];

  const solution = [...withMeta]
    .sort((a, b) => rgbToValue(a.color) - rgbToValue(b.color))
    .map((c) => c.id);

  return {
    colors,
    colorTokens: presented.map((c) => ({ id: c.id, encrypted: c.encrypted })),
    solution,
    maxAttempts,
  };
}
