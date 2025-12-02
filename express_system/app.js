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
const requestTimeout = require('./middleware/requestTimeout');
const apiKeyGuard = require('./middleware/apiKey');
const jwtAuth = require('./middleware/auth');

const app = express();
app.set('trust proxy', 1);

app.use(helmet());
app.use(compression());
app.use(express.json({ limit: '25kb' }));
app.use(formatResponse);
app.use(requestTimeout());
app.use(logger);

const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3001')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (!allowedOrigins.length) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('CORS not allowed'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
  credentials: true,
  optionsSuccessStatus: 204
};

const corsMiddleware = cors(corsOptions);
app.use((req, res, next) => {
  corsMiddleware(req, res, (err) => {
    if (err) {
      return res.formatError({ status: 403, message: 'CORS Error: origin not allowed' });
    }
    next();
  });
});
app.options('*', corsMiddleware);

app.use(rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
  max: Number(process.env.RATE_LIMIT_MAX || 100),
  standardHeaders: true,
  legacyHeaders: false
}));

app.use(apiKeyGuard);
app.use('/api/auth', authRoutes);
app.use('/api', jwtAuth);
app.use('/api/users', userRoutes);

app.get('/health', (req, res) => res.formatSuccess({ status: 'ok' }));
app.use(errorHandler);

module.exports = app;
