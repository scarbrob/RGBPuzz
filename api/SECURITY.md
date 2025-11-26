# API Security Documentation

## Overview
The RGBPuzz API has been hardened with comprehensive security measures including input validation, rate limiting, CORS policies, and protection against common web vulnerabilities.

## Security Measures Implemented

### 1. Input Validation (`src/middleware/validation.ts`)
All API inputs are validated before processing:

- **userId**: Alphanumeric/hyphen/underscore only, max 128 chars, regex: `^[a-zA-Z0-9_-]+$`
- **email**: Max 254 chars, basic email format validation
- **difficulty**: Whitelist validation (`easy`, `medium`, `hard`, `insane`)
- **level**: Integer between 1-100
- **date**: YYYY-MM-DD format with Date.parse validation
- **attempts**: Integer between 1-1000
- **solveTime**: Number between 0-3600000ms (1 hour max)
- **tokenIds**: Array of 3-20 items, each 64-char hex string
- **displayName**: Sanitized string, max 100 chars

All validation errors return structured responses with field names and error messages.

### 2. Rate Limiting (`src/middleware/rateLimit.ts`)
Per-endpoint rate limits to prevent API abuse:

| Endpoint | Limit | Window |
|----------|-------|--------|
| validateSolution | 20 requests | 1 minute |
| getUserStats | 60 requests | 1 minute |
| dailyChallenge | 30 requests | 1 minute |
| getLevel | 100 requests | 1 minute |
| updateStats | 30 requests | 1 minute |

**Client Identification**: By `userId` or IP address from `x-forwarded-for` header

**Response Headers**: 
- `Retry-After`: Time until next allowed request
- `X-RateLimit-Limit`: Total requests allowed per window
- `X-RateLimit-Remaining`: Requests remaining in current window
- `X-RateLimit-Reset`: Timestamp when limit resets

**Note**: Current implementation uses in-memory storage. For production scale with multiple instances, use Redis or Azure Cache for Redis.

### 3. CORS Policy (`src/middleware/cors.ts`)
Cross-Origin Resource Sharing configuration:

- **Allowed Origins**: Configurable via `ALLOWED_ORIGINS` environment variable (supports wildcards like `*.example.com`)
- **Allowed Methods**: GET, POST, OPTIONS
- **Allowed Headers**: Content-Type, Authorization
- **Max Age**: 86400 seconds (24 hours)
- **Preflight Support**: OPTIONS requests return 204 with CORS headers

All API responses include appropriate CORS headers.

### 4. SQL Injection Protection
Fixed SQL injection vulnerability in `getUserLevelProgress`:

- Input validation before query construction
- Difficulty whitelist check
- userId format validation with regex
- Single quote escaping: `userId.replace(/'/g, "''")`

### 5. Error Handling
Sanitized error responses:

- No stack traces exposed to clients
- No internal implementation details in error messages
- Generic "Internal server error" for unexpected errors
- Structured validation errors with field names

### 6. Authentication & Authorization (`src/middleware/auth.ts`)
JWT token validation for Microsoft Entra External ID:

- **Token Verification**: Validates JWT signature using JWKS from Microsoft Entra External ID
- **User Identification**: Extracts userId (oid/sub) from validated token
- **Authorization Check**: Ensures authenticated user matches requested userId
- **Configurable**: Can be disabled via `ENTRA_ENABLED=false` environment variable
- **Error Handling**: Returns 403 Forbidden for mismatched userId or invalid tokens

Protected endpoints verify that the authenticated user is accessing/modifying only their own data.

## Protected Endpoints

All endpoints are now protected with security middleware:

### Public Endpoints
- `GET /api/daily-challenge` - Rate limited (30/min), date validation, CORS
- `GET /api/level` - Rate limited (100/min), difficulty/level validation, CORS
- `POST /api/validate-solution` - Rate limited (20/min), token/mode validation, CORS
- `GET /api/challenges/history` - Rate limited (60/min), CORS

### User Statistics Endpoints
- `GET /api/user/stats` - Rate limited (60/min), userId/email/displayName validation, **Auth required**, CORS
- `POST /api/user/daily-stats` - Rate limited (30/min), full input validation, **Auth required**, CORS
- `POST /api/user/level-stats` - Rate limited (30/min), full input validation, **Auth required**, CORS
- `GET /api/user/level-progress` - Rate limited (60/min), userId/difficulty validation, **Auth required**, CORS

**Note:** Auth required endpoints validate that the JWT token's user ID matches the requested userId parameter.

## Environment Variables

Required security-related environment variables:

```env
# CORS Configuration
ALLOWED_ORIGINS=https://yourdomain.com
# or for development:
ALLOWED_ORIGINS=*

# Daily Challenge Salt (for token generation)
DAILY_CHALLENGE_SALT=<secure-random-string>

# Azure Storage
AZURE_STORAGE_CONNECTION_STRING=<connection-string>

# Microsoft Entra External ID Authentication (Recommended)
ENTRA_ENABLED=true
ENTRA_CLIENT_ID=<your-client-id>
ENTRA_TENANT_NAME=rgbpuzz
ENTRA_DOMAIN=rgbpuzz.b2clogin.com
ENTRA_POLICY=B2C_1_signupsignin
```

**Authentication Configuration:**
- Set `ENTRA_ENABLED=false` to disable authentication validation (not recommended for production)
- When enabled, protected endpoints require valid JWT tokens from Microsoft Entra External ID
- Tokens are validated against the configured tenant and policy

## Security Best Practices

### For Production Deployment

1. **CORS Origins**: Set `ALLOWED_ORIGINS` to your specific domain instead of wildcard `*`
2. **Enable Authentication**: Set `ENTRA_ENABLED=true` and configure all Microsoft Entra External ID environment variables
3. **Rate Limiting**: Replace in-memory store with Redis/Azure Cache for distributed scenarios
4. **Secrets Management**: Use Azure Key Vault for sensitive environment variables
5. **Monitoring**: Enable Application Insights to monitor rate limit violations, auth failures, and errors
6. **HTTPS Only**: Ensure all API traffic uses HTTPS (enforced by Azure Functions by default)

### Testing Security Measures

Test rate limiting:
```bash
# Should return 429 after exceeding limit
for i in {1..25}; do curl https://your-api.com/api/validate-solution; done
```

Test input validation:
```bash
# Should return 400 with validation error
curl -X POST https://your-api.com/api/user/daily-stats \
  -H "Content-Type: application/json" \
  -d '{"userId":"<script>alert(1)</script>","date":"invalid"}'
```

Test CORS:
```bash
# Should include CORS headers
curl -i -X OPTIONS https://your-api.com/api/daily-challenge
```

## Threat Mitigation

| Threat | Mitigation |
|--------|-----------|
| API Abuse | Rate limiting per client |
| SQL Injection | Input validation + escaping |
| XSS | Input sanitization |
| CORS Attacks | Strict origin validation |
| Information Disclosure | Sanitized error messages |
| DoS | Rate limiting + Azure infrastructure |
| Unauthorized Access | JWT authentication + userId validation |
| Token Forgery | JWKS signature verification |
| MITM Attacks | HTTPS only (Azure enforced) |

## Future Security Enhancements

1. **Distributed Rate Limiting**: Implement Redis-based rate limiting for horizontal scaling
2. **Request Signing**: Add cryptographic signing to prevent replay attacks
3. **API Keys**: Add API key requirement for certain endpoints
4. **Audit Logging**: Log all security events (rate limit violations, validation failures, auth failures) to storage
5. **WAF**: Configure Azure Web Application Firewall rules
6. **IP Allowlisting**: Add IP-based access controls for admin endpoints
7. **Token Refresh**: Implement automatic token refresh handling in frontend

## Compliance

Current implementation addresses:

- **OWASP Top 10**: Injection (A03), Security Misconfiguration (A05), Vulnerable Components (A06)
- **CWE**: CWE-89 (SQL Injection), CWE-79 (XSS), CWE-352 (CSRF via CORS)

## Contact

For security issues or vulnerabilities, please report via GitHub Issues or contact the maintainer directly.
