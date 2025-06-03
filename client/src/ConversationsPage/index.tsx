import ConversationPage from "./ConversationsPage";
import MessageProvider from "./context/MessageContext";

export default function ConversationsPage() {
  return (
    <MessageProvider>
      <ConversationPage />
    </MessageProvider>
  );
}
