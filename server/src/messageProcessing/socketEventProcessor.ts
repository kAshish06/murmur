import { QUEUE_CONFIG } from "../types/messages";
import { RabbitMQService } from "../services/rabbitmqService";
import { SocketEvent, SocketMessageData } from "../types/messages";
import { logger } from "../utils/logger";
import { Server as SocketIOServer } from "socket.io";
import { getUsersPresence } from "../services/presenceService";

export async function startSocketEventProcessor(io: SocketIOServer) {
  const rabbitMQ = RabbitMQService.getInstance();
  await rabbitMQ.consume(
    QUEUE_CONFIG.socket_events.name,
    async (event: SocketEvent<SocketMessageData>) => {
      try {
        switch (event.type) {
          case "message":
            const recepientsPresence = await getUsersPresence(
              event.recipientIds
            );
            event.recipientIds.forEach((id) => {
              if (recepientsPresence[id]?.online) {
                io.to(`user:${id.toString()}`).emit(
                  "receiveMessage",
                  event.data
                );
              } else {
                // Publish to rabbitmq
                rabbitMQ.publish(QUEUE_CONFIG.notification.name, event.data);
              }
            });
            break;
          default:
            break;
        }
      } catch (error) {
        logger.error(`Error processing socket event ${event.type}:`, error);
      }
    }
  );
}
