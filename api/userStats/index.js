const path = require('path');

module.exports = async function (context, req) {
    try {
        // Create mock HttpRequest object for v4 function signature
        const mockRequest = {
            json: async () => req.body,
            text: async () => JSON.stringify(req.body),
            body: req.body,
            query: req.query,
            params: req.params
        };
        
        const { getUserStats } = require(path.join(__dirname, '..', 'dist', 'functions', 'userStats'));
        const response = await getUserStats(mockRequest, context);
        context.res = {
            status: response.status || 200,
            headers: response.headers || {},
            body: response.jsonBody || response.body
        };
    } catch (error) {
        context.log.error('Error in userStats:', error);
        context.res = {
            status: 500,
            body: { error: 'Internal server error' }
        };
    }
};
