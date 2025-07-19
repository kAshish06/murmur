import { useState, useRef } from "react";
import SearchUser, {
  type SearchUserRef,
} from "../components/customUtils/SearchUser";
import { type Conversation } from "./types";
import { type User } from "../Auth/types";
import { useAuthStore } from "../store/useAuthStore";
import { SearchedUserList } from "../components/customUtils/SearchedUserList";
import ConversationList from "./ConversationList";
import useConversationsStore from "../store/useConversationsStore";

type Props = {
  onConversationSelection: (conversation: Conversation) => void;
};

export default function ConversationsListWithUserSearch({
  onConversationSelection,
}: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const searchUserRef = useRef<SearchUserRef>(null);
  const {
    conversations: storedConversations,
    addConversation,
    setSelectedConversationId,
  } = useConversationsStore();
  const { user: currentUser } = useAuthStore();

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
      {!searchQuery && (
        <ConversationList onConversationSelection={onConversationSelection} />
      )}
    </div>
  );
}
