const assert = require("assert");
const { resolveCoordinates, calculateDistanceKm, generateItineraryRouteMap } = require("./services/geoService");
const { getDestinationWeather } = require("./services/weatherService");
const { getDestinationSafetyInfo } = require("./services/safetyService");

async function runPhase6Tests() {
  console.log("\n==================================================================");
  console.log("⭐ RUNNING PHASE 6: MAPS + WEATHER + SAFETY TEST SUITE ⭐");
  console.log("==================================================================\n");

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

  // 1. Geo & Route Mapping Tests
  test("Geo Service resolves accurate coordinates for Indian destinations and landmarks", () => {
    const manaliCoords = resolveCoordinates("Manali");
    assert.ok(manaliCoords && manaliCoords.lat && manaliCoords.lng, "Manali must have valid coordinates");
    assert.strictEqual(Math.round(manaliCoords.lat), 32);

    const amerFortCoords = resolveCoordinates("Amer Fort");
    assert.ok(amerFortCoords && amerFortCoords.lat && amerFortCoords.lng, "Amer Fort must have valid coordinates");

    const assiGhatCoords = resolveCoordinates("Assi Ghat");
    assert.ok(assiGhatCoords && assiGhatCoords.lat && assiGhatCoords.lng, "Assi Ghat must have valid coordinates");
  });

  test("Distance calculation computes realistic kilometer distances", () => {
    // Distance between Old Manali and Sissu
    const dist = calculateDistanceKm(32.2530, 77.1750, 32.4760, 77.1210);
    assert.ok(dist > 20 && dist < 45, `Distance between Old Manali & Sissu should be ~25-35 km (computed: ${dist} km)`);
  });

  test("Route Map Builder sequences waypoints in 'Hotel ➔ Attraction ➔ Restaurant ➔ Activity' flow", () => {
    const sampleItinerary = [
      {
        dayNumber: 1,
        title: "Day 1: Arrival & Exploration",
        activities: [
          { time: "09:00", title: "Check-in at Old Manali Hostel", category: "Accommodation", location: "Old Manali" },
          { time: "11:00", title: "Explore Hadimba Temple", category: "Activities", location: "Hadimba Temple" },
          { time: "13:30", title: "Himachali Thali Lunch at Cafe 1947", category: "Food", location: "Beas River" },
          { time: "16:00", title: "Jogini Waterfall Hike", category: "Activities", location: "Jogini Waterfalls" }
        ]
      }
    ];

    const routeMap = generateItineraryRouteMap("Manali", sampleItinerary);
    assert.ok(routeMap && routeMap.daysRoutes.length === 1, "Must generate day routes");

    const day1 = routeMap.daysRoutes[0];
    assert.strictEqual(day1.waypoints.length, 4, "Must have 4 waypoints");
    assert.strictEqual(day1.waypoints[0].stepType, "Hotel");
    assert.strictEqual(day1.waypoints[1].stepType, "Attraction");
    assert.strictEqual(day1.waypoints[2].stepType, "Restaurant");
    assert.strictEqual(day1.waypoints[3].stepType, "Activity");
    assert.ok(day1.totalDayDistanceKm > 0, "Must calculate total day distance");
    assert.ok(day1.sequenceSummary.includes("Hotel ➔ Attraction ➔ Restaurant ➔ Activity"));
  });

  // 2. Weather Engine Tests
  await asyncTest("Weather Engine retrieves live/forecast weather and travel suggestions for Manali", async () => {
    const weather = await getDestinationWeather("Manali");
    assert.strictEqual(weather.success, true);
    assert.ok(weather.current && weather.current.temperature !== undefined, "Must have current temperature");
    assert.ok(weather.current.condition, "Must have weather condition");
    assert.ok(weather.current.icon, "Must have weather icon");
    assert.ok(Array.isArray(weather.forecast) && weather.forecast.length >= 5, "Must have 5-day forecast");
    assert.ok(Array.isArray(weather.travelSuggestions) && weather.travelSuggestions.length > 0, "Must have travel suggestions");
  });

  await asyncTest("Weather Engine provides coastal tropical weather context for Goa", async () => {
    const weather = await getDestinationWeather("Goa");
    assert.strictEqual(weather.success, true);
    assert.ok(weather.current.temperature > 15, "Goa temperature should be tropical");
    assert.ok(weather.forecast.length === 5, "Must provide 5 days");
  });

  // 3. Safety Intelligence Tests
  test("Safety Service provides destination safety index, emergency contacts, trekking & wildlife rules", () => {
    const safety = getDestinationSafetyInfo("Manali");
    assert.ok(safety.safetyScore >= 4.0, "Safety score must be high");
    assert.ok(safety.soloFriendliness >= 9.0, "Solo friendliness score must be high");
    assert.ok(safety.emergencyContacts.length >= 4, "Must have multiple emergency helplines");

    // Check emergency numbers
    const numbers = safety.emergencyContacts.map(c => c.number);
    assert.ok(numbers.includes("112"), "Must include 112 National Emergency");
    assert.ok(numbers.includes("1363"), "Must include 1363 Tourist Police");
    assert.ok(numbers.includes("1091"), "Must include 1091 Women Safety");

    // Check specific safety sections
    assert.ok(safety.soloTips.length > 0, "Must have solo tips");
    assert.ok(safety.trekkingSafety.length > 0, "Must have trekking safety");
    assert.ok(safety.wildlifeSafety.length > 0, "Must have wildlife safety");
    assert.ok(safety.weatherWarnings.length > 0, "Must have weather warnings");
  });

  console.log(`\n==================================================================`);
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log(`==================================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase6Tests();
