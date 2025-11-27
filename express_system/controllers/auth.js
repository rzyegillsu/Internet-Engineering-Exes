// controllers/auth.js
const jwt = require('jsonwebtoken');
const asyncHandler = require('../middleware/asyncHandler');
const User = require('../models/user');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET;
const REFRESH_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

if (!JWT_SECRET || !REFRESH_SECRET) {
  console.warn('JWT_SECRET or REFRESH_TOKEN_SECRET not set in .env');
}

function signAccessToken(user) {
  const payload = { sub: user.id, username: user.username };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function signRefreshToken(user) {
  const payload = { sub: user.id, username: user.username };
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES_IN });
}

exports.register = [
  // expects { username, password, firstname, lastname }
  asyncHandler(async (req, res) => {
    const { username, password, firstname, lastname } = req.body;
    if (!username || !password) {
      return res.formatError({ status: 400, message: 'username and password are required' });
    }
    const exists = User.findByUsername(username);
    if (exists) return res.formatError({ status: 409, message: 'username already exists' });

    const newUser = await User.create({ username, password, firstname, lastname });
    return res.formatSuccess(newUser);
  })
];

exports.login = [
  asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.formatError({ status: 400, message: 'username and password required' });

    const user = User.findByUsername(username);
    if (!user) return res.formatError({ status: 401, message: 'Invalid credentials' });

    const ok = await User.verifyPassword(user, password);
    if (!ok) return res.formatError({ status: 401, message: 'Invalid credentials' });

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    // store refresh token
    User.addRefreshToken(user.id, refreshToken);

    return res.formatSuccess({ accessToken, refreshToken, expiresIn: JWT_EXPIRES_IN });
  })
];

exports.refresh = [
  asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.formatError({ status: 400, message: 'refreshToken required' });

    let payload;
    try {
      payload = jwt.verify(refreshToken, REFRESH_SECRET);
    } catch (e) {
      return res.formatError({ status: 401, message: 'Invalid refresh token' });
    }

    const userId = payload.sub;
    if (!User.isRefreshTokenValid(userId, refreshToken)) {
      return res.formatError({ status: 401, message: 'Refresh token revoked' });
    }

    const user = User.find(userId);
    if (!user) return res.formatError({ status: 401, message: 'User not found' });

    const newAccess = signAccessToken(user);
    const newRefresh = signRefreshToken(user);

    // rotate tokens: remove old, add new
    User.revokeRefreshToken(userId, refreshToken);
    User.addRefreshToken(userId, newRefresh);

    return res.formatSuccess({ accessToken: newAccess, refreshToken: newRefresh, expiresIn: JWT_EXPIRES_IN });
  })
];

exports.logout = [
  asyncHandler(async (req, res) => {
    // client should send refreshToken in body to revoke
    const { refreshToken } = req.body;
    if (!refreshToken) return res.formatError({ status: 400, message: 'refreshToken required' });

    let payload;
    try {
      payload = jwt.decode(refreshToken);
    } catch (e) {
      return res.formatError({ status: 400, message: 'Invalid token' });
    }

    const userId = payload && payload.sub;
    if (userId) User.revokeRefreshToken(userId, refreshToken);

    return res.formatSuccess({ message: 'Logged out' });
  })
];
