import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { EllipsisVertical, Phone, Video } from "lucide-react";
import { useGetMessages } from "./query/conversationsQuery";
import { useMessageContext } from "./context/useMessageContext";
import { type Conversation } from "./types";
import useIntersectionObserver from "../hooks/useIntersectionObserver";
import { useUserPresenceQuery } from "./query/presenceQuery";
import { ConversationMessage } from "./ConversationMessage";

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
          <ConversationMessage message={message} key={message.id} />
        ))}
        <div ref={messageEndCallbackRef}></div>
      </div>
    </div>
  );
}
