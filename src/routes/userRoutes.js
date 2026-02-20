const express = require('express');
const router = express.Router();
const { createUser, getUsers, getUserById, deleteUser, updateProfile } = require('../controllers/user');
const protect = require('../middleware/protect');
const allowRoles = require('../middleware/allowRoles');

// Admin only
router.post('/', protect, allowRoles('admin'), createUser);
router.get('/', protect, allowRoles('admin'), getUsers);
router.get('/:id', protect, allowRoles('admin'), getUserById);
router.delete('/:id', protect, allowRoles('admin'), deleteUser);

// Any logged-in user
router.patch('/profile', protect, updateProfile);

module.exports = router;