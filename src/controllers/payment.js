const Payment = require("../models/paymentModel");
const Project = require("../models/projectModel");

// POST /api/payments — admin adds a payment record for a project
const createPayment = async (req, res) => {
  try {
    const { project, amount, method, status, date, notes } = req.body;

    if (!project || !amount) return res.status(400).json({ message: "Project and amount are required" });

    const projectDoc = await Project.findById(project);
    if (!projectDoc) return res.status(404).json({ message: "Project not found" });

    const payment = await Payment.create({
      project,
      client: projectDoc.client,
      amount,
      method,
      status,
      date,
      notes,
    });

    const populated = await payment.populate([
      { path: "project", select: "name" },
      { path: "client", select: "name email company" },
    ]);

    res.status(201).json({ message: "Payment record created", payment: populated });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /api/payments — admin gets all payments, client gets their own
const getPayments = async (req, res) => {
  try {
    const filter = req.user.role === "client" ? { client: req.user._id } : {};

    const payments = await Payment.find(filter).populate("project", "name status").populate("client", "name email company").sort({ createdAt: -1 });

    res.status(200).json(payments);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /api/payments/project/:projectId — get payment for a specific project
const getPaymentByProject = async (req, res) => {
  try {
    const payment = await Payment.findOne({ project: req.params.projectId }).populate("project", "name status").populate("client", "name email company");

    if (!payment) return res.status(200).json({ message: "No payment record found" });

    // client can only see their own
    if (req.user.role === "client" && payment.client._id.toString() !== req.user._id.toString()) return res.status(403).json({ message: "Access denied" });

    res.status(200).json(payment);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// PATCH /api/payments/:id — admin updates a payment record
const updatePayment = async (req, res) => {
  try {
    const { amount, method, status, date, notes } = req.body;

    const payment = await Payment.findByIdAndUpdate(req.params.id, { amount, method, status, date, notes }, { new: true }).populate("project", "name status").populate("client", "name email company");

    if (!payment) return res.status(404).json({ message: "Payment not found" });

    res.status(200).json({ message: "Payment updated", payment });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// DELETE /api/payments/:id — admin deletes a payment record
const deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);
    if (!payment) return res.status(404).json({ message: "Payment not found" });
    res.status(200).json({ message: "Payment deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /api/payments/stats — admin gets total revenue stats
const getPaymentStats = async (req, res) => {
  try {
    const payments = await Payment.find();

    const totalRevenue = payments.filter((p) => p.status === "paid").reduce((sum, p) => sum + p.amount, 0);
    const totalPending = payments.filter((p) => p.status === "unpaid").reduce((sum, p) => sum + p.amount, 0);
    const totalPartial = payments.filter((p) => p.status === "partial").reduce((sum, p) => sum + p.amount, 0);
    const totalPayments = payments.length;

    res.status(200).json({ totalRevenue, totalPending, totalPartial, totalPayments });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { createPayment, getPayments, getPaymentByProject, updatePayment, deletePayment, getPaymentStats };
