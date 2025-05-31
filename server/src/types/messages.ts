export interface RawMessage {
  messageId: string;
  senderId: number;
  conversationId: number;
  content: string;
  timestamp: Date;
  metadata?: {
    deviceId?: string;
    socketId?: string;
    [key: string]: any;
  };
}

export interface ProcessedMessage extends RawMessage {
  dbId: number;
  status: "delivered" | "pending" | "failed";
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
  messageId: string;
  senderId: number;
  content: string;
  timestamp: Date;
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
