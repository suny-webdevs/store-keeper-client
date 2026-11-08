"use client";

import React, { useState } from "react";
import {
  GitBranch,
  Plus,
  Pencil,
  Trash2,
  MapPin,
  Phone,
  CheckCircle2,
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
import { useBranches } from "@/hooks/use-branches";
import { BranchForm } from "@/components/features/branches/branch-form";
import type { Branch } from "@/types/api";
import type { BranchInput } from "@/lib/schemas";
import { formatDate } from "@/lib/formatters";

export default function BranchesPage() {
  const {
    branches,
    isLoading,
    createBranch,
    isCreating,
    updateBranch,
    isUpdating,
    deleteBranch,
    isDeleting,
  } = useBranches();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [deleteTargetBranch, setDeleteTargetBranch] = useState<Branch | null>(null);

  const handleOpenCreate = () => {
    setEditingBranch(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setDialogOpen(true);
  };

  const handleFormSubmit = async (data: BranchInput) => {
    if (editingBranch) {
      await updateBranch({ id: editingBranch.id, data });
    } else {
      await createBranch(data);
    }
    setDialogOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (deleteTargetBranch) {
      await deleteBranch(deleteTargetBranch.id);
      setDeleteTargetBranch(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Branches & Outlets
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Manage your retail store locations, fulfillment warehouses, and branch-scoped inventory.
          </p>
        </div>
        <Button onClick={handleOpenCreate} size="sm" className="bg-primary text-primary-foreground gap-2">
          <Plus className="h-4 w-4" />
          <span>Add New Branch</span>
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
        ) : branches.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-3">
              <GitBranch className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">No branches found</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              Get started by creating your primary store location or warehouse to track branch stock.
            </p>
            <Button onClick={handleOpenCreate} size="sm" className="mt-4 gap-2">
              <Plus className="h-4 w-4" />
              Add First Branch
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-30">Code</TableHead>
                <TableHead>Branch Name</TableHead>
                <TableHead className="hidden md:table-cell">Address</TableHead>
                <TableHead className="hidden sm:table-cell">Phone</TableHead>
                <TableHead className="w-25">Status</TableHead>
                <TableHead className="hidden lg:table-cell w-35">Created</TableHead>
                <TableHead className="w-25 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {branches.map((branch) => (
                <TableRow key={branch.id}>
                  <TableCell className="font-mono text-xs font-semibold text-foreground num">
                    {branch.code}
                  </TableCell>
                  <TableCell className="font-medium text-foreground">
                    <div className="flex items-center gap-2">
                      <span>{branch.name}</span>
                      {branch.id === "br_main" && (
                        <span className="rounded bg-primary/10 text-primary text-[10px] px-1.5 py-0.2 font-semibold">
                          Main
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                    {branch.address ? (
                      <span className="flex items-center gap-1.5 truncate max-w-70">
                        <MapPin className="h-3 w-3 shrink-0 text-muted-foreground/60" />
                        {branch.address}
                      </span>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-xs text-muted-foreground font-mono num">
                    {branch.phone || "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={branch.isActive ? "success" : "secondary"}>
                      {branch.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                    {formatDate(branch.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenEdit(branch)}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        aria-label="Edit branch"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteTargetBranch(branch)}
                        disabled={branch.id === "br_main"}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive disabled:opacity-30"
                        aria-label="Delete branch"
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

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingBranch ? "Edit Branch Details" : "Create New Branch"}
            </DialogTitle>
            <DialogDescription>
              {editingBranch
                ? "Update branch location details, code, and contact information."
                : "Add a new store branch or warehouse location for inventory tracking."}
            </DialogDescription>
          </DialogHeader>
          <BranchForm
            initialData={editingBranch}
            onSubmit={handleFormSubmit}
            onCancel={() => setDialogOpen(false)}
            isSubmitting={isCreating || isUpdating}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog
        open={Boolean(deleteTargetBranch)}
        onOpenChange={(open) => !open && setDeleteTargetBranch(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Delete Branch Location
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete branch{" "}
              <strong className="text-foreground">
                &ldquo;{deleteTargetBranch?.name}&rdquo;
              </strong>{" "}
              ({deleteTargetBranch?.code})? This action cannot be undone. Branch-scoped inventory and sales history may become unassigned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete Branch"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
