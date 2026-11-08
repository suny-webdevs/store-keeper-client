import { createClient } from "./supabase/server";
import { cookies } from "next/headers";
import type { ApiResponse, PaginationMeta } from "@/types/api";
import { ApiError } from "./api";

export interface ServerRequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined | null>;
}

export async function apiFetchServer<T>(
  endpoint: string,
  options: ServerRequestOptions = {}
): Promise<{ data: T; meta?: PaginationMeta; message: string }> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";
  
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

  const supabase = await createClient();
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData.session?.access_token;
  
  const cookieStore = await cookies();
  const csrfToken = cookieStore.get("csrf_token")?.value;

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

  const response = await fetch(url, {
    ...options,
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    let errMessage = `Server request failed with status ${response.status}`;
    try {
      const errJson = await response.json();
      errMessage = errJson.message || errMessage;
    } catch {
      // Ignore
    }
    throw new ApiError(errMessage, response.status);
  }

  const envelope: ApiResponse<T> = await response.json();
  return {
    data: envelope.data,
    meta: envelope.meta,
    message: envelope.message || "Success",
  };
}
