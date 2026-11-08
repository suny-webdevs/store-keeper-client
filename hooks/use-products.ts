"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiFetch, ApiError } from "@/lib/api";
import type { Product } from "@/types/api";
import type { ProductInput } from "@/lib/schemas";

export interface ProductFilters {
  page?: number;
  limit?: number;
  categoryId?: string;
  isActive?: boolean;
  q?: string;
  sort?: string;
}

export function useProducts(filters: ProductFilters = {}) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["products", filters],
    queryFn: async () => {
      const res = await apiFetch<Product[]>("/products", {
        params: {
          page: filters.page || 1,
          limit: filters.limit || 20,
          "filter[categoryId]": filters.categoryId || undefined,
          "filter[isActive]": filters.isActive,
          q: filters.q || undefined,
          sort: filters.sort || undefined,
        },
      });
      return res;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: ProductInput) => {
      return apiFetch<Product>("/products", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: (res) => {
      toast.success(res.message || "Product created successfully");
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (err: unknown) => {
      const message = err instanceof ApiError ? err.errors?.[0]?.message || err.message : "Failed to create product";
      toast.error(message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ProductInput> }) => {
      return apiFetch<Product>(`/products/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    onSuccess: (res, variables) => {
      toast.success(res.message || "Product updated successfully");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", variables.id] });
    },
    onError: (err: unknown) => {
      const message = err instanceof ApiError ? err.errors?.[0]?.message || err.message : "Failed to update product";
      toast.error(message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiFetch<{ id: string }>(`/products/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: (res) => {
      toast.success(res.message || "Product deleted");
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (err: unknown) => {
      const message = err instanceof ApiError ? err.errors?.[0]?.message || err.message : "Failed to delete product";
      toast.error(message);
    },
  });

  return {
    products: query.data?.data || [],
    meta: query.data?.meta,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    createProduct: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateProduct: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteProduct: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}

export function useProduct(id?: string) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      if (!id) return null;
      const res = await apiFetch<Product>(`/products/${id}`);
      return res.data;
    },
    enabled: Boolean(id),
  });
}
