const User = require('../models/userModel');
const Project = require('../models/projectModel');
const Service = require('../models/serviceModel');
const ServiceRequest = require('../models/serviceRequest');

// GET /api/dashboard  — admin only
const getDashboardStats = async (req, res) => {
  try {
    const [totalEmployees, totalClients, totalProjects, totalServices, pendingRequests, projectsByStatus] =
      await Promise.all([
        User.countDocuments({ role: 'employee' }),
        User.countDocuments({ role: 'client' }),
        Project.countDocuments(),
        Service.countDocuments(),
        ServiceRequest.countDocuments({ status: 'pending' }),
        Project.aggregate([
          { $group: { _id: '$status', count: { $sum: 1 } } },
        ]),
      ]);

    res.status(200).json({
      totalEmployees,
      totalClients,
      totalProjects,
      totalServices,
      pendingRequests,
      projectsByStatus,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getDashboardStats };