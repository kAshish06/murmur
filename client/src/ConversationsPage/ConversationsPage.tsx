import { useCallback, useState } from "react";
import ConversationsList from "./ConversationsList";
import ConversationPane from "./ConversationPane";
import { useAuthStore } from "../store/useAuthStore";
import { useMessageContext } from "./context/useMessageContext";
import { MessageStatus } from "../types/messageQueue";
import { MessageInput } from "./MessageInput";
import type { Conversation } from "./types";

export default function ConversationsPage() {
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation>();
  const user = useAuthStore((state) => state.user);
  const {
    sendMessage,
    socket: { socket, isConnected },
  } = useMessageContext();
  const handleConversationSelection = useCallback(
    (conversation: Conversation) => {
      setSelectedConversation(conversation);
    },
    []
  );

  const handleSendMessage = useCallback(
    (message: string) => {
      if (!socket || !isConnected || !user || !selectedConversation) return;

      console.log("Sending message:", message);
      const tempId = Date.now();
      sendMessage({
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
      });
    },
    [socket, isConnected, user, selectedConversation, sendMessage]
  );

  return (
    <div className="flex flex-1 overflow-auto">
      <div className="w-1/3 border-r">
        <ConversationsList
          onConversationSelection={handleConversationSelection}
        />
      </div>
      <div className="w-2/3 flex flex-col justify-between">
        {!selectedConversation?.id && (
          <span>Select a contact to view the conversation.</span>
        )}
        {selectedConversation?.id && (
          <ConversationPane selectedConversation={selectedConversation} />
        )}

        <MessageInput
          onSend={handleSendMessage}
          disabled={!socket || !isConnected || !selectedConversation?.id}
        />
      </div>
    </div>
  );
}
