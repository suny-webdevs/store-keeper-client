"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiFetch, ApiError } from "@/lib/api";
import type { Branch } from "@/types/api";
import type { BranchInput } from "@/lib/schemas";

export function useBranches() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["branches"],
    queryFn: async () => {
      const res = await apiFetch<Branch[]>("/branches");
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: BranchInput) => {
      return apiFetch<Branch>("/branches", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: (res) => {
      toast.success(res.message || "Branch created successfully");
      queryClient.invalidateQueries({ queryKey: ["branches"] });
    },
    onError: (err: unknown) => {
      const message = err instanceof ApiError ? err.errors?.[0]?.message || err.message : "Failed to create branch";
      toast.error(message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<BranchInput> }) => {
      return apiFetch<Branch>(`/branches/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    onSuccess: (res) => {
      toast.success(res.message || "Branch updated successfully");
      queryClient.invalidateQueries({ queryKey: ["branches"] });
    },
    onError: (err: unknown) => {
      const message = err instanceof ApiError ? err.errors?.[0]?.message || err.message : "Failed to update branch";
      toast.error(message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiFetch<{ id: string }>(`/branches/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: (res) => {
      toast.success(res.message || "Branch deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["branches"] });
    },
    onError: (err: unknown) => {
      const message = err instanceof ApiError ? err.errors?.[0]?.message || err.message : "Failed to delete branch";
      toast.error(message);
    },
  });

  return {
    branches: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    createBranch: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateBranch: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteBranch: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
