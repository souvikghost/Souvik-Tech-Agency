const express = require('express');
const router = express.Router();
const {
  getProjects,
  getProjectById,
  assignEmployees,
  updateStatus,
  updateProject,
  deleteProject,
} = require('../controllers/project');
const protect = require('../middleware/protect');
const allowRoles = require('../middleware/allowRoles');

router.get('/', protect, getProjects);
router.get('/:id', protect, getProjectById);
router.patch('/:id/assign', protect, allowRoles('admin'), assignEmployees);
router.patch('/:id/status', protect, allowRoles('admin', 'employee'), updateStatus);
router.patch('/:id', protect, allowRoles('admin'), updateProject);
router.delete('/:id', protect, allowRoles('admin'), deleteProject);

module.exports = router;