import Redis, { type RedisOptions } from "ioredis";
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
const redisHost = process.env.REDIS_HOST || "localhost";
const redisPort = parseInt(process.env.REDIS_PORT || "6379", 10);
const redisPassword = process.env.REDIS_PASSWORD;

const redisClientOptions: RedisOptions = {
  host: redisHost,
  port: redisPort,
};
console.log("Redis password from env ----------------", redisPassword);
if (redisPassword && redisPassword.trim() !== "") {
  console.log("Attempting Redis authentication with provided password.");
  redisClientOptions.password = redisPassword;
  redisClientOptions.username = "default";
} else {
  console.log(
    "No Redis password provided or password is empty. Connecting without authentication."
  );
}

const redisClient = new Redis(redisClientOptions);

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
