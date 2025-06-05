import { useEffect, useState } from "react";
import { useGetConversations } from "./query/conversationsQuery";
import useConversationsStore from "../store/useConversationsStore";
import { getDateString } from "../utils/dateFormatter";
import { type Conversation } from "./types";

type Props = {
  onConversationSelection: (conversation: Conversation) => void;
};

export default function ConversationsList({ onConversationSelection }: Props) {
  const [selectedConversationId, setSelectedConversationId] = useState<
    number | undefined
  >();
  const { conversations: storedConversations, setConversations } =
    useConversationsStore();

  const {
    data: fetchedConversations,
    isPending,
    isError,
  } = useGetConversations();

  useEffect(() => {
    if (!isPending && fetchedConversations?.length) {
      setConversations(fetchedConversations);
    }
  }, [fetchedConversations, isPending, setConversations]);

  const handleConversationClick = (conversation: Conversation) => {
    setSelectedConversationId(conversation.id);
    onConversationSelection(conversation);
  };

  if (isPending) return <div>Loading conversations...</div>;
  if (isError)
    return <div>Error loading conversations. Please try again later.</div>;
  if (!storedConversations?.length) return <div>No conversations found.</div>;

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
          onClick={() => handleConversationClick(conversation)}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">
                {conversation.otherParticipants[0].username}
              </h3>
            </div>
            <span className="text-xs">
              {getDateString(conversation.updatedAt)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
