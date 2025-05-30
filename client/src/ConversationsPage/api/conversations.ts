import callApi from "../../apiUtils/apiUtil";
import type { Conversation, Message } from "../types";

export async function fetchConversation(): Promise<Conversation[]> {
  const response = await callApi.get<Conversation[]>(`/chat/conversations`);
  return response.result;
}

export async function fetchMessages(
  conversationId: number
): Promise<Message[]> {
  const response = await callApi.get<Message[]>(
    `/chat/conversations/${conversationId}/messages`
  );
  return response.result;
}
