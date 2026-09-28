const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { sampleUsers } = require("../data/sampleUsers");
const { generateToken, authenticate, requireAdmin } = require("../middleware/auth");

// In-memory users store for offline/fallback mode (initialized with sampleUsers)
const inMemoryUsers = [...sampleUsers];

// Helper: Sanitize user object (strip password)
const sanitizeUser = (user) => {
  const u = user.toObject ? user.toObject() : { ...user };
  delete u.password;
  return u;
};

// Helper: Email validation
const isValidEmail = (email) => {
  return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email);
};

// ==========================================
// 1. REGISTER
// ==========================================
router.post("/register", async (req, res) => {
  const {
    name,
    email,
    password,
    avatar,
    bio,
    travelInterests,
    preferredDestinations,
    travelStyle,
    role,
  } = req.body;

  // Validation
  if (!name || typeof name !== "string" || name.trim().length < 2) {
    return res.status(400).json({ error: "Name must be at least 2 characters long." });
  }

  if (!email || typeof email !== "string" || !isValidEmail(email.trim())) {
    return res.status(400).json({ error: "Please enter a valid email address." });
  }

  if (!password || typeof password !== "string" || password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters long." });
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Check in-memory user list
  const inMemoryExists = inMemoryUsers.some(
    (u) => u.email.toLowerCase() === normalizedEmail
  );
  if (inMemoryExists) {
    return res.status(409).json({ error: "An account with this email already exists." });
  }

  // Determine role: default USER, allow ADMIN if explicitly specified as ADMIN or bootstrap email
  let assignedRole = "USER";
  if (role === "ADMIN" || normalizedEmail.startsWith("admin@")) {
    assignedRole = "ADMIN";
  }

  const userData = {
    name: name.trim(),
    email: normalizedEmail,
    role: assignedRole,
    avatar:
      avatar && typeof avatar === "string" && avatar.trim()
        ? avatar.trim()
        : "https://api.dicebear.com/7.x/adventurer/svg?seed=Aria",
    bio: bio && typeof bio === "string" ? bio.trim().slice(0, 500) : "",
    travelInterests: Array.isArray(travelInterests) && travelInterests.length > 0
      ? travelInterests
      : ["Heritage & Culture", "Photography", "Street Food"],
    preferredDestinations: Array.isArray(preferredDestinations) && preferredDestinations.length > 0
      ? preferredDestinations
      : ["Rajasthan", "Himachal Pradesh", "Kerala"],
    travelStyle: travelStyle || "Cultural Explorer",
  };

  // 1. Try MongoDB if connected
  const isMongo = req.app.get("mongoConnected") && req.app.get("mongoConnected")();
  if (isMongo) {
    try {
      const existingDb = await User.findOne({ email: normalizedEmail }).maxTimeMS(2500);
      if (existingDb) {
        return res.status(409).json({ error: "An account with this email already exists." });
      }

      const user = new User({ ...userData, password });
      await user.save();

      // Sync to in-memory
      inMemoryUsers.push({
        _id: String(user._id),
        ...userData,
        password: user.password,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });

      const token = generateToken(user);
      return res.status(201).json({
        message: "Registration successful!",
        token,
        user: user.toJSON(),
      });
    } catch (err) {
      // Fall through to in-memory
    }
  }

  // 2. Fallback in-memory
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, salt);
  const newId = "u_" + Date.now();
  const now = new Date().toISOString();

  const memUser = {
    _id: newId,
    ...userData,
    password: hashedPassword,
    createdAt: now,
    updatedAt: now,
  };

  inMemoryUsers.push(memUser);

  const token = generateToken(memUser);
  res.status(201).json({
    message: "Registration successful!",
    token,
    user: sanitizeUser(memUser),
  });
});

// ==========================================
// 2. LOGIN
// ==========================================
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const normalizedEmail = email.trim().toLowerCase();

  // 1. Try MongoDB if connected
  const isMongo = req.app.get("mongoConnected") && req.app.get("mongoConnected")();
  if (isMongo) {
    try {
      const user = await User.findOne({ email: normalizedEmail }).maxTimeMS(2500);
      if (user) {
        const isMatch = await user.comparePassword(password);
        if (isMatch) {
          const token = generateToken(user);
          return res.json({
            message: "Login successful!",
            token,
            user: user.toJSON(),
          });
        }
      }
    } catch (err) {
      // Fall through to in-memory
    }
  }

  // 2. Fallback to in-memory
  const memUser = inMemoryUsers.find(
    (u) => u.email.toLowerCase() === normalizedEmail
  );

  if (memUser) {
    const isMatch = bcrypt.compareSync(password, memUser.password);
    if (isMatch) {
      const token = generateToken(memUser);
      return res.json({
        message: "Login successful!",
        token,
        user: sanitizeUser(memUser),
      });
    }
  }

  return res.status(401).json({ error: "Invalid email or password." });
});

// ==========================================
// 3. GET CURRENT USER PROFILE (/me)
// ==========================================
router.get("/me", authenticate, async (req, res) => {
  const userId = req.user.id;
  const email = req.user.email;

  // 1. Try MongoDB
  const isMongo = req.app.get("mongoConnected") && req.app.get("mongoConnected")();
  if (isMongo) {
    try {
      let user = null;
      if (userId && userId.length === 24) {
        user = await User.findById(userId).maxTimeMS(2500);
      }
      if (!user && email) {
        user = await User.findOne({ email }).maxTimeMS(2500);
      }
      if (user) {
        return res.json({ user: user.toJSON() });
      }
    } catch (err) {
      // Fall through to in-memory
    }
  }

  // 2. In-memory lookup
  const memUser = inMemoryUsers.find(
    (u) =>
      String(u._id) === String(userId) ||
      u.email.toLowerCase() === email.toLowerCase()
  );

  if (memUser) {
    return res.json({ user: sanitizeUser(memUser) });
  }

  res.status(404).json({ error: "User profile not found." });
});

// ==========================================
// 4. UPDATE PROFILE (/profile)
// ==========================================
router.put("/profile", authenticate, async (req, res) => {
  const userId = req.user.id;
  const email = req.user.email;
  const { name, bio, avatar, travelInterests, preferredDestinations, travelStyle } = req.body;

  // Validate updates
  const updates = {};
  if (name && typeof name === "string" && name.trim().length >= 2) {
    updates.name = name.trim();
  }
  if (bio !== undefined && typeof bio === "string") {
    updates.bio = bio.trim().slice(0, 500);
  }
  if (avatar && typeof avatar === "string" && avatar.trim()) {
    updates.avatar = avatar.trim();
  }
  if (Array.isArray(travelInterests)) {
    updates.travelInterests = travelInterests;
  }
  if (Array.isArray(preferredDestinations)) {
    updates.preferredDestinations = preferredDestinations;
  }
  if (travelStyle && typeof travelStyle === "string") {
    updates.travelStyle = travelStyle;
  }
  updates.updatedAt = new Date().toISOString();

  // 1. Try MongoDB
  const isMongo = req.app.get("mongoConnected") && req.app.get("mongoConnected")();
  if (isMongo) {
    try {
      let user = null;
      if (userId && userId.length === 24) {
        user = await User.findByIdAndUpdate(userId, { $set: updates }, { new: true }).maxTimeMS(2500);
      }
      if (!user && email) {
        user = await User.findOneAndUpdate({ email }, { $set: updates }, { new: true }).maxTimeMS(2500);
      }
      if (user) {
        // Sync memory
        const memIdx = inMemoryUsers.findIndex(
          (u) => String(u._id) === String(user._id) || u.email.toLowerCase() === email.toLowerCase()
        );
        if (memIdx !== -1) {
          inMemoryUsers[memIdx] = { ...inMemoryUsers[memIdx], ...updates };
        }
        return res.json({
          message: "Profile updated successfully!",
          user: user.toJSON(),
        });
      }
    } catch (err) {
      // Fall through to in-memory
    }
  }

  // 2. In-memory update
  const memIdx = inMemoryUsers.findIndex(
    (u) =>
      String(u._id) === String(userId) ||
      u.email.toLowerCase() === email.toLowerCase()
  );

  if (memIdx === -1) {
    return res.status(404).json({ error: "User not found." });
  }

  inMemoryUsers[memIdx] = {
    ...inMemoryUsers[memIdx],
    ...updates,
  };

  res.json({
    message: "Profile updated successfully!",
    user: sanitizeUser(inMemoryUsers[memIdx]),
  });
});

// ==========================================
// 5. LOGOUT
// ==========================================
router.post("/logout", (req, res) => {
  res.json({ message: "Logged out successfully." });
});

// ==========================================
// 6. ADMIN: GET ALL USERS
// ==========================================
router.get("/users", authenticate, requireAdmin, async (req, res) => {
  const isMongo = req.app.get("mongoConnected") && req.app.get("mongoConnected")();
  if (isMongo) {
    try {
      const users = await User.find().select("-password").maxTimeMS(2500);
      if (users && users.length > 0) {
        return res.json({ total: users.length, users });
      }
    } catch (err) {
      // Fall through to in-memory
    }
  }

  res.json({
    total: inMemoryUsers.length,
    users: inMemoryUsers.map(sanitizeUser),
  });
});

module.exports = router;
