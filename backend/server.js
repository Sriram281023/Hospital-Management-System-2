require("dotenv").config();
const express = require("express");
const cors    = require("cors");
const morgan  = require("morgan");
const connectDB = require("./config/db");

// Connect to MongoDB
connectDB();

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: (origin, callback) => {
    // Echo back the requesting origin to satisfy CORS with credentials
    if (!origin) return callback(null, true);
    callback(null, origin);
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

// ─── Debug Log Middleware ───────────────────────────────────────────────────
app.use((req, res, next) => {
  const originalJson = res.json;
  res.json = function (data) {
    console.log(`[API LOG] ${req.method} ${req.originalUrl} | Status: ${res.statusCode} | User: ${req.user?.username || "Guest"} | Res:`, JSON.stringify(data).slice(0, 150));
    return originalJson.apply(this, arguments);
  };
  next();
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/auth",         require("./routes/auth"));
app.use("/api/patients",     require("./routes/patients"));
app.use("/api/doctors",      require("./routes/doctors"));
app.use("/api/appointments", require("./routes/appointments"));
app.use("/api/bills",        require("./routes/bills"));

// ─── Health check ─────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "CityCare Hospital API running ✅", env: process.env.NODE_ENV });
});

// ─── 404 handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ─── Global error handler ────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ success: false, message: err.message || "Server Error" });
});

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});

module.exports = app;
