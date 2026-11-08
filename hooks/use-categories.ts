"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiFetch, ApiError } from "@/lib/api";
import type { Category } from "@/types/api";
import type { CategoryInput } from "@/lib/schemas";

export function useCategories(tree: boolean = true) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["categories", { tree }],
    queryFn: async () => {
      const res = await apiFetch<Category[]>("/categories", {
        params: { tree },
      });
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CategoryInput) => {
      return apiFetch<Category>("/categories", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: (res) => {
      toast.success(res.message || "Category created successfully");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (err: unknown) => {
      const message = err instanceof ApiError ? err.errors?.[0]?.message || err.message : "Failed to create category";
      toast.error(message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CategoryInput> }) => {
      return apiFetch<Category>(`/categories/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    onSuccess: (res) => {
      toast.success(res.message || "Category updated successfully");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (err: unknown) => {
      const message = err instanceof ApiError ? err.errors?.[0]?.message || err.message : "Failed to update category";
      toast.error(message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiFetch<{ id: string }>(`/categories/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: (res) => {
      toast.success(res.message || "Category deleted");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (err: unknown) => {
      const message = err instanceof ApiError ? err.errors?.[0]?.message || err.message : "Failed to delete category";
      toast.error(message);
    },
  });

  return {
    categories: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    createCategory: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateCategory: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteCategory: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
