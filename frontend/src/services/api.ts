
const API_URL = import.meta.env.VITE_API_URL;

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const result = await response.json().catch(() => null);

  if (response.status === 401 && token) {
    window.dispatchEvent(new Event("auth:unauthorized"));
  }

  if (!response.ok) {
    throw new Error(
      result?.message ?? `Request gagal (${response.status})`,
    );
  }

  return result as T;
}