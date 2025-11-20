// checks x-api-key header
module.exports = (req, res, next) => {
    const apiKey = req.header('x-api-key');
    if (!apiKey) return res.status(401).json({ error: 'Missing API key' });
    if (apiKey !== process.env.API_KEY) return res.status(401).json({ error: 'Invalid API key' });
    // for further per-route roles, attach info to req (e.g. req.user)
    req.user = { apiKey };
    next();
};