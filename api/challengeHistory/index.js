const path = require('path');

module.exports = async function (context, req) {
  try {
    const { getChallengeHistory } = require(path.join(__dirname, '..', 'dist', 'functions', 'challengeHistory'));
    const response = await getChallengeHistory(req, context);
    
    context.res = {
      status: response.status || 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: response.jsonBody,
    };
  } catch (error) {
    context.log.error('Error in challengeHistory wrapper:', error);
    context.res = {
      status: 500,
      body: { error: 'Internal server error' },
    };
  }
};
