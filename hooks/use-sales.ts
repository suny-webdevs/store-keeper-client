"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiFetch, ApiError } from "@/lib/api";
import type { Sale, PaymentMethod } from "@/types/api";
import type { CheckoutSaleInput } from "@/lib/schemas";
import { useUiStore } from "@/stores/ui";

export interface SalesFilters {
  cursor?: string;
  limit?: number;
  from?: string;
  to?: string;
  status?: string;
}

export function useSales(filters: SalesFilters = {}) {
  const queryClient = useQueryClient();
  const { activeBranchId } = useUiStore();
  const branchId = activeBranchId || "br_main";

  const query = useQuery({
    queryKey: ["sales", branchId, filters],
    queryFn: async () => {
      const res = await apiFetch<Sale[]>(`/branches/${branchId}/sales`, {
        params: {
          cursor: filters.cursor,
          limit: filters.limit || 20,
          from: filters.from,
          to: filters.to,
          "filter[status]": filters.status,
        },
      });
      return res;
    },
    enabled: Boolean(branchId),
  });

  const createSaleMutation = useMutation({
    mutationFn: async (payload: CheckoutSaleInput & { immediate?: boolean }) => {
      return apiFetch<Sale>(`/branches/${branchId}/sales`, {
        method: "POST",
        params: { immediate: payload.immediate ?? true },
        body: JSON.stringify(payload),
      });
    },
    onSuccess: (res) => {
      toast.success(res.message || "Sale processed successfully");
      queryClient.invalidateQueries({ queryKey: ["sales", branchId] });
      queryClient.invalidateQueries({ queryKey: ["stock", branchId] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
    onError: (err: unknown) => {
      const message = err instanceof ApiError ? err.errors?.[0]?.message || err.message : "Failed to process sale";
      toast.error(message);
    },
  });

  const cancelSaleMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiFetch<Sale>(`/sales/${id}/cancel`, {
        method: "POST",
      });
    },
    onSuccess: (res) => {
      toast.success(res.message || "Sale order cancelled");
      queryClient.invalidateQueries({ queryKey: ["sales", branchId] });
      queryClient.invalidateQueries({ queryKey: ["stock", branchId] });
    },
    onError: (err: unknown) => {
      const message = err instanceof ApiError ? err.errors?.[0]?.message || err.message : "Failed to cancel sale";
      toast.error(message);
    },
  });

  const addPaymentMutation = useMutation({
    mutationFn: async ({
      saleId,
      method,
      amount,
      reference,
    }: {
      saleId: string;
      method: PaymentMethod;
      amount: number;
      reference?: string;
    }) => {
      return apiFetch<Sale>(`/sales/${saleId}/payments`, {
        method: "POST",
        body: JSON.stringify({ method, amount, reference }),
      });
    },
    onSuccess: (res) => {
      toast.success(res.message || "Payment recorded");
      queryClient.invalidateQueries({ queryKey: ["sales", branchId] });
    },
    onError: (err: unknown) => {
      const message = err instanceof ApiError ? err.errors?.[0]?.message || err.message : "Failed to record payment";
      toast.error(message);
    },
  });

  return {
    sales: query.data?.data || [],
    meta: query.data?.meta,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    createSale: createSaleMutation.mutateAsync,
    isCreatingSale: createSaleMutation.isPending,
    cancelSale: cancelSaleMutation.mutateAsync,
    isCancelling: cancelSaleMutation.isPending,
    addPayment: addPaymentMutation.mutateAsync,
    isAddingPayment: addPaymentMutation.isPending,
  };
}

export function useSale(id?: string) {
  return useQuery({
    queryKey: ["sale", id],
    queryFn: async () => {
      if (!id) return null;
      const res = await apiFetch<Sale>(`/sales/${id}`);
      return res.data;
    },
    enabled: Boolean(id),
  });
}
