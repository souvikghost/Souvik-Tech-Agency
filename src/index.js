const dotenv = require("dotenv");
dotenv.config({ quiet: true });
const express = require("express");
const { connectDb } = require("./config/db");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const app = express();

app.set("trust proxy", true);

const allowedOrigins = ["http://localhost:5173", "http://localhost:3000", "https://souviktechagency.vercel.app"];

app.use(
  cors({
    // origin: ["http://localhost:3000", "https://localhost:3000"],

    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "DELETE", "PATCH"],
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/projects", require("./routes/projectRoutes"));
app.use("/api/services", require("./routes/serviceRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/messages", require("./routes/messageRoutes"));
app.use('/api/payments', require('./routes/paymentRoutes'));

app.get("/", (req, res) => res.json({ message: "Souvik Tech Agency API" }));

module.exports = { app, connectDb };
