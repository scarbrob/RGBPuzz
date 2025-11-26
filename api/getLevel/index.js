const path = require('path');

module.exports = async function (context, req) {
    try {
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
        
        const { getLevel } = require(path.join(__dirname, '..', 'dist', 'functions', 'getLevel'));
        const response = await getLevel(mockRequest, context);
        context.res = {
            status: response.status || 200,
            headers: response.headers || {},
            body: response.jsonBody || response.body
        };
    } catch (error) {
        context.log('Error in getLevel:', error);
        context.res = {
            status: 500,
            body: { error: 'Internal server error' }
        };
    }
};
