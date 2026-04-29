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
 * Instead we just require() the compiled function modules. This is enough to
 * keep V8 from evicting them and keep require.cache populated.
 */
module.exports = async function (context, timer) {
    if (timer.isPastDue) {
        context.log('Warmup timer is past due');
    }

    try {
        // Touch the compiled modules so they stay in require.cache and V8's hot set.
        // Paths are relative to this file: api/warmup/ -> api/dist/api/src/functions/
        require('../dist/api/src/functions/dailyChallenge');
        require('../dist/api/src/functions/spectrumDaily');
        require('../dist/api/src/functions/getLevel');
        require('../dist/api/src/functions/getSpectrumLevel');
        require('../dist/api/src/functions/validateSolution');
        context.log('Warmup: modules touched');
    } catch (err) {
        context.log(`Warmup: module touch failed: ${err.message}`);
    }
};
