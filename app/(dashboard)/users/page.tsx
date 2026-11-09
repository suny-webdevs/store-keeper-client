"use client";

import React, { useState } from "react";
import {
  Users,
  UserPlus,
  Shield,
  GitBranch,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useUsers } from "@/hooks/use-users";
import { useBranches } from "@/hooks/use-branches";
import { InviteUserForm } from "@/components/features/users/invite-user-form";
import { BranchAccessManager } from "@/components/features/users/branch-access-manager";
import type { UserItem, BranchRole } from "@/types/api";
import type { InviteUserInput } from "@/lib/schemas";
import { formatDate } from "@/lib/formatters";

export default function UsersPage() {
  const {
    users,
    isLoading,
    inviteUser,
    isInviting,
    deleteUser,
    isDeleting,
    assignBranch,
    updateBranchRole,
    removeBranch,
  } = useUsers();

  const { branches } = useBranches();

  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [selectedUserForBranches, setSelectedUserForBranches] = useState<UserItem | null>(null);
  const [deleteTargetUser, setDeleteTargetUser] = useState<UserItem | null>(null);

  const handleInviteSubmit = async (data: InviteUserInput) => {
    await inviteUser(data);
    setInviteDialogOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (deleteTargetUser) {
      await deleteUser(deleteTargetUser.id);
      setDeleteTargetUser(null);
    }
  };

  const handleAssignBranch = async (data: { userId: string; branchId: string; role: BranchRole }) => {
    await assignBranch(data);
    // Refresh local selected state
    if (selectedUserForBranches && selectedUserForBranches.id === data.userId) {
      const branchObj = branches.find((b) => b.id === data.branchId);
      setSelectedUserForBranches({
        ...selectedUserForBranches,
        branches: [
          ...selectedUserForBranches.branches,
          { branchId: data.branchId, branchName: branchObj?.name, role: data.role },
        ],
      });
    }
  };

  const handleUpdateBranchRole = async (data: { userId: string; branchId: string; role: BranchRole }) => {
    await updateBranchRole(data);
    if (selectedUserForBranches && selectedUserForBranches.id === data.userId) {
      setSelectedUserForBranches({
        ...selectedUserForBranches,
        branches: selectedUserForBranches.branches.map((b) =>
          b.branchId === data.branchId ? { ...b, role: data.role } : b
        ),
      });
    }
  };

  const handleRemoveBranch = async (data: { userId: string; branchId: string }) => {
    await removeBranch(data);
    if (selectedUserForBranches && selectedUserForBranches.id === data.userId) {
      setSelectedUserForBranches({
        ...selectedUserForBranches,
        branches: selectedUserForBranches.branches.filter((b) => b.branchId !== data.branchId),
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Invite CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Team & Access Control
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Manage store employees, assigned cashier roles, branch access permissions, and administrators.
          </p>
        </div>
        <Button onClick={() => setInviteDialogOpen(true)} size="sm" className="bg-primary text-primary-foreground gap-2">
          <UserPlus className="h-4 w-4" />
          <span>Invite Member</span>
        </Button>
      </div>

      {/* Main Table Card */}
      <div className="rounded-lg border border-border bg-card overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-3">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">No team members</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              Invite your managers and cashiers to manage sales and stock in your branches.
            </p>
            <Button onClick={() => setInviteDialogOpen(true)} size="sm" className="mt-4 gap-2">
              <UserPlus className="h-4 w-4" />
              Invite First Member
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User / Email</TableHead>
                <TableHead className="w-[120px]">Global Role</TableHead>
                <TableHead className="hidden md:table-cell">Assigned Branches</TableHead>
                <TableHead className="w-[90px]">Status</TableHead>
                <TableHead className="hidden lg:table-cell w-[130px]">Joined</TableHead>
                <TableHead className="w-[120px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-xs">
                        {u.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">{u.fullName}</span>
                        <span className="text-[11px] text-muted-foreground">{u.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        u.globalRole === "OWNER"
                          ? "default"
                          : u.globalRole === "ADMIN"
                          ? "outline"
                          : "secondary"
                      }
                      className="text-[10px]"
                    >
                      <Shield className="h-2.5 w-2.5 mr-1" />
                      {u.globalRole}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                    {u.branches && u.branches.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {u.branches.map((b) => (
                          <span
                            key={b.branchId}
                            className="inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 text-[10px] text-foreground font-mono num"
                          >
                            <GitBranch className="h-2.5 w-2.5 text-primary" />
                            {b.branchName || b.branchId} [{b.role}]
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground/60 italic text-xs">All branches</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={u.isActive ? "success" : "secondary"}>
                      {u.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                    {formatDate(u.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedUserForBranches(u)}
                        className="h-7 px-2 text-[11px] gap-1"
                      >
                        <GitBranch className="h-3 w-3 text-primary" />
                        <span>Branches</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteTargetUser(u)}
                        disabled={u.globalRole === "OWNER"}
                        className="h-7 w-7 text-muted-foreground hover:text-destructive disabled:opacity-30"
                        aria-label="Remove user"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Invite Member Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>
              Send an invitation email to add a staff member, store manager, or administrator.
            </DialogDescription>
          </DialogHeader>
          <InviteUserForm
            branches={branches}
            onSubmit={handleInviteSubmit}
            onCancel={() => setInviteDialogOpen(false)}
            isSubmitting={isInviting}
          />
        </DialogContent>
      </Dialog>

      {/* Branch Access Dialog */}
      <Dialog
        open={Boolean(selectedUserForBranches)}
        onOpenChange={(open) => !open && setSelectedUserForBranches(null)}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Manage Branch Permissions</DialogTitle>
            <DialogDescription>
              Assign or revoke operational branch roles for{" "}
              <strong className="text-foreground">
                {selectedUserForBranches?.fullName}
              </strong>{" "}
              ({selectedUserForBranches?.email}).
            </DialogDescription>
          </DialogHeader>
          {selectedUserForBranches && (
            <BranchAccessManager
              user={selectedUserForBranches}
              allBranches={branches}
              onAssignBranch={handleAssignBranch}
              onUpdateBranchRole={handleUpdateBranchRole}
              onRemoveBranch={handleRemoveBranch}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation Alert Dialog */}
      <AlertDialog
        open={Boolean(deleteTargetUser)}
        onOpenChange={(open) => !open && setDeleteTargetUser(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Remove Team Member
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{" "}
              <strong className="text-foreground">
                &ldquo;{deleteTargetUser?.fullName}&rdquo;
              </strong>{" "}
              ({deleteTargetUser?.email}) from Store Keeper? Their account access will be revoked immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Removing..." : "Remove User"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
