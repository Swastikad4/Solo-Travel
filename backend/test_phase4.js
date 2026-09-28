// Test script for Phase 4: Trip Planner + Budget API using native http
const http = require("http");

const request = (method, path, body = null) => {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: "localhost",
      port: 5000,
      path,
      method,
      headers: {
        "Content-Type": "application/json",
        ...(data ? { "Content-Length": Buffer.byteLength(data) } : {})
      }
    };

    const req = http.request(options, (res) => {
      let bodyStr = "";
      res.on("data", (chunk) => { bodyStr += chunk; });
      res.on("end", () => {
        let parsed = bodyStr;
        try { parsed = JSON.parse(bodyStr); } catch (e) {}
        resolve({ status: res.statusCode, data: parsed });
      });
    });

    req.on("error", (err) => reject(err));
    if (data) req.write(data);
    req.end();
  });
};

async function runTests() {
  console.log("🚀 Starting Phase 4 API Verification...\n");
  let passed = 0;
  let failed = 0;

  const assert = (condition, msg) => {
    if (condition) {
      console.log(`✅ PASS: ${msg}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${msg}`);
      failed++;
    }
  };

  try {
    // 1. Test template route
    console.log("--- 1. Testing Destination Templates ---");
    const tplRes = await request("GET", "/api/trips/templates/Jaipur?days=3");
    assert(tplRes.status === 200, "Get Jaipur template status 200");
    assert(Array.isArray(tplRes.data.itinerary) && tplRes.data.itinerary.length === 3, "Jaipur template returns 3 days");
    assert(tplRes.data.itinerary[0].activities.length > 0, "Day 1 has sample activities");

    // 2. Test trip creation
    console.log("\n--- 2. Testing Trip Creation ---");
    const newTripPayload = {
      userId: "TestSoloTraveler",
      title: "Royal Jaipur Solo Journey",
      destination: "Jaipur",
      state: "Rajasthan",
      startDate: "2026-11-10",
      endDate: "2026-11-13",
      travelers: 2,
      budget: 25000,
      notes: "First time visiting Rajasthan solo!"
    };
    const createRes = await request("POST", "/api/trips/add", newTripPayload);
    assert(createRes.status === 201, "Create trip returns status 201");
    const createdTrip = createRes.data;
    const tripId = createdTrip._id;
    assert(createdTrip.budget === 25000, "Trip budget is set to 25000");
    assert(createdTrip.travelers === 2, "Travelers count is set to 2");
    assert(createdTrip.itinerary && createdTrip.itinerary.length > 0, "Trip has initialized itinerary days");

    // 3. Test get single trip
    console.log("\n--- 3. Testing Get Single Trip ---");
    const getRes = await request("GET", `/api/trips/${tripId}`);
    assert(getRes.status === 200, "Get trip by ID returns 200");
    assert(getRes.data.title === "Royal Jaipur Solo Journey", "Trip title matches");

    // 4. Test adding an activity to Day 1
    console.log("\n--- 4. Testing Add Activity ---");
    const actPayload = {
      dayNumber: 1,
      time: "16:45",
      title: "Chai & Photography at Jal Mahal Promenade",
      category: "Food",
      cost: 120,
      location: "Man Sagar Lake",
      notes: "Golden hour reflection of the water palace"
    };
    const addActRes = await request("POST", `/api/trips/${tripId}/activity`, actPayload);
    assert(addActRes.status === 200, "Add activity returns 200");
    const day1 = addActRes.data.itinerary.find(d => d.dayNumber === 1);
    const addedAct = day1.activities.find(a => a.title.includes("Jal Mahal"));
    assert(Boolean(addedAct), "New activity found in Day 1");
    assert(addedAct.cost === 120, "Activity cost is 120");

    // 5. Test editing / moving an activity (Move from Day 1 to Day 2)
    console.log("\n--- 5. Testing Edit / Move Activity ---");
    const updateActRes = await request("PUT", `/api/trips/${tripId}/activity/${addedAct._id}`, {
      title: "Chai & Sunset Photography at Jal Mahal (Rescheduled)",
      cost: 150,
      targetDayNumber: 2
    });
    assert(updateActRes.status === 200, "Update activity returns 200");
    const day2 = updateActRes.data.itinerary.find(d => d.dayNumber === 2);
    const movedAct = day2.activities.find(a => String(a._id) === String(addedAct._id));
    assert(Boolean(movedAct), "Activity was successfully moved to Day 2");
    assert(movedAct.cost === 150, "Activity updated cost is 150");

    // 6. Test adding an extra expense item
    console.log("\n--- 6. Testing Budget Expense Addition ---");
    const expRes = await request("POST", `/api/trips/${tripId}/expense`, {
      title: "Jaipur Express Sleeper Train",
      category: "Transportation",
      cost: 1400,
      notes: "Delhi to Jaipur AC 3-Tier"
    });
    assert(expRes.status === 200, "Add expense returns 200");
    assert(expRes.data.expenses && expRes.data.expenses.some(e => e.title.includes("Sleeper Train")), "Expense item added to trip");

    // 7. Test delete activity
    console.log("\n--- 7. Testing Delete Activity ---");
    const delActRes = await request("DELETE", `/api/trips/${tripId}/activity/${addedAct._id}`);
    assert(delActRes.status === 200, "Delete activity returns 200");
    const day2After = delActRes.data.itinerary.find(d => d.dayNumber === 2);
    const exists = day2After.activities.some(a => String(a._id) === String(addedAct._id));
    assert(!exists, "Activity was successfully deleted from Day 2");

    // 8. Test trip update
    console.log("\n--- 8. Testing Trip Update ---");
    const updateTripRes = await request("PUT", `/api/trips/${tripId}`, {
      budget: 30000,
      status: "Confirmed"
    });
    assert(updateTripRes.status === 200, "Trip update returns 200");
    assert(updateTripRes.data.budget === 30000, "Trip budget updated to 30000");
    assert(updateTripRes.data.status === "Confirmed", "Trip status updated to Confirmed");

    console.log(`\n========================================`);
    console.log(`Total Passed: ${passed} | Total Failed: ${failed}`);
    console.log(`========================================\n`);

  } catch (err) {
    console.error("Test error:", err);
    failed++;
  }
}

runTests();
