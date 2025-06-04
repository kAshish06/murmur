import { useQuery } from "@tanstack/react-query";
import { fetchConversation, fetchMessages } from "../api/conversations";
import type { Conversation, Message } from "../types";
import { CONVERSATIONS_QUERY_KEY, MESSAGES_QUERY_KEY } from "../queryKeys";

export function useGetConversations() {
  return useQuery<Conversation[]>({
    queryKey: CONVERSATIONS_QUERY_KEY,
    queryFn: (): Promise<Conversation[]> => fetchConversation(),
  });
}

export function useGetMessages(conversationId: number | undefined) {
  return useQuery<Message[]>({
    queryKey: MESSAGES_QUERY_KEY(conversationId as number),
    queryFn: (): Promise<Message[]> => fetchMessages(conversationId as number),
    enabled:
      conversationId !== undefined &&
      conversationId !== null &&
      !isNaN(conversationId),
  });
}
