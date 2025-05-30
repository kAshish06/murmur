import { useEffect } from "react";
import useMessageStore from "../store/useMessageStore";
import { useAuthStore } from "../store/useAuthStore";
import { useGetMessages } from "./query/conversationsQuery";
interface ConversationPaneProps {
  selectedConversationId: string;
}

// This is a placeholder component. You'll replace this with actual message fetching and sending logic.
export default function ConversationPane({
  selectedConversationId,
}: ConversationPaneProps) {
  const user = useAuthStore((state) => state.user);
  const {
    data: historicalMessages,
    isPending,
    isError,
  } = useGetMessages(Number(selectedConversationId));
  const messages = useMessageStore(
    (state) => state.messages[selectedConversationId]
  );
  const setMessages = useMessageStore((state) => state.setMessages);
  useEffect(() => {
    if (selectedConversationId && !isPending && historicalMessages) {
      setMessages(historicalMessages, selectedConversationId);
    }
  }, [selectedConversationId, isPending, historicalMessages, setMessages]);

  if (isPending) {
    return <div>Loading messages ...</div>;
  }
  if (isError) {
    return <div>Error loading messages. Try again later.</div>;
  }
  if (!messages?.length) {
    return <div>This is the start of conversation</div>;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Conversation Header (e.g., contact name) */}
      <div className="py-2 px-2 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-800">
          Contact Name (ID: {selectedConversationId})
        </h3>{" "}
        {/* Placeholder */}
      </div>

      {/* Message Area */}
      <div className="flex-grow p-6 overflow-y-auto">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-4 ${
              message.sender.id === user?.id ? "text-right" : "text-left"
            }`}
          >
            <span
              className={`inline-block p-3 rounded-lg ${
                message.sender.id === user?.id
                  ? "bg-blue-500 text-white"
                  : "bg-gray-300 text-gray-800"
              }`}
            >
              {message.content}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
