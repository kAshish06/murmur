interface ConversationPaneProps {
  selectedContactId: string | null;
}

// This is a placeholder component. You'll replace this with actual message fetching and sending logic.
export default function ConversationPane({
  selectedContactId,
}: ConversationPaneProps) {
  if (!selectedContactId) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Select a contact to view the conversation.
      </div>
    );
  }

  // Dummy messages for structure
  const dummyMessages = [
    { id: "m1", text: "Hi!", sender: "Alice" },
    { id: "m2", text: "Hello!", sender: "Me" },
    { id: "m3", text: "How are you?", sender: "Alice" },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Conversation Header (e.g., contact name) */}
      <div className="py-2 px-2 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-800">
          Contact Name (ID: {selectedContactId})
        </h3>{" "}
        {/* Placeholder */}
      </div>

      {/* Message Area */}
      <div className="flex-grow p-6 overflow-y-auto">
        {dummyMessages.map((message) => (
          <div
            key={message.id}
            className={`mb-4 ${
              message.sender === "Me" ? "text-right" : "text-left"
            }`}
          >
            <span
              className={`inline-block p-3 rounded-lg ${
                message.sender === "Me"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-300 text-gray-800"
              }`}
            >
              {message.text}
            </span>
          </div>
        ))}
      </div>

      {/* Message Input */}
      <div className="p-6 bg-white border-t border-gray-200">
        <input
          type="text"
          placeholder="Type your message..."
          className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {/* You'll likely need a send button here */}
      </div>
    </div>
  );
}
