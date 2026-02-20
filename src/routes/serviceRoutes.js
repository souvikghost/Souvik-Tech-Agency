const express = require('express');
const router = express.Router();
const { createService, getServices, deleteService } = require('../controllers/service');
const { createRequest, getRequests, approveRequest, rejectRequest } = require('../controllers/serviceRequest');
const protect = require('../middleware/protect');
const allowRoles = require('../middleware/allowRoles');

// Services
router.post('/', protect, allowRoles('admin'), createService);
router.get('/', protect, getServices);
router.delete('/:id', protect, allowRoles('admin'), deleteService);

// Service Requests
router.post('/requests', protect, allowRoles('client'), createRequest);
router.get('/requests', protect, allowRoles('admin', 'client'), getRequests);
router.patch('/requests/:id/approve', protect, allowRoles('admin'), approveRequest);
router.patch('/requests/:id/reject', protect, allowRoles('admin'), rejectRequest);

module.exports = router;