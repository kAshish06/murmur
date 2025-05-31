import {
  userConnected,
  userDisconnected,
  getUserPresence,
  getUserLastSeen,
  getOnlineUsers,
} from "../services/presenceService";
import redisClient from "../config/redis";

async function testPresenceService() {
  try {
    const userId = 1;
    const deviceId = "test-device-1";
    const socketId = "test-socket-1";

    // Test user connection
    console.log("\nTesting user connection...");
    await userConnected(userId, deviceId, socketId);

    // Verify presence data
    const presence = await getUserPresence(userId);
    console.log("User presence after connection:", presence);

    // Test last seen
    const lastSeen = await getUserLastSeen(userId);
    console.log("User last seen:", lastSeen);

    // Test online users
    const onlineUsers = await getOnlineUsers();
    console.log("Online users:", onlineUsers);

    // Test user disconnection
    console.log("\nTesting user disconnection...");
    await userDisconnected(userId, deviceId);

    // Verify presence after disconnection
    const presenceAfterDisconnect = await getUserPresence(userId);
    console.log("User presence after disconnection:", presenceAfterDisconnect);

    // Cleanup
    await redisClient.del(`user:${userId}:presence`);
    await redisClient.del(`user:${userId}:lastSeen`);

    console.log("\nPresence service test completed successfully");
  } catch (error) {
    console.error("Presence service test failed:", error);
  } finally {
    await redisClient.quit();
  }
}

// Run the test
testPresenceService();
