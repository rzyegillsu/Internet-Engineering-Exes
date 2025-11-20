module.exports = (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const elapsed = Date.now() - start;
        console.log(`[${new Date().toISOString()}] ${req.ip} ${req.method} ${req.originalUrl} ${res.statusCode} - ${elapsed}ms`);
    });
    next();
};