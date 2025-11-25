const path = require('path');
const { validateSolution } = require(path.join(__dirname, '..', 'dist', 'functions', 'validateSolution'));

module.exports = async function (context, req) {
    try {
        const response = await validateSolution(req, context);
        context.res = {
            status: response.status || 200,
            headers: response.headers || {},
            body: response.jsonBody || response.body
        };
    } catch (error) {
        context.log.error('Error in validateSolution:', error);
        context.res = {
            status: 500,
            body: { error: 'Internal server error' }
        };
    }
};
