import express, { Request, Response, NextFunction } from "express";
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

dotenv.config();

const app = express();
const server = http.createServer(app);

/** Register middlewares */
const whitelist = process.env.CORS_WHITELIST
  ? process.env.CORS_WHITELIST.split(",").map((origin) => origin.trim())
  : [];
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

app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use(errorHandlerMiddleware);

app.get("/", (_req, res) => {
  res.send("Murmur backend is running");
});

const io = initSocketServer(server, whitelist);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
