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

// --- get real IP (Cloudflare aware) ---
const getIP = (req) => {
  return req.headers["cf-connecting-ip"] || req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.ip || "unknown";
};

// --- fetch geo info from freeipapi ---
const getGeoInfo = async (ip) => {
  try {
    if (ip === "::1" || ip === "127.0.0.1" || ip === "unknown") {
      return {
        ipSource: "localhost",
        country: "localhost",
        countryCode: "LH",
        city: "localhost",
        region: "localhost",
        regionCode: "LH",
        timezone: "localhost",
        isp: "localhost",
        continent: "localhost",
        continentCode: "LH",
        flag: null,
        latitude: null,
        longitude: null,
      };
    }

    const geoRes = await fetch(`https://freeipapi.com/api/json/${ip}`);
    const geo = await geoRes.json();

    return {
      ipSource: "freeipapi",
      country: geo.countryName || "unknown",
      countryCode: geo.countryCode || "unknown",
      city: geo.cityName || "unknown",
      region: geo.regionName || "unknown",
      regionCode: geo.regionCode || "unknown",
      timezone: geo.timeZone || "unknown",
      isp: geo.isp || "unknown",
      continent: geo.continent || "unknown",
      continentCode: geo.continentCode || "unknown",
      flag: geo.countryFlag || null,
      latitude: geo.latitude || null,
      longitude: geo.longitude || null,
    };
  } catch {
    return {
      ipSource: "unknown",
      country: "unknown",
      countryCode: "unknown",
      city: "unknown",
      region: "unknown",
      regionCode: "unknown",
      timezone: "unknown",
      isp: "unknown",
      continent: "unknown",
      continentCode: "unknown",
      flag: null,
      latitude: null,
      longitude: null,
    };
  }
};

// --- save or update access log ---
const logAccess = async (ip, success) => {
  try {
    const existing = await AccessLog.findOne({ ip });

    if (existing) {
      existing.attempts += 1;
      existing.lastSeen = new Date();
      if (success) existing.successCount += 1;
      else existing.failCount += 1;
      await existing.save();
    } else {
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
