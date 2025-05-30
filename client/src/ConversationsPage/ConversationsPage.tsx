import { useCallback, useState } from "react";
import ConversationsHeader from "./ConversationsHeader";
import ConversationsList from "./ConversationsList";
import ConversationPane from "./ConversationPane";
import useSocketConnect from "../socket";
import useMessageStore from "../store/useMessageStore";
import { useAuthStore } from "../store/useAuthStore";

export default function ConversationsPage() {
  const { socket, isConnected } = useSocketConnect();
  const [selectedConversationId, setSelectedConversationId] =
    useState<string>();
  const [messageInput, setMessageInput] = useState("");
  const user = useAuthStore((state) => state.user);
  const addMessage = useMessageStore((state) => state.addMessage);
  const handleConversationSelection = useCallback((conversationId: string) => {
    setSelectedConversationId(conversationId);
  }, []);
  const handleSendMessage = () => {
    if (
      socket &&
      isConnected &&
      messageInput.trim() &&
      user &&
      selectedConversationId
    ) {
      console.log("Sending message:", messageInput);
      addMessage(
        {
          id: Math.random(),
          conversationId: Number(selectedConversationId),
          senderId: user.id,
          content: messageInput,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          sender: {
            id: user?.id,
            username: user?.username,
          },
        },
        selectedConversationId
      );
      socket.emit("sendMessage", {
        text: messageInput,
        conversationId: selectedConversationId,
      });
      setMessageInput("");
    }
  };

  return (
    <div className="conversations-page">
      <ConversationsHeader />
      <div className="flex h-[calc(100vh-headerHeight)]">
        <div className="w-1/3 border-r">
          <ConversationsList
            onConversationSelection={handleConversationSelection}
          />
        </div>
        <div className="w-2/3">
          {!selectedConversationId && (
            <div className="flex items-center justify-center h-full text-gray-500">
              Select a contact to view the conversation.
            </div>
          )}
          {selectedConversationId && (
            <ConversationPane selectedConversationId={selectedConversationId} />
          )}

          <div className="p-4 border-t">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Type a message..."
              className="border p-2 mr-2"
            />
            <button
              onClick={handleSendMessage}
              disabled={!socket || !isConnected || !messageInput.trim()}
              className="bg-blue-500 text-white p-2 rounded disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
