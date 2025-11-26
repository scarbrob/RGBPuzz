const path = require('path');

module.exports = async function (context, req) {
    try {
        context.log('validateSolution wrapper called');
        context.log('Request body:', JSON.stringify(req.body));
        
        // In v3 model, the body is already parsed in req.body
        // We need to create a mock HttpRequest object for the v4 function
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
        
        const { validateSolution } = require(path.join(__dirname, '..', 'dist', 'functions', 'validateSolution'));
        const response = await validateSolution(mockRequest, context);
        
        context.log('Response from validateSolution:', JSON.stringify(response));
        
        context.res = {
            status: response.status || 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                ...(response.headers || {})
            },
            body: JSON.stringify(response.jsonBody || response.body)
        };
    } catch (error) {
        context.log('Error in validateSolution wrapper:', error);
        context.log('Stack:', error.stack);
        context.res = {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: { error: 'Internal server error', details: error.message, stack: error.stack }
        };
    }
};
