import {
  QUEUE_CONFIG,
  RawMessage,
  ProcessedMessageWithConversation,
  SocketMessageData,
  SocketEvent,
  MessageStatusEnum,
} from "../types/messages";
import { RabbitMQService } from "../services/rabbitmqService";
import {
  createMessage,
  createConversation,
  getConversationParticipants,
  ConversationResponse,
} from "../services/chatService";
import { logger } from "../utils/logger";
import { Message } from "@prisma/client";

export async function startMessageProcessor() {
  const rabbitMQ = RabbitMQService.getInstance();
  await rabbitMQ.consume(
    QUEUE_CONFIG.incoming.name,
    async (message: RawMessage) => {
      try {
        /**
         * Client can send a message with conversation id if a conversation is already created or
         * Or a message with a recipient id if a conversation does not exist between them.
         * Client must send either the conversation id or recipient id.
         * */
        let savedMessage: Message = {
          id: 0,
          conversationId: 0,
          senderId: 0,
          content: "",
          status: "PENDING",
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        let conversation: ConversationResponse | undefined;
        if (message.conversationId) {
          const newMessage = await createMessage({
            conversationId: message.conversationId,
            senderId: message.senderId,
            content: message.content,
            status: MessageStatusEnum.SENT,
          });
          savedMessage = newMessage.message;
        } else if (message.recipientId) {
          /** Create a conversation first and then create a message */
          conversation = await createConversation("private", [
            message.recipientId,
            message.senderId,
          ]);
          const newMessage = await createMessage({
            conversationId: conversation.id,
            senderId: message.senderId,
            content: message.content,
            status: MessageStatusEnum.SENT,
          });
          savedMessage = newMessage.message;
        }
        const processedMessage: ProcessedMessageWithConversation = {
          message: {
            ...savedMessage,
            status: MessageStatusEnum.SENT,
            tempId: message.tempId,
            timestamp: message.timestamp,
          },
          conversation,
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
    async ({ message, conversation }: ProcessedMessageWithConversation) => {
      try {
        const participantIds = await getConversationParticipants(
          message.conversationId
        );
        const socketEvent: SocketEvent<SocketMessageData> = {
          type: "message",
          data: {
            message: {
              id: message.id,
              tempId: message.tempId,
              senderId: message.senderId,
              conversationId: message.conversationId,
              content: message.content,
              createdAt: message.timestamp,
              status: message.status,
              sender: {
                id: message.senderId,
              },
            },
            conversation,
          },
          recipientIds: participantIds,
        };
        await rabbitMQ.publish(QUEUE_CONFIG.socket_events.name, socketEvent);
      } catch (error) {
        logger.error(`Error processing message ${message.id}:`, error);
      }
    }
  );
  await rabbitMQ.consume(
    QUEUE_CONFIG.notification.name,
    async ({ message }: ProcessedMessageWithConversation) => {
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
