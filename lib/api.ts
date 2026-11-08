import { createClient } from "./supabase/client";
import type { ApiResponse, ApiErrorResponse, ApiErrorDetail, PaginationMeta } from "@/types/api";

export class ApiError extends Error {
  status: number;
  code?: string;
  errors?: ApiErrorDetail[];

  constructor(message: string, status: number, errors?: ApiErrorDetail[], code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.errors = errors;
  }
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^|;\\s*)(" + name + ")=([^;]*)"));
  return match ? decodeURIComponent(match[3]) : null;
}

export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined | null>;
}

export interface ApiSuccessResult<T> {
  data: T;
  meta?: PaginationMeta;
  message: string;
}

export async function apiFetch<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiSuccessResult<T>> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/v1";
  
  // Format query parameters
  let url = endpoint.startsWith("http") ? endpoint : `${baseUrl.replace(/\/$/, "")}/${endpoint.replace(/^\//, "")}`;
  if (options.params) {
    const searchParams = new URLSearchParams();
    Object.entries(options.params).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        searchParams.append(key, String(val));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes("?") ? "&" : "?") + queryString;
    }
  }

  const supabase = createClient();
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData.session?.access_token;
  const csrfToken = getCookie("csrf_token");

  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }
  if (csrfToken && options.method && options.method.toUpperCase() !== "GET") {
    headers.set("X-CSRF-Token", csrfToken);
  }

  const executeRequest = async (): Promise<Response> => {
    return fetch(url, {
      ...options,
      headers,
      credentials: "include",
    });
  };

  let response: Response;
  try {
    response = await executeRequest();
  } catch (err: unknown) {
    throw new ApiError(
      err instanceof Error ? err.message : "Network error, please check your connection",
      0
    );
  }

  // Handle 401 unauthorized with 1 session refresh retry
  if (response.status === 401) {
    const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
    if (!refreshError && refreshData.session) {
      headers.set("Authorization", `Bearer ${refreshData.session.access_token}`);
      try {
        response = await executeRequest();
      } catch (err: unknown) {
        throw new ApiError(
          err instanceof Error ? err.message : "Network error during retry",
          0
        );
      }
    } else {
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  }

  const contentType = response.headers.get("content-type");
  const isJson = contentType && contentType.includes("application/json");

  if (!response.ok) {
    let errorEnvelope: ApiErrorResponse | null = null;
    if (isJson) {
      try {
        errorEnvelope = await response.json();
      } catch {
        // Fallback below
      }
    }
    const message = errorEnvelope?.message || `Request failed with status ${response.status}`;
    const errors = errorEnvelope?.errors;
    const code = errors?.[0]?.code;
    throw new ApiError(message, response.status, errors, code);
  }

  if (isJson) {
    const envelope: ApiResponse<T> = await response.json();
    return {
      data: envelope.data,
      meta: envelope.meta,
      message: envelope.message || "Success",
    };
  }

  const textData = (await response.text()) as unknown as T;
  return {
    data: textData,
    message: "Success",
  };
}
