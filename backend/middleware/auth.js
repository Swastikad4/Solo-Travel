const jwt = require("jsonwebtoken");

const JWT_SECRET =
  process.env.JWT_SECRET || "solotravel_secret_key_super_secure_india_2026";

/**
 * Generate a signed JWT token
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id ? String(user._id) : user.id,
      email: user.email,
      name: user.name,
      role: user.role || "USER",
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
};

/**
 * Authenticate middleware: verifies Bearer JWT token
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Access denied. Authentication token required.",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired. Please log in again." });
    }
    return res.status(401).json({ error: "Invalid token. Authentication failed." });
  }
};

/**
 * Require Admin role middleware
 */
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required." });
  }

  if (req.user.role !== "ADMIN") {
    return res.status(403).json({
      error: "Access forbidden. Administrator role required for this action.",
    });
  }

  next();
};

module.exports = {
  JWT_SECRET,
  generateToken,
  authenticate,
  requireAdmin,
};
