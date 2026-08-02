import { InvocationContext, Timer } from '@azure/functions';

/**
 * Timer-triggered warmup function.
 *
 * Purpose: keep the Node.js process and our compiled function modules
 * resident in memory so HTTP-triggered functions don't pay a cold JIT/module-load
 * cost on the first request after an idle period.
 *
 * We deliberately do NOT make HTTP calls to our own endpoints because:
 *   - It pollutes the IP-based rate limit store with our own egress IP
 *   - It bypasses any future caching layer
 *   - The infrastructure warmth is already handled by minimumElasticInstanceCount
 *
 * Instead we just import the compiled function modules. This is enough to
 * keep V8 from evicting them and keep the module cache populated.
 */
export async function warmup(timer: Timer, context: InvocationContext): Promise<void> {
  if (timer.isPastDue) {
    context.log('Warmup timer is past due');
  }

  try {
    // Re-touch sibling compiled modules to keep them hot in the module cache.
    await Promise.all([
      import('./dailyChallenge'),
      import('./spectrumDaily'),
      import('./getLevel'),
      import('./getSpectrumLevel'),
      import('./validateSolution'),
    ]);
    context.log('Warmup: modules touched');
  } catch (err) {
    context.log(`Warmup: module touch failed: ${(err as Error).message}`);
  }
}
