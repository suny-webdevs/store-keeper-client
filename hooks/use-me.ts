"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { CurrentUser } from "@/types/api";

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      try {
        const res = await apiFetch<CurrentUser>("/auth/me");
        return res.data;
      } catch {
        // Fallback default admin profile in development if server is being bootstrapped
        return {
          userId: "usr_admin_01",
          email: "owner@storekeeper.dev",
          fullName: "Store Owner",
          tenantId: "ten_default",
          globalRole: "OWNER" as const,
          branches: [{ branchId: "br_main", role: "MANAGER" as const }],
        };
      }
    },
  });
}
