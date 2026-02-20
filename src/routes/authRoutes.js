const express = require('express');
const router = express.Router();
const { login, logout, getMe } = require('../controllers/auth');
const protect = require('../middleware/protect');

router.post('/login', login);
router.post('/logout', logout);
router.get('/me', protect, getMe);

module.exports = router;