import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useGetMessages } from "./query/conversationsQuery";
import { useMessageContext } from "./context/useMessageContext";
import { Check, Clock, CheckCheck, CircleAlert } from "lucide-react";
import { type MessageStatus, type Conversation } from "./types";
import { MessageStatus as MessageStatusEnum } from "../types/messageQueue";
import useIntersectionObserver from "../hooks/useIntersectionObserver";

interface ConversationPaneProps {
  selectedConversation: Conversation;
}

const PAGE_SIZE = 9;

export default function ConversationPane({
  selectedConversation,
}: ConversationPaneProps) {
  const [messageStartRef, setMessageStartRef] = useState<HTMLDivElement | null>(
    null
  );
  const [page, setPage] = useState(1);
  const [startObserving, setStartObserving] = useState(false);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const containerScrollHeightRef = useRef<number>(0);
  const user = useAuthStore((state) => state.user);
  const {
    data: historicalMessages,
    isPending,
    isError,
  } = useGetMessages(selectedConversation.id);
  const { getConversationMessages, setMessagesInStore: setMessages } =
    useMessageContext();

  const messages = useMemo(() => {
    const conversationMessages = getConversationMessages(
      selectedConversation.id
    );
    return conversationMessages.slice(
      Math.max(conversationMessages.length - PAGE_SIZE * page, 0),
      conversationMessages.length
    );
  }, [page, selectedConversation, getConversationMessages]);

  useIntersectionObserver(
    messageStartRef,
    (entry: IntersectionObserverEntry) => {
      if (entry.isIntersecting && entry.intersectionRatio < 1) {
        containerScrollHeightRef.current =
          containerRef.current?.scrollHeight || 0;
        setPage((prev) => prev + 1);
      }
    },
    "100px",
    0.1,
    containerRef.current,
    startObserving
  );
  const callBackRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      setMessageStartRef(node);
    }
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop =
        containerRef.current.scrollHeight - containerScrollHeightRef.current;
    }
  }, [page]);

  useEffect(() => {
    if (selectedConversation.id && !isPending && historicalMessages) {
      setMessages(historicalMessages, selectedConversation.id);
    }
  }, [selectedConversation.id, isPending, historicalMessages, setMessages]);

  useEffect(() => {
    if (historicalMessages?.length) {
      if (messageEndRef.current) {
        messageEndRef.current.scrollIntoView({ behavior: "smooth" });
        setStartObserving(true);
      }
    }
  }, [historicalMessages]);

  const getStatusIcon = (status: MessageStatus) => {
    switch (status) {
      case MessageStatusEnum.PENDING:
        return <Clock className="inline w-3 h-3 text-gray-500" />;
      case MessageStatusEnum.SENT:
        return <Check className="inline w-3 h-3 text-gray-500" />;
      case MessageStatusEnum.SEEN:
        return <CheckCheck className="inline w-3 h-3 text-blue-500" />;
      case MessageStatusEnum.DELIVERED:
        return <CheckCheck className="inline w-3 h-3 text-gray-500" />;
      case MessageStatusEnum.FAILED:
        return <CircleAlert className="inline w-3 h-3 text-red-500" />;
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
  console.log(messages);
  return (
    <div className="flex flex-col justify-between flex-1 overflow-hidden">
      {/* Conversation Header */}
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-xl font-semibold text-gray-900">
          {selectedConversation.otherParticipants[0].username}
        </h3>
      </div>

      {/* Message Area */}

      <div className="p-2 overflow-y-auto space-y-4" ref={containerRef}>
        <div className="h-4" ref={callBackRef}></div>
        {messages.map((message) => (
          <div key={message.id} className={`flex`}>
            <div className="min-w-[20%] max-w-[70%]">
              <div
                className={`py-1 px-2 rounded-lg ${
                  message.senderId === user?.id
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
                  {message.senderId === user?.id &&
                    getStatusIcon(message.status)}
                </div>
              </div>
            </div>
          </div>
        ))}
        <div ref={messageEndRef}></div>
      </div>
    </div>
  );
}
