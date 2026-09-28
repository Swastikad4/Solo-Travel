const assert = require("assert");
const { isIndianDestination, generateAITripItinerary, applyAICommand } = require("./services/aiPlannerEngine");

async function runPhase5Tests() {
  console.log("\n========================================================");
  console.log("⭐ RUNNING PHASE 5: AI TRAVEL PLANNER TEST SUITE ⭐");
  console.log("========================================================\n");

  let passed = 0;
  let failed = 0;

  function test(name, fn) {
    try {
      fn();
      console.log(`✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ FAIL: ${name}`);
      console.error(err);
      failed++;
    }
  }

  async function asyncTest(name, fn) {
    try {
      await fn();
      console.log(`✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ FAIL: ${name}`);
      console.error(err);
      failed++;
    }
  }

  // 1. India-Only Validation Tests
  test("Strict rejection of foreign/international destinations", () => {
    assert.strictEqual(isIndianDestination("Paris"), false, "Paris should not be allowed");
    assert.strictEqual(isIndianDestination("London"), false, "London should not be allowed");
    assert.strictEqual(isIndianDestination("New York"), false, "New York should not be allowed");
    assert.strictEqual(isIndianDestination("Dubai"), false, "Dubai should not be allowed");
    assert.strictEqual(isIndianDestination("Bali"), false, "Bali should not be allowed");
    assert.strictEqual(isIndianDestination("Tokyo"), false, "Tokyo should not be allowed");
    assert.strictEqual(isIndianDestination("Bangkok"), false, "Bangkok should not be allowed");
    assert.strictEqual(isIndianDestination("Rome"), false, "Rome should not be allowed");
  });

  test("Acceptance of Indian destinations, states, UTs & hill stations", () => {
    assert.strictEqual(isIndianDestination("Manali"), true, "Manali should be valid");
    assert.strictEqual(isIndianDestination("Jaipur"), true, "Jaipur should be valid");
    assert.strictEqual(isIndianDestination("Rishikesh"), true, "Rishikesh should be valid");
    assert.strictEqual(isIndianDestination("Varanasi"), true, "Varanasi should be valid");
    assert.strictEqual(isIndianDestination("Munnar"), true, "Munnar should be valid");
    assert.strictEqual(isIndianDestination("North Goa"), true, "North Goa should be valid");
    assert.strictEqual(isIndianDestination("Leh-Ladakh"), true, "Leh-Ladakh should be valid");
    assert.strictEqual(isIndianDestination("Hampi"), true, "Hampi should be valid");
    assert.strictEqual(isIndianDestination("Himachal Pradesh"), true, "Himachal Pradesh should be valid");
    assert.strictEqual(isIndianDestination("Kerala"), true, "Kerala should be valid");
    assert.strictEqual(isIndianDestination("Meghalaya"), true, "Meghalaya should be valid");
  });

  // 2. Generation Rejection Test for Foreign Location
  await asyncTest("AI Engine rejects Paris with exact India-only error message", async () => {
    const result = await generateAITripItinerary({
      destination: "Paris",
      days: 5,
      budget: 50000
    });
    assert.strictEqual(result.success, false);
    assert.strictEqual(
      result.error,
      "Sorry, this platform currently supports travel destinations within India only."
    );
    assert.strictEqual(result.isIndiaOnlyError, true);
  });

  // 3. Generation for Manali (5 days, ₹15,000, solo, trekking + nature)
  await asyncTest("AI Engine generates full structured itinerary for Manali (5 days, ₹15,000, solo)", async () => {
    const result = await generateAITripItinerary({
      destination: "Manali",
      days: 5,
      startDate: "2026-10-01",
      travelers: 1,
      budget: 15000,
      interests: ["Trekking & Hiking", "Nature & Wildlife"],
      travelStyle: "Solo Backpacker",
      accommodation: "Backpacker Hostel",
      foodPreference: "Authentic Local Cuisine",
      transportation: "Public Buses & Rental Scooter"
    });

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.itinerary.length, 5, "Must generate exactly 5 days");

    // Verify Day 1 structure & activities
    const day1 = result.itinerary[0];
    assert.ok(day1.title, "Day 1 must have a title");
    assert.ok(Array.isArray(day1.activities) && day1.activities.length >= 4, "Day 1 must have multiple activities");

    // Verify individual activity fields
    const act = day1.activities[0];
    assert.ok(act.time, "Activity must have time");
    assert.ok(act.title, "Activity must have title");
    assert.ok(act.category, "Activity must have category");
    assert.ok(act.cost !== undefined, "Activity must have cost");
    assert.ok(act.location !== undefined, "Activity must have location");
    assert.ok(act.notes !== undefined, "Activity must have notes");

    // Verify food suggestions
    assert.ok(result.foodSuggestions.mustTryDishes.length > 0, "Must have dishes suggestions");
    assert.ok(result.foodSuggestions.recommendedSpots.length > 0, "Must have recommended spots");

    // Verify transportation & travel time
    assert.ok(result.transportation.gettingThere, "Must have getting there info");
    assert.ok(result.transportation.localTransit, "Must have local transit info");
    assert.ok(result.travelTimes.length > 0, "Must have travel time estimates");

    // Verify packing list & safety tips
    assert.ok(result.packingList.length > 0, "Must have packing list");
    assert.ok(result.safetyTips.length > 0, "Must have safety tips");

    // Verify accommodation suggestions
    assert.ok(result.accommodations.length > 0, "Must have accommodation suggestions");

    // Verify budget breakdown
    assert.ok(result.budgetBreakdown, "Must have budget breakdown");
    assert.ok(result.budgetBreakdown.estimatedTotalCost > 0, "Must have estimated total cost");
  });

  // 4. Test AI Commands
  test("AI Command: 'regenerate_day' refreshes a single day's activities", () => {
    const sampleItinerary = [
      {
        day: 1,
        dayNumber: 1,
        title: "Day 1: Arrival",
        activities: [{ time: "09:00", title: "Old Act 1", cost: 100 }]
      },
      {
        day: 2,
        dayNumber: 2,
        title: "Day 2: City Walk",
        activities: [{ time: "10:00", title: "Old Act 2", cost: 200 }]
      }
    ];

    const result = applyAICommand("regenerate_day", sampleItinerary, { destination: "Manali" }, {
      commandType: "regenerate_day",
      dayNumber: 2
    });

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.itinerary[1].activities.length > 1, true);
    assert.notStrictEqual(result.itinerary[1].activities[0].title, "Old Act 2");
    // Day 1 should remain untouched
    assert.strictEqual(result.itinerary[0].activities[0].title, "Old Act 1");
  });

  test("AI Command: 'more_trekking' injects ridge hikes and trail activities", () => {
    const sampleItinerary = [
      {
        day: 1,
        dayNumber: 1,
        title: "Day 1",
        activities: [
          { time: "09:00", title: "Breakfast", category: "Food", cost: 100 },
          { time: "11:00", title: "Museum", category: "Activities", cost: 200 },
          { time: "13:00", title: "Lunch", category: "Food", cost: 200 },
          { time: "15:00", title: "Mall Road", category: "Activities", cost: 100 },
          { time: "19:00", title: "Dinner", category: "Food", cost: 300 }
        ]
      }
    ];

    const result = applyAICommand("more_trekking", sampleItinerary, { destination: "Manali" }, {
      commandType: "more_trekking"
    });

    assert.strictEqual(result.success, true);
    const day1Acts = result.itinerary[0].activities;
    const hasTrek = day1Acts.some(a => a.title.toLowerCase().includes("hike") || a.title.toLowerCase().includes("trek"));
    assert.strictEqual(hasTrek, true, "Must contain hiking or trekking activity");
  });

  test("AI Command: 'make_cheaper' scales down costs and suggests budget alternatives", () => {
    const sampleItinerary = [
      {
        day: 1,
        dayNumber: 1,
        title: "Day 1",
        activities: [
          { time: "09:00", title: "Fine Dining Breakfast", category: "Food", cost: 1000 },
          { time: "14:00", title: "Private Cab Tour", category: "Transportation", cost: 2000 }
        ]
      }
    ];

    const result = applyAICommand("make_cheaper", sampleItinerary, { destination: "Jaipur" }, {
      commandType: "make_cheaper"
    });

    assert.strictEqual(result.success, true);
    const day1Acts = result.itinerary[0].activities;
    assert.ok(day1Acts[0].cost < 1000, "Food cost must be reduced");
    assert.ok(day1Acts[1].cost < 2000, "Transit cost must be reduced");
  });

  test("AI Command: 'optimize_budget' balances expenses towards target budget", () => {
    const sampleItinerary = [
      {
        day: 1,
        dayNumber: 1,
        title: "Day 1",
        activities: [
          { time: "09:00", title: "Act 1", cost: 4000 },
          { time: "14:00", title: "Act 2", cost: 6000 }
        ]
      }
    ];

    const result = applyAICommand("optimize_budget", sampleItinerary, { destination: "Goa", budget: 3000 }, {
      commandType: "optimize_budget"
    });

    assert.strictEqual(result.success, true);
    const newTotal = result.itinerary[0].activities.reduce((s, a) => s + a.cost, 0);
    assert.ok(newTotal <= 3100, `Optimized total (${newTotal}) should fit within target budget of 3000`);
  });

  console.log(`\n========================================================`);
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase5Tests();
