const https = require('https');

/**
 * Timer-triggered warmup function.
 * Runs every 4 minutes to keep HTTP-triggered functions warm.
 * The minimumElasticInstanceCount=1 handles infrastructure warmth,
 * but this ensures the function code itself stays loaded in memory.
 */
module.exports = async function (context, timer) {
    if (timer.isPastDue) {
        context.log('Warmup timer is past due');
    }

    const endpoints = [
        'https://api.rgbpuzz.com/api/daily-challenge',
        'https://api.rgbpuzz.com/api/spectrum-daily',
    ];

    for (const url of endpoints) {
        try {
            await new Promise((resolve, reject) => {
                const req = https.get(url, { timeout: 5000 }, (res) => {
                    res.on('data', () => {});
                    res.on('end', resolve);
                });
                req.on('error', reject);
                req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
            });
            context.log(`Warmup: ${url} OK`);
        } catch (err) {
            context.log(`Warmup: ${url} failed: ${err.message}`);
        }
    }
};
