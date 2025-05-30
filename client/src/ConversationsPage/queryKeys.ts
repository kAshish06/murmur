export const CONVERSATIONS_QUERY_KEY = ["conversations"];
export const MESSAGES_QUERY_KEY = (conversationId: number) => [
  "messages",
  conversationId,
];
