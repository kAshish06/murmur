import { useCallback, useState } from "react";
import ConversationsHeader from "./ConversationsHeader";
import ConversationsList from "./ConversationsList";
import ConversationPane from "./ConversationPane";
import { useAuthStore } from "../store/useAuthStore";
import { useMessageContext } from "./context/useMessageContext";
import { MessageStatus } from "../types/messageQueue";
import { MessageInput } from "./MessageInput";

export default function ConversationsPage() {
  const [selectedConversationId, setSelectedConversationId] =
    useState<number>();
  const user = useAuthStore((state) => state.user);
  const {
    sendMessage,
    socket: { socket, isConnected },
  } = useMessageContext();
  const handleConversationSelection = useCallback((conversationId: number) => {
    setSelectedConversationId(conversationId);
  }, []);

  const handleSendMessage = useCallback(
    (message: string) => {
      if (!socket || !isConnected || !user || !selectedConversationId) return;

      console.log("Sending message:", message);
      const tempId = Date.now();
      sendMessage({
        id: tempId,
        tempId: tempId.toString(),
        conversationId: Number(selectedConversationId),
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
    [socket, isConnected, user, selectedConversationId, sendMessage]
  );

  return (
    <div className="flex flex-col h-full">
      <ConversationsHeader />
      <div className="flex overflow-auto h-full">
        <div className="w-1/3 border-r">
          <ConversationsList
            onConversationSelection={handleConversationSelection}
          />
        </div>
        <div className="w-2/3 flex flex-col justify-between">
          {!selectedConversationId && (
            <span>Select a contact to view the conversation.</span>
          )}
          {selectedConversationId && (
            <ConversationPane selectedConversationId={selectedConversationId} />
          )}

          <MessageInput
            onSend={handleSendMessage}
            disabled={!socket || !isConnected || !selectedConversationId}
          />
        </div>
      </div>
    </div>
  );
}
