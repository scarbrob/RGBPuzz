const path = require('path');

module.exports = async function (context, req) {
    try {
        console.log('getUserLevelProgressHandler wrapper called');
        console.log('Request query:', JSON.stringify(req.query));
        
        // Create mock HttpRequest object for v4 function signature
        const mockRequest = {
            json: async () => req.body,
            text: async () => JSON.stringify(req.body),
            body: req.body,
            query: {
                get: (key) => req.query[key] || null
            },
            params: req.params
        };
        
        const { getUserLevelProgressHandler } = require(path.join(__dirname, '..', 'dist', 'functions', 'getUserLevelProgressHandler'));
        const response = await getUserLevelProgressHandler(mockRequest, context);
        
        console.log('Response from getUserLevelProgressHandler:', JSON.stringify(response));
        
        context.res = {
            status: response.status || 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                ...(response.headers || {})
            },
            body: JSON.stringify(response.jsonBody || response.body)
        };
    } catch (error) {
        console.error('Error in getUserLevelProgressHandler wrapper:', error);
        console.error('Stack:', error.stack);
        context.res = {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ error: 'Internal server error', details: error.message, stack: error.stack })
        };
    }
};
