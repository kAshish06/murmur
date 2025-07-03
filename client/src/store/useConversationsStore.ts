import { create } from "zustand";
import { devtools, persist, createJSONStorage } from "zustand/middleware";

import type { Conversation } from "../ConversationsPage/types";

interface ConversationStore {
  conversations: Conversation[] | [];
  setConversations: (conversations: Conversation[]) => void;
  addConversation: (conversation: Conversation) => void;
  updateConversation: (conversationId: number, updatedAt: string) => void;
  replaceTemporaryConversation: (
    conversation: Conversation & { oldConversationId?: number }
  ) => void;
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
        updateConversation: (conversationId: number, updatedAt: string) =>
          set((state) => ({
            conversations: state.conversations.map((conv) =>
              conv.id === conversationId ? { ...conv, updatedAt } : conv
            ),
          })),
        replaceTemporaryConversation: (conversation) =>
          set((state) => {
            const existingConversationIndex = state.conversations?.findIndex(
              (conv) => conv.id === conversation.oldConversationId
            );
            delete conversation.oldConversationId;
            const newConversations = [...state.conversations];
            newConversations[existingConversationIndex] = conversation;
            return {
              conversations: newConversations,
            };
          }),
      }),
      {
        name: "conversations",
        storage: createJSONStorage(() => localStorage),
      }
    )
  )
);

export default useConversationsStore;
