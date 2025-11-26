const path = require('path');

module.exports = async function (context, req) {
    try {
        // Create mock HttpRequest object for v4 function signature
        const mockRequest = {
            method: req.method || 'GET',
            json: async () => req.body,
            text: async () => JSON.stringify(req.body),
            body: req.body,
            query: req.query,
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
        
        const { getChallengeHistory } = require(path.join(__dirname, '..', 'dist', 'functions', 'challengeHistory'));
        const response = await getChallengeHistory(mockRequest, context);    context.res = {
      status: response.status || 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: response.jsonBody,
    };
  } catch (error) {
    context.log('Error in challengeHistory wrapper:', error);
    context.res = {
      status: 500,
      body: { error: 'Internal server error' },
    };
  }
};
