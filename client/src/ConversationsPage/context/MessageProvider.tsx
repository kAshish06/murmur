import { useCallback, useEffect, useMemo } from "react";
import QueueManager from "../../services/QueueManager";
import QueueProcessor from "../../services/QueueProcessor";
import useSocketConnect from "../../socket";
import useMessageStore from "../../store/useMessageStore";
import { type Message, type SocketReceivedData } from "../types";
import useConversationsStore from "../../store/useConversationsStore";
import { MessageContext } from "./MessageContext";

export const MessageProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { messages, setMessages, addMessage } = useMessageStore(
    (state) => state
  );
  const queueManager = useMemo(() => new QueueManager(), []);
  const { replaceTemporaryConversation } = useConversationsStore();
  const handleSocketReceivedMessage = useCallback(
    ({ message, conversation }: SocketReceivedData): void => {
      try {
        if (conversation) {
          replaceTemporaryConversation(conversation);
          message.conversationId = conversation?.clientId;
        }
        // Add to status update queue
        queueManager.addToIncomingMessageQueue(message);
      } catch (error) {
        console.error("Error handling message confirmation:", error);
      }
    },
    [queueManager, replaceTemporaryConversation]
  );

  const socket = useSocketConnect(handleSocketReceivedMessage);
  const queueProcessor = useMemo(
    () =>
      socket && socket.isConnected
        ? new QueueProcessor(socket.socket!, queueManager)
        : null,
    [socket, queueManager]
  );
  useEffect(() => {
    if (!queueProcessor) return;
    queueProcessor.startProcessing();
  }, [queueProcessor]);

  const sendMessage = useCallback(
    (message: Message) => {
      queueManager.addToOutgoingQueue(message);
    },
    [queueManager]
  );
  const getConversationMessages = useCallback(
    (conversationId: number) => messages[conversationId],
    [messages]
  );

  const value = useMemo(
    () => ({
      getConversationMessages,
      setMessagesInStore: setMessages,
      addMessageInStore: addMessage,
      sendMessage,
      socket,
    }),
    [getConversationMessages, sendMessage, setMessages, addMessage, socket]
  );

  return (
    <MessageContext.Provider value={value}>{children}</MessageContext.Provider>
  );
};

export default MessageProvider;
