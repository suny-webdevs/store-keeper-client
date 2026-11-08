"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiFetch, ApiError } from "@/lib/api";
import type { StockItem } from "@/types/api";
import type { StockInInput, StockAdjustmentInput } from "@/lib/schemas";
import { useUiStore } from "@/stores/ui";

export interface StockFilters {
  page?: number;
  limit?: number;
  productId?: string;
  lowStock?: boolean;
}

export function useStock(filters: StockFilters = {}) {
  const queryClient = useQueryClient();
  const { activeBranchId } = useUiStore();
  const branchId = activeBranchId || "br_main";

  const query = useQuery({
    queryKey: ["stock", branchId, filters],
    queryFn: async () => {
      const res = await apiFetch<StockItem[]>(`/branches/${branchId}/stock`, {
        params: {
          page: filters.page || 1,
          limit: filters.limit || 20,
          "filter[productId]": filters.productId,
          "filter[lowStock=true]": filters.lowStock ? "true" : undefined,
        },
      });
      return res;
    },
    enabled: Boolean(branchId),
  });

  const stockInMutation = useMutation({
    mutationFn: async (data: StockInInput) => {
      return apiFetch<StockItem>(`/branches/${branchId}/stock-in`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: (res) => {
      toast.success(res.message || "Stock received successfully");
      queryClient.invalidateQueries({ queryKey: ["stock", branchId] });
      queryClient.invalidateQueries({ queryKey: ["ledger", branchId] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
    onError: (err: unknown) => {
      const message = err instanceof ApiError ? err.errors?.[0]?.message || err.message : "Failed to receive stock";
      toast.error(message);
    },
  });

  const adjustmentMutation = useMutation({
    mutationFn: async (data: StockAdjustmentInput) => {
      return apiFetch<StockItem>(`/branches/${branchId}/adjustments`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: (res) => {
      toast.success(res.message || "Stock adjustment recorded");
      queryClient.invalidateQueries({ queryKey: ["stock", branchId] });
      queryClient.invalidateQueries({ queryKey: ["ledger", branchId] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
    onError: (err: unknown) => {
      const message = err instanceof ApiError ? err.errors?.[0]?.message || err.message : "Failed to adjust stock";
      toast.error(message);
    },
  });

  return {
    stock: query.data?.data || [],
    meta: query.data?.meta,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    stockIn: stockInMutation.mutateAsync,
    isStockInPending: stockInMutation.isPending,
    adjustStock: adjustmentMutation.mutateAsync,
    isAdjustPending: adjustmentMutation.isPending,
  };
}
