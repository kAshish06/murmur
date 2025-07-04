import { type MessageQueueItem } from "../types/messageQueue";
export type ConversationParticipant = {
  id: number;
  username: string;
};

export type Conversation = {
  id: number;
  clientId: number;
  type: string;
  createdAt: string;
  updatedAt: string;
  otherParticipants: ConversationParticipant[];
  lastMessage: string;
  isTemporary?: boolean;
};

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

export type Message = {
  conversationId: number;
  updatedAt?: string;
  id: number;
  tempId?: string;
  createdAt: string;
  senderId?: number;
  content: string;
  sender?: ConversationParticipant;
  status: MessageStatus;
  recipientId?: number;
};

export type SocketReceivedData = {
  message: Message | MessageQueueItem;
  conversation?: Conversation;
};

export type ConversationMessage = {
  [conversationId: string]: Message[];
};

export type UserPresenceData = {
  online: boolean;
  lastSeen: number;
  devices: Record<string, string>;
};
