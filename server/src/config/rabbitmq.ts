import { config } from "dotenv";

config();

export const rabbitmqConfig = {
  url: process.env.RABBITMQ_URL || "amqp://localhost:5672",
  options: {
    heartbeat: 60,
    timeout: 30000, // Increased timeout to 30 seconds
    retry: {
      maxRetries: 10, // Increased max retries
      minDelay: 1000,
      maxDelay: 10000, // Increased max delay
    },
    // Add TLS options since we're using CloudAMQP
    tls: {
      rejectUnauthorized: false
    }
  },
};

// Add debug logging
console.log('RabbitMQ configuration:', {
  url: process.env.RABBITMQ_URL || 'Not set',
  options: rabbitmqConfig.options
});
