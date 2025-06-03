export type ConversationParticipant = {
  id: number;
  username: string;
};

export type Conversation = {
  id: number;
  type: string;
  createdAt: string;
  updatedAt: string;
  otherParticipants: ConversationParticipant[];
  lastMessage: string;
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
};

export type ConversationMessage = {
  [conversationId: string]: Message[];
};
