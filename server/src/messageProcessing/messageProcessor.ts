import {
  QUEUE_CONFIG,
  RawMessage,
  ProcessedMessage,
  SocketMessageData,
  SocketEvent,
  MessageStatusEnum,
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
          status: MessageStatusEnum.SENT,
        });
        const processedMessage: ProcessedMessage = {
          ...savedMessage,
          status: MessageStatusEnum.SENT,
          tempId: message.tempId,
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
            id: message.id,
            tempId: message.tempId,
            senderId: message.senderId,
            conversationId: message.conversationId,
            content: message.content,
            createdAt: message.timestamp,
            status: message.status,
          },
          recipientIds: participantIds,
        };
        await rabbitMQ.publish(QUEUE_CONFIG.socket_events.name, socketEvent);
        // await updateMessageStatus(message.id, "delivered");
      } catch (error) {
        // await updateMessageStatus(message.id, "failed");
        logger.error(`Error processing message ${message.id}:`, error);
      }
    }
  );
  await rabbitMQ.consume(
    QUEUE_CONFIG.notification.name,
    async (message: ProcessedMessage) => {
      try {
        // TODO: Implement notification logic, will be triggered when user is not online.
      } catch (error) {
        logger.error(`Error processing message ${message.id}:`, error);
      }
    }
  );
}

startMessageProcessor().catch((error) => {
  logger.error("Failed to start message processor:", error);
});
