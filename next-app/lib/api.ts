const API_BASE_URL =
  (typeof globalThis !== "undefined" &&
    (
      globalThis as typeof globalThis & {
        process?: { env?: Record<string, string | undefined> };
      }
    ).process?.env?.NEXT_PUBLIC_API_URL) ||
  "http://localhost:8000";

interface RequestOptions extends RequestInit {
  token?: string;
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { token, headers, ...customConfig } = options;

  // Kunin ang token mula sa parameter o mula sa localStorage (kung nasa browser)
  const authToken =
    token ??
    (typeof window !== "undefined" ? localStorage.getItem("token") : null);

  const config: RequestInit = {
    ...customConfig,
    headers: {
      "Content-Type": "application/json",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...headers,
    },
  };

  const url = `${API_BASE_URL}${
    endpoint.startsWith("/") ? endpoint : `/${endpoint}`
  }`;

  const response = await fetch(url, config);

  // Subukang i-parse ang JSON response kung mayroon
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMessage =
      data?.message || data?.detail || `Request failed (${response.status})`;
    throw new Error(errorMessage);
  }

  return data as T;
}

// Helper methods para sa mas madaling paggamit (GET, POST, PUT, DELETE)
export const api = {
  get: <T = any>(endpoint: string, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: "GET" }),

  post: <T = any>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T = any>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T = any>(endpoint: string, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: "DELETE" }),
};