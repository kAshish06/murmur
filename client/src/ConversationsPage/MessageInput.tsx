import React, { useState, useCallback } from "react";
import { Button } from "../components/atoms/Button";

interface MessageInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSend,
  disabled = false,
}) => {
  const [message, setMessage] = useState("");

  const handleSubmit = useCallback(() => {
    if (!message.trim()) return;
    onSend(message);
    setMessage("");
  }, [message, onSend]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  return (
    <div className="p-2 border-t border-gray-100">
      <div className="flex gap-4">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Type a message..."
          className="flex-1 p-1 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={disabled}
        />
        <Button onClick={handleSubmit} disabled={disabled || !message.trim()}>
          Send
        </Button>
      </div>
    </div>
  );
};
