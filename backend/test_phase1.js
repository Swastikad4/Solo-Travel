const http = require("http");

const request = (method, path, body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const headers = {
      "Content-Type": "application/json"
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const options = {
      hostname: "localhost",
      port: 5000,
      path,
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

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

async function runTests() {
  console.log("🚀 Starting Phase 1 Backend Verification Tests...\n");
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
    // 1. Check Indian States Endpoint
    const statesRes = await request("GET", "/api/destinations/locations/states");
    assert(
      statesRes.status === 200 &&
        statesRes.body.totalStates === 28 &&
        statesRes.body.totalUnionTerritories === 8 &&
        statesRes.body.states.length === 36,
      "Location States API returns all 28 States and 8 UTs (36 total)"
    );

    // 2. Check Destinations query & pagination
    const allDestsRes = await request("GET", "/api/destinations?limit=6&page=1");
    assert(
      allDestsRes.status === 200 &&
        allDestsRes.body.destinations &&
        allDestsRes.body.destinations.length > 0 &&
        allDestsRes.body.total > 0 &&
        allDestsRes.body.currentPage === 1,
      "Destinations query returns paginated Indian destinations with metadata"
    );

    // 3. State Filtering: Rajasthan
    const rajRes = await request("GET", "/api/destinations?state=Rajasthan");
    const allRaj = rajRes.body.destinations.every((d) => d.state === "Rajasthan");
    assert(
      rajRes.status === 200 && rajRes.body.destinations.length >= 2 && allRaj,
      "State filtering: ?state=Rajasthan returns only destinations in Rajasthan (Jaipur, Udaipur, etc.)"
    );

    // 4. Category Filtering: Spiritual
    const spirRes = await request("GET", "/api/destinations?category=Spiritual");
    const hasVaranasiOrRishikesh = spirRes.body.destinations.some(
      (d) => d.name === "Varanasi" || d.name === "Rishikesh"
    );
    assert(
      spirRes.status === 200 && hasVaranasiOrRishikesh,
      "Category filtering: ?category=Spiritual returns spiritual destinations"
    );

    // 5. Budget Sorting
    const sortRes = await request("GET", "/api/destinations?sortBy=budget_asc");
    const budgets = sortRes.body.destinations.map((d) => d.avgBudget.perDay);
    const isSorted = budgets.every((v, i, a) => !i || a[i - 1] <= v);
    assert(
      sortRes.status === 200 && isSorted,
      "Budget sorting: ?sortBy=budget_asc returns destinations in ascending order of daily cost"
    );

    // 6. Single Destination details by slug
    const singleRes = await request("GET", "/api/destinations/jaipur");
    assert(
      singleRes.status === 200 &&
        singleRes.body.name === "Jaipur" &&
        singleRes.body.country === "India" &&
        singleRes.body.attractions &&
        singleRes.body.attractions.length >= 4,
      "Single destination lookup: /api/destinations/jaipur returns full details and attractions"
    );

    // Admin login for protected CRUD tests
    const adminLoginRes = await request("POST", "/api/auth/login", {
      email: "admin@solotravel.in",
      password: "Admin@123"
    });
    const adminToken = adminLoginRes.body.token;

    // 7. Strict Validation: REJECT international destination (e.g. Paris, France)
    const intlRes = await request("POST", "/api/destinations", {
      name: "Paris",
      country: "France",
      state: "Ile-de-France",
      district: "Paris",
      city: "Paris",
      description: "A city in Europe",
      image: "https://example.com/paris.jpg"
    }, adminToken);
    assert(
      intlRes.status === 400 &&
        JSON.stringify(intlRes.body).includes("India-only platform"),
      "Strict validation: POST with country='France' is REJECTED with 400 Bad Request"
    );

    // 8. Strict Validation: REJECT invalid Indian state
    const invalidStateRes = await request("POST", "/api/destinations", {
      name: "Atlantis",
      country: "India",
      state: "Narnia",
      district: "Fantasy",
      city: "Magic",
      description: "Fictional place",
      image: "https://example.com/atlantis.jpg"
    }, adminToken);
    assert(
      invalidStateRes.status === 400 &&
        JSON.stringify(invalidStateRes.body).includes("Indian State or Union Territory"),
      "Strict validation: POST with invalid state 'Narnia' is REJECTED with 400 Bad Request"
    );

    // 9. Valid Indian Destination Creation
    const validCreateRes = await request("POST", "/api/destinations", {
      name: "Jodhpur Blue City",
      country: "India",
      state: "Rajasthan",
      district: "Jodhpur",
      city: "Jodhpur",
      townOrVillage: "Old Blue City",
      description: "Sun City of Mehrangarh fort and indigo colored lanes.",
      image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800",
      category: ["Heritage", "Architecture"],
      avgBudget: { min: 1000, max: 2500, perDay: 1500, tier: "Budget", currency: "INR (₹)" }
    }, adminToken);
    assert(
      validCreateRes.status === 201 &&
        validCreateRes.body.name === "Jodhpur Blue City" &&
        validCreateRes.body.slug === "jodhpur-blue-city" &&
        validCreateRes.body.country === "India",
      "Valid CRUD: POST creates new Indian destination with slug and 201 status"
    );

    // 10. Modification test (PUT)
    const putRes = await request("PUT", "/api/destinations/jodhpur-blue-city", {
      tagline: "The Majestic Sun City of India"
    }, adminToken);
    assert(
      putRes.status === 200 && putRes.body.tagline === "The Majestic Sun City of India",
      "Valid CRUD: PUT updates destination successfully"
    );

    // 11. Modification rejection test (attempt to change country to international)
    const badPutRes = await request("PUT", "/api/destinations/jodhpur-blue-city", {
      country: "Spain"
    }, adminToken);
    assert(
      badPutRes.status === 400,
      "Strict validation: PUT attempting to alter country to 'Spain' is REJECTED"
    );

    // 12. Deletion test (DELETE)
    const deleteRes = await request("DELETE", "/api/destinations/jodhpur-blue-city", null, adminToken);
    assert(
      deleteRes.status === 200 && deleteRes.body.message.includes("deleted"),
      "Valid CRUD: DELETE removes destination successfully"
    );

    // 13. Verify trip lookup for Indian destinations
    const tripsRes = await request("GET", "/api/trips/jaipur");
    assert(
      tripsRes.status === 200 && Array.isArray(tripsRes.body) && tripsRes.body.length >= 1,
      "Trip API: /api/trips/jaipur returns Indian destination trips"
    );

    console.log(`\n================================`);
    console.log(`Total: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
    console.log(`================================\n`);
  } catch (err) {
    console.error("Test runner error:", err);
  }
}

runTests();
