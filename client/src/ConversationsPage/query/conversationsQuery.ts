import { useMutation, useQuery } from "@tanstack/react-query";
import {
  fetchConversation,
  fetchMessages,
  createConversation,
} from "../api/conversations";
import type { Conversation, Message } from "../types";
import { CONVERSATIONS_QUERY_KEY, MESSAGES_QUERY_KEY } from "../queryKeys";

export function useGetConversations() {
  return useQuery<Conversation[]>({
    queryKey: CONVERSATIONS_QUERY_KEY,
    queryFn: async (): Promise<Conversation[]> => {
      const conversations = await fetchConversation();
      return conversations.map((conv) => ({ ...conv, clientId: conv.id }));
    },
  });
}

export function useGetMessages(
  conversationId: number | undefined,
  isTemporary: boolean | undefined
) {
  return useQuery<Message[]>({
    queryKey: MESSAGES_QUERY_KEY(conversationId as number),
    queryFn: (): Promise<Message[]> => fetchMessages(conversationId as number),
    enabled:
      !isTemporary &&
      conversationId !== undefined &&
      conversationId !== null &&
      !isNaN(conversationId),
  });
}

export function useCreateConversationMutation(
  onSuccess: (data: Conversation) => void,
  onError: (data: unknown) => void
) {
  return useMutation({
    mutationFn: async ({
      participantIds,
      type,
    }: {
      participantIds: number[];
      type: string;
    }) => await createConversation(participantIds, type),
    onSuccess,
    onError,
  });
}
