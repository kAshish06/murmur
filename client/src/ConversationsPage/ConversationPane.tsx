import { useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useGetMessages } from "./query/conversationsQuery";
import { useMessageContext } from "./context/useMessageContext";
import { Check, Clock, Send } from "lucide-react";
import { type MessageStatus } from "./types";
import { MessageStatus as MessageStatusEnum } from "../types/messageQueue";

interface ConversationPaneProps {
  selectedConversationId: number;
}

export default function ConversationPane({
  selectedConversationId,
}: ConversationPaneProps) {
  const user = useAuthStore((state) => state.user);
  const {
    data: historicalMessages,
    isPending,
    isError,
  } = useGetMessages(selectedConversationId);
  const { getConversationMessages, setMessagesInStore: setMessages } =
    useMessageContext();

  const messages = getConversationMessages(selectedConversationId);

  useEffect(() => {
    if (selectedConversationId && !isPending && historicalMessages) {
      setMessages(historicalMessages, selectedConversationId);
    }
  }, [selectedConversationId, isPending, historicalMessages, setMessages]);

  const getStatusIcon = (status: MessageStatus) => {
    switch (status) {
      case MessageStatusEnum.PENDING:
        return <Clock className="inline w-3 h-3 text-gray-500" />;
      case MessageStatusEnum.SENT:
        return <Send className="inline w-3 h-3 text-gray-500" />;
      case MessageStatusEnum.SEEN:
        return <Send className="inline w-3 h-3 text-gray-500" />;
      case MessageStatusEnum.DELIVERED:
        return <Check className="inline w-3 h-3 text-blue-500" />;
      case MessageStatusEnum.FAILED:
        return <Clock className="inline w-3 h-3 text-red-500" />;
      default:
        return null;
    }
  };

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
    <div className="flex flex-col justify-between flex-1 overflow-hidden">
      {/* Conversation Header */}
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-xl font-semibold text-gray-900">
          Contact Name (ID: {selectedConversationId})
        </h3>
      </div>

      {/* Message Area */}
      <div className="m-4 p-1 overflow-y-auto space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex`}>
            <div className="min-w-[20%] max-w-[70%]">
              <div
                className={`py-1 px-2 rounded-lg ${
                  message.sender?.id === user?.id
                    ? "bg-gray-200 text-black"
                    : "bg-black text-white"
                }`}
              >
                <div className="text-left text-sm">{message.content}</div>
                <div className="flex items-center justify-end mt-1 text-xs text-gray-500">
                  <span className="px-1">
                    {new Date(message.createdAt).toLocaleTimeString([], {
                      hour: "numeric",
                      minute: "numeric",
                    })}
                  </span>
                  {message.sender?.id === user?.id &&
                    getStatusIcon(message.status)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
