import { Server as SocketIOServer, Socket } from "socket.io";
import http from "http";
import { userConnected, userDisconnected } from "../services/presenceService";
import { v4 as uuidv4 } from "uuid";
import { logger } from "../utils/logger";
import { QUEUE_CONFIG, RawMessage } from "../types/messages";
import { RabbitMQService } from "../services/rabbitmqService";

export interface AuthenticatedSocket extends Socket {
  user?: { id: number };
  deviceId?: string;
}

export type MessageStatus =
  | "pending"
  | "sent"
  | "seen"
  | "delivered"
  | "failed";

interface IncomingMessage {
  conversationId: number;
  recipientId?: number;
  updatedAt: string;
  id: number;
  tempId?: string;
  createdAt: string;
  senderId?: number;
  content: string;
  status: MessageStatus;
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

  io.on("connection", async (socket: AuthenticatedSocket) => {
    if (!socket.user?.id) {
      logger.warn(`Unauthenticated socket connection attempt: ${socket.id}`);
      socket.disconnect();
      return;
    }

    try {
      const deviceId = uuidv4();
      socket.deviceId = deviceId;

      await userConnected(socket.user.id, deviceId, socket.id);

      logger.info(
        `User ${socket.user.id} connected with device ${deviceId} (socket: ${socket.id})`
      );

      // Join user's personal room for direct messages and presence updates
      socket.join(`user:${socket.user.id}`);

      socket.on(
        "sendMessage",
        async (message: IncomingMessage, callback?: (error?: any) => void) => {
          if (!socket.user?.id) {
            logger.warn(
              `Received message from unauthenticated socket: ${socket.id}`
            );
            if (callback) {
              callback({ error: "Authentication required" });
            }
            return;
          }

          const senderId = socket.user.id;
          const { conversationId, content, recipientId } = message;

          if ((!conversationId && !recipientId) || !content) {
            logger.warn(
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

          try {
            const rawMessage: RawMessage = {
              messageId: message.id,
              tempId: message.tempId,
              conversationId,
              senderId,
              content: message.content,
              timestamp: message.createdAt,
              metadata: {
                deviceId: socket.deviceId,
                socketId: socket.id,
              },
            };
            if (recipientId) {
              logger.info("message received with recipientId");
              rawMessage.recipientId = recipientId;
            }

            await RabbitMQService.getInstance().publish(
              QUEUE_CONFIG.incoming.name,
              rawMessage
            );

            if (callback) {
              callback();
            }
          } catch (error) {
            logger.error(
              `Error publishing message for user ${senderId} in conversation ${conversationId}:`,
              error
            );
            if (callback) {
              callback({ error: "Failed to send message" });
            }
          }
        }
      );

      socket.on("disconnect", async () => {
        if (socket.user?.id && socket.deviceId) {
          try {
            await userDisconnected(socket.user.id, socket.deviceId);
            logger.info(
              `User ${socket.user.id} disconnected device ${socket.deviceId} (socket: ${socket.id})`
            );
          } catch (error) {
            logger.error(
              `Error handling disconnection for user ${socket.user.id}:`,
              error
            );
          }
        }
      });

      socket.on("error", (err) => {
        logger.error(
          `Socket error for user ${socket.user?.id} (${socket.id}):`,
          err
        );
      });
    } catch (error) {
      logger.error(`Error handling socket connection:`, error);
      socket.disconnect();
    }
  });

  return io;
};
