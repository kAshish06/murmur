import callApi from "../../apiUtils/apiUtil";
import { type UserPresenceData } from "../types";

export async function getUsersPresence(
  userId: number
): Promise<UserPresenceData> {
  const { result } = await callApi.get<UserPresenceData>(`/presence/${userId}`);
  return result;
}
