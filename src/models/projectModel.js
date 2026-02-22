const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  employees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: { type: String, enum: ['pending', 'in-progress', 'completed','stopped'], default: 'pending' },
  serviceRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceRequest' },
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);