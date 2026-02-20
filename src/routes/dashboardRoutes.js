const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/dashboard');
const protect = require('../middleware/protect');
const allowRoles = require('../middleware/allowRoles');

router.get('/', protect, allowRoles('admin'), getDashboardStats);

module.exports = router;