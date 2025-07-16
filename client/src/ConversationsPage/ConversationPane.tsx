import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useGetMessages } from "./query/conversationsQuery";
import { useMessageContext } from "./context/useMessageContext";
import { type Conversation } from "./types";
import useIntersectionObserver from "../hooks/useIntersectionObserver";
import { ConversationMessage } from "./ConversationMessage";
interface ConversationPaneProps {
  selectedConversation: Conversation;
}

const PAGE_SIZE = 9;

export default function ConversationPane({
  selectedConversation,
}: ConversationPaneProps) {
  const messageStartRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(1);
  const [startObserving, setStartObserving] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const containerScrollHeightRef = useRef<number>(0);
  const isAtBottomRef = useRef(false);
  const {
    data: historicalMessages,
    isPending,
    isError,
  } = useGetMessages(selectedConversation.id, selectedConversation.isTemporary);
  const { getConversationMessages, setMessagesInStore: setMessages } =
    useMessageContext();

  useIntersectionObserver(
    messageStartRef.current,
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

  const messageEndCallbackRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      node.scrollIntoView({ behavior: "auto" });
      setStartObserving(true);
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

  useEffect(() => {
    const containerEl = containerRef.current;
    if (isAtBottomRef.current && containerEl) {
      containerEl.scrollTop = containerEl.scrollHeight;
    }
  }, [messages]);
  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    isAtBottomRef.current =
      el.scrollHeight - el.scrollTop - el.clientHeight < 50;
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
    <div
      className="py-2 px-4 overflow-y-auto space-y-4"
      ref={containerRef}
      onScroll={handleScroll}
    >
      <div className="h-4" ref={messageStartRef}></div>
      {messages.map((message) => (
        <ConversationMessage message={message} key={message.id} />
      ))}
      <div ref={messageEndCallbackRef}></div>
    </div>
  );
}
