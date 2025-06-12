import { useEffect, useState, useRef } from "react";
import { Phone } from "lucide-react";
import { useGetConversations } from "./query/conversationsQuery";
import SearchUser, {
  type SearchUserRef,
} from "../components/customUtils/SearchUser";
import useConversationsStore from "../store/useConversationsStore";
import { getDateString } from "../utils/dateFormatter";
import { type Conversation } from "./types";
import { useSearchUsersQuery } from "../Auth/query/authQuery";
import RotatingArrowLoader from "../components/customUtils/RotatingArrowLoader";
import { type User } from "../Auth/types";
import { useCreateConversationMutation } from "./query/conversationsQuery";
import { useAuthStore } from "../store/useAuthStore";

type Props = {
  onConversationSelection: (conversation: Conversation) => void;
};

export default function ConversationsList({ onConversationSelection }: Props) {
  const [selectedConversationId, setSelectedConversationId] = useState<
    number | undefined
  >();
  const [searchQuery, setSearchQuery] = useState("");
  const searchUserRef = useRef<SearchUserRef>(null);
  const {
    conversations: storedConversations,
    setConversations,
    addConversation,
  } = useConversationsStore();
  const { user: currentUser } = useAuthStore();
  const {
    data: searchUsers,
    isPending: isSearchPending,
    isError: isSearchError,
  } = useSearchUsersQuery(searchQuery);
  const {
    data: fetchedConversations,
    isPending,
    isError,
  } = useGetConversations();

  const createConversationMutation = useCreateConversationMutation(
    (data) => {
      const existing = storedConversations.find((conv) => conv.id === data.id);
      searchUserRef.current?.closeSearch();
      if (existing) {
        setSelectedConversationId(data.id);
        onConversationSelection(data);
        setSearchQuery("");
        return;
      }
      addConversation(data);
      setSelectedConversationId(data.id);
      onConversationSelection(data);
      setSearchQuery("");
    },
    (error) => {
      console.error("Error creating conversation:", error);
      setSearchQuery("");
    }
  );

  useEffect(() => {
    if (!isPending && fetchedConversations?.length) {
      setConversations(fetchedConversations);
    }
  }, [fetchedConversations, isPending, setConversations]);

  const handleConversationClick = (conversation: Conversation) => {
    setSelectedConversationId(conversation.id);
    onConversationSelection(conversation);
  };

  const handleNewConversation = async (user: User) => {
    if (!currentUser?.id) {
      return;
    }
    await createConversationMutation.mutateAsync({
      participantIds: [currentUser.id, user.id],
      type: "private",
    });
  };

  if (isPending) return <div>Loading conversations...</div>;
  if (isError)
    return <div>Error loading conversations. Please try again later.</div>;
  if (!storedConversations?.length) return <div>No conversations found.</div>;

  return (
    <div className="space-y-2 px-1">
      <SearchUser
        ref={searchUserRef}
        onSearch={(query) => setSearchQuery(query)}
      />
      {searchQuery && (
        <>
          {isSearchPending && (
            <RotatingArrowLoader>Searching users ...</RotatingArrowLoader>
          )}
          {isSearchError && (
            <div>Error loading users. Please try again later.</div>
          )}
          {searchUsers?.map((user) => (
            <div
              key={user.id}
              className="bg-gray-200 text-gray-900 px-3 py-3 rounded-lg cursor-pointer transition-colors duration-200 hover:bg-gray-300"
              onClick={() => handleNewConversation(user)}
            >
              <span className="font-semibold text-left">{user.username}</span>
              <span>{" - "}</span>
              <span className="text-xs">{user.email}</span>
              <div className="flex items-center gap-1 px-1">
                <Phone size={16} />
                <span>{" - "}</span>
                <span className="text-xs">{user.phone}</span>
              </div>
            </div>
          ))}
        </>
      )}
      {!searchQuery &&
        storedConversations.map((conversation) => (
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
