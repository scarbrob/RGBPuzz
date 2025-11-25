const path = require('path');

module.exports = async function (context, req) {
  try {
    const { initializeDatabase } = require(path.join(__dirname, '..', 'dist', 'functions', 'initDb'));
    const response = await initializeDatabase(req, context);
    
    context.res = {
      status: response.status || 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: response.jsonBody,
    };
  } catch (error) {
    context.log.error('Error in initDb wrapper:', error);
    context.res = {
      status: 500,
      body: { error: 'Internal server error', details: error.message },
    };
  }
};
