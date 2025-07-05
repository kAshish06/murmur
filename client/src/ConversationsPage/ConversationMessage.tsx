import { Check, Clock, CheckCheck, CircleAlert } from "lucide-react";
import type { Message } from "./types";
import { useAuthStore } from "../store/useAuthStore";
import useMobileView from "../hooks/useMobileView";
import { MessageStatus as MessageStatusEnum } from "../types/messageQueue";
import { type MessageStatus } from "./types";

type Props = {
  message: Message;
};
export const ConversationMessage = ({ message }: Props) => {
  const user = useAuthStore((state) => state.user);
  const isMobileView = useMobileView();
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
  return (
    <div
      className={`flex ${
        !isMobileView && message.senderId === user?.id ? "justify-end" : ""
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
            {message.senderId === user?.id && getStatusIcon(message.status)}
          </div>
        </div>
      </div>
    </div>
  );
};
