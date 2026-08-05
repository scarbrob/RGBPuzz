/**
 * Azure Functions v4 programming model entry point.
 *
 * All function registrations live here. The compiled output of this file
 * (dist/api/src/index.js) is the `main` entry in package.json, which the
 * v4 host loads at startup to discover functions.
 */
import { app } from '@azure/functions';
import { getDailyChallenge } from './functions/dailyChallenge';
import { validateSolution } from './functions/validateSolution';
import { getLevel } from './functions/getLevel';
import { getSpectrumLevel } from './functions/getSpectrumLevel';
import { getSpectrumDaily } from './functions/spectrumDaily';
import { warmup } from './functions/warmup';

// HTTP triggers
app.http('dailyChallenge', {
  methods: ['GET', 'OPTIONS'],
  authLevel: 'anonymous',
  route: 'daily-challenge',
  handler: getDailyChallenge,
});

app.http('getLevel', {
  methods: ['GET', 'OPTIONS'],
  authLevel: 'anonymous',
  route: 'level',
  handler: getLevel,
});

app.http('getSpectrumLevel', {
  methods: ['GET', 'OPTIONS'],
  authLevel: 'anonymous',
  route: 'spectrum-level',
  handler: getSpectrumLevel,
});

app.http('spectrumDaily', {
  methods: ['GET', 'OPTIONS'],
  authLevel: 'anonymous',
  route: 'spectrum-daily',
  handler: getSpectrumDaily,
});

app.http('validateSolution', {
  methods: ['POST', 'OPTIONS'],
  authLevel: 'anonymous',
  route: 'validate-solution',
  handler: validateSolution,
});

// Timer trigger - keep function modules hot, no HTTP self-pings
app.timer('warmup', {
  schedule: '0 */10 * * * *',
  handler: warmup,
});
