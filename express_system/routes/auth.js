// routes/auth.js
const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/auth');

// Public (no auth)
router.post('/register', authCtrl.register);
router.post('/login', authCtrl.login);
router.post('/refresh', authCtrl.refresh);
router.post('/logout', authCtrl.logout);

module.exports = router;
