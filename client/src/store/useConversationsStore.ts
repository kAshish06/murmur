import { create } from "zustand";
import { devtools, persist, createJSONStorage } from "zustand/middleware";

import type { Conversation } from "../ConversationsPage/types";

interface ConversationStore {
  conversations: Conversation[] | [];
  setConversations: (conversations: Conversation[]) => void;
  addConversation: (conversation: Conversation) => void;
}

const useConversationsStore = create<ConversationStore>()(
  devtools(
    persist(
      (set) => ({
        conversations: [],
        setConversations: (conversations: Conversation[]) =>
          set({ conversations }),
        addConversation: (conversation: Conversation) =>
          set((state) => ({
            conversations: [...state.conversations, conversation],
          })),
      }),
      {
        name: "conversations",
        storage: createJSONStorage(() => localStorage),
      }
    )
  )
);

export default useConversationsStore;
