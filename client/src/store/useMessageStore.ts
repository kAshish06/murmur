import { create } from "zustand";
import { devtools, persist, createJSONStorage } from "zustand/middleware";

import type { Message, ConversationMessage } from "../ConversationsPage/types";

interface MessageStore {
  messages: ConversationMessage;
  setMessages: (messages: Message[], conversationId: string) => void;
  addMessage: (message: Message, conversationId: string) => void;
}
const useMessageStore = create<MessageStore>()(
  devtools(
    persist(
      (set) => ({
        messages: {},
        setMessages: (messages: Message[], conversationId: string) => {
          set((state) => ({
            messages: {
              ...state.messages,
              [conversationId]: messages,
            },
          }));
        },
        addMessage: (message: Message, conversationId: string) => {
          set((state) => {
            const newState = { ...state };
            newState.messages[conversationId].push(message);
            return newState;
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
