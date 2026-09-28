const rateLimit = require("express-rate-limit");

/**
 * Deep sanitize helper: cleans prohibited MongoDB injection operators ($ and .)
 */
const cleanObject = (obj) => {
  if (!obj || typeof obj !== "object") return obj;

  if (Array.isArray(obj)) {
    return obj.map(cleanObject);
  }

  const sanitized = {};
  for (const key of Object.keys(obj)) {
    // Block keys starting with $ (MongoDB operators) or containing dots (path injection)
    if (key.startsWith("$") || key.includes(".")) {
      continue;
    }
    const val = obj[key];
    sanitized[key] = typeof val === "object" ? cleanObject(val) : val;
  }
  return sanitized;
};

/**
 * NoSQL Injection Protection Middleware
 */
const sanitizeNoSql = (req, res, next) => {
  if (req.body) req.body = cleanObject(req.body);
  if (req.query) req.query = cleanObject(req.query);
  if (req.params) req.params = cleanObject(req.params);
  next();
};

/**
 * XSS Protection Middleware: Strips script tags & inline javascript URLs from string inputs
 */
const xssCleanValue = (val) => {
  if (typeof val !== "string") return val;
  return val
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/onload=/gi, "")
    .replace(/onerror=/gi, "");
};

const cleanXssObject = (obj) => {
  if (!obj || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(cleanXssObject);

  const cleaned = {};
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (typeof val === "string") {
      cleaned[key] = xssCleanValue(val);
    } else if (typeof val === "object") {
      cleaned[key] = cleanXssObject(val);
    } else {
      cleaned[key] = val;
    }
  }
  return cleaned;
};

const xssSanitizer = (req, res, next) => {
  if (req.body) req.body = cleanXssObject(req.body);
  if (req.query) req.query = cleanXssObject(req.query);
  next();
};

/**
 * Strict Rate Limiter for Authentication endpoints (Login & Register)
 * Max 25 attempts per 15 minutes to prevent brute-force attacks
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 25,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many authentication attempts from this IP. Please try again after 15 minutes."
  }
});

/**
 * General API Rate Limiter
 * Max 300 requests per 15 minutes
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many requests, please slow down and try again shortly."
  }
});

/**
 * Centralized Global Error Handler with HTTP Status Code Mapping
 */
const standardErrorHandler = (err, req, res, next) => {
  console.error("API Error:", err.name || "Error", "-", err.message);

  // 400: Mongoose Validation Error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors || {}).map((e) => e.message);
    return res.status(400).json({
      error: "Validation failed",
      details: messages.length > 0 ? messages : err.message
    });
  }

  // 400: Cast Error (Invalid MongoDB ObjectId)
  if (err.name === "CastError") {
    return res.status(400).json({
      error: `Invalid format for resource identifier: ${err.value}`
    });
  }

  // 409: MongoDB Duplicate Key Error (E11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || "resource";
    return res.status(409).json({
      error: `An account or record with this ${field} already exists.`
    });
  }

  // 401: JWT Authentication Errors
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return res.status(401).json({
      error: err.name === "TokenExpiredError" ? "Token expired. Please log in again." : "Invalid authentication token."
    });
  }

  // Default Status Code
  const status = err.status || err.statusCode || 500;
  const message =
    process.env.NODE_ENV === "production" && status === 500
      ? "An internal server error occurred. Please try again later."
      : err.message || "Internal server error";

  res.status(status).json({ error: message });
};

module.exports = {
  sanitizeNoSql,
  xssSanitizer,
  authLimiter,
  apiLimiter,
  standardErrorHandler
};
