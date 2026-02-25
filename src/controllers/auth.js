const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const AccessLog = require("../models/accessLog");

const sendTokenCookie = (res, user) => {
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 24 * 60 * 60 * 1000,
  });

  return token;
};

const getIP = (req) => {
  return req.headers["cf-connecting-ip"] || req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.ip || "unknown";
};

// --- helper: fetch geo info from ipapi ---
const getGeoInfo = async (ip) => {
  try {
    // skip for localhost
    if (ip === "::1" || ip === "127.0.0.1" || ip === "unknown") {
      return { country: "localhost", countryCode: "LH", city: "localhost", region: "localhost", timezone: "localhost", org: "localhost", postal: "unknown", latitude: null, longitude: null };
    }
    const res = await fetch(`https://ipapi.co/${ip}/json/`);
    const data = await res.json();
    return {
      country: data.country_name || "unknown",
      countryCode: data.country_code || "unknown",
      city: data.city || "unknown",
      region: data.region || "unknown",
      timezone: data.timezone || "unknown",
      org: data.org || "unknown",
      postal: data.postal || "unknown",
      latitude: data.latitude || null,
      longitude: data.longitude || null,
    };
  } catch {
    return { country: "unknown", countryCode: "unknown", city: "unknown", region: "unknown", timezone: "unknown", org: "unknown", postal: "unknown", latitude: null, longitude: null };
  }
};

// --- helper: save or update access log ---
const logAccess = async (ip, success) => {
  try {
    const existing = await AccessLog.findOne({ ip });

    if (existing) {
      // same IP — just update counts and lastSeen
      existing.attempts += 1;
      existing.lastSeen = new Date();
      if (success) existing.successCount += 1;
      else existing.failCount += 1;
      await existing.save();
    } else {
      // new IP — fetch geo and create record
      const geo = await getGeoInfo(ip);
      await AccessLog.create({
        ip,
        ...geo,
        attempts: 1,
        successCount: success ? 1 : 0,
        failCount: success ? 0 : 1,
        firstSeen: new Date(),
        lastSeen: new Date(),
      });
    }
  } catch (err) {
    // never let logging break the login flow
    console.error("AccessLog error:", err.message);
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) return res.status(400).json({ message: "Email and password required" });

    const ip = getIP(req);
    const user = await User.findOne({ email });

    if (!user) {
      await logAccess(ip, false);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (user.isDeleted) {
      await logAccess(ip, false);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await logAccess(ip, false);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    await logAccess(ip, true);
    sendTokenCookie(res, user);

    res.status(200).json({
      message: "Login successful",
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// POST /api/auth/logout
const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });
  res.status(200).json({ message: "Logged out successfully" });
};

// GET /api/auth/me
const getMe = (req, res) => {
  res.status(200).json({ user: req.user });
};

module.exports = { login, logout, getMe };
