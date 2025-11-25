const path = require('path');
const { getLevel } = require(path.join(__dirname, '..', 'dist', 'functions', 'getLevel'));

module.exports = async function (context, req) {
    try {
        const response = await getLevel(req, context);
        context.res = {
            status: response.status || 200,
            headers: response.headers || {},
            body: response.jsonBody || response.body
        };
    } catch (error) {
        context.log.error('Error in getLevel:', error);
        context.res = {
            status: 500,
            body: { error: 'Internal server error' }
        };
    }
};
