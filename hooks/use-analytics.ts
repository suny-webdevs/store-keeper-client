"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type {
  SalesSummaryPoint,
  ProfitLossSummary,
  TopProductItem,
  DeadStockItem,
  StockValuation,
} from "@/types/api";
import { useUiStore } from "@/stores/ui";

export function useSalesSummary(from?: string, to?: string, bucket: "day" | "week" | "month" = "day") {
  const { activeBranchId } = useUiStore();
  const branchId = activeBranchId || "br_main";

  return useQuery({
    queryKey: ["analytics", "sales-summary", branchId, from, to, bucket],
    queryFn: async () => {
      const res = await apiFetch<{ points: SalesSummaryPoint[] }>("/analytics/sales-summary", {
        params: { branchId, from, to, bucket },
      });
      return res.data?.points || [];
    },
    enabled: Boolean(branchId),
  });
}

export function useProfitLoss(from?: string, to?: string) {
  const { activeBranchId } = useUiStore();
  const branchId = activeBranchId || "br_main";

  return useQuery({
    queryKey: ["analytics", "profit-loss", branchId, from, to],
    queryFn: async () => {
      const res = await apiFetch<ProfitLossSummary>("/analytics/profit-loss", {
        params: { branchId, from, to },
      });
      return res.data;
    },
    enabled: Boolean(branchId),
  });
}

export function useTopProducts(from?: string, to?: string, limit: number = 5) {
  const { activeBranchId } = useUiStore();
  const branchId = activeBranchId || "br_main";

  return useQuery({
    queryKey: ["analytics", "top-products", branchId, from, to, limit],
    queryFn: async () => {
      const res = await apiFetch<TopProductItem[]>("/analytics/top-products", {
        params: { branchId, from, to, limit },
      });
      return res.data || [];
    },
    enabled: Boolean(branchId),
  });
}

export function useDeadStock(days: number = 90) {
  const { activeBranchId } = useUiStore();
  const branchId = activeBranchId || "br_main";

  return useQuery({
    queryKey: ["analytics", "dead-stock", branchId, days],
    queryFn: async () => {
      const res = await apiFetch<DeadStockItem[]>("/analytics/dead-stock", {
        params: { branchId, days },
      });
      return res.data || [];
    },
    enabled: Boolean(branchId),
  });
}

export function useStockValuation() {
  const { activeBranchId } = useUiStore();
  const branchId = activeBranchId || "br_main";

  return useQuery({
    queryKey: ["analytics", "stock-valuation", branchId],
    queryFn: async () => {
      const res = await apiFetch<StockValuation>("/analytics/stock-valuation", {
        params: { branchId },
      });
      return res.data;
    },
    enabled: Boolean(branchId),
  });
}
