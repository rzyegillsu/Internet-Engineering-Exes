// middleware/validateRequest.js
const { validationResult } = require('express-validator');

module.exports = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  const details = errors.array().map(({ msg, param, value, location }) => ({
    msg,
    param,
    location,
    value
  }));

  if (res.formatError) {
    return res.formatError({
      status: 400,
      message: 'Validation failed',
      details
    });
  }

  return res.status(400).json({
    success: false,
    error: {
      message: 'Validation failed',
      status: 400,
      details
    }
  });
};
