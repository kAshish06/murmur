type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  data?: unknown;
  headers?: HeadersInit;
};
type FormattedResponse<T> = {
  status: string;
  result: T;
};
const VITE_BACKEND_URL_ENV = import.meta.env.VITE_BACKEND_URL;
const VITE_FALLBACK_PORT_ENV =
  import.meta.env.VITE_CLIENT_FALLBACK_PORT || "8080"; // Default to 8080 if VITE_CLIENT_FALLBACK_PORT is not set
const BASE_URL = "https://murmur-backend-5zvw.onrender.com/api";
// (
//   VITE_BACKEND_URL_ENV && VITE_BACKEND_URL_ENV.trim() !== ""
// )
//   ? VITE_BACKEND_URL_ENV.trim() + "/api"
//   : `http://localhost:${VITE_FALLBACK_PORT_ENV}/api`;
// const BASE_URL_PRODUCTION = "https://murmur-8frr.onrender.com/api"; // Example for production

async function refreshToken(): Promise<boolean> {
  const token = sessionStorage.getItem("token");
  if (!token) return false;

  const response = await fetch(`${BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.ok) {
    const data = await response.json();
    sessionStorage.setItem("token", data.token);
    return true;
  } else {
    sessionStorage.removeItem("token");
    return false;
  }
}

async function httpRequest<T>(
  endpoint: string,
  options: RequestOptions
): Promise<FormattedResponse<T>> {
  const { method = "GET", data } = options;

  const config: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };
  const token = localStorage.getItem("accessToken");
  if (token) {
    const parsedToken = JSON.parse(token);
    (config.headers as Record<string, string>)[
      "Authorization"
    ] = `Bearer ${parsedToken}`;
  }

  if (method !== "GET" && data) {
    config.body = JSON.stringify(data);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, config);

  // Handle 401: Unauthorized — token may have expired
  if (response.status === 401) {
    const refreshed = await refreshToken();
    if (refreshed) {
      return httpRequest<T>(endpoint, { ...options });
    } else {
      throw new Error("Session expired. Please log in again.");
    }
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "API request failed");
  }

  return response.json();
}

const callApi = {
  get: <T>(endpoint: string, data?: unknown): Promise<FormattedResponse<T>> =>
    httpRequest(endpoint, {
      method: "GET",
      data,
    }),
  post: <T>(endpoint: string, data?: unknown): Promise<FormattedResponse<T>> =>
    httpRequest(endpoint, {
      method: "POST",
      data,
    }),
  delete: <T>(
    endpoint: string,
    data?: unknown
  ): Promise<FormattedResponse<T>> =>
    httpRequest(endpoint, {
      method: "DELETE",
      data,
    }),
};

export default callApi;
