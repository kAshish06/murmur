export interface MessageQueueItem {
  id: number;
  tempId?: string;
  conversationId: number;
  senderId?: number;
  content: string;
  status: MessageStatusType;
  createdAt: string;
  updatedAt?: string;
  retries?: number;
  lastError?: string;
  lastAttempt?: number;
}
export type MessageStatusType =
  | "PENDING"
  | "SENT"
  | "SEEN"
  | "DELIVERED"
  | "FAILED";
export enum MessageStatus {
  PENDING = "PENDING",
  SENT = "SENT",
  SEEN = "SEEN",
  DELIVERED = "DELIVERED",
  FAILED = "FAILED",
}

export interface MessageQueueStats {
  PENDING: number;
  SENT: number;
  SEEN: number;
  DELIVERED: number;
  FAILED: number;
}

export interface MessageQueueError {
  id: number;
  error: string;
  timestamp: string;
  retryCount: number;
}
