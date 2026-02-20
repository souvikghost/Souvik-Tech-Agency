const ServiceRequest = require('../models/serviceRequest');
const Project = require('../models/projectModel');

// POST /api/services/requests  — client requests a service
const createRequest = async (req, res) => {
  try {
    const { service, note } = req.body;
    if (!service) return res.status(400).json({ message: 'Service ID required' });

    const request = await ServiceRequest.create({
      client: req.user._id,
      service,
      note,
    });

    res.status(201).json({ message: 'Service request submitted', request });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/services/requests  — admin sees all, client sees their own
const getRequests = async (req, res) => {
  try {
    const filter = req.user.role === 'client' ? { client: req.user._id } : {};
    const requests = await ServiceRequest.find(filter)
      .populate('client', 'name email')
      .populate('service', 'name');
    res.status(200).json(requests);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PATCH /api/services/requests/:id/approve  — admin approves → auto creates project
const approveRequest = async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.id).populate('service');
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.status !== 'pending')
      return res.status(400).json({ message: 'Request already processed' });

    request.status = 'approved';
    await request.save();

    // Auto-create project on approval
    const project = await Project.create({
      name: request.service.name,
      description: `Project created from service request`,
      client: request.client,
      serviceRequest: request._id,
    });

    res.status(200).json({ message: 'Request approved, project created', project });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PATCH /api/services/requests/:id/reject  — admin rejects
const rejectRequest = async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.status !== 'pending')
      return res.status(400).json({ message: 'Request already processed' });

    request.status = 'rejected';
    await request.save();

    res.status(200).json({ message: 'Request rejected', request });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { createRequest, getRequests, approveRequest, rejectRequest };