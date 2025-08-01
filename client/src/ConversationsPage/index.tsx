import ConversationPage from "./ConversationsPage";
import MessageProvider from "./context/MessageProvider";

export default function ConversationsPage() {
  return (
    <MessageProvider>
      <ConversationPage />
    </MessageProvider>
  );
}
