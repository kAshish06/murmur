import { useMutation, useQuery } from "@tanstack/react-query";
import { registerUser, login, refreshTokens, fetchUser } from "../api/auth";
import type {
  RegisterUserPayload,
  RegisterAndLoginResponse,
  LoginPayload,
  RefreshTokenResponse,
  User,
} from "../types";
import { AUTH_QUERY_KEY } from "../queryKeys";

export function useRegisterUserMutation(
  onSuccess: (data: RegisterAndLoginResponse) => void,
  onError: (data: unknown) => void
) {
  return useMutation({
    mutationFn: async (data: RegisterUserPayload) => await registerUser(data),
    onSuccess,
    onError,
  });
}

export function useLoginMutation(
  onSuccess: (data: RegisterAndLoginResponse) => void,
  onError: (data: unknown) => void
) {
  return useMutation({
    mutationFn: async (data: LoginPayload) => await login(data),
    onSuccess,
    onError,
  });
}

export function useRefreshTokenMutation(
  onSuccess: (data: RefreshTokenResponse) => void,
  onError: (data: unknown) => void
) {
  return useMutation({
    mutationFn: async (refreshToken: string | null) =>
      await refreshTokens(refreshToken),
    onSuccess,
    onError,
  });
}

export function useGetUserQuery(accessToken: string) {
  return useQuery<User>({
    queryKey: AUTH_QUERY_KEY,
    queryFn: (): Promise<User> => fetchUser(),
    enabled: !!accessToken,
  });
}
