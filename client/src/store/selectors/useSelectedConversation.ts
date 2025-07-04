import useConversationsStore from "../useConversationsStore";

export default function useSelectedConversation() {
  return useConversationsStore(({ selectedConversationId, conversations }) => {
    if (!selectedConversationId) return null;
    return conversations.find(
      (conv) => conv.clientId === selectedConversationId
    );
  });
}
