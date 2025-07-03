import { useCallback, useState } from "react";
import { Menu } from "lucide-react";
import ConversationsList from "./ConversationsList";
import ConversationPane from "./ConversationPane";
import { useAuthStore } from "../store/useAuthStore";
import { useMessageContext } from "./context/useMessageContext";
import { MessageStatus } from "../types/messageQueue";
import { MessageInput } from "./MessageInput";
import type { Conversation } from "./types";
import useMobileView from "../hooks/useMobileView";

export default function ConversationsPage() {
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation>();
  const isMobileView = useMobileView();
  const [showList, setShowList] = useState(true);
  const user = useAuthStore((state) => state.user);
  const {
    sendMessage,
    socket: { socket, isConnected },
  } = useMessageContext();
  const handleConversationSelection = useCallback(
    (conversation: Conversation) => {
      setSelectedConversation(conversation);
      if (isMobileView) {
        setShowList(false);
      }
    },
    [isMobileView]
  );

  const handleSendMessage = useCallback(
    (message: string) => {
      if (!socket || !isConnected || !user || !selectedConversation) return;

      console.log("Sending message:", message);
      const tempId = Date.now();
      const messagePayload = {
        id: tempId,
        tempId: tempId.toString(),
        conversationId: Number(selectedConversation.id),
        senderId: user.id,
        content: message,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sender: {
          id: user?.id,
          username: user?.username,
        },
        status: MessageStatus.PENDING,
        recipientId: 0,
      };
      if (selectedConversation.isTemporary) {
        messagePayload.recipientId =
          selectedConversation.otherParticipants[0].id;
      }
      sendMessage(messagePayload);
    },
    [socket, isConnected, user, selectedConversation, sendMessage]
  );

  return (
    <div className="flex flex-col flex-1 overflow-auto border border-gray-200 rounded-lg">
      {isMobileView && (
        <div className="flex items-center p-4 border-b border-gray-100">
          <div className="flex-1">
            <Menu onClick={() => setShowList((prev) => !prev)} />
          </div>
          <h3 className="flex-2 text-left text-xl font-semibold text-gray-900">
            {selectedConversation?.otherParticipants[0].username}
          </h3>
        </div>
      )}
      <div className="flex flex-1 overflow-auto">
        {isMobileView ? (
          <>
            {showList && (
              <div className="w-2/3 border-r border-gray-300">
                <ConversationsList
                  onConversationSelection={handleConversationSelection}
                />
              </div>
            )}
          </>
        ) : (
          <div className="w-1/4 border-r border-gray-300">
            <ConversationsList
              onConversationSelection={handleConversationSelection}
            />
          </div>
        )}
        <div
          className={`${
            showList ? (isMobileView ? "w-1/3" : "w-3/4") : "w-full"
          } flex flex-col justify-between`}
        >
          {!selectedConversation?.id && (
            <div className="flex flex-1 items-center justify-center">
              Select a contact to view the conversation.
            </div>
          )}
          {selectedConversation?.id && (
            <ConversationPane
              selectedConversation={selectedConversation}
              key={selectedConversation.id}
            />
          )}

          <MessageInput
            onSend={handleSendMessage}
            disabled={!socket || !isConnected || !selectedConversation?.id}
          />
        </div>
      </div>
    </div>
  );
}
