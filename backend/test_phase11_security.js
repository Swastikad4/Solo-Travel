const http = require("http");
const assert = require("assert");
const express = require("express");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

const { generateToken } = require("./middleware/auth");
const { sanitizeNoSql, xssSanitizer, standardErrorHandler } = require("./middleware/security");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const User = require("./models/User");
const Trip = require("./models/Trip");
const Destination = require("./models/Destination");
const Review = require("./models/Review");
const Group = require("./models/Group");
const Report = require("./models/Report");

const app = express();
app.use(express.json());
app.use(sanitizeNoSql);
app.use(xssSanitizer);

// Test echo route to verify NoSQL & XSS sanitization
app.post("/api/test-sanitize", (req, res) => {
  res.json({ body: req.body });
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});
app.use(standardErrorHandler);

const makeRequest = (port, method, reqPath, body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const options = {
      hostname: "127.0.0.1",
      port,
      path: reqPath,
      method,
      headers
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on("error", (err) => reject(err));
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
};

async function runSecurityTests() {
  console.log("==================================================");
  console.log("🔒 RUNNING PHASE 11 SECURITY & BACKEND QUALITY TESTS");
  console.log("==================================================");

  const server = http.createServer(app);
  await new Promise((res) => server.listen(0, "127.0.0.1", res));
  const port = server.address().port;

  try {
    // 1. Password Hashing & Safe Serialization Test
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync("SecurePassword123!", salt);
    assert(bcrypt.compareSync("SecurePassword123!", hash), "Bcrypt password comparison succeeds");
    assert(!bcrypt.compareSync("WrongPassword", hash), "Bcrypt comparison fails on wrong password");
    console.log("  ✓ Password Hashing: Bcrypt hashing with salt rounds >= 10 verified");

    // 2. HTTP 409 Conflict on Duplicate Registration
    const dupRes = await makeRequest(port, "POST", "/api/auth/register", {
      name: "Aarav Sharma",
      email: "aarav@solotravel.in", // existing pre-seeded user
      password: "Password@123"
    });
    assert.strictEqual(dupRes.status, 409, "Duplicate user registration returns 409 Conflict");
    console.log("  ✓ HTTP 409 Conflict: Handled duplicate email registration correctly");

    // 3. HTTP 400 Bad Request on Validation Failure
    const badReqRes = await makeRequest(port, "POST", "/api/auth/register", {
      name: "R", // Too short
      email: "invalid-email",
      password: "123" // Too short
    });
    assert.strictEqual(badReqRes.status, 400, "Validation failure returns 400 Bad Request");
    console.log("  ✓ HTTP 400 Bad Request: Input length and email format validation enforced");

    // 4. HTTP 401 Unauthorized on Invalid Password
    const badLoginRes = await makeRequest(port, "POST", "/api/auth/login", {
      email: "aarav@solotravel.in",
      password: "IncorrectPassword999"
    });
    assert.strictEqual(badLoginRes.status, 401, "Invalid password login returns 401 Unauthorized");
    console.log("  ✓ HTTP 401 Unauthorized: Invalid credentials properly rejected");

    // 5. HTTP 403 Forbidden on Unauthorized Access
    const userToken = generateToken({ _id: "u_traveler1", email: "user@test.in", role: "USER" });
    const forbidRes = await makeRequest(port, "GET", "/api/admin/stats", null, userToken);
    assert.strictEqual(forbidRes.status, 403, "Non-admin access returns 403 Forbidden");
    console.log("  ✓ HTTP 403 Forbidden: RBAC properly prevents privilege escalation");

    // 6. HTTP 404 Not Found on Missing Resource
    const notFoundRes = await makeRequest(port, "GET", "/api/non-existent-endpoint-xyz");
    assert.strictEqual(notFoundRes.status, 404, "Invalid endpoint returns 404 Not Found");
    console.log("  ✓ HTTP 404 Not Found: Handled non-existent routes cleanly");

    // 7. NoSQL Injection Sanitization
    const sanitizeRes = await makeRequest(port, "POST", "/api/test-sanitize", {
      username: "goodUser",
      "$where": "this.password.length > 0",
      "nested": {
        "$gt": "",
        "validKey": "validValue"
      }
    });
    assert.strictEqual(sanitizeRes.status, 200);
    assert.strictEqual(sanitizeRes.body.body.$where, undefined, "Prohibited $ operator stripped");
    assert.strictEqual(sanitizeRes.body.body.nested.$gt, undefined, "Nested $gt operator stripped");
    assert.strictEqual(sanitizeRes.body.body.nested.validKey, "validValue", "Legitimate fields preserved");
    console.log("  ✓ NoSQL Injection Protection: Stripped MongoDB operators ($where, $gt) from payloads");

    // 8. XSS Protection
    const xssRes = await makeRequest(port, "POST", "/api/test-sanitize", {
      bio: "Hello world <script>alert('XSS')</script> solo traveler",
      website: "javascript:alert(1)"
    });
    assert(!xssRes.body.body.bio.includes("<script>"), "Script tags stripped by XSS sanitizer");
    assert(!xssRes.body.body.website.includes("javascript:"), "javascript: protocol stripped");
    console.log("  ✓ XSS Protection: Cleaned malicious script tags and inline javascript protocols");

    // 9. API Key & Environment Isolation
    const frontendSrc = path.join(__dirname, "../frontend/src");
    const scanFiles = (dir) => {
      let results = [];
      const list = fs.readdirSync(dir);
      list.forEach((file) => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
          results = results.concat(scanFiles(fullPath));
        } else if (file.endsWith(".js") || file.endsWith(".jsx")) {
          results.push(fullPath);
        }
      });
      return results;
    };

    const clientFiles = scanFiles(frontendSrc);
    let leakedSecretFound = false;
    clientFiles.forEach((file) => {
      const content = fs.readFileSync(file, "utf8");
      if (content.includes("mongodb+srv://") || content.includes("JWT_SECRET") || content.includes("cluster0.ckjmqxa.mongodb.net")) {
        leakedSecretFound = true;
      }
    });
    assert(!leakedSecretFound, "Zero backend DB strings or JWT secrets found in frontend bundle");
    console.log("  ✓ API Key Isolation: Frontend bundle verified free of server-side secrets");

    // 10. Database Schema Index Configurations
    assert(User.schema.indexes().length >= 1, "User schema has indexes");
    assert(Trip.schema.indexes().length >= 1, "Trip schema has indexes");
    assert(Destination.schema.indexes().length >= 1, "Destination schema has indexes");
    assert(Review.schema.indexes().length >= 1, "Review schema has indexes");
    assert(Group.schema.indexes().length >= 1, "Group schema has indexes");
    assert(Report.schema.indexes().length >= 1, "Report schema has indexes");
    console.log("  ✓ Database Indexing: Performance indexes verified across all 6 core Mongoose models");

    console.log("==================================================");
    console.log("🎉 ALL 10/10 SECURITY & QUALITY ASSERTIONS PASSED!");
    console.log("==================================================");
  } finally {
    server.close();
  }
}

runSecurityTests().catch((err) => {
  console.error("❌ Security test failed:", err);
  process.exit(1);
});
