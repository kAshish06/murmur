import callApi from "../../apiUtils/apiUtil";
import type { Conversation, Message } from "../types";

export async function fetchConversation(): Promise<Conversation[]> {
  const { result } = await callApi.get<Conversation[]>(`/chat/conversations`);
  return result;
}

export async function fetchMessages(
  conversationId: number
): Promise<Message[]> {
  const { result } = await callApi.get<Message[]>(
    `/chat/conversations/${conversationId}/messages`
  );
  return result;
}

export async function createConversation(
  participantIds: number[],
  type: string
): Promise<Conversation> {
  const { result } = await callApi.post<Conversation>(`/chat/conversations`, {
    participantIds,
    type,
  });
  return result;
}
