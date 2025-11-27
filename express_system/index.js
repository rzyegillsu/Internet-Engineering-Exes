require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const formatResponse = require('./middleware/formatResponse');
const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');

const app = express();
app.set('trust proxy', 1);

app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(logger);

// CORS
const allowed = (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
const corsOptions = {
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowed.length === 0) return callback(null, true);
    if (allowed.indexOf(origin) !== -1) return callback(null, true);
    callback(new Error('CORS not allowed'), false);
  }
};
app.use((req, res, next) => {
  cors(corsOptions)(req, res, err => {
    if (err) return next({ status: 403, message: 'CORS Error: origin not allowed' });
    next();
  });
});

// rate limiter
app.use(rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15*60*1000),
  max: Number(process.env.RATE_LIMIT_MAX || 100),
  standardHeaders: true,
  legacyHeaders: false
}));

// response formatter
app.use(formatResponse);

// auth routes (public)
app.use('/api/auth', authRoutes);

// protect following routes with JWT middleware
const jwtAuth = require('./middleware/auth');
app.use('/api', jwtAuth);

// protected routes
app.use('/api/users', userRoutes);

// health
app.get('/health', (req, res) => res.formatSuccess({ status: 'ok' }));

// error handler
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`HTTP Server running on http://localhost:${PORT}`);
});
