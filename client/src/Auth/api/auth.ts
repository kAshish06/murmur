import callApi from "../../apiUtils/apiUtil";
import type {
  LoginPayload,
  RegisterUserPayload,
  RegisterAndLoginResponse,
} from "../types";

export async function fetchUser(id: string) {
  return await callApi.get(`/user/${id}`);
}

export async function registerUser(
  data: RegisterUserPayload
): Promise<RegisterAndLoginResponse> {
  return await callApi.post("/auth/register", data);
}

export async function login(
  data: LoginPayload
): Promise<RegisterAndLoginResponse> {
  return await callApi.post("/auth/login", data);
}
