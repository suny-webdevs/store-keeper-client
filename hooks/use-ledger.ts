"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { StockLedgerEntry } from "@/types/api";
import { useUiStore } from "@/stores/ui";

export interface LedgerFilters {
  cursor?: string;
  limit?: number;
  type?: string;
  from?: string;
  to?: string;
}

export function useLedger(filters: LedgerFilters = {}) {
  const { activeBranchId } = useUiStore();
  const branchId = activeBranchId || "br_main";

  return useQuery({
    queryKey: ["ledger", branchId, filters],
    queryFn: async () => {
      const res = await apiFetch<StockLedgerEntry[]>(`/branches/${branchId}/ledger`, {
        params: {
          cursor: filters.cursor,
          limit: filters.limit || 25,
          "filter[type]": filters.type,
          from: filters.from,
          to: filters.to,
        },
      });
      return res;
    },
    enabled: Boolean(branchId),
  });
}
