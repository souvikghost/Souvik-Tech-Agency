const Project = require('../models/projectModel');

// GET /api/projects  — filtered by role
const getProjects = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === 'client') filter.client = req.user._id;
    if (req.user.role === 'employee') filter.employees = req.user._id;
    // admin gets all

    const projects = await Project.find(filter)
      .populate('client', 'name email company')
      .populate('employees', 'name email');

    res.status(200).json(projects);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/projects/:id
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('client', 'name email company')
      .populate('employees', 'name email')
      .populate('serviceRequest');

    if (!project) return res.status(404).json({ message: 'Project not found' });

    // employees and clients can only see their own projects
    if (req.user.role === 'client' && project.client._id.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Access denied' });

    if (req.user.role === 'employee' && !project.employees.some(e => e._id.toString() === req.user._id.toString()))
      return res.status(403).json({ message: 'Access denied' });

    res.status(200).json(project);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PATCH /api/projects/:id/assign  — admin assigns/unassigns employees
const assignEmployees = async (req, res) => {
  try {
    const { employees } = req.body; // array of user IDs
    if (!Array.isArray(employees))
      return res.status(400).json({ message: 'employees must be an array' });

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { employees },
      { new: true }
    ).populate('employees', 'name email');

    if (!project) return res.status(404).json({ message: 'Project not found' });

    res.status(200).json({ message: 'Employees updated', project });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PATCH /api/projects/:id/status  — employee or admin updates status
const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['pending', 'in-progress', 'completed'];
    if (!allowed.includes(status))
      return res.status(400).json({ message: 'Invalid status' });

    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // employee must be assigned to update
    if (req.user.role === 'employee' && !project.employees.includes(req.user._id))
      return res.status(403).json({ message: 'You are not assigned to this project' });

    project.status = status;
    await project.save();

    res.status(200).json({ message: 'Status updated', project });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PATCH /api/projects/:id  — admin updates project details
const updateProject = async (req, res) => {
  try {
    const { name, description } = req.body;
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { name, description },
      { new: true }
    );
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.status(200).json({ message: 'Project updated', project });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// DELETE /api/projects/:id  — admin deletes project
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.status(200).json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getProjects, getProjectById, assignEmployees, updateStatus, updateProject, deleteProject };