const http = require("http");

const request = (method, path, body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const headers = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const options = {
      hostname: "localhost",
      port: 5000,
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
  console.log("🚀 Starting Phase 2 Backend Auth & User Profile Tests...\n");
  let passed = 0;
  let failed = 0;

  function assert(condition, name, details = "") {
    if (condition) {
      console.log(`✅ PASS: ${name}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${name} ${details}`);
      failed++;
    }
  }

  try {
    const testUserEmail = `test_kiran_${Date.now()}@solotravel.in`;
    let userToken = null;
    let adminToken = null;

    // 1. User Registration
    const regRes = await request("POST", "/api/auth/register", {
      name: "Kiran Solo",
      email: testUserEmail,
      password: "Password@123",
      travelInterests: ["Trekking", "Photography"],
      preferredDestinations: ["Himachal Pradesh", "Ladakh"],
      travelStyle: "Adventure Seeker",
    });

    assert(
      regRes.status === 201 &&
        regRes.body.token &&
        regRes.body.user &&
        regRes.body.user.email === testUserEmail &&
        regRes.body.user.role === "USER" &&
        !regRes.body.user.password,
      "User Registration: creates user, hashes password, returns valid JWT token and profile"
    );
    userToken = regRes.body.token;

    // 2. Duplicate Email Rejection
    const dupRes = await request("POST", "/api/auth/register", {
      name: "Duplicate Kiran",
      email: testUserEmail,
      password: "Password@123",
    });
    assert(
      dupRes.status === 400 && dupRes.body.error,
      "Duplicate email registration is REJECTED with 400 Bad Request"
    );

    // 3. Password Validation (< 6 chars)
    const weakPassRes = await request("POST", "/api/auth/register", {
      name: "Weak Pass",
      email: `weak_${Date.now()}@solotravel.in`,
      password: "123",
    });
    assert(
      weakPassRes.status === 400,
      "Short password (< 6 chars) is REJECTED with 400 Bad Request"
    );

    // 4. Invalid Email Validation
    const badEmailRes = await request("POST", "/api/auth/register", {
      name: "Bad Email",
      email: "invalid-email-address",
      password: "Password@123",
    });
    assert(
      badEmailRes.status === 400,
      "Malformed email is REJECTED with 400 Bad Request"
    );

    // 5. User Login
    const loginRes = await request("POST", "/api/auth/login", {
      email: testUserEmail,
      password: "Password@123",
    });
    assert(
      loginRes.status === 200 &&
        loginRes.body.token &&
        loginRes.body.user.email === testUserEmail,
      "User Login: authenticates registered user and returns JWT token"
    );

    // 6. Pre-seeded Demo Traveler Login
    const travelerLoginRes = await request("POST", "/api/auth/login", {
      email: "aarav@solotravel.in",
      password: "Travel@123",
    });
    assert(
      travelerLoginRes.status === 200 &&
        travelerLoginRes.body.user.role === "USER" &&
        travelerLoginRes.body.user.name === "Aarav Sharma",
      "Demo Traveler Login (aarav@solotravel.in) succeeds with USER role"
    );

    // 7. Pre-seeded Demo Admin Login
    const adminLoginRes = await request("POST", "/api/auth/login", {
      email: "admin@solotravel.in",
      password: "Admin@123",
    });
    assert(
      adminLoginRes.status === 200 &&
        adminLoginRes.body.user.role === "ADMIN",
      "Demo Admin Login (admin@solotravel.in) succeeds with ADMIN role"
    );
    adminToken = adminLoginRes.body.token;

    // 8. Wrong Password Rejection
    const badLoginRes = await request("POST", "/api/auth/login", {
      email: testUserEmail,
      password: "WrongPassword!456",
    });
    assert(
      badLoginRes.status === 401,
      "Incorrect password is REJECTED with 401 Unauthorized"
    );

    // 9. Protected Route GET /api/auth/me without token -> 401
    const unauthMe = await request("GET", "/api/auth/me");
    assert(
      unauthMe.status === 401,
      "Protected route /api/auth/me without token is REJECTED with 401 Unauthorized"
    );

    // 10. Protected Route GET /api/auth/me with valid token -> 200
    const authMe = await request("GET", "/api/auth/me", null, userToken);
    assert(
      authMe.status === 200 &&
        authMe.body.user &&
        authMe.body.user.email === testUserEmail,
      "Protected route /api/auth/me with Bearer token returns current user profile"
    );

    // 11. Profile Update PUT /api/auth/profile
    const updateRes = await request(
      "PUT",
      "/api/auth/profile",
      {
        name: "Kiran Mountain Wanderer",
        bio: "Trekking through Spiti Valley and living in monastery homestays.",
        travelStyle: "Slow Nomad",
        travelInterests: ["Trekking", "Spiritual", "Photography"],
        preferredDestinations: ["Himachal Pradesh", "Ladakh", "Uttarakhand"],
      },
      userToken
    );
    assert(
      updateRes.status === 200 &&
        updateRes.body.user.name === "Kiran Mountain Wanderer" &&
        updateRes.body.user.travelStyle === "Slow Nomad" &&
        updateRes.body.user.travelInterests.includes("Spiritual"),
      "Profile Update PUT /api/auth/profile successfully updates bio, travel style, and interests"
    );

    // 12. Authorization: Regular USER denied from Admin destination creation
    const userCreateDest = await request(
      "POST",
      "/api/destinations",
      {
        name: "Unauthorized Dest",
        state: "Rajasthan",
        district: "Jaipur",
        city: "Jaipur",
        description: "Should fail",
        image: "https://example.com/img.jpg",
      },
      userToken
    );
    assert(
      userCreateDest.status === 403,
      "Role Authorization: Regular USER attempting destination creation is REJECTED with 403 Forbidden"
    );

    // 13. Authorization: ADMIN permitted for Admin destination creation
    const testDestName = `Spiti Hidden Valley ${Date.now()}`;
    const adminCreateDest = await request(
      "POST",
      "/api/destinations",
      {
        name: testDestName,
        country: "India",
        state: "Himachal Pradesh",
        district: "Lahaul and Spiti",
        city: "Kaza",
        description: "High altitude desert valley with ancient Buddhist monasteries.",
        image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800",
        category: ["Adventure", "Spiritual"],
      },
      adminToken
    );
    assert(
      adminCreateDest.status === 201 && adminCreateDest.body.slug,
      "Role Authorization: ADMIN successfully creates Indian destination with 201 Created"
    );

    // 14. Admin Users Directory GET /api/auth/users
    const nonAdminUsersList = await request("GET", "/api/auth/users", null, userToken);
    assert(
      nonAdminUsersList.status === 403,
      "Admin endpoint GET /api/auth/users is REJECTED with 403 for non-admin"
    );

    const adminUsersList = await request("GET", "/api/auth/users", null, adminToken);
    assert(
      adminUsersList.status === 200 && adminUsersList.body.users.length >= 3,
      "Admin endpoint GET /api/auth/users successfully returns user directory for ADMIN"
    );

    // 15. Logout endpoint
    const logoutRes = await request("POST", "/api/auth/logout");
    assert(
      logoutRes.status === 200 && logoutRes.body.message,
      "Logout endpoint POST /api/auth/logout returns success message"
    );

    console.log("\n================================");
    console.log(`Total: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
    console.log("================================\n");

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error("Test execution failed:", err);
    process.exit(1);
  }
}

runTests();
