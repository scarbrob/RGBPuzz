const path = require('path');

module.exports = async function (context, req) {
    try {
        const mockRequest = {
            method: req.method || 'POST',
            json: async () => req.body,
            text: async () => JSON.stringify(req.body),
            body: req.body,
            query: {
                get: (key) => req.query[key] || null
            },
            params: req.params,
            headers: {
                get: (key) => {
                    if (!req.headers) return null;
                    const lowerKey = key.toLowerCase();
                    for (const [k, v] of Object.entries(req.headers)) {
                        if (k.toLowerCase() === lowerKey) return v;
                    }
                    return null;
                }
            }
        };

        const { validateSolution } = require(path.join(__dirname, '..', 'dist', 'api', 'src', 'functions', 'validateSolution'));
        const response = await validateSolution(mockRequest, context);
        context.res = {
            status: response.status || 200,
            headers: response.headers || {},
            body: response.jsonBody || response.body
        };
    } catch (error) {
        context.log('Error in validateSolution wrapper:', error);
        context.res = {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
            body: { error: 'Internal server error' }
        };
    }
};
