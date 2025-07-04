import { useEffect, useState, useRef } from "react";
import { useGetConversations } from "./query/conversationsQuery";
import SearchUser, {
  type SearchUserRef,
} from "../components/customUtils/SearchUser";
import useConversationsStore from "../store/useConversationsStore";
import { getDateString } from "../utils/dateFormatter";
import { type Conversation } from "./types";
import { type User } from "../Auth/types";
import { useAuthStore } from "../store/useAuthStore";
import { SearchedUserList } from "../components/customUtils/SearchedUserList";

type Props = {
  onConversationSelection: (conversation: Conversation) => void;
};

export default function ConversationsList({ onConversationSelection }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const searchUserRef = useRef<SearchUserRef>(null);
  const {
    conversations: storedConversations,
    selectedConversationId,
    setConversations,
    addConversation,
    setSelectedConversationId,
  } = useConversationsStore();
  const { user: currentUser } = useAuthStore();
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
    setSelectedConversationId(conversation.clientId);
    onConversationSelection(conversation);
  };

  const handleSearchedUserClick = async (user: User) => {
    if (!currentUser?.id) {
      return;
    }
    const existingConversation = storedConversations.find(
      (conv) => conv.otherParticipants[0].id === user.id
    );
    let conversation: Conversation;
    if (existingConversation) {
      conversation = existingConversation;
    } else {
      const currentTime = Date.now();
      conversation = {
        id: currentTime,
        clientId: currentTime,
        type: "private",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        otherParticipants: [{ id: user.id, username: user.username }],
        lastMessage: "",
        isTemporary: true,
      };
      addConversation(conversation);
    }
    setSelectedConversationId(conversation.clientId);
    onConversationSelection(conversation);
    searchUserRef.current?.closeSearch();
  };

  if (isPending) return <div>Loading conversations...</div>;
  if (isError)
    return <div>Error loading conversations. Please try again later.</div>;
  if (!storedConversations?.length) return <div>No conversations found.</div>;

  return (
    <div className="space-y-2 px-1">
      <h2 className="text-xl font-semibold text-left p-4 pl-2">
        Conversations
      </h2>
      <div className="pl-2 pb-4 pr-4">
        <SearchUser
          ref={searchUserRef}
          onSearch={(query) => setSearchQuery(query)}
        />
      </div>
      <SearchedUserList
        searchQuery={searchQuery}
        handleUserClick={handleSearchedUserClick}
      />
      {!searchQuery &&
        storedConversations.map((conversation) => (
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
              <span className="text-xs">
                {getDateString(conversation.updatedAt)}
              </span>
            </div>
          </div>
        ))}
    </div>
  );
}
