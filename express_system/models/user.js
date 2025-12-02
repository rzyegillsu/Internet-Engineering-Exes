// models/user.js
const bcrypt = require('bcryptjs');

let users = [];
let idCounter = 1;

let profiles = [];
let profileIdCounter = 1;

let refreshTokens = new Map(); // key: userId, value: Set of tokens

const sanitizeProfile = (profile) => {
  if (!profile) return null;
  return { ...profile };
};

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

  // profile CRUD (separate from auth accounts)
  listProfiles() {
    return profiles.map(sanitizeProfile);
  },

  getProfile(id) {
    const profile = profiles.find(p => p.id === Number(id));
    return sanitizeProfile(profile);
  },

  createProfile({ name, age }) {
    const profile = {
      id: profileIdCounter++,
      name: name.trim(),
      age: Number(age),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    profiles.push(profile);
    return sanitizeProfile(profile);
  },

  updateProfile(id, data) {
    const idx = profiles.findIndex(p => p.id === Number(id));
    if (idx === -1) return null;

    const nextName = data.name !== undefined ? data.name.trim() : profiles[idx].name;
    const nextAge = data.age !== undefined ? Number(data.age) : profiles[idx].age;

    profiles[idx] = {
      ...profiles[idx],
      name: nextName,
      age: nextAge,
      updatedAt: new Date().toISOString()
    };

    return sanitizeProfile(profiles[idx]);
  },

  deleteProfile(id) {
    const idx = profiles.findIndex(p => p.id === Number(id));
    if (idx === -1) return false;
    profiles.splice(idx, 1);
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
  reset() {
    users = [];
    profiles = [];
    idCounter = 1;
    profileIdCounter = 1;
    refreshTokens.clear();
  }
};
