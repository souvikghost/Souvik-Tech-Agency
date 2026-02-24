const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    client:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount:  { type: Number, required: true, min: 0 },
    method:  { type: String, enum: ['bank_transfer', 'upi', 'cheque', 'cash', 'other'], default: 'other' },
    status:  { type: String, enum: ['paid', 'unpaid', 'partial'], default: 'unpaid' },
    date:    { type: Date, default: Date.now },
    notes:   { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);