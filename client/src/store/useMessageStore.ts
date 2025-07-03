import { create } from "zustand";
import { devtools, persist, createJSONStorage } from "zustand/middleware";

import type { Message, ConversationMessage } from "../ConversationsPage/types";

export interface MessageStore {
  messages: ConversationMessage;
  setMessages: (messages: Message[], conversationId: number) => void;
  addMessage: (message: Message, conversationId: number) => void;
  updateMessage: (message: Message) => void;
}
const useMessageStore = create<MessageStore>()(
  devtools(
    persist(
      (set) => ({
        messages: {},
        setMessages: (messages: Message[], conversationId: number) => {
          set((state) => ({
            messages: {
              ...state.messages,
              [conversationId]: messages,
            },
          }));
        },
        addMessage: (message: Message, conversationId: number) => {
          set((state) => {
            const existingMessages = state.messages[conversationId] || [];
            return {
              messages: {
                ...state.messages,
                [conversationId]: [...existingMessages, message],
              },
            };
          });
        },
        updateMessage: (message: Message) => {
          set((state) => {
            console.log("Updating message:", message);
            return {
              messages: {
                ...state.messages,
                [message.conversationId]: state.messages[
                  message.conversationId
                ].map((msg) => {
                  if (msg.id === message.id || msg.tempId === message.tempId) {
                    return message;
                  }
                  return msg;
                }),
              },
            };
          });
        },
      }),
      {
        name: "messages",
        storage: createJSONStorage(() => localStorage),
      }
    )
  )
);

export default useMessageStore;
