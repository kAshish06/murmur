import express, { Request, Response, NextFunction } from "express";
import http from "http";
import cors from "cors";
import { Server as SocketIOServer } from "socket.io";
import dotenv from "dotenv";

import rateLimiterMiddleware from "./middleware/rateLimiter";
import sanitizeBodyMiddleware from "./middleware/sanitiseUserInput";
import logApiMiddleware from "./middleware/logger";
import errorHandlerMiddleware from "./middleware/errorHandler";
import authRoutes from "./routes/auth";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: "*", // Set frontend URL in prod
  },
});

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

app.use("/api/auth", authRoutes);
app.use(errorHandlerMiddleware);

app.get("/", (_req, res) => {
  res.send("Murmur backend is running");
});

io.on("connection", (socket) => {
  console.log("New client connected: " + socket.id);

  socket.on("message", (msg) => {
    socket.broadcast.emit("message", msg);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected: " + socket.id);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
