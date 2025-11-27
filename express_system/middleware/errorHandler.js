// middleware/errorHandler.js
module.exports = (err, req, res, next) => {
  console.error(err && err.stack ? err.stack : err);
  if (res.formatError) return res.formatError(err);
  const status = err && err.status ? err.status : 500;
  res.status(status).json({ success: false, error: { message: err.message || 'Internal Server Error', status } });
};
