import callApi from "../../apiUtils/apiUtil";
import type {
  LoginPayload,
  RegisterUserPayload,
  RegisterAndLoginResponse,
  RefreshTokenResponse,
  User,
} from "../types";

export async function fetchUser(): Promise<User> {
  const { result } = await callApi.get<User>(`/user/`);
  return result;
}

export async function registerUser(
  data: RegisterUserPayload
): Promise<RegisterAndLoginResponse> {
  const { result } = await callApi.post<RegisterAndLoginResponse>(
    "/auth/register",
    data
  );
  return result;
}

export async function login(
  data: LoginPayload
): Promise<RegisterAndLoginResponse> {
  const { result } = await callApi.post<RegisterAndLoginResponse>(
    "/auth/login",
    data
  );
  return result;
}

export async function refreshTokens(
  refreshToken: string | null
): Promise<RefreshTokenResponse> {
  const { result } = await callApi.post<RefreshTokenResponse>("/auth/refresh", {
    refreshToken,
  });
  return result;
}

export async function logout(refreshToken: string | null): Promise<void> {
  const { result } = await callApi.post<void>("/auth/logout", {
    refreshToken,
  });
  return result;
}

export async function searchUsers(query: string): Promise<User[]> {
  const { result } = await callApi.get<User[]>(`/user/search?q=${query}`);
  return result;
}
