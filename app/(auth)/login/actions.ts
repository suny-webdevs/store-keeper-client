"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function loginAction(formData: { email: string; password: string }) {
  const cookieStore = await cookies();
  const email = formData.email.trim();
  const password = formData.password;

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // In local dev without live Supabase connection, allow standard demo accounts
      const isPlaceholderSupabase =
        !process.env.NEXT_PUBLIC_SUPABASE_URL ||
        process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

      if (isPlaceholderSupabase) {
        // Set CSRF token (crypto.randomUUID, Lax, 7d TTL)
        const csrfToken = crypto.randomUUID();
        cookieStore.set("csrf_token", csrfToken, {
          path: "/",
          httpOnly: false,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 7 * 24 * 60 * 60,
        });

        // Set dev auth session cookie
        cookieStore.set("dev_auth_session", "true", {
          path: "/",
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 7 * 24 * 60 * 60,
        });

        return { ok: true };
      }

      return { error: error.message };
    }

    // On Supabase success: set csrf_token non-httpOnly cookie
    const csrfToken = crypto.randomUUID();
    cookieStore.set("csrf_token", csrfToken, {
      path: "/",
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
    });

    cookieStore.set("dev_auth_session", "true", {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
    });

    return { ok: true };
  } catch (err: unknown) {
    return {
      error: err instanceof Error ? err.message : "Authentication error occurred",
    };
  }
}
