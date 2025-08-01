import { createContext } from "react";
import { Socket } from "socket.io-client";
import { type Message } from "../types";

export const MessageContext = createContext<{
  getConversationMessages: (conversationId: number) => Message[];
  setMessagesInStore: (messages: Message[], conversationId: number) => void;
  addMessageInStore: (message: Message, conversationId: number) => void;
  sendMessage: (message: Message) => void;
  socket: {
    socket: Socket | null;
    isConnected: boolean;
  };
} | null>(null);
