const getApiUrl = () => {
  const configuredUrl = import.meta.env.VITE_API_URL || "/api";

  if (typeof window === "undefined") return configuredUrl;
  if (!configuredUrl.startsWith("http")) return configuredUrl;

  try {
    const apiUrl = new URL(configuredUrl);
    const isVercelPreviewApi = apiUrl.hostname.endsWith(".vercel.app");
    const isCustomDomain = !window.location.hostname.endsWith(".vercel.app")
      && !["localhost", "127.0.0.1"].includes(window.location.hostname);

    if (import.meta.env.PROD && isVercelPreviewApi && isCustomDomain) return "/api";
  } catch {
    return "/api";
  }

  return configuredUrl;
};

const API_URL = getApiUrl();
const TOKEN_KEY = "granite_auth_token";

export type AuthUser = {
  id: string;
  full_name?: string;
  email: string;
  role: "admin" | "user";
};

type RequestOptions = RequestInit & { auth?: boolean };

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export const authStore = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

const request = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const headers = new Headers(options.headers);
  const isFormData = options.body instanceof FormData;
  if (!isFormData && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");

  const token = authStore.getToken();
  if (options.auth && token) headers.set("Authorization", `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
    });
  } catch {
    throw new ApiError("Server is not reachable. Please make sure the backend is running.", 0, "NETWORK_ERROR");
  }

  const responseText = await response.text();
  const data = responseText ? (() => {
    try {
      return JSON.parse(responseText);
    } catch {
      return null;
    }
  })() : null;

  if (!response.ok) {
    throw new ApiError(data?.error || response.statusText || "Request failed", response.status, data?.code);
  }
  return data as T;
};

export const authApi = {
  status: () => request<{ hasUsers: boolean }>("/auth/status"),
  signup: (payload: { full_name: string; email: string; password: string }) =>
    request<{ token: string; user: AuthUser }>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  login: (payload: { email: string; password: string }) =>
    request<{ token: string; user: AuthUser }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  forgotPassword: (payload: { email: string }) =>
    request<{ message: string; emailSent: boolean; resetUrl: string | null }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  resetPassword: (payload: { token: string; password: string }) =>
    request<{ message: string }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  me: () => request<{ user: AuthUser }>("/auth/me", { auth: true }),
};

export const publicApi = {
  list: <T = any>(table: string, params: Record<string, string | number | boolean | undefined> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== "") query.set(key, String(value));
    });
    return request<T[]>(`/${table}${query.toString() ? `?${query}` : ""}`);
  },
  submitInquiry: (payload: any) =>
    request("/inquiries", { method: "POST", body: JSON.stringify(payload) }),
  submitReview: (payload: any) =>
    request("/reviews", { method: "POST", body: JSON.stringify(payload), auth: true }),
  uploadReviewImage: (file: File) => {
    const body = new FormData();
    body.append("image", file);
    return request<{ url: string }>("/review-upload", { method: "POST", body, auth: true });
  },
};

export const adminApi = {
  list: <T = any>(table: string, params: Record<string, string | number | boolean | undefined> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== "") query.set(key, String(value));
    });
    return request<T[]>(`/admin/${table}${query.toString() ? `?${query}` : ""}`, { auth: true });
  },
  create: <T = any>(table: string, payload: any) =>
    request<T>(`/admin/${table}`, { method: "POST", body: JSON.stringify(payload), auth: true }),
  update: <T = any>(table: string, id: string, payload: any) =>
    request<T>(`/admin/${table}/${id}`, { method: "PUT", body: JSON.stringify(payload), auth: true }),
  remove: (table: string, id: string) =>
    request(`/admin/${table}/${id}`, { method: "DELETE", auth: true }),
  upload: (file: File) => {
    const body = new FormData();
    body.append("image", file);
    return request<{ url: string }>("/admin/upload", { method: "POST", body, auth: true });
  },
};
