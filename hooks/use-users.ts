"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiFetch, ApiError } from "@/lib/api";
import type { UserItem, BranchRole } from "@/types/api";
import type { InviteUserInput, UpdateUserInput } from "@/lib/schemas";

export function useUsers(filters?: { page?: number; limit?: number }) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["users", filters],
    queryFn: async () => {
      const res = await apiFetch<UserItem[]>("/users", {
        params: {
          page: Math.max(1, filters?.page || 1),
          limit: Math.min(100, Math.max(1, filters?.limit || 50)),
        },
      });

      // Normalize branchAccess to branches array for consistent UI access
      const normalizedUsers = (res.data || []).map((u) => {
        const branches =
          u.branchAccess && u.branchAccess.length > 0
            ? u.branchAccess.map((ba) => ({
                branchId: ba.branchId,
                branchName: ba.branch?.name,
                role: ba.role,
              }))
            : u.branches || [];

        return {
          ...u,
          branches,
        };
      });

      return {
        data: normalizedUsers,
        meta: res.meta,
        message: res.message,
      };
    },
  });

  const inviteMutation = useMutation({
    mutationFn: async (data: InviteUserInput) => {
      const payload: {
        email: string;
        fullName: string;
        globalRole?: "OWNER" | "ADMIN";
        branches?: { branchId: string; role: BranchRole }[];
      } = {
        email: data.email.trim(),
        fullName: data.fullName.trim(),
      };

      if (data.globalRole === "ADMIN" || data.globalRole === "OWNER") {
        payload.globalRole = data.globalRole;
      }

      if (data.branchId && data.branchRole) {
        payload.branches = [
          {
            branchId: data.branchId,
            role: data.branchRole as BranchRole,
          },
        ];
      }

      return apiFetch<UserItem>("/users/invite", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: (res) => {
      toast.success(res.message || "Invitation sent successfully");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (err: unknown) => {
      const message =
        err instanceof ApiError
          ? err.errors?.[0]?.message || err.message
          : "Failed to invite user";
      toast.error(message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateUserInput }) => {
      return apiFetch<UserItem>(`/users/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    onSuccess: (res) => {
      toast.success(res.message || "User updated successfully");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
    onError: (err: unknown) => {
      const message =
        err instanceof ApiError
          ? err.errors?.[0]?.message || err.message
          : "Failed to update user";
      toast.error(message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiFetch<{ id: string }>(`/users/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: (res) => {
      toast.success(res.message || "User removed");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (err: unknown) => {
      const message =
        err instanceof ApiError
          ? err.errors?.[0]?.message || err.message
          : "Failed to remove user";
      toast.error(message);
    },
  });

  const assignBranchMutation = useMutation({
    mutationFn: async ({
      userId,
      branchId,
      role,
    }: {
      userId: string;
      branchId: string;
      role: BranchRole;
    }) => {
      return apiFetch(`/users/${userId}/branches`, {
        method: "POST",
        body: JSON.stringify({ branchId, role }),
      });
    },
    onSuccess: () => {
      toast.success("Branch access updated");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
    onError: (err: unknown) => {
      const message =
        err instanceof ApiError
          ? err.errors?.[0]?.message || err.message
          : "Failed to update branch access";
      toast.error(message);
    },
  });

  const updateBranchRoleMutation = useMutation({
    mutationFn: async ({
      userId,
      branchId,
      role,
    }: {
      userId: string;
      branchId: string;
      role: BranchRole;
    }) => {
      return apiFetch(`/users/${userId}/branches/${branchId}`, {
        method: "PATCH",
        body: JSON.stringify({ role }),
      });
    },
    onSuccess: () => {
      toast.success("Branch role updated");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
    onError: (err: unknown) => {
      const message =
        err instanceof ApiError
          ? err.errors?.[0]?.message || err.message
          : "Failed to update branch role";
      toast.error(message);
    },
  });

  const removeBranchMutation = useMutation({
    mutationFn: async ({ userId, branchId }: { userId: string; branchId: string }) => {
      return apiFetch(`/users/${userId}/branches/${branchId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      toast.success("Branch access removed");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
    onError: (err: unknown) => {
      const message =
        err instanceof ApiError
          ? err.errors?.[0]?.message || err.message
          : "Failed to remove branch access";
      toast.error(message);
    },
  });

  return {
    users: query.data?.data || [],
    meta: query.data?.meta,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    inviteUser: inviteMutation.mutateAsync,
    isInviting: inviteMutation.isPending,
    updateUser: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteUser: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    assignBranch: assignBranchMutation.mutateAsync,
    updateBranchRole: updateBranchRoleMutation.mutateAsync,
    isUpdatingBranchRole: updateBranchRoleMutation.isPending,
    removeBranch: removeBranchMutation.mutateAsync,
  };
}
