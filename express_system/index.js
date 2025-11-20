console.log("Loaded API KEY:", process.env.API_KEY);
console.log("ENV PATH:", __dirname);

require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const userRoutes = require('./routes/user');
const logger = require('./middleware/logger');
const auth = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');

const PORT = process.env.PORT || 3000;  

const app = express();
app.set('trust proxy', 1);

// basic security headers
app.use(helmet());

// body parser
app.use(express.json());

// request logger
app.use(logger);

// rate limiter (global)
const limiter = rateLimit({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 60000),
    max: Number(process.env.RATE_LIMIT_MAX || 100),
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' }
});
app.use(limiter);

// auth middleware applied to API routes
app.use('/api', auth);

// API routes
app.use('/api/users', userRoutes);

// health
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// centralized error handler
app.use(errorHandler);

// ⭐ ONLY HTTP — no HTTPS in Codespaces
app.listen(PORT, "0.0.0.0", () => {
    console.log(`HTTP Server running on http://localhost:${PORT}`);
    console.log(`Codespaces URL will appear under Ports tab automatically.`);
});
