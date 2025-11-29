const path = require('path');

module.exports = async function (context, req) {
    try {
        context.log('getDailyAttempt wrapper called with query:', req.query);
        
        // Create mock HttpRequest object for v4 function signature
        const mockRequest = {
            method: req.method || 'GET',
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
        
        const { getDailyAttempt } = require(path.join(__dirname, '..', 'dist', 'functions', 'getDailyAttempt'));
        const response = await getDailyAttempt(mockRequest, context);
        
        context.log('getDailyAttempt response:', {
            status: response.status,
            hasJsonBody: !!response.jsonBody,
            bodyPreview: response.jsonBody ? JSON.stringify(response.jsonBody).substring(0, 200) : 'no body'
        });
        
        // Return the response - Azure Functions v3 expects body to be an object for JSON
        context.res = {
            status: response.status || 200,
            headers: {
                'Content-Type': 'application/json',
                ...(response.headers || {})
            },
            body: response.jsonBody || response.body
        };
    } catch (error) {
        context.log.error('Error in getDailyAttempt:', error);
        context.res = {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
            body: { error: 'Internal server error', details: error.message }
        };
    }
};
