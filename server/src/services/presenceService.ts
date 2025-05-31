import redisClient, { REDIS_KEYS, PresenceData } from "../config/redis";
import { logger } from "../utils/logger";
import { Server as SocketIOServer } from "socket.io";

// Constants
const PRESENCE_TIMEOUT = 5 * 60 * 1000; // 5 minutes in milliseconds
const RECENTLY_ONLINE_THRESHOLD = 15 * 60 * 1000; // 15 minutes in milliseconds

// Event names for presence updates
export const PRESENCE_EVENTS = {
  USER_ONLINE: "presence:online",
  USER_OFFLINE: "presence:offline",
  USER_LAST_SEEN: "presence:lastSeen",
} as const;

let io: SocketIOServer | null = null;

export function initPresenceService(socketServer: SocketIOServer) {
  io = socketServer;
  startPresenceCleanup();
}

// Initialize presence cleanup interval
function startPresenceCleanup() {
  setInterval(async () => {
    try {
      await cleanupStalePresence();
    } catch (error) {
      logger.error("Error in presence cleanup:", error);
    }
  }, PRESENCE_TIMEOUT);
}

// Cleanup stale presence data
async function cleanupStalePresence() {
  try {
    const keys = await redisClient.keys("user:*:presence");
    const now = Date.now();

    for (const key of keys) {
      const data = await redisClient.get(key);
      if (!data) continue;

      const presenceData = JSON.parse(data);
      if (now - presenceData.lastSeen > PRESENCE_TIMEOUT) {
        const userId = parseInt(key.split(":")[1]);
        await redisClient.del(key);
        emitPresenceEvent(userId, false);
        logger.info(`Cleaned up stale presence data for user ${userId}`);
      }
    }
  } catch (error) {
    logger.error("Error cleaning up stale presence:", error);
  }
}

// Emit presence events to all connected clients
function emitPresenceEvent(userId: number, isOnline: boolean) {
  if (!io) return;

  const event = isOnline
    ? PRESENCE_EVENTS.USER_ONLINE
    : PRESENCE_EVENTS.USER_OFFLINE;
  io.emit(event, { userId, timestamp: Date.now() });
}

export async function userConnected(
  userId: number,
  deviceId: string,
  socketId: string
): Promise<void> {
  try {
    const key = REDIS_KEYS.USER_PRESENCE(userId);
    const existingData = await redisClient.get(key);
    const presenceData = existingData
      ? JSON.parse(existingData)
      : { online: true, lastSeen: Date.now(), devices: {} };

    // Only emit online event if this is the first device
    const wasOffline = !presenceData.online;
    presenceData.online = true;
    presenceData.lastSeen = Date.now();
    presenceData.devices[deviceId] = socketId;

    await redisClient.set(key, JSON.stringify(presenceData));

    if (wasOffline) {
      emitPresenceEvent(userId, true);
    }

    logger.info(`User ${userId} connected with device ${deviceId}`);
  } catch (error) {
    logger.error(`Error in userConnected:`, error);
    throw error;
  }
}

export async function userDisconnected(
  userId: number,
  deviceId: string
): Promise<void> {
  try {
    const key = REDIS_KEYS.USER_PRESENCE(userId);
    const existingData = await redisClient.get(key);

    if (!existingData) {
      logger.warn(`No presence data found for user ${userId}`);
      return;
    }

    const presenceData = JSON.parse(existingData);
    delete presenceData.devices[deviceId];
    presenceData.lastSeen = Date.now();

    // If no devices left, remove the presence data and emit offline event
    if (Object.keys(presenceData.devices).length === 0) {
      await redisClient.del(key);
      emitPresenceEvent(userId, false);
      logger.info(`Removed presence data for user ${userId}`);
    } else {
      await redisClient.set(key, JSON.stringify(presenceData));
      logger.info(`User ${userId} disconnected device ${deviceId}`);
    }
  } catch (error) {
    logger.error(`Error in userDisconnected:`, error);
    throw error;
  }
}

export async function getUserPresence(
  userId: number
): Promise<PresenceData | null> {
  try {
    const key = REDIS_KEYS.USER_PRESENCE(userId);
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    logger.error(`Error in getUserPresence:`, error);
    throw error;
  }
}

export async function getUsersPresence(
  userIds: number[]
): Promise<Record<number, PresenceData | null>> {
  try {
    const pipeline = redisClient.pipeline();
    userIds.forEach((userId) => {
      pipeline.get(REDIS_KEYS.USER_PRESENCE(userId));
    });

    const results = await pipeline.exec();
    if (!results) return {};

    return userIds.reduce((acc, userId, index) => {
      const [error, data] = results[index] || [null, null];
      if (error) {
        logger.error(`Error getting presence for user ${userId}:`, error);
        acc[userId] = null;
      } else {
        acc[userId] = data ? JSON.parse(data as string) : null;
      }
      return acc;
    }, {} as Record<number, PresenceData | null>);
  } catch (error) {
    logger.error(`Error in getUsersPresence:`, error);
    throw error;
  }
}

export async function getUserLastSeen(userId: number): Promise<number | null> {
  try {
    const presenceData = await getUserPresence(userId);
    return presenceData?.lastSeen || null;
  } catch (error) {
    logger.error(`Error in getUserLastSeen:`, error);
    throw error;
  }
}

export async function getOnlineUsers(): Promise<number[]> {
  try {
    const keys = await redisClient.keys("user:*:presence");
    const onlineUsers: number[] = [];

    for (const key of keys) {
      const data = await redisClient.get(key);
      if (data) {
        const presenceData = JSON.parse(data);
        if (presenceData.online) {
          const userId = parseInt(key.split(":")[1]);
          onlineUsers.push(userId);
        }
      }
    }

    return onlineUsers;
  } catch (error) {
    logger.error(`Error in getOnlineUsers:`, error);
    throw error;
  }
}

export async function getRecentlyOnlineUsers(
  threshold: number = RECENTLY_ONLINE_THRESHOLD
): Promise<number[]> {
  try {
    const keys = await redisClient.keys("user:*:presence");
    const now = Date.now();
    const recentlyOnlineUsers: number[] = [];

    for (const key of keys) {
      const data = await redisClient.get(key);
      if (!data) continue;

      const presenceData = JSON.parse(data);
      if (now - presenceData.lastSeen <= threshold) {
        const userId = parseInt(key.split(":")[1]);
        recentlyOnlineUsers.push(userId);
      }
    }

    return recentlyOnlineUsers;
  } catch (error) {
    logger.error(`Error in getRecentlyOnlineUsers:`, error);
    throw error;
  }
}
