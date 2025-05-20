import { useMutation } from "@tanstack/react-query";
import { registerUser, login } from "../api/auth";
import type {
  RegisterUserPayload,
  RegisterAndLoginResponse,
  LoginPayload,
} from "../types";

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
