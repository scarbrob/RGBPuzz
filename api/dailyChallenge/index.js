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
            headers: {
                get: (key) => req.headers[key] || req.headers[key.toLowerCase()] || null
            },
            params: req.params
        };
        
        const { getDailyChallenge } = require(path.join(__dirname, '..', 'dist', 'functions', 'dailyChallenge'));
        const response = await getDailyChallenge(mockRequest, context);
        context.res = {
            status: response.status || 200,
            headers: response.headers || {},
            body: response.jsonBody || response.body
        };
    } catch (error) {
        context.log('Error in dailyChallenge:', error);
        context.res = {
            status: 500,
            body: { error: 'Internal server error' }
        };
    }
};
