import { Message } from "@prisma/client";

export interface RawMessage {
  messageId: number | string;
  tempId?: string;
  senderId: number;
  conversationId: number;
  content: string;
  timestamp: string;
  metadata?: {
    deviceId?: string;
    socketId?: string;
    [key: string]: any;
  };
}
export type MessageStatus =
  | "PENDING"
  | "SENT"
  | "SEEN"
  | "DELIVERED"
  | "FAILED";

export enum MessageStatusEnum {
  PENDING = "PENDING",
  SENT = "SENT",
  SEEN = "SEEN",
  DELIVERED = "DELIVERED",
  FAILED = "FAILED",
}

export interface ProcessedMessage extends Message {
  id: number;
  tempId?: string;
  status: MessageStatus;
  timestamp: string;
  error?: string;
}

export interface NotificationMessage extends ProcessedMessage {
  deliveryAttempts: number;
  lastAttempt: Date;
  maxAttempts: number;
}

export interface QueueConfig {
  name: string;
  durable: boolean;
  autoDelete: boolean;
}

export const QUEUE_CONFIG: {
  [key: string]: QueueConfig;
} = {
  incoming: {
    name: "incoming_messages",
    durable: true,
    autoDelete: false,
  },
  outgoing: {
    name: "outgoing_messages",
    durable: true,
    autoDelete: false,
  },
  notification: {
    name: "notification_messages",
    durable: true,
    autoDelete: false,
  },
  socket_events: {
    name: "socket_events",
    durable: true,
    autoDelete: false,
  },
};

export interface SocketMessageData {
  id: string | number;
  tempId?: string;
  senderId: number;
  conversationId: number;
  content: string;
  createdAt: string;
  status: MessageStatus;
  metadata?: {
    deviceId?: string;
    socketId?: string;
  };
}

export interface SocketPresenceData {
  userId: number;
  online: boolean;
  lastSeen: Date;
}
export interface SocketErrorData {
  error: string;
  messageId: string;
  timestamp: Date;
}
export type SocketEventData =
  | SocketMessageData
  | SocketPresenceData
  | SocketErrorData;
export interface SocketEvent<T> {
  type: "message" | "presence" | "error";
  data: SocketEventData;
  recipientIds: number[];
}
