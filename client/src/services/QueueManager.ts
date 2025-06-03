import type { Message } from "../ConversationsPage/types";
import { type MessageQueueItem, MessageStatus } from "../types/messageQueue";
import { messageQueueDB } from "./messageQueueDB";

class QueueManager {
  private outgoingQueue: MessageQueueItem[];
  private retryQueue: Map<number, { retries: number; lastAttempt: number }>;
  private statusUpdateQueue: MessageQueueItem[];

  constructor() {
    this.outgoingQueue = [];
    this.retryQueue = new Map();
    this.statusUpdateQueue = [];
    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      // Load all pending messages
      const pendingMessages = await messageQueueDB.getMessagesByStatus(
        MessageStatus.PENDING
      );
      const failedMessages = await messageQueueDB.getMessagesByStatus(
        MessageStatus.FAILED
      );
      const statusUpdates = await messageQueueDB.getMessagesByStatus(
        MessageStatus.SENT
      );

      // Add to respective queues
      pendingMessages.forEach((msg) => this.addToRetryQueue(msg));
      failedMessages.forEach((msg) => this.addToRetryQueue(msg));
      statusUpdates.forEach((msg) => this.addToStatusUpdateQueue(msg));
    } catch (error) {
      console.error("Failed to initialize queues:", error);
    }
  }

  public async addToOutgoingQueue(
    message: Message | MessageQueueItem
  ): Promise<void> {
    this.outgoingQueue.push(this.convertMessageToMessageQueueItem(message));
  }

  public async addToRetryQueue(
    message: Message | MessageQueueItem
  ): Promise<void> {
    this.retryQueue.set(message.id, {
      retries: 0,
      lastAttempt: Date.now(),
    });
  }

  public async addToStatusUpdateQueue(
    message: Message | MessageQueueItem
  ): Promise<void> {
    this.statusUpdateQueue.push(this.convertMessageToMessageQueueItem(message));
  }

  public async removeFromOutgoingQueue(messageId: number): Promise<void> {
    this.outgoingQueue = this.outgoingQueue.filter(
      (msg) => msg.id !== messageId
    );
  }

  public async removeFromRetryQueue(messageId: number): Promise<void> {
    this.retryQueue.delete(messageId);
  }

  public async removeFromStatusUpdateQueue(messageId: number): Promise<void> {
    this.statusUpdateQueue = this.statusUpdateQueue.filter(
      (msg) => msg.id !== messageId
    );
  }

  public getOutgoingQueue(): MessageQueueItem[] {
    return [...this.outgoingQueue];
  }

  public getOutgoingBatch(size: number): MessageQueueItem[] {
    if (size < 0) {
      throw new Error("Batch size must be a non-negative number");
    }

    return size === 0 ? [] : this.outgoingQueue.splice(0, size);
  }

  public getRetryQueue(): MessageQueueItem[] {
    return Array.from(this.retryQueue.entries())
      .map(
        ([id]) =>
          this.outgoingQueue.find((msg) => msg.id === id) ||
          this.statusUpdateQueue.find((msg) => msg.id === id)
      )
      .filter((msg): msg is MessageQueueItem => msg !== undefined);
  }

  public getRetryBatch(size: number): MessageQueueItem[] {
    if (size < 0) {
      throw new Error("Batch size must be a non-negative number");
    }

    const batch = Array.from(this.retryQueue.entries())
      .map(
        ([id]) =>
          this.outgoingQueue.find((msg) => msg.id === id) ||
          this.statusUpdateQueue.find((msg) => msg.id === id)
      )
      .filter((msg): msg is MessageQueueItem => msg !== undefined);

    return size === 0 ? [] : batch.splice(0, size);
  }

  public getStatusUpdateQueue(): MessageQueueItem[] {
    return [...this.statusUpdateQueue];
  }

  public getStatusUpdateBatch(size: number): MessageQueueItem[] {
    if (size < 0) {
      throw new Error("Batch size must be a non-negative number");
    }

    return size === 0 ? [] : this.statusUpdateQueue.splice(0, size);
  }

  public async getQueueStats(): Promise<{
    outgoing: number;
    retry: number;
    statusUpdate: number;
  }> {
    return {
      outgoing: this.outgoingQueue.length,
      retry: this.retryQueue.size,
      statusUpdate: this.statusUpdateQueue.length,
    };
  }

  public async cleanup(): Promise<void> {
    await messageQueueDB.cleanupOldMessages(7);
  }

  private convertMessageToMessageQueueItem(message: Message): MessageQueueItem {
    return {
      id: message.id,
      tempId: message.tempId,
      conversationId: message.conversationId,
      senderId: message.senderId,
      content: message.content,
      status: message.status,
      createdAt: message.createdAt,
      retries: 0,
      lastError: undefined,
      lastAttempt: undefined,
    };
  }
}

export default QueueManager;
