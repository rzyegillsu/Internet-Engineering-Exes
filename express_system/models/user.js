// models/user.js
const bcrypt = require('bcryptjs');

let users = [];
let idCounter = 1;

let refreshTokens = new Map(); // key: userId, value: Set of tokens

module.exports = {
  all() { return users; },

  find(id) { return users.find(u => u.id === Number(id)); },

  findByUsername(username) {
    return users.find(u => u.username === username);
  },

  async create({ username, password, firstname, lastname }) {
    const hashed = await bcrypt.hash(password, 10);
    const user = { id: idCounter++, username, password: hashed, firstname, lastname };
    users.push(user);
    return { ...user, password: undefined };
  },

  async verifyPassword(user, plainPassword) {
    if (!user) return false;
    return bcrypt.compare(plainPassword, user.password);
  },

  update(id, data) {
    const idx = users.findIndex(u => u.id === Number(id));
    if (idx === -1) return null;
    // do not allow direct password overwrite without hashing here
    users[idx] = { ...users[idx], ...data };
    return { ...users[idx], password: undefined };
  },

  remove(id) {
    const idx = users.findIndex(u => u.id === Number(id));
    if (idx === -1) return false;
    users.splice(idx, 1);
    refreshTokens.delete(Number(id));
    return true;
  },

  // refresh token helpers (simple in-memory)
  addRefreshToken(userId, token) {
    const id = Number(userId);
    if (!refreshTokens.has(id)) refreshTokens.set(id, new Set());
    refreshTokens.get(id).add(token);
  },

  revokeRefreshToken(userId, token) {
    const id = Number(userId);
    if (!refreshTokens.has(id)) return;
    refreshTokens.get(id).delete(token);
  },

  isRefreshTokenValid(userId, token) {
    const id = Number(userId);
    return refreshTokens.has(id) && refreshTokens.get(id).has(token);
  },

  reset() { users = []; idCounter = 1; refreshTokens.clear(); }
};
