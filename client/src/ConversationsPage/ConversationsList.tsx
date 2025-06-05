import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useGetConversations } from "./query/conversationsQuery";
import SearchUser from "../components/customUtils/SearchUser";
import useConversationsStore from "../store/useConversationsStore";
import { getDateString } from "../utils/dateFormatter";
import { type Conversation } from "./types";
import { useSearchUsersQuery } from "../Auth/query/authQuery";
import RotatingArrowLoader from "../components/customUtils/RotatingArrowLoader";

type Props = {
  onConversationSelection: (conversation: Conversation) => void;
};

export default function ConversationsList({ onConversationSelection }: Props) {
  const [selectedConversationId, setSelectedConversationId] = useState<
    number | undefined
  >();
  const [searchQuery, setSearchQuery] = useState("");
  const { conversations: storedConversations, setConversations } =
    useConversationsStore();
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
      <SearchUser onSearch={(query) => setSearchQuery(query)} />
      {searchQuery && (
        <div className="flex flex-col gap-2">
          <div className="flex justify-end">
            <X onClick={() => setSearchQuery("")} />
          </div>
          <div className="flex flex-1 justify-center">
            {isSearchPending && (
              <RotatingArrowLoader>Searching users ...</RotatingArrowLoader>
            )}
            {isSearchError && (
              <div>Error loading users. Please try again later.</div>
            )}
            {searchUsers?.map((user) => (
              <div
                key={user.id}
                className={`bg-gray-200 text-gray-900 px-3 py-3 rounded-lg cursor-pointer transition-colors duration-200 hover:`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{user.username}</h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
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
