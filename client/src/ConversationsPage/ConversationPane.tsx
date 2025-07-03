import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { EllipsisVertical, Phone, Video } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useGetMessages } from "./query/conversationsQuery";
import { useMessageContext } from "./context/useMessageContext";
import { Check, Clock, CheckCheck, CircleAlert } from "lucide-react";
import { type MessageStatus, type Conversation } from "./types";
import { MessageStatus as MessageStatusEnum } from "../types/messageQueue";
import useIntersectionObserver from "../hooks/useIntersectionObserver";
import useMobileView from "../hooks/useMobileView";
import { useUserPresenceQuery } from "./query/presenceQuery";
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
  const containerRef = useRef<HTMLDivElement>(null);
  const containerScrollHeightRef = useRef<number>(0);
  const user = useAuthStore((state) => state.user);
  const isMobileView = useMobileView();
  const {
    data: historicalMessages,
    isPending,
    isError,
  } = useGetMessages(selectedConversation.id, selectedConversation.isTemporary);
  const { getConversationMessages, setMessagesInStore: setMessages } =
    useMessageContext();
  const { data: userPresence } = useUserPresenceQuery(
    selectedConversation.otherParticipants[0].id
  );

  useIntersectionObserver(
    messageStartRef,
    (entry: IntersectionObserverEntry) => {
      if (entry.isIntersecting && entry.intersectionRatio > 0) {
        console.log("intersecting");
        containerScrollHeightRef.current =
          containerRef.current?.scrollHeight || 0;
        setPage((prev) => prev + 1);
      }
    },
    "10px",
    0.1,
    containerRef.current,
    startObserving
  );

  const messageStartCallbackRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      setMessageStartRef(node);
    }
  }, []);

  const messageEndCallbackRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      node.scrollIntoView({ behavior: "auto" });
      // setTimeout(() => {
      setStartObserving(true);
      // }, 500);
    }
  }, []);

  const messages = useMemo(() => {
    const conversationMessages = getConversationMessages(
      selectedConversation.id
    );
    return conversationMessages?.slice(
      Math.max(conversationMessages.length - PAGE_SIZE * page, 0),
      conversationMessages.length
    );
  }, [page, selectedConversation, getConversationMessages]);

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

  if (!selectedConversation.isTemporary && isPending) {
    return <div>Loading messages ...</div>;
  }
  if (!selectedConversation.isTemporary && isError) {
    return <div>Error loading messages. Try again later.</div>;
  }
  if (!messages?.length) {
    return <div>This is the start of conversation</div>;
  }
  return (
    <div className="flex flex-col justify-between flex-1 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-gray-100 w-full">
        <div>
          <h2 className="text-xl font-semibold text-left bg-black-100">
            {selectedConversation.otherParticipants[0].username}
          </h2>
          {userPresence?.online ? (
            <div className="text-left text-xs text-neutral-500">Online</div>
          ) : (
            <div className="text-left text-xs text-neutral-500">Offline</div>
          )}
        </div>
        <div className="flex gap-4">
          <Phone size={20} />
          <Video size={20} />
          <EllipsisVertical size={20} />
        </div>
      </div>
      <div className="py-2 px-4 overflow-y-auto space-y-4" ref={containerRef}>
        <div className="h-4" ref={messageStartCallbackRef}></div>
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              !isMobileView && message.senderId === user?.id
                ? "justify-end"
                : ""
            }`}
          >
            <div className="min-w-[30%] max-w-[95%]">
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
        <div ref={messageEndCallbackRef}></div>
      </div>
    </div>
  );
}
