/**
 * CORS configuration for Azure Functions.
 *
 * `ALLOWED_ORIGINS` is a comma-separated allowlist. The critical rule: an
 * `Access-Control-Allow-Origin` header may name exactly ONE origin (or `*`).
 * Emitting the joined list produces a header no browser matches, so every
 * response must echo back the caller's own origin after validating it.
 */

const DEFAULT_ORIGIN = 'https://rgbpuzz.com';

/** Parse the allowlist, tolerating stray whitespace and trailing commas. */
export function getAllowedOrigins(): string[] {
  const raw = process.env.ALLOWED_ORIGINS;
  if (!raw) return [DEFAULT_ORIGIN];

  const parsed = raw
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  return parsed.length > 0 ? parsed : [DEFAULT_ORIGIN];
}

/** Headers that do not depend on the caller. */
const staticCorsHeaders: Record<string, string> = {
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400', // 24 hours
  // Responses differ per Origin, so caches must key on it. Without this a
  // shared cache can serve one origin's ACAO header to a different origin.
  Vary: 'Origin',
};

/**
 * Validate an origin against the allowlist.
 */
export function isOriginAllowed(origin: string | null | undefined): boolean {
  if (!origin) return false;

  const allowedOrigins = getAllowedOrigins();

  if (allowedOrigins.includes('*')) {
    return true;
  }

  return allowedOrigins.some((allowed) => {
    if (allowed === origin) return true;

    // Wildcard subdomain match (e.g. *.example.com). Require a dot boundary so
    // `*.rgbpuzz.com` does not also match `evil-rgbpuzz.com`.
    if (allowed.startsWith('*.')) {
      const domain = allowed.slice(1); // ".example.com"
      return origin.endsWith(domain);
    }

    return false;
  });
}

/**
 * Resolve the `Access-Control-Allow-Origin` value for a caller.
 *
 * Returns `undefined` when the origin is not allowed, so the header is omitted
 * entirely and the browser blocks the response.
 */
export function resolveAllowOrigin(origin?: string | null): string | undefined {
  const allowedOrigins = getAllowedOrigins();

  if (allowedOrigins.includes('*')) return '*';

  // No Origin header: same-origin, curl, or a server-side caller. Nothing to
  // echo, so advertise the canonical site rather than the whole list.
  if (!origin) return allowedOrigins[0];

  return isOriginAllowed(origin) ? origin : undefined;
}

/**
 * Build the full CORS header set for a caller.
 */
export function buildCorsHeaders(origin?: string | null): Record<string, string> {
  const headers: Record<string, string> = { ...staticCorsHeaders };
  const allowOrigin = resolveAllowOrigin(origin);
  if (allowOrigin) {
    headers['Access-Control-Allow-Origin'] = allowOrigin;
  }
  return headers;
}

/**
 * Handle a CORS preflight request.
 */
export function handleCorsPreflightOptions(origin?: string | null) {
  return {
    status: 204,
    headers: buildCorsHeaders(origin),
  };
}

/**
 * Add CORS headers to a response.
 *
 * `origin` is the REQUIRED first parameter, not a trailing optional one. The
 * previous signature made it easy to forget -- only 6 of ~30 call sites passed
 * it, so most responses silently advertised the wrong origin. Putting it first
 * makes an omission a compile error.
 */
export function addCorsHeaders(origin: string | null | undefined, response: any) {
  return {
    ...response,
    headers: {
      ...buildCorsHeaders(origin),
      ...(response.headers || {}),
    },
  };
}
