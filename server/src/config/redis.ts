import { Redis } from "ioredis";
import { logger } from "../utils/logger";

export interface PresenceData {
  online: boolean;
  lastSeen: number;
  devices: Record<string, string>; // deviceId -> socketId
}

export const REDIS_KEYS = {
  USER_PRESENCE: (userId: number) => `user:${userId}:presence`,
} as const;

// Create Redis client
const redisClient = new Redis(
  process.env.REDIS_URL || "redis://localhost:6379"
);

// Handle Redis connection events
redisClient.on("connect", () => {
  logger.info("Connected to Redis");
});

redisClient.on("error", (error) => {
  logger.error("Redis connection error:", error);
});

redisClient.on("close", () => {
  logger.warn("Redis connection closed");
});

export default redisClient;
