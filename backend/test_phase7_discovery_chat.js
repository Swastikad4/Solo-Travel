require("dotenv").config();

async function runPhase7Tests() {
  console.log("==================================================");
  console.log("🧪 RUNNING PHASE 7 DISCOVERY & CHAT TEST SUITE");
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

  // 1. Test User Schema Fields
  const User = require("./models/User");
  const Conversation = require("./models/Conversation");
  const Message = require("./models/Message");

  assert(User.schema.path("username") !== undefined, "User schema has username field");
  assert(User.schema.path("blockedUsers") !== undefined, "User schema has blockedUsers field");
  assert(User.schema.path("privacySettings.whoCanMessageMe") !== undefined, "User schema has privacySettings.whoCanMessageMe field");
  assert(User.schema.path("isOnline") !== undefined, "User schema has isOnline presence field");

  // 2. Test Conversation & Message Schemas
  assert(Conversation.schema.path("participants") !== undefined, "Conversation schema tracks participants array");
  assert(Conversation.schema.path("unreadCounts") !== undefined, "Conversation schema tracks unreadCounts");
  assert(Message.schema.path("read") !== undefined, "Message schema tracks read status");
  assert(Message.schema.path("deletedFor") !== undefined, "Message schema tracks deletedFor list");

  // 3. Test Socket Service
  const socketService = require("./services/socketService");
  assert(typeof socketService.initSocketServer === "function", "socketService provides initSocketServer");
  assert(typeof socketService.isUserOnline === "function", "socketService tracks online users");

  // 4. Test User Discovery & Profile Routes Logic
  const userDiscoveryRoutes = require("./routes/userDiscoveryRoutes");
  assert(userDiscoveryRoutes !== undefined, "userDiscoveryRoutes module loads cleanly");

  // 5. Test Chat Routes Logic
  const chatRoutes = require("./routes/chatRoutes");
  assert(chatRoutes !== undefined, "chatRoutes module loads cleanly");

  console.log("==================================================");
  console.log(`🎉 TEST SUMMARY: ${passed}/${total} assertions passed`);
  console.log("==================================================");

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runPhase7Tests();
