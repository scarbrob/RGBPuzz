import { describe, it, expect, afterEach } from 'vitest';
import {
  getAllowedOrigins,
  isOriginAllowed,
  resolveAllowOrigin,
  buildCorsHeaders,
  addCorsHeaders,
  handleCorsPreflightOptions,
} from '../src/middleware/cors';

const LIVE = 'http://localhost:3000,https://www.rgbpuzz.com,https://rgbpuzz.com,https://white-pebble-06934e70f.3.azurestaticapps.net,https://portal.azure.com';

function withOrigins(value: string | undefined, fn: () => void) {
  const prev = process.env.ALLOWED_ORIGINS;
  if (value === undefined) delete process.env.ALLOWED_ORIGINS;
  else process.env.ALLOWED_ORIGINS = value;
  try {
    fn();
  } finally {
    if (prev === undefined) delete process.env.ALLOWED_ORIGINS;
    else process.env.ALLOWED_ORIGINS = prev;
  }
}

afterEach(() => {
  delete process.env.ALLOWED_ORIGINS;
});

describe('getAllowedOrigins', () => {
  it('splits the live comma-separated list', () => {
    withOrigins(LIVE, () => {
      expect(getAllowedOrigins()).toEqual([
        'http://localhost:3000',
        'https://www.rgbpuzz.com',
        'https://rgbpuzz.com',
        'https://white-pebble-06934e70f.3.azurestaticapps.net',
        'https://portal.azure.com',
      ]);
    });
  });

  it('tolerates whitespace and trailing commas', () => {
    withOrigins(' https://a.com , https://b.com ,', () => {
      expect(getAllowedOrigins()).toEqual(['https://a.com', 'https://b.com']);
    });
  });

  it('falls back to the canonical origin when unset or empty', () => {
    withOrigins(undefined, () => {
      expect(getAllowedOrigins()).toEqual(['https://rgbpuzz.com']);
    });
    withOrigins('  ,, ', () => {
      expect(getAllowedOrigins()).toEqual(['https://rgbpuzz.com']);
    });
  });
});

describe('the single-origin invariant', () => {
  // The bug this suite exists for: the old implementation emitted the whole
  // joined allowlist as one Access-Control-Allow-Origin value, which is invalid
  // and matches no origin in any browser.
  it('never emits a comma-joined allow-origin header', () => {
    withOrigins(LIVE, () => {
      for (const origin of [
        'https://rgbpuzz.com',
        'https://www.rgbpuzz.com',
        'http://localhost:3000',
        null,
        undefined,
      ]) {
        const value = buildCorsHeaders(origin)['Access-Control-Allow-Origin'];
        expect(value ?? '', String(origin)).not.toContain(',');
      }
    });
  });

  it('echoes back each allowed origin verbatim', () => {
    withOrigins(LIVE, () => {
      for (const origin of getAllowedOrigins()) {
        expect(resolveAllowOrigin(origin), origin).toBe(origin);
      }
    });
  });
});

describe('isOriginAllowed', () => {
  it('accepts every live origin', () => {
    withOrigins(LIVE, () => {
      for (const origin of getAllowedOrigins()) {
        expect(isOriginAllowed(origin), origin).toBe(true);
      }
    });
  });

  it('rejects unknown origins', () => {
    withOrigins(LIVE, () => {
      for (const origin of ['https://evil.example.com', 'https://rgbpuzz.com.evil.com', 'http://rgbpuzz.com']) {
        expect(isOriginAllowed(origin), origin).toBe(false);
      }
    });
  });

  it('rejects a missing origin', () => {
    withOrigins(LIVE, () => {
      expect(isOriginAllowed(null)).toBe(false);
      expect(isOriginAllowed(undefined)).toBe(false);
      expect(isOriginAllowed('')).toBe(false);
    });
  });

  it('honours a wildcard allowlist', () => {
    withOrigins('*', () => {
      expect(isOriginAllowed('https://anything.example.com')).toBe(true);
      expect(resolveAllowOrigin('https://anything.example.com')).toBe('*');
    });
  });

  it('matches wildcard subdomains only on a dot boundary', () => {
    // `*.rgbpuzz.com` must not also match `evil-rgbpuzz.com`.
    withOrigins('*.rgbpuzz.com', () => {
      expect(isOriginAllowed('https://www.rgbpuzz.com')).toBe(true);
      expect(isOriginAllowed('https://evil-rgbpuzz.com')).toBe(false);
    });
  });
});

describe('resolveAllowOrigin', () => {
  it('omits the header for a disallowed origin', () => {
    withOrigins(LIVE, () => {
      expect(resolveAllowOrigin('https://evil.example.com')).toBeUndefined();
      expect(buildCorsHeaders('https://evil.example.com')).not.toHaveProperty(
        'Access-Control-Allow-Origin',
      );
    });
  });

  it('advertises the canonical origin when no Origin header is sent', () => {
    withOrigins(LIVE, () => {
      expect(resolveAllowOrigin(null)).toBe('http://localhost:3000');
    });
    withOrigins('https://rgbpuzz.com,https://www.rgbpuzz.com', () => {
      expect(resolveAllowOrigin(null)).toBe('https://rgbpuzz.com');
    });
  });
});

describe('buildCorsHeaders', () => {
  it('sets Vary: Origin so caches do not cross-serve responses', () => {
    withOrigins(LIVE, () => {
      expect(buildCorsHeaders('https://rgbpuzz.com').Vary).toBe('Origin');
    });
  });

  it('always carries methods and headers', () => {
    withOrigins(LIVE, () => {
      const h = buildCorsHeaders('https://rgbpuzz.com');
      expect(h['Access-Control-Allow-Methods']).toContain('POST');
      expect(h['Access-Control-Allow-Headers']).toContain('Content-Type');
    });
  });
});

describe('addCorsHeaders', () => {
  it('merges onto the response without clobbering its own headers', () => {
    withOrigins(LIVE, () => {
      const res = addCorsHeaders('https://www.rgbpuzz.com', {
        status: 429,
        headers: { 'Retry-After': '30' },
        jsonBody: { error: 'slow down' },
      });
      expect(res.status).toBe(429);
      expect(res.headers['Retry-After']).toBe('30');
      expect(res.headers['Access-Control-Allow-Origin']).toBe('https://www.rgbpuzz.com');
      expect(res.jsonBody).toEqual({ error: 'slow down' });
    });
  });

  it('drops the allow-origin header for a disallowed caller', () => {
    withOrigins(LIVE, () => {
      const res = addCorsHeaders('https://evil.example.com', { status: 200, jsonBody: {} });
      expect(res.headers).not.toHaveProperty('Access-Control-Allow-Origin');
    });
  });
});

describe('handleCorsPreflightOptions', () => {
  it('returns 204 with the caller-specific origin', () => {
    withOrigins(LIVE, () => {
      const res = handleCorsPreflightOptions('https://www.rgbpuzz.com');
      expect(res.status).toBe(204);
      expect(res.headers['Access-Control-Allow-Origin']).toBe('https://www.rgbpuzz.com');
      expect(res.headers['Access-Control-Max-Age']).toBe('86400');
    });
  });

  it('omits the origin header when the preflight caller is not allowed', () => {
    withOrigins(LIVE, () => {
      const res = handleCorsPreflightOptions('https://evil.example.com');
      expect(res.status).toBe(204);
      expect(res.headers).not.toHaveProperty('Access-Control-Allow-Origin');
    });
  });
});
