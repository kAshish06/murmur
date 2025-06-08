import { type MessageQueueItem, MessageStatus } from "../types/messageQueue";
import QueueManager from "./QueueManager";
import { messageQueueDB } from "./messageQueueDB";
import { Socket } from "socket.io-client";
import useMessageStore from "../store/useMessageStore";
import useConversationStore from "../store/useConversationsStore";

class QueueProcessor {
  private queueManager: QueueManager;
  private socket: Socket;
  private processing: Set<number>;
  private RETRY_DELAY = 2000; // 2 seconds
  private BATCH_SIZE = 10;
  private PROCESSING_INTERVAL = 1000; // 1 second
  private processingInterval!: NodeJS.Timeout;

  constructor(socket: Socket, queueManager: QueueManager) {
    this.socket = socket;
    this.queueManager = queueManager;
    this.processing = new Set();
    this.initialize();
  }

  private initialize(): void {
    // Set up socket listeners
    this.setupSocketListeners();
  }

  private setupSocketListeners(): void {
    this.socket.on("connect", () => {
      this.handleSocketConnect();
    });

    this.socket.on("disconnect", (reason) => {
      this.handleSocketDisconnect(reason);
    });

    this.socket.on("connect_error", (error) => {
      this.handleSocketError(error);
    });
  }

  public startProcessing(): void {
    this.processingInterval = setInterval(() => {
      this.processQueues();
    }, this.PROCESSING_INTERVAL);
  }

  private async processQueues(): Promise<void> {
    try {
      // 1. Process outgoing queue (highest priority)
      await this.processOutgoingQueue();

      // 2. Process status update queue
      await this.processStatusUpdateQueue();

      // 3. Process retry queue (lowest priority)
      await this.processRetryQueue();
    } catch (error) {
      console.error("Error processing queues:", error);
    }
  }

  private async processOutgoingQueue(): Promise<void> {
    const batch = this.queueManager.getOutgoingBatch(this.BATCH_SIZE);

    if (batch.length > 0) {
      for (const message of batch) {
        await this.processMessage(message);
      }
    }
  }

  private async processStatusUpdateQueue(): Promise<void> {
    const batch = this.queueManager.getIncomingMessageBatch(this.BATCH_SIZE);

    if (batch.length > 0) {
      for (const message of batch) {
        await this.handleIncomingMessages(message);
      }
    }
  }

  private async processRetryQueue(): Promise<void> {
    const now = Date.now();
    const batch = this.queueManager.getRetryBatch(this.BATCH_SIZE);
    const readyForRetry: MessageQueueItem[] = [];

    for (const message of batch) {
      const timeSinceLastAttempt =
        message.lastAttempt && now - message.lastAttempt;
      if (timeSinceLastAttempt && timeSinceLastAttempt >= this.RETRY_DELAY) {
        readyForRetry.push(message);
      }
    }

    if (readyForRetry.length > 0) {
      for (const message of readyForRetry) {
        try {
          // Send message via socket
          await this.sendMessage(message);

          // Remove from retry queue if successful
          await this.queueManager.removeFromRetryQueue(message.id);
        } catch (error) {
          // Handle error but keep in retry queue
          console.error(`Failed to retry message ${message.id}:`, error);

          // Update last attempt time
          await this.queueManager.addToRetryQueue({
            ...message,
            lastAttempt: Date.now(),
          });
        }
      }
    }
  }

  private async processMessage(message: MessageQueueItem): Promise<void> {
    try {
      // Add to processing set
      this.processing.add(message.id);

      // Update UI with initial message
      const messageToPush = {
        conversationId: message.conversationId,
        updatedAt: message.updatedAt,
        createdAt: message.createdAt,
        id: message.id,
        tempId: message.tempId,
        senderId: message.senderId,
        content: message.content,
        sender: {
          id: Number(message.senderId),
          username: "",
        },
        status: MessageStatus.PENDING,
      };
      const messageStore = useMessageStore.getState();
      const { addMessage } = messageStore;
      addMessage(messageToPush, message.conversationId);

      // Save message to IndexedDB
      await messageQueueDB.addMessage(messageToPush);

      // Send message via socket
      await this.sendMessage(messageToPush);
    } catch {
      // Handle error
      await this.handleError(message);
    } finally {
      this.processing.delete(message.id);
      await this.queueManager.removeFromOutgoingQueue(message.id);
    }
  }

  private async sendMessage(message: MessageQueueItem): Promise<void> {
    // Send message via socket
    console.log("sending msg to socket", message);
    this.socket.emit("sendMessage", message);
  }

  private async handleIncomingMessages(
    message: MessageQueueItem
  ): Promise<void> {
    try {
      this.processing.add(message.id);
      // Update database
      const result = await messageQueueDB.updateMessageStatus(
        message.status,
        message.tempId
      );
      if ("error" in result) {
        await messageQueueDB.addMessage(message);
      }

      // Get current state
      const messageStore = useMessageStore.getState();
      const conversationStore = useConversationStore.getState();
      const { updateMessage, addMessage } = messageStore;
      const { updateConversation } = conversationStore;

      // Prepare message data
      const messageData = {
        id: message.id,
        status: message.status,
        updatedAt: message.updatedAt,
        conversationId: message.conversationId,
        createdAt: message.createdAt,
        content: message.content,
        senderId: message.senderId,
        tempId: message.tempId,
      };

      // Check if message exists in the store
      const conversationMessages =
        messageStore.messages[message.conversationId] || [];
      const messageExists = conversationMessages.some(
        (msg) => msg.id === message.id || msg.tempId === message.tempId
      );

      // Update or add message based on existence
      if (messageExists) {
        updateMessage(messageData);
      } else {
        addMessage(messageData, message.conversationId);
      }

      // Update conversation timestamp if needed
      if (message.updatedAt) {
        console.log("Updating conversation timestamp:", message.conversationId);
        updateConversation(message.conversationId, message.updatedAt);
      }
    } catch (error) {
      console.error("Error updating message status:", error);
      throw error;
    } finally {
      this.processing.delete(message.id);
      await this.queueManager.removeFromOutgoingQueue(message.id);
    }
  }

  private async handleError(message: MessageQueueItem): Promise<void> {
    try {
      // Update status to pending with error
      await this.handleIncomingMessages({
        ...message,
        status: MessageStatus.PENDING,
      });

      // Add to retry queue
      await this.queueManager.addToRetryQueue(message);
    } catch (error) {
      console.error("Error handling message error:", error);
    }
  }

  private handleSocketConnect(): void {
    console.log("Socket connected");
    this.processing.clear();
  }

  private handleSocketDisconnect(reason: string): void {
    console.log("Socket disconnected:", reason);
    // Handle any pending messages
    this.addUnprocessedMessagesToRetryQueue();
  }

  private handleSocketError(error: Error): void {
    console.error("Socket error:", error);
    this.addUnprocessedMessagesToRetryQueue();
  }

  public async cleanup(): Promise<void> {
    clearInterval(this.processingInterval);
    this.processing.clear();
  }

  private addUnprocessedMessagesToRetryQueue(): void {
    this.processing.forEach((id) => {
      this.queueManager.addToRetryQueue({
        ...(this.queueManager.getOutgoingQueue().find((msg) => msg.id === id) ||
          this.queueManager
            .getIncomingMessageQueue()
            .find((msg) => msg.id === id)!),
        lastAttempt: Date.now(),
      });
    });
  }
}

export default QueueProcessor;
