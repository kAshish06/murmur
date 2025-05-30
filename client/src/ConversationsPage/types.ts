export type ConversationParticipant = {
  id: number;
  username: string;
};
export type Conversation = {
  id: string;
  type: string;
  createdAt: Date;
  updatedAt: Date;
  otherParticipants: ConversationParticipant[];
  lastMessage: string;
};

export type Message = {
  conversationId: number;
  updatedAt: string;
  id: number;
  createdAt: string;
  senderId: number;
  content: string;
  sender: ConversationParticipant;
};

export type ConversationMessage = {
  [conversationId: string]: Message[];
};
