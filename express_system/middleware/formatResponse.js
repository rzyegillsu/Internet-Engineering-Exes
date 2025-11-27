// middleware/formatResponse.js
module.exports = (req, res, next) => {
  res.formatSuccess = (data, status = 200) => {
    const payload = {
      success: true,
      data,
      timestamp: new Date().toISOString()
    };
    return res.status(status).json(payload);
  };

  res.formatError = (err) => {
    const status = err && err.status ? err.status : 500;
    const message = err && err.message ? err.message : 'Internal Server Error';
    const details = err && err.details ? err.details : undefined;
    const payload = {
      success: false,
      error: {
        message,
        status,
        ...(details ? { details } : {})
      },
      timestamp: new Date().toISOString()
    };
    return res.status(status).json(payload);
  };

  next();
};
