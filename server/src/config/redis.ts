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

let redisClient: Redis;

if (process.env.REDIS_URL) {
  // If REDIS_URL is provided (e.g., by Render), use it directly
  console.log('REDIS_URL:', process.env.REDIS_URL);
  redisClient = new Redis(process.env.REDIS_URL, {
    // Optional: Add TLS options if required by your Redis provider and not in the URL
    // tls: process.env.REDIS_TLS_ENABLED === 'true' ? { rejectUnauthorized: false } : undefined,
    retryStrategy: (times) => Math.min(times * 100, 3000), // e.g., retry up to 3s
    maxRetriesPerRequest: 3, // Optional: Limit retries for a single command
  });
  console.log('Attempting to connect to Redis using REDIS_URL:', process.env.REDIS_URL);
} else {
  // Fallback to individual host, port, password for local/other environments
  const redisHost = process.env.REDIS_HOST || 'localhost';
  const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);
  const redisPassword = process.env.REDIS_PASSWORD;

  const redisClientOptions: RedisOptions = {
    host: redisHost,
    port: redisPort,
    retryStrategy: (times) => Math.min(times * 100, 3000),
    maxRetriesPerRequest: 3,
  };

  if (redisPassword && redisPassword.trim() !== '') {
    redisClientOptions.password = redisPassword;
    // redisClientOptions.username = 'default'; // Usually not needed if password is in URL or for basic auth
  }
  redisClient = new Redis(redisClientOptions);
  console.log(`Attempting to connect to Redis using host: ${redisHost}, port: ${redisPort}`);
}

redisClient.on('connect', () => {
  logger.info('Successfully connected to Redis');
});

redisClient.on('error', (err) => {
  logger.error('Redis connection error:', err);
});

redisClient.on('reconnecting', () => {
  logger.info('Reconnecting to Redis...');
});

redisClient.on('end', () => {
  logger.info('Redis connection ended.');
});

export default redisClient;
