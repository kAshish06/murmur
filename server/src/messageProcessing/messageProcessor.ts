import {
  QUEUE_CONFIG,
  RawMessage,
  ProcessedMessage,
  SocketMessageData,
  SocketEvent,
} from "../types/messages";
import { RabbitMQService } from "../services/rabbitmqService";
import {
  createMessage,
  getConversationParticipants,
} from "../services/chatService";
import { logger } from "../utils/logger";

export async function startMessageProcessor() {
  const rabbitMQ = RabbitMQService.getInstance();
  await rabbitMQ.consume(
    QUEUE_CONFIG.incoming.name,
    async (message: RawMessage) => {
      try {
        const savedMessage = await createMessage({
          conversationId: message.conversationId,
          senderId: message.senderId,
          content: message.content,
        });
        const processedMessage: ProcessedMessage = {
          ...savedMessage,
          status: "pending",
          dbId: savedMessage.id,
          messageId: message.messageId,
          conversationId: message.conversationId,
          timestamp: message.timestamp,
        };
        await rabbitMQ.publish(QUEUE_CONFIG.outgoing.name, processedMessage);
        logger.info(
          `Message ${message.messageId} processed and pushed to outgoing queue`
        );
      } catch (error) {
        logger.error(`Error processing message ${message.messageId}:`, error);
      }
    }
  );
  await rabbitMQ.consume(
    QUEUE_CONFIG.outgoing.name,
    async (message: ProcessedMessage) => {
      try {
        const participantIds = await getConversationParticipants(
          message.conversationId
        );
        const socketEvent: SocketEvent<SocketMessageData> = {
          type: "message",
          data: {
            messageId: message.messageId,
            senderId: message.senderId,
            content: message.content,
            timestamp: message.timestamp,
          },
          recipientIds: participantIds,
        };
        await rabbitMQ.publish(QUEUE_CONFIG.socket_events.name, socketEvent);
        // await updateMessageStatus(message.dbId, "delivered");
      } catch (error) {
        // await updateMessageStatus(message.dbId, "failed");
        logger.error(`Error processing message ${message.messageId}:`, error);
      }
    }
  );
  await rabbitMQ.consume(
    QUEUE_CONFIG.notification.name,
    async (message: ProcessedMessage) => {
      try {
        // TODO: Implement notification logic, will be triggered when user is not online.
      } catch (error) {
        logger.error(`Error processing message ${message.messageId}:`, error);
      }
    }
  );
}

startMessageProcessor().catch((error) => {
  logger.error("Failed to start message processor:", error);
});
