const express = require("express");
const router = express.Router();
const protect = require("../middleware/protect");
const allowRoles = require("../middleware/allowRoles");
const { createPayment, updatePayment, deletePayment, getPaymentByProject, getPaymentStats, getPayments } = require("../controllers/payment");

// Stats — must be before /:id to avoid conflict
router.get("/stats", protect, allowRoles("admin"), getPaymentStats);

// Project-specific payment
router.get("/project/:projectId", protect, getPaymentByProject);

// All payments
router.get("/", protect, getPayments);

// Admin only — create, update, delete
router.post("/", protect, allowRoles("admin"), createPayment);
router.patch("/:id", protect, allowRoles("admin"), updatePayment);
router.delete("/:id", protect, allowRoles("admin"), deletePayment);

module.exports = router;
