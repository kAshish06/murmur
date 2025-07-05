import { EllipsisVertical, Phone, Video } from "lucide-react";
import { useUserPresenceQuery } from "./query/presenceQuery";
import type { Conversation } from "./types";

type Props = {
  selectedConversation: Conversation;
};

export const ConversationHeader = ({ selectedConversation }: Props) => {
  const { data: userPresence } = useUserPresenceQuery(
    selectedConversation.otherParticipants[0].id
  );
  return (
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
  );
};
