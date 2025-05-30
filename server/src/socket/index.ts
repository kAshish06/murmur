import { Server as SocketIOServer, Socket } from "socket.io";
import http from "http";
import { socketAuthMiddleware } from "./middleware/authMiddleware";
import { createMessage } from "../services/chatService";
import { Message as PrismaMessage } from "@prisma/client";

export interface AuthenticatedSocket extends Socket {
  user?: { id: number };
}
interface IncomingMessage {
  conversationId: number;
  text: string;
}

interface OutgoingMessage extends PrismaMessage {
  // If you need to add any extra fields not in PrismaMessage, define them here
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

    socket.on(
      "sendMessage",
      async (message: IncomingMessage, callback?: (error?: any) => void) => {
        if (!socket.user?.id) {
          console.warn(
            `Received message from unauthenticated socket: ${socket.id}`
          );
          if (callback) {
            callback({ error: "Authentication required" });
          }
          return;
        }

        const senderId = socket.user.id;
        const { conversationId, text } = message;

        if (!conversationId || !text) {
          console.warn(
            `Received invalid message data from user ${senderId}:`,
            message
          );
          if (callback) {
            callback({
              error: "Invalid message data (missing conversationId or text)",
            });
          }
          return;
        }

        console.log(
          `Attempting to save message for Conversation ${conversationId} from User ${senderId}:`,
          text
        );

        try {
          const savedMessage = await createMessage({
            conversationId,
            senderId,
            content: text,
          });

          console.log(`Message saved to database: ${savedMessage.id}`);

          socket.broadcast.emit(
            "receiveMessage",
            savedMessage as OutgoingMessage
          );

          if (callback) {
            callback();
          }
        } catch (error) {
          console.error(
            `Error saving or broadcasting message for user ${senderId} in conversation ${conversationId}:`,
            error
          );
          if (callback) {
            callback({ error: "Failed to send message" });
          }
        }
      }
    );

    socket.on("disconnect", () => {
      console.log(
        `Client disconnected: ${socket.id}, User ID: ${socket.user?.id}`
      );
    });

    socket.on("error", (err) => {
      console.error(
        `Socket error for user ${socket.user?.id} (${socket.id}):`,
        err
      );
    });
  });

  return io;
};
