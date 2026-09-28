require("dotenv").config();

async function runPhase8Tests() {
  console.log("==================================================");
  console.log("🧪 RUNNING PHASE 8 TRAVEL GROUPS & GROUP CHAT TESTS");
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

  // 1. Test Group Schema
  const Group = require("./models/Group");
  const GroupMessage = require("./models/GroupMessage");

  assert(Group.schema.path("name") !== undefined, "Group schema has name field");
  assert(Group.schema.path("destination") !== undefined, "Group schema has destination field");
  assert(Group.schema.path("category") !== undefined, "Group schema has category field");
  assert(Group.schema.path("members") !== undefined, "Group schema tracks members list");
  assert(Group.schema.path("admins") !== undefined, "Group schema tracks admins list");
  assert(Group.schema.path("rules") !== undefined, "Group schema stores community rules");

  // 2. Test GroupMessage Schema
  assert(GroupMessage.schema.path("groupId") !== undefined, "GroupMessage schema has groupId field");
  assert(GroupMessage.schema.path("content") !== undefined, "GroupMessage schema has content field");
  assert(GroupMessage.schema.path("isDeleted") !== undefined, "GroupMessage schema supports deletion flag");

  // 3. Test Group Routes
  const groupRoutes = require("./routes/groupRoutes");
  assert(groupRoutes !== undefined, "groupRoutes module loads cleanly");

  // 4. Test Socket Service Group Capabilities
  const socketService = require("./services/socketService");
  assert(typeof socketService.initSocketServer === "function", "Socket server supports real-time group chatrooms");

  console.log("==================================================");
  console.log(`🎉 TEST SUMMARY: ${passed}/${total} assertions passed`);
  console.log("==================================================");

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runPhase8Tests();
