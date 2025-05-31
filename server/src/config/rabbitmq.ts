import { config } from "dotenv";

config();

export const rabbitmqConfig = {
  url: process.env.RABBITMQ_URL || "amqp://localhost:5672",
  options: {
    heartbeat: 60,
    timeout: 10000,
    retry: {
      maxRetries: 3,
      minDelay: 1000,
      maxDelay: 5000,
    },
  },
};
