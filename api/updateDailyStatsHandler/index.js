const path = require('path');

module.exports = async function (context, req) {
    try {
        console.log('updateDailyStatsHandler wrapper called');
        console.log('Request body:', JSON.stringify(req.body));
        
        // In v3 model, the body is already parsed in req.body
        const mockRequest = {
            json: async () => req.body,
            text: async () => JSON.stringify(req.body),
            body: req.body,
            query: {
                get: (key) => req.query[key] || null
            },
            params: req.params
        };
        
        const { updateDailyStatsHandler } = require(path.join(__dirname, '..', 'dist', 'functions', 'updateDailyStatsHandler'));
        const response = await updateDailyStatsHandler(mockRequest, context);
        
        console.log('Response from updateDailyStatsHandler:', JSON.stringify(response));
        
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
        console.error('Error in updateDailyStatsHandler wrapper:', error);
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
