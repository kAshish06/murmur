import callApi from "../../apiUtils/apiUtil";
import type {
  LoginPayload,
  RegisterUserPayload,
  RegisterAndLoginResponse,
  RefreshTokenResponse,
  User,
} from "../types";

export async function fetchUser(): Promise<User> {
  const response = await callApi.get<User>(`/auth/user`);
  return response.result;
}

export async function registerUser(
  data: RegisterUserPayload
): Promise<RegisterAndLoginResponse> {
  const response = await callApi.post<RegisterAndLoginResponse>(
    "/auth/register",
    data
  );
  return response.result;
}

export async function login(
  data: LoginPayload
): Promise<RegisterAndLoginResponse> {
  const response = await callApi.post<RegisterAndLoginResponse>(
    "/auth/login",
    data
  );
  return response.result;
}

export async function refreshTokens(
  refreshToken: string | null
): Promise<RefreshTokenResponse> {
  const response = await callApi.post<RefreshTokenResponse>("/auth/refresh", {
    refreshToken,
  });
  return response.result;
}
