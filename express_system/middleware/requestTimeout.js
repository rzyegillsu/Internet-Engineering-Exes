// middleware/requestTimeout.js
module.exports = function requestTimeout(options = {}) {
  const timeoutMs = Number(options.timeoutMs || process.env.REQUEST_TIMEOUT_MS || 10000);

  return (req, res, next) => {
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      if (res.headersSent) return;
      const err = { status: 503, message: 'Request timed out' };
      if (res.formatError) {
        return res.formatError(err);
      }
      res.status(err.status).json({ success: false, error: err });
    }, timeoutMs);

    const clear = () => clearTimeout(timer);
    res.on('finish', clear);
    res.on('close', clear);

    if (!timedOut) {
      next();
    }
  };
};
