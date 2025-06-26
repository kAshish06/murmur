import { useQuery } from "@tanstack/react-query";
import { getUsersPresence } from "../api/presence";
import { type UserPresenceData } from "../types";
import { USER_PRESENCE_QUERY_KEY } from "../queryKeys";

export const useUserPresenceQuery = (userId: number) => {
  return useQuery<UserPresenceData>({
    queryKey: USER_PRESENCE_QUERY_KEY(userId),
    queryFn: (): Promise<UserPresenceData> => getUsersPresence(userId),
  });
};
