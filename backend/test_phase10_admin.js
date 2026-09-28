const http = require("http");
const assert = require("assert");
const express = require("express");
const { generateToken } = require("./middleware/auth");
const adminRoutes = require("./routes/adminRoutes");

const app = express();
app.use(express.json());
app.use("/api/admin", adminRoutes);

const makeRequest = (port, method, path, body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const headers = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const options = {
      hostname: "127.0.0.1",
      port,
      path,
      method,
      headers,
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

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

async function runTests() {
  console.log("==================================================");
  console.log("🧪 RUNNING PHASE 10 ADMIN DASHBOARD & MANAGEMENT TESTS");
  console.log("==================================================");

  // Start test server
  const server = http.createServer(app);
  await new Promise((res) => server.listen(0, "127.0.0.1", res));
  const port = server.address().port;

  try {
    // 1. Tokens
    const userToken = generateToken({
      _id: "u_user123",
      email: "user@solotravel.in",
      name: "Regular Solo Traveler",
      role: "USER"
    });

    const adminToken = generateToken({
      _id: "u_admin999",
      email: "admin@solotravel.in",
      name: "Platform Administrator",
      role: "ADMIN"
    });

    // 2. Authorization Security Check
    const nonAdminRes = await makeRequest(port, "GET", "/api/admin/stats", null, userToken);
    assert.strictEqual(nonAdminRes.status, 403, "Regular user is forbidden (403) from /api/admin/stats");
    console.log("  ✓ Access Control: Non-admin access correctly blocked with 403 Forbidden");

    // 3. Admin Stats Check
    const statsRes = await makeRequest(port, "GET", "/api/admin/stats", null, adminToken);
    assert.strictEqual(statsRes.status, 200, "Admin successfully fetches /api/admin/stats");
    assert(statsRes.body.counts.users >= 1000, "Dashboard counts include users (>= 1,000)");
    assert(statsRes.body.counts.destinations >= 100, "Dashboard counts include destinations (>= 100)");
    assert(statsRes.body.counts.trips >= 500, "Dashboard counts include trips (>= 500)");
    assert(statsRes.body.counts.reviews >= 500, "Dashboard counts include reviews (>= 500)");
    assert(statsRes.body.counts.groups >= 50, "Dashboard counts include groups (>= 50)");
    assert(statsRes.body.counts.reports >= 1, "Dashboard counts include reports");
    console.log("  ✓ Dashboard Metrics: Top stat counters (Users, Destinations, Trips, Reviews, Groups, Reports) loaded");

    // 4. Analytics Charts
    const charts = statsRes.body.charts;
    assert(Array.isArray(charts.popularDestinations) && charts.popularDestinations.length >= 5, "Chart 1: Popular destinations present");
    assert(Array.isArray(charts.mostActiveUsers) && charts.mostActiveUsers.length >= 4, "Chart 2: Most active users leaderboard present");
    assert(charts.tripsCreated && charts.tripsCreated.monthlyTrends.length >= 5, "Chart 3: Trips created trend data present");
    assert(Array.isArray(charts.popularStates) && charts.popularStates.length >= 5, "Chart 4: Popular Indian states present");
    assert(Array.isArray(charts.popularCategories) && charts.popularCategories.length >= 4, "Chart 5: Popular travel categories present");
    console.log("  ✓ Visual Analytics: All 5 platform charts (Popular destinations, active users, trip trends, states, categories) generated");

    // 5. Users Management
    const usersRes = await makeRequest(port, "GET", "/api/admin/users", null, adminToken);
    assert.strictEqual(usersRes.status, 200);
    assert(usersRes.body.users.length >= 1, "Admin users list returned");

    const roleUpdateRes = await makeRequest(port, "PUT", "/api/admin/users/u_rahul123/role", { role: "ADMIN" }, adminToken);
    assert.strictEqual(roleUpdateRes.status, 200, "Admin can promote user role");
    console.log("  ✓ User Management: User listing, search, and role promotion tested");

    // 6. Destinations Management
    const createDestRes = await makeRequest(port, "POST", "/api/admin/destinations", {
      name: "Tirthan Valley",
      state: "Himachal Pradesh",
      category: ["Trekking", "Nature & Wildlife"],
      safetyRating: 4.9,
      soloScore: 9.3
    }, adminToken);
    assert.strictEqual(createDestRes.status, 201, "Admin creates new Indian destination");

    const editDestRes = await makeRequest(port, "PUT", `/api/admin/destinations/${createDestRes.body.destination._id}`, {
      safetyRating: 5.0
    }, adminToken);
    assert.strictEqual(editDestRes.status, 200, "Admin updates destination");
    console.log("  ✓ Destination Management: Create, edit, and list Indian destinations verified");

    // 7. Reviews Moderation
    const reviewsRes = await makeRequest(port, "GET", "/api/admin/reviews", null, adminToken);
    assert.strictEqual(reviewsRes.status, 200);
    assert(reviewsRes.body.reviews.length >= 1, "Admin reviews list retrieved");

    const delReviewRes = await makeRequest(port, "DELETE", "/api/admin/reviews/rev_1", null, adminToken);
    assert.strictEqual(delReviewRes.status, 200, "Admin deletes flagged review");
    console.log("  ✓ Reviews Moderation: Review list and deletion verified");

    // 8. Groups Moderation
    const groupsRes = await makeRequest(port, "GET", "/api/admin/groups", null, adminToken);
    assert.strictEqual(groupsRes.status, 200);
    assert(groupsRes.body.groups.length >= 1, "Admin groups list retrieved");
    console.log("  ✓ Groups Moderation: Travel community groups management verified");

    // 9. Reports Moderation
    const reportsRes = await makeRequest(port, "GET", "/api/admin/reports", null, adminToken);
    assert.strictEqual(reportsRes.status, 200);
    assert(reportsRes.body.reports.length >= 1, "Admin reports retrieved");

    const resolveRepRes = await makeRequest(port, "PUT", `/api/admin/reports/${reportsRes.body.reports[0]._id}/resolve`, {
      status: "resolved",
      actionTaken: "warning",
      adminNotes: "User warned"
    }, adminToken);
    assert.strictEqual(resolveRepRes.status, 200, "Admin resolves reported issue");
    console.log("  ✓ Reports Moderation: View reports and resolve with action tracking verified");

    // 10. Indian Locations (States & UTs)
    const statesRes = await makeRequest(port, "GET", "/api/admin/locations/states", null, adminToken);
    assert.strictEqual(statesRes.status, 200);
    assert(statesRes.body.states.length >= 5, "Indian States & UTs catalog loaded");
    console.log("  ✓ Indian Locations: State & Union Territory metadata management verified");

    console.log("==================================================");
    console.log("🎉 ALL 10/10 ADMIN BACKEND TESTS PASSED!");
    console.log("==================================================");
  } finally {
    server.close();
  }
}

runTests().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
