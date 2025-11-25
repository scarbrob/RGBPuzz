const path = require('path');
const { getDailyChallenge } = require(path.join(__dirname, '..', 'dist', 'functions', 'dailyChallenge'));

module.exports = async function (context, req) {
    try {
        const response = await getDailyChallenge(req, context);
        context.res = {
            status: response.status || 200,
            headers: response.headers || {},
            body: response.jsonBody || response.body
        };
    } catch (error) {
        context.log.error('Error in dailyChallenge:', error);
        context.res = {
            status: 500,
            body: { error: 'Internal server error' }
        };
    }
};
