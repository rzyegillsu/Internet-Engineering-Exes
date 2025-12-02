// middleware/apiKey.js
module.exports = (req, res, next) => {
  if (req.method === 'OPTIONS') {
    return next();
  }

  const configuredKey = process.env.API_KEY;
  if (!configuredKey) {
    console.warn('API_KEY is not configured. Set API_KEY in your .env file.');
    return res.formatError ? res.formatError({ status: 500, message: 'API key not configured' }) : res.status(500).json({
      success: false,
      error: { status: 500, message: 'API key not configured' }
    });
  }

  const apiKey = req.header('x-api-key') || req.header('X-API-Key');
  if (!apiKey || apiKey !== configuredKey) {
    return res.formatError ? res.formatError({ status: 401, message: 'Unauthorized: Invalid API key' }) : res.status(401).json({
      success: false,
      error: { status: 401, message: 'Unauthorized: Invalid API key' }
    });
  }

  return next();
};
