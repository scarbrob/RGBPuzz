const path = require('path');
const { getUserStats } = require(path.join(__dirname, '..', 'dist', 'functions', 'userStats'));

module.exports = async function (context, req) {
    try {
        const response = await getUserStats(req, context);
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
