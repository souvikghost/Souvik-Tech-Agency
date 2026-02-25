const mongoose = require("mongoose");

const accessLogSchema = new mongoose.Schema(
  {
    ip:           { type: String, required: true, unique: true },
    country:      { type: String, default: "unknown" },
    countryCode:  { type: String, default: "unknown" },
    city:         { type: String, default: "unknown" },
    region:       { type: String, default: "unknown" },
    timezone:     { type: String, default: "unknown" },
    org:          { type: String, default: "unknown" },  // ISP / organization
    postal:       { type: String, default: "unknown" },
    latitude:     { type: Number, default: null },
    longitude:    { type: Number, default: null },
    attempts:     { type: Number, default: 1 },
    successCount: { type: Number, default: 0 },
    failCount:    { type: Number, default: 0 },
    firstSeen:    { type: Date, default: Date.now },
    lastSeen:     { type: Date, default: Date.now },
  },
  { timestamps: false }
);

module.exports = mongoose.model("AccessLog", accessLogSchema);