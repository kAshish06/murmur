import { Server as SocketIOServer, Socket } from "socket.io";
import http from "http";
import { socketAuthMiddleware } from "./middleware/authMiddleware";

export interface AuthenticatedSocket extends Socket {
  user?: { id: number };
}

/**
 * Initializes and configures the Socket.IO server.
 * @param server The HTTP server instance to attach Socket.IO to.
 * @param allowedOrigins An array of allowed origins for CORS.
 * @returns The configured Socket.IO server instance.
 */
export const initSocketServer = (
  server: http.Server,
  allowedOrigins: string[]
): SocketIOServer => {
  const io = new SocketIOServer(server, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.use(socketAuthMiddleware);

  io.on("connection", (socket: AuthenticatedSocket) => {
    console.log(
      `Authenticated client connected: ${socket.id}, User ID: ${socket.user?.id}`
    );

    socket.on("message", (msg: any) => {
      console.log(`Message from User ${socket.user?.id} (${socket.id}):`, msg);
      io.emit("message", { userId: socket.user?.id, message: msg });
    });

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
};
