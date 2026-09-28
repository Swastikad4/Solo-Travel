require("dotenv").config();

async function runPhase9Tests() {
  console.log("==================================================");
  console.log("🧪 RUNNING PHASE 9 SHARING & RECOMMENDATIONS TESTS");
  console.log("==================================================");

  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`  ✓ ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAILED: ${message}`);
    }
  }

  // 1. Test Trip Schema Sharing Fields
  const Trip = require("./models/Trip");
  assert(Trip.schema.path("isPublic") !== undefined, "Trip schema has isPublic flag");
  assert(Trip.schema.path("shareId") !== undefined, "Trip schema has unique shareId index");
  assert(Trip.schema.path("sharedAt") !== undefined, "Trip schema tracks sharedAt timestamp");

  // 2. Test Recommendation Service
  const { getRecommendations, calculateMatchScore, INDIAN_DESTINATION_DATABASE } = require("./services/recommendationService");
  assert(Array.isArray(INDIAN_DESTINATION_DATABASE) && INDIAN_DESTINATION_DATABASE.length >= 10, "Indian destination database contains curated travel destinations");

  // Test Manali / Trekking recommendation profile
  const trekkingProfile = {
    interests: ["Trekking", "Mountains", "Adventure Seeker"],
    travelStyle: "Budget Backpacker",
    budget: 15000,
    duration: 5,
    favorites: ["Manali"],
    previousTrips: []
  };

  const recs = await getRecommendations(trekkingProfile);
  assert(Array.isArray(recs) && recs.length > 0, "Recommendation engine generates scored destination array");
  
  const topMatch = recs[0];
  assert(topMatch.matchScore >= 88, `Top recommendation (${topMatch.name}) has strong match score >= 88% (Got ${topMatch.matchScore}%)`);
  assert(Array.isArray(topMatch.matchReasons) && topMatch.matchReasons.length > 0, "Top recommendation provides personalized match reasons");

  // 3. Test Beach & Chill profile (Goa / Kerala should rank high)
  const beachProfile = {
    interests: ["Beach & Chill", "Yoga & Wellness"],
    travelStyle: "Slow Nomad",
    budget: 12000,
    duration: 4,
    favorites: ["Goa"],
    previousTrips: []
  };

  const beachRecs = await getRecommendations(beachProfile);
  const topBeachNames = beachRecs.slice(0, 3).map(r => r.name);
  assert(topBeachNames.some(n => n.includes("Goa") || n.includes("Varkala")), `Beach & chill profile correctly ranks Goa or Kerala near top (Top 3: ${topBeachNames.join(", ")})`);

  console.log("==================================================");
  console.log(`🎉 TEST SUMMARY: ${passed}/${total} assertions passed`);
  console.log("==================================================");

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runPhase9Tests();
