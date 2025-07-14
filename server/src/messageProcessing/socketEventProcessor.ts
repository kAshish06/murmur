import { MessageStatusEnum, QUEUE_CONFIG } from "../types/messages";
import { RabbitMQService } from "../services/rabbitmqService";
import { SocketEvent, SocketMessageData } from "../types/messages";
import { logger } from "../utils/logger";
import { Server as SocketIOServer } from "socket.io";
import { getUsersPresence } from "../services/presenceService";
import { updateMessage } from "../services/chatService";

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
            const isRecepientOnline =
              event.recipientIds.filter(
                (id) =>
                  id !== event.data.message.senderId &&
                  recepientsPresence[id]?.online
              ).length > 0;
            if (isRecepientOnline) {
              event.data.message.status = MessageStatusEnum.DELIVERED;
            }
            event.recipientIds.forEach((id) => {
              if (recepientsPresence[id]?.online) {
                io.to(`user:${id.toString()}`).emit(
                  "receiveMessage",
                  event.data
                );
                logger.info(
                  `Message ${event.data} sent to user ${id} successfully`
                );
              } else {
                // Publish to rabbitmq
                rabbitMQ.publish(QUEUE_CONFIG.notification.name, event.data);
              }
            });
            // Ideally, one should have a different queue for updating db table and this should be pushed to that queue so that
            // retries are also handled.
            updateMessage(event.data.message.id, {
              status: MessageStatusEnum.DELIVERED,
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
