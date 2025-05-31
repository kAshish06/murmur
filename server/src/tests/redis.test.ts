import redisClient from "../config/redis";

async function testRedisConnection() {
  try {
    // Test basic Redis operations
    await redisClient.set("test:key", "Hello Redis!");
    const value = await redisClient.get("test:key");
    console.log("Redis test value:", value);

    // Test presence data structure
    const userId = 1;
    const presenceData = {
      online: true,
      lastSeen: new Date().toISOString(),
      devices: {
        device1: {
          socketId: "socket123",
          lastActive: new Date().toISOString(),
        },
      },
    };

    await redisClient.set(
      `user:${userId}:presence`,
      JSON.stringify(presenceData)
    );

    const storedPresence = await redisClient.get(`user:${userId}:presence`);
    console.log("Stored presence data:", storedPresence);

    // Cleanup
    await redisClient.del("test:key");
    await redisClient.del(`user:${userId}:presence`);

    console.log("Redis connection test completed successfully");
  } catch (error) {
    console.error("Redis connection test failed:", error);
  } finally {
    // Close Redis connection
    await redisClient.quit();
  }
}

// Run the test
testRedisConnection();
