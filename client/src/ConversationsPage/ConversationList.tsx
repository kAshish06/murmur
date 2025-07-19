import { useEffect } from "react";
import { getDateString } from "../utils/dateFormatter";
import useConversationsStore from "../store/useConversationsStore";
import { useGetConversations } from "./query/conversationsQuery";
import { type Conversation } from "./types";

type Props = {
  onConversationSelection: (conversation: Conversation) => void;
};

export const ConversationList = ({ onConversationSelection }: Props) => {
  const {
    data: fetchedConversations,
    isPending,
    isError,
  } = useGetConversations();

  const {
    conversations: storedConversations,
    selectedConversationId,
    setSelectedConversationId,
    setConversations,
  } = useConversationsStore();

  useEffect(() => {
    if (!isPending && fetchedConversations?.length) {
      setConversations(fetchedConversations);
    }
  }, [fetchedConversations, isPending, setConversations]);

  const handleConversationClick = (conversation: Conversation) => {
    setSelectedConversationId(conversation.clientId);
    onConversationSelection(conversation);
  };

  if (isPending) return <div>Loading conversations...</div>;
  if (isError)
    return <div>Error loading conversations. Please try again later.</div>;
  if (!storedConversations?.length) return <div>No conversations found.</div>;

  return storedConversations.map((conversation) => (
    <div
      key={conversation.clientId}
      className={`${
        selectedConversationId === conversation.clientId
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
        <span className="text-xs">{getDateString(conversation.updatedAt)}</span>
      </div>
    </div>
  ));
};

export default ConversationList;
