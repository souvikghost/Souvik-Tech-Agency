const User = require('../models/userModel');

// POST /api/users  — admin creates employee or client
const createUser = async (req, res) => {
  try {
    const { name, email, password, role, company } = req.body;


    if (!name || !email || !password || !role)
      return res.status(400).json({ message: 'All fields required' });

    if (!['employee', 'client'].includes(role))
      return res.status(400).json({ message: 'Role must be employee or client' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already in use' });

    const user = await User.create({ name, email, password, role, company });

    res.status(201).json({
      message: 'User created',
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/users  — admin gets all users (can filter by role)
const getUsers = async (req, res) => {
  try {
    const filter = {};
    if (req.query.role) filter.role = req.query.role;

    const users = await User.find(filter).select('-password');
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/users/:id  — admin gets single user
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// DELETE /api/users/:id  — admin removes employee or client
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.role === 'admin')
      return res.status(403).json({ message: 'Cannot delete admin' });

    await user.deleteOne();
    res.status(200).json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PATCH /api/users/profile  — any logged-in user edits their own profile
const updateProfile = async (req, res) => {
  try {
    const { name, company, avatar } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (company) updates.company = company;
    if (avatar) updates.avatar = avatar;

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');
    res.status(200).json({ message: 'Profile updated', user });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { createUser, getUsers, getUserById, deleteUser, updateProfile };