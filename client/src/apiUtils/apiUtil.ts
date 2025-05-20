type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  data?: unknown;
  headers?: HeadersInit;
};

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

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
): Promise<T> {
  const { method = "GET", data } = options;

  const config: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };
  const token = sessionStorage.getItem("token");
  if (token) {
    (config.headers as Record<string, string>)[
      "Authorization"
    ] = `Bearer ${token}`;
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
  get: <T>(endpoint: string, data?: unknown): Promise<T> =>
    httpRequest(endpoint, {
      method: "GET",
      data,
    }),
  post: <T>(endpoint: string, data?: unknown): Promise<T> =>
    httpRequest(endpoint, {
      method: "POST",
      data,
    }),
  delete: <T>(endpoint: string, data?: unknown): Promise<T> =>
    httpRequest(endpoint, {
      method: "DELETE",
      data,
    }),
};

export default callApi;
