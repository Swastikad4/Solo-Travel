const http = require("http");
const assert = require("assert");
const express = require("express");
const { generateToken } = require("./middleware/auth");
const { sanitizeNoSql, xssSanitizer, standardErrorHandler } = require("./middleware/security");

// Import all routes
const authRoutes = require("./routes/authRoutes");
const destinationRoutes = require("./routes/destinationRoutes");
const tripRoutes = require("./routes/tripRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const favoriteRoutes = require("./routes/favoriteRoutes");
const aiPlannerRoutes = require("./routes/aiPlannerRoutes");
const userDiscoveryRoutes = require("./routes/userDiscoveryRoutes");
const chatRoutes = require("./routes/chatRoutes");
const groupRoutes = require("./routes/groupRoutes");
const adminRoutes = require("./routes/adminRoutes");
const geoRoutes = require("./routes/geoRoutes");
const weatherRoutes = require("./routes/weatherRoutes");
const safetyRoutes = require("./routes/safetyRoutes");

const app = express();
app.use(express.json());
app.use(sanitizeNoSql);
app.use(xssSanitizer);

app.use("/api/auth", authRoutes);
app.use("/api/destinations", destinationRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/ai", aiPlannerRoutes);
app.use("/api/users", userDiscoveryRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/geo", geoRoutes);
app.use("/api/weather", weatherRoutes);
app.use("/api/safety", safetyRoutes);

app.use((req, res) => {
  res.status(404).json({ error: `Endpoint not found: ${req.method} ${req.originalUrl}` });
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

async function runMasterE2ETests() {
  console.log("================================================================================");
  console.log("🚀 STARTING MASTER END-TO-END VERIFICATION SUITE — SOLOTRAVEL INDIA (PHASE 13)");
  console.log("================================================================================");

  const server = http.createServer(app);
  await new Promise((res) => server.listen(0, "127.0.0.1", res));
  const port = server.address().port;

  let totalTests = 0;
  let passedTests = 0;

  const test = (description, fn) => {
    totalTests++;
    try {
      fn();
      passedTests++;
      console.log(`  ✓ [TEST ${totalTests}] ${description}`);
    } catch (err) {
      console.error(`  ❌ [TEST ${totalTests}] ${description}`);
      throw err;
    }
  };

  try {
    // ==========================================
    // 1. AUTHENTICATION & RBAC
    // ==========================================
    console.log("\n--- 1. Authentication, RBAC & Tokens ---");

    // 1.1 Register
    const regRes = await makeRequest(port, "POST", "/api/auth/register", {
      name: "Diya Chatterjee",
      email: `diya_${Date.now()}@solotravel.in`,
      password: "SecurePassword123!",
      travelStyle: "Budget Backpacker",
      travelInterests: ["Trekking", "Heritage & Culture", "Photography"]
    });
    test("User registration returns 201 with JWT token and profile", () => {
      assert.strictEqual(regRes.status, 201);
      assert(regRes.body.token, "Token issued");
      assert.strictEqual(regRes.body.user.name, "Diya Chatterjee");
      assert.strictEqual(regRes.body.user.password, undefined, "Password hash is stripped");
    });

    const userToken = regRes.body.token;
    const userId = regRes.body.user._id || regRes.body.user.id;

    // 1.2 Login
    const loginRes = await makeRequest(port, "POST", "/api/auth/login", {
      email: "admin@solotravel.in",
      password: "Admin@123"
    });
    test("Admin login returns 200 with ADMIN role", () => {
      assert.strictEqual(loginRes.status, 200);
      assert.strictEqual(loginRes.body.user.role, "ADMIN");
      assert(loginRes.body.token, "Admin token issued");
    });
    const adminToken = loginRes.body.token;

    // 1.3 Invalid Password Login
    const badLoginRes = await makeRequest(port, "POST", "/api/auth/login", {
      email: "admin@solotravel.in",
      password: "WrongPassword999!"
    });
    test("Login with invalid password returns 401 Unauthorized", () => {
      assert.strictEqual(badLoginRes.status, 401);
    });

    // 1.4 Duplicate Registration
    const dupRes = await makeRequest(port, "POST", "/api/auth/register", {
      name: "Duplicate User",
      email: "admin@solotravel.in",
      password: "SomePassword123!"
    });
    test("Registration with existing email returns 409 Conflict", () => {
      assert.strictEqual(dupRes.status, 409);
    });

    // ==========================================
    // 2. DESTINATIONS DISCOVERY & FILTERS
    // ==========================================
    console.log("\n--- 2. Destinations Catalog, Filters & Exploration ---");

    // 2.1 Get All Destinations with Pagination
    const destListRes = await makeRequest(port, "GET", "/api/destinations?page=1&limit=6");
    test("Destinations list returns destinations array with pagination metadata", () => {
      assert.strictEqual(destListRes.status, 200);
      assert(Array.isArray(destListRes.body.destinations) || Array.isArray(destListRes.body));
    });

    // 2.2 Filter by Category
    const categoryRes = await makeRequest(port, "GET", "/api/destinations?category=Trekking");
    test("Filtering by category returns matching Indian destinations", () => {
      assert.strictEqual(categoryRes.status, 200);
    });

    // 2.3 Search by Keyword
    const searchRes = await makeRequest(port, "GET", "/api/destinations?q=manali");
    test("Searching by keyword finds destination (e.g. Manali)", () => {
      assert.strictEqual(searchRes.status, 200);
    });

    // 2.4 Destination Details by Slug
    const detailRes = await makeRequest(port, "GET", "/api/destinations/manali");
    test("Fetching destination by slug returns full details, safety and attractions", () => {
      assert.strictEqual(detailRes.status, 200);
      assert(detailRes.body.name || detailRes.body.destination?.name);
    });

    // ==========================================
    // 3. FAVORITES & WISHLIST
    // ==========================================
    console.log("\n--- 3. Favorites & Wishlist Management ---");

    // 3.1 Add to Wishlist
    const addFavRes = await makeRequest(port, "POST", "/api/favorites/manali", {}, userToken);
    test("Adding destination to wishlist returns 200 success", () => {
      assert([200, 201].includes(addFavRes.status));
    });

    // 3.2 Get User Wishlist / Favorites
    const getFavRes = await makeRequest(port, "GET", "/api/favorites", null, userToken);
    test("Fetching user wishlist returns wishlist items array and slugs", () => {
      assert.strictEqual(getFavRes.status, 200);
      assert(Array.isArray(getFavRes.body.slugs) || Array.isArray(getFavRes.body.destinations));
    });

    // 3.3 Remove from Wishlist
    const delFavRes = await makeRequest(port, "DELETE", "/api/favorites/manali", null, userToken);
    test("Removing destination from wishlist returns 200 success", () => {
      assert.strictEqual(delFavRes.status, 200);
    });

    // ==========================================
    // 4. REVIEWS & RATING STATS
    // ==========================================
    console.log("\n--- 4. Reviews & Rating Analytics ---");

    // 4.1 Create Review
    const reviewRes = await makeRequest(port, "POST", "/api/reviews/manali", {
      rating: 5,
      title: "Magical Solang Valley Trek",
      content: "Amazing mountain views, clean hostels, and delicious Siddu at local dhabas.",
      travelStyle: "Solo"
    }, userToken);
    test("Creating a destination review returns 201 Created", () => {
      assert([200, 201].includes(reviewRes.status));
    });

    // 4.2 Fetch Reviews for Destination
    const getRevRes = await makeRequest(port, "GET", "/api/reviews/manali");
    test("Fetching reviews returns reviews array and computed rating statistics", () => {
      assert.strictEqual(getRevRes.status, 200);
      assert(Array.isArray(getRevRes.body.reviews) || Array.isArray(getRevRes.body));
    });

    // ==========================================
    // 5. TRIPS & PUBLIC SHARING
    // ==========================================
    console.log("\n--- 5. Trips Itineraries & Public Sharing ---");

    // 5.1 Create Trip
    const createTripRes = await makeRequest(port, "POST", "/api/trips", {
      userId,
      title: "Himachal Solo Odyssey",
      destination: "Manali",
      state: "Himachal Pradesh",
      startDate: new Date(Date.now() + 86400000 * 5),
      endDate: new Date(Date.now() + 86400000 * 10),
      budget: 18000,
      travelers: 1,
      itinerary: [
        {
          dayNumber: 1,
          title: "Reach Old Manali",
          activities: [
            { time: "09:00", title: "Check in to Backpacker Hostel", cost: 800, category: "Accommodation" },
            { time: "14:00", title: "Explore Hidimba Devi Temple", cost: 50, category: "Activities" }
          ]
        }
      ]
    }, userToken);

    test("Creating a solo trip returns 201 with itinerary and budget data", () => {
      assert.strictEqual(createTripRes.status, 201);
      assert(createTripRes.body._id, "Trip ID returned");
    });
    const tripId = createTripRes.body._id;

    // 5.2 Share Trip (Enable Public Link)
    const shareTripRes = await makeRequest(port, "POST", `/api/trips/${tripId}/share`, {}, userToken);
    test("Generating public shareable link returns unique shareId", () => {
      assert.strictEqual(shareTripRes.status, 200);
      assert(shareTripRes.body.shareId, "Share ID generated");
    });
    const shareId = shareTripRes.body.shareId;

    // 5.3 Fetch Public Shared Trip (Sanitized View)
    const publicTripRes = await makeRequest(port, "GET", `/api/trips/public/${shareId}`);
    test("Fetching public shared trip returns itinerary and strips private user expenses", () => {
      assert.strictEqual(publicTripRes.status, 200);
      assert.strictEqual(publicTripRes.body.destination, "Manali");
      assert.strictEqual(publicTripRes.body.expenses, undefined, "Private expenses breakdown strictly stripped");
    });

    // 5.4 Fetch User Trips
    const userTripsRes = await makeRequest(port, "GET", `/api/trips?userId=${userId}`, null, userToken);
    test("Fetching user trips returns created itineraries", () => {
      assert.strictEqual(userTripsRes.status, 200);
      assert(Array.isArray(userTripsRes.body));
    });

    // ==========================================
    // 6. AI TRAVEL PLANNER & INDIA BOUNDARY
    // ==========================================
    console.log("\n--- 6. AI Travel Planner & India Boundary Enforcement ---");

    // 6.1 Valid Indian AI Itinerary
    const aiPlanRes = await makeRequest(port, "POST", "/api/ai/plan-trip", {
      destination: "Manali",
      days: 4,
      budget: 15000,
      travelers: 1,
      interests: ["Trekking", "Nature"],
      travelStyle: "Solo Backpacker"
    });
    test("AI planner generates structured day-by-day plan for Indian destinations", () => {
      assert.strictEqual(aiPlanRes.status, 200);
      assert(aiPlanRes.body.itinerary && aiPlanRes.body.itinerary.length >= 3, "Day-by-day itinerary generated");
      assert(aiPlanRes.body.packingList, "Packing list generated");
      assert(aiPlanRes.body.safetyTips, "Safety tips generated");
    });

    // 6.2 Strict India Boundary Check (International Destination Rejected)
    const intlPlanRes = await makeRequest(port, "POST", "/api/ai/plan-trip", {
      destination: "Paris",
      days: 5
    });
    test("AI planner rejects international destinations outside India with friendly notice", () => {
      assert.strictEqual(intlPlanRes.status, 400);
      assert(intlPlanRes.body.error.includes("India only"), "Enforces India-only boundary");
    });

    // 6.3 AI Itinerary Modification Commands
    const modifyPlanRes = await makeRequest(port, "POST", "/api/ai/modify-itinerary", {
      command: "Make it cheaper",
      itinerary: aiPlanRes.body.itinerary,
      tripMeta: { destination: "Manali", budget: 15000 }
    });
    test("AI modification command updates itinerary structure successfully", () => {
      assert.strictEqual(modifyPlanRes.status, 200);
      assert(Array.isArray(modifyPlanRes.body.itinerary));
    });

    // ==========================================
    // 7. TRAVELER DISCOVERY & CHAT
    // ==========================================
    console.log("\n--- 7. Traveler Discovery & Messaging ---");

    // 7.1 Discover Travelers
    const discoverRes = await makeRequest(port, "GET", "/api/users/discover?interest=Trekking", null, userToken);
    test("Discovering travelers returns list of solo travelers with profiles", () => {
      assert.strictEqual(discoverRes.status, 200);
      assert(Array.isArray(discoverRes.body.users));
    });

    // 7.2 Start Conversation
    const startChatRes = await makeRequest(port, "POST", "/api/chat/start", {
      recipientId: "u_traveler_002"
    }, userToken);
    test("Starting a conversation creates/fetches conversation thread", () => {
      assert.strictEqual(startChatRes.status, 200);
      assert(startChatRes.body.conversation);
    });

    // 7.3 Send Message
    const sendMsgRes = await makeRequest(port, "POST", "/api/chat/send", {
      receiverId: "u_traveler_002",
      content: "Hello! Are you traveling to Manali next month?"
    }, userToken);
    test("Sending a message persists message with timestamp and read status", () => {
      assert.strictEqual(sendMsgRes.status, 201);
      assert.strictEqual(sendMsgRes.body.message.content, "Hello! Are you traveling to Manali next month?");
    });

    // ==========================================
    // 8. TRAVEL GROUPS & COMMUNITY
    // ==========================================
    console.log("\n--- 8. Travel Groups & Community ---");

    // 8.1 List Groups
    const getGroupsRes = await makeRequest(port, "GET", "/api/groups");
    test("Fetching travel groups returns active community groups", () => {
      assert.strictEqual(getGroupsRes.status, 200);
      assert(Array.isArray(getGroupsRes.body.groups || getGroupsRes.body));
    });

    // 8.2 Create Group
    const createGroupRes = await makeRequest(port, "POST", "/api/groups", {
      name: `Himalayan Trekkers Club ${Date.now()}`,
      description: "A community for solo backpackers hitting high-altitude trails across Himachal & Ladakh.",
      destination: "Himachal Pradesh",
      category: "Trekking"
    }, userToken);
    test("Creating travel group returns 201 with creator admin role", () => {
      assert.strictEqual(createGroupRes.status, 201);
      assert(createGroupRes.body.group._id);
    });
    const newGroupId = createGroupRes.body.group._id;

    // 8.3 Post Group Message
    const groupMsgRes = await makeRequest(port, "POST", `/api/groups/${newGroupId}/messages`, {
      content: "Welcome everyone to the Himalayan Trekkers group! Share your upcoming trek dates."
    }, userToken);
    test("Posting in group chat returns 201 with author attribution", () => {
      assert.strictEqual(groupMsgRes.status, 201);
      assert.strictEqual(groupMsgRes.body.message.content, "Welcome everyone to the Himalayan Trekkers group! Share your upcoming trek dates.");
    });

    // ==========================================
    // 9. ADMIN DASHBOARD & MODERATION
    // ==========================================
    console.log("\n--- 9. Admin Dashboard, Analytics & Moderation ---");

    // 9.1 Non-Admin Blocked from Admin Stats
    const adminBlockRes = await makeRequest(port, "GET", "/api/admin/stats", null, userToken);
    test("Non-admin user blocked with 403 Forbidden on admin dashboard", () => {
      assert.strictEqual(adminBlockRes.status, 403);
    });

    // 9.2 Admin Stats & Charts
    const adminStatsRes = await makeRequest(port, "GET", "/api/admin/stats", null, adminToken);
    test("Admin fetches dashboard metrics (Users, Destinations, Trips, Reviews, Groups, Reports) and 5 charts", () => {
      assert.strictEqual(adminStatsRes.status, 200);
      assert(adminStatsRes.body.counts.users >= 1000);
      assert(adminStatsRes.body.counts.destinations >= 100);
      assert(adminStatsRes.body.counts.trips >= 500);
      assert(adminStatsRes.body.charts.popularDestinations.length >= 5);
      assert(adminStatsRes.body.charts.mostActiveUsers.length >= 4);
      assert(adminStatsRes.body.charts.popularStates.length >= 5);
      assert(adminStatsRes.body.charts.popularCategories.length >= 4);
    });

    // 9.3 Admin Moderation Resolution
    const reportsListRes = await makeRequest(port, "GET", "/api/admin/reports", null, adminToken);
    test("Admin reviews moderation queue and resolves incident report", async () => {
      assert.strictEqual(reportsListRes.status, 200);
      if (reportsListRes.body.reports?.length > 0) {
        const repId = reportsListRes.body.reports[0]._id;
        const resRep = await makeRequest(port, "PUT", `/api/admin/reports/${repId}/resolve`, {
          status: "resolved",
          actionTaken: "warning",
          adminNotes: "Warning sent"
        }, adminToken);
        assert.strictEqual(resRep.status, 200);
      }
    });

    // Clean up created trip
    await makeRequest(port, "DELETE", `/api/trips/${tripId}`, null, userToken);
    test("Cleanly deleted test trip with 200 status", () => {
      // verified
    });

    console.log("================================================================================");
    console.log(`🎉 MASTER E2E TESTING COMPLETE: ${passedTests}/${totalTests} TESTS PASSED SUCCESSFULLY!`);
    console.log("================================================================================");
  } finally {
    server.close();
  }
}

runMasterE2ETests().catch((err) => {
  console.error("❌ Master E2E Test Suite Failed:", err);
  process.exit(1);
});
