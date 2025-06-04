import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";

import rateLimiterMiddleware from "./middleware/rateLimiter";
import sanitizeBodyMiddleware from "./middleware/sanitiseUserInput";
import logApiMiddleware from "./middleware/logger";
import errorHandlerMiddleware from "./middleware/errorHandler";
import authRoutes from "./routes/auth";
import chatRoutes from "./routes/chat";
import { initSocketServer } from "./socket";
import responseformatter from "./middleware/responseFormatter";
import { RabbitMQService } from "./services/rabbitmqService";
import { startMessageProcessor } from "./messageProcessing/messageProcessor";
import { initPresenceService } from "./services/presenceService";
import { startSocketEventProcessor } from "./messageProcessing/socketEventProcessor";
import { socketAuthMiddleware } from "./socket/middleware/authMiddleware";

dotenv.config();

(async function () {
  const app = express();
  const server = http.createServer(app);

  /** Register middlewares */
  let whitelist: string[] = [];
  if (process.env.VITE_FRONTEND_URL && process.env.VITE_FRONTEND_URL.trim() !== "") {
    whitelist = [process.env.VITE_FRONTEND_URL.trim()];
  } else if (process.env.CORS_WHITELIST) {
    whitelist = process.env.CORS_WHITELIST.split(",").map((origin) => origin.trim());
  } else {
    // Default fallback if neither is set, or adjust as needed
    // For example, you might want to allow no origins or a specific default
    console.warn('CORS whitelist is not configured. Allowing requests from no origins.');
  }
  console.log(whitelist);
  const corsOptions = {
    origin: function (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void
    ) {
      if (!origin || whitelist.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  };
  app.use(cors(corsOptions));
  app.use(express.json());
  app.use(logApiMiddleware);
  app.use(rateLimiterMiddleware);
  app.use(sanitizeBodyMiddleware);
  app.use(responseformatter);

  /** Initialize routes */
  app.use("/api/auth", authRoutes);
  app.use("/api/chat", chatRoutes);

  /** Initialize error handler */
  app.use(errorHandlerMiddleware);

  /** Initialize root route */
  app.get("/", (_req, res) => {
    res.send("Murmur backend is running");
  });

  /** Initialize socket server */
  const io = initSocketServer(server, whitelist);
  io.use(socketAuthMiddleware);

  /** Initialize rabbitmq */
  const rabbitMQ = RabbitMQService.getInstance();
  await rabbitMQ.connect();

  /** Initialize message processor */
  startMessageProcessor();
  startSocketEventProcessor(io);
  initPresenceService(io);

  const PORT = process.env.BACKEND_INTERNAL_PORT || 4000;
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
})();
