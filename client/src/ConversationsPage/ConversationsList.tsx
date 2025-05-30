import { useEffect } from "react";
import { useGetConversations } from "./query/conversationsQuery";
import useConversationsStore from "../store/useConversationsStore";

type props = {
  onConversationSelection: (conversationId: string) => void;
};
export default function ConversationsList({ onConversationSelection }: props) {
  const { conversations: storedConversations, setConversations } =
    useConversationsStore();
  const {
    data: fetchedConversations,
    isPending,
    isError,
    error,
  } = useGetConversations();

  useEffect(() => {
    if (!isPending && fetchedConversations && fetchedConversations.length > 0) {
      setConversations(fetchedConversations);
    }
  }, [fetchedConversations, isPending, setConversations]);

  if (isPending) {
    return <div>Loading conversations...</div>;
  }

  if (isError) {
    console.error("Error fetching conversations:", error);
    return <div>Error loading conversations. Please try again later.</div>;
  }

  if (!storedConversations || storedConversations.length === 0) {
    return <div>No conversations found.</div>;
  }

  return (
    <div className="">
      <ul>
        {storedConversations.map((conversation) => (
          <li
            key={conversation.id}
            className="py-2 cursor-pointer hover:bg-gray-50"
            onClick={() => onConversationSelection(conversation.id)}
          >
            {conversation.otherParticipants[0].username}
          </li>
        ))}
      </ul>
    </div>
  );
}
