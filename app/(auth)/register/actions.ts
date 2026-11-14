"use server";

import { registerTenantSchema, type RegisterTenantInput } from "@/lib/schemas";

export type RegisterTenantResult = { ok: true; demo: boolean } | { ok: false; error: string };

/**
 * Tenant onboarding submit.
 *
 * The backend contract (BUILD.md and the live OpenAPI document at `/api/docs-json`)
 * exposes `auth/me`, `branches` and `users` only — there is no tenant-registration
 * endpoint yet, so nothing is persisted. This action validates the payload on the
 * server (never trust the client) and simulates completion in development.
 *
 * When the backend ships the endpoint, POST here through `apiFetchServer` and
 * return `{ ok: true, demo: false }`; the wizard needs no changes.
 */
export async function registerTenantAction(
  input: RegisterTenantInput
): Promise<RegisterTenantResult> {
  const parsed = registerTenantSchema.safeParse(input);

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return { ok: false, error: firstIssue?.message ?? "Please check the highlighted fields." };
  }

  if (process.env.NODE_ENV === "production") {
    return {
      ok: false,
      error: "Workspace registration is not available yet. Please contact your administrator.",
    };
  }

  return { ok: true, demo: true };
}
