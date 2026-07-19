type ApiOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
  token?: string | null;
  formData?: boolean;
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
  meta?: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
};

const ADMIN_API_BASE = process.env.NEXT_PUBLIC_ADMIN_API_URL || "http://localhost:3002/api/v1/admin";

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  if (isRefreshing && refreshPromise) return refreshPromise;
  isRefreshing = true;
  refreshPromise = (async () => {
    const token = getToken();
    if (!token) return false;
    try {
      const res = await fetch(`${ADMIN_API_BASE}/auth/refresh`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success && json.data?.accessToken) {
        setToken(json.data.accessToken);
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();
  return refreshPromise;
}

export async function apiClient<T>(endpoint: string, options: ApiOptions = {}): Promise<ApiResponse<T>> {
  const { method = "GET", body, params, token, formData } = options;

  let url = `${ADMIN_API_BASE}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        searchParams.set(key, String(value));
      }
    });
    const qs = searchParams.toString();
    if (qs) url += `?${qs}`;
  }

  const headers: Record<string, string> = {};
  if (!formData) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method,
    headers,
    body: formData ? (body as FormData) : body ? JSON.stringify(body) : undefined,
  });

  const json = await response.json();

  if (response.status === 401 && token) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      const newToken = getToken();
      headers["Authorization"] = `Bearer ${newToken}`;
      const retryRes = await fetch(url, {
        method,
        headers,
        body: formData ? (body as FormData) : body ? JSON.stringify(body) : undefined,
      });
      const retryJson = await retryRes.json();
      if (retryRes.ok && retryJson.success !== false) return retryJson;
    }
    if (typeof window !== "undefined") {
      clearToken();
      window.location.href = "/login";
    }
    throw new ApiError(
      json.error?.message || "Session expired",
      json.error?.code || "UNAUTHORIZED",
      response.status,
    );
  }

  if (!response.ok || json.success === false) {
    throw new ApiError(
      json.error?.message || "An unexpected error occurred",
      json.error?.code || "INTERNAL_ERROR",
      response.status,
      json.error?.details,
    );
  }

  return json;
}

export class ApiError extends Error {
  code: string;
  status: number;
  details?: unknown;

  constructor(message: string, code: string, status: number, details?: unknown) {
    super(message);
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("admin_token");
}

export function setToken(token: string): void {
  localStorage.setItem("admin_token", token);
}

export function clearToken(): void {
  localStorage.removeItem("admin_token");
  localStorage.removeItem("admin_user");
}

export function getStoredUser(): { id: string; email: string; role: string } | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("admin_user");
  return raw ? JSON.parse(raw) : null;
}

export function storeUser(user: { id: string; email: string; role: string }): void {
  localStorage.setItem("admin_user", JSON.stringify(user));
}
