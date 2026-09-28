const http = require("http");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const {
  sanitizeNoSql,
  xssSanitizer,
  authLimiter,
  apiLimiter,
  standardErrorHandler
} = require("./middleware/security");
require("dotenv").config();

<<<<<<< HEAD
const prisma = require("./lib/prisma");
=======
const { initSocketServer } = require("./services/socketService");
>>>>>>> 8588af7 (Update project)

const app = express();
const server = http.createServer(app);

// ===== SECURITY =====
// Helmet security headers — disable CSP since this is a REST API (JSON only, not HTML)
app.use(helmet({ contentSecurityPolicy: false }));
app.disable("x-powered-by");

// CORS — allow specific origins in production, wildcard in dev
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : [];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);
      if (allowedOrigins.length === 0) return callback(null, true); // dev: allow all
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Initialize Socket.IO with HTTP server
initSocketServer(server, allowedOrigins);

// Rate limiting & Input Sanitization
app.use("/api/", apiLimiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

app.use(express.json({ limit: "10kb" })); // Prevent large payload attacks
app.use(sanitizeNoSql); // NoSQL Injection Protection
app.use(xssSanitizer); // XSS Protection

// ===== POSTGRESQL (via Prisma) =====
let dbConnected = false;

prisma
  .$connect()
  .then(() => {
    dbConnected = true;
    console.log("✅ PostgreSQL Connected via Prisma");
  })
  .catch(() => {
    console.log("⚠️  PostgreSQL connection failed — using sample data fallback");
    console.log("   To fix: set a valid DATABASE_URL in your .env file");
  });

app.set("dbConnected", () => dbConnected);

// ===== ROUTES =====
const authRoutes = require("./routes/authRoutes");
const tripRoutes = require("./routes/tripRoutes");
const destinationRoutes = require("./routes/destinationRoutes");
const chatRoutes = require("./routes/chatRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const favoriteRoutes = require("./routes/favoriteRoutes");
const aiPlannerRoutes = require("./routes/aiPlannerRoutes");
const geoRoutes = require("./routes/geoRoutes");
const weatherRoutes = require("./routes/weatherRoutes");
const safetyRoutes = require("./routes/safetyRoutes");
const userDiscoveryRoutes = require("./routes/userDiscoveryRoutes");
const groupRoutes = require("./routes/groupRoutes");
const adminRoutes = require("./routes/adminRoutes");

// Health check endpoint (for Render/uptime monitoring)
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    dbConnected,
    database: "PostgreSQL",
    timestamp: new Date().toISOString(),
  });
});

app.get("/", (req, res) => {
  res.json({
    name: "SoloTravel API",
    version: "1.0.0",
    status: "running",
    dbConnected,
    database: "PostgreSQL",
    message: dbConnected
      ? "Connected to PostgreSQL"
      : "Using sample data (PostgreSQL not connected)",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/destinations", destinationRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/ai", aiPlannerRoutes);
app.use("/api/geo", geoRoutes);
app.use("/api/weather", weatherRoutes);
app.use("/api/safety", safetyRoutes);
app.use("/api/users", userDiscoveryRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/admin", adminRoutes);

// ===== 404 HANDLER =====
app.use((req, res) => {
  res.status(404).json({ error: `Endpoint not found: ${req.method} ${req.originalUrl}` });
});

// ===== GLOBAL ERROR HANDLER =====
app.use(standardErrorHandler);

// ===== START =====
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || "development"}`);
<<<<<<< HEAD
  console.log(`   Database: PostgreSQL`);
=======
  console.log(`   Real-Time Socket.IO: Activated on port ${PORT}`);
>>>>>>> 8588af7 (Update project)
});