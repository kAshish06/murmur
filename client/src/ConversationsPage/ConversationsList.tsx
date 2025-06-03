import { useEffect, useState } from "react";
import { useGetConversations } from "./query/conversationsQuery";
import useConversationsStore from "../store/useConversationsStore";

type props = {
  onConversationSelection: (conversationId: number) => void;
};
export default function ConversationsList({ onConversationSelection }: props) {
  const [selectedConversationId, setSelectedConversationId] = useState<
    number | undefined
  >();
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
    <div className="space-y-2 px-1">
      {storedConversations.map((conversation) => (
        <div
          key={conversation.id}
          className={`${
            selectedConversationId === conversation.id
              ? "bg-gray-900 text-white hover:bg-black"
              : "hover:bg-gray-200"
          } px-3 py-3 rounded-lg cursor-pointer transition-colors duration-200`}
          onClick={() => {
            setSelectedConversationId(conversation.id);
            onConversationSelection(conversation.id);
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">
                {conversation.otherParticipants[0].username}
              </h3>
              {/* <p className="text-sm text-gray-600">
                {conversation.lastMessage?.slice(0, 50)}
                {conversation.lastMessage?.length > 50 && "..."}
              </p> */}
            </div>
            <span className="text-sm">
              {new Date(conversation.updatedAt).toLocaleTimeString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
