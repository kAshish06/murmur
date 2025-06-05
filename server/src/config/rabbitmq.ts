import { config } from "dotenv";

config();

export const rabbitmqConfig = {
  // Use URL from environment which contains all credentials
  url: process.env.RABBITMQ_URL || "amqp://localhost:5672",
  options: {
    heartbeat: 60,
    timeout: 30000,
    retry: {
      maxRetries: 10,
      minDelay: 1000,
      maxDelay: 10000,
    },
    // Add TLS options since we're using CloudAMQP
    tls: {
      rejectUnauthorized: false
    },
    // Properly extract vhost from URL (e.g., /chpyqzcf)
    vhost: (() => {
      const url = process.env.RABBITMQ_URL || "";
      const match = url.match(/\/([^/?]+)(\?|$)/);
      return match ? `/${match[1]}` : "/";
    })()
  },
};

// Add debug logging
console.log('RabbitMQ configuration:', {
  url: process.env.RABBITMQ_URL || 'Not set',
  options: rabbitmqConfig.options
});
