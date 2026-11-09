"use client";

import React, { useState } from "react";
import { GitBranch, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { UserItem, Branch, BranchRole } from "@/types/api";

interface BranchAccessManagerProps {
  user: UserItem;
  allBranches: Branch[];
  onAssignBranch: (data: { userId: string; branchId: string; role: BranchRole }) => Promise<void>;
  onUpdateBranchRole?: (data: { userId: string; branchId: string; role: BranchRole }) => Promise<void>;
  onRemoveBranch: (data: { userId: string; branchId: string }) => Promise<void>;
}

export function BranchAccessManager({
  user,
  allBranches,
  onAssignBranch,
  onUpdateBranchRole,
  onRemoveBranch,
}: BranchAccessManagerProps) {
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<BranchRole>("CASHIER");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available branches not already assigned to user
  const assignedBranchIds = new Set((user.branches || []).map((b) => b.branchId));
  const availableBranches = allBranches.filter((b) => !assignedBranchIds.has(b.id));

  const handleAdd = async () => {
    if (!selectedBranchId) return;
    setIsSubmitting(true);
    try {
      await onAssignBranch({
        userId: user.id,
        branchId: selectedBranchId,
        role: selectedRole,
      });
      setSelectedBranchId("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoleChange = async (branchId: string, role: BranchRole) => {
    if (!onUpdateBranchRole) return;
    setIsSubmitting(true);
    try {
      await onUpdateBranchRole({
        userId: user.id,
        branchId,
        role,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemove = async (branchId: string) => {
    setIsSubmitting(true);
    try {
      await onRemoveBranch({
        userId: user.id,
        branchId,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const userBranches = user.branches || [];

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
          Assigned Branches ({userBranches.length})
        </h4>
        <div className="mt-2 space-y-2">
          {userBranches.length === 0 ? (
            <p className="text-xs text-muted-foreground italic py-2">
              No specific branch assignment. User has workspace-level role permissions.
            </p>
          ) : (
            userBranches.map((b) => {
              const branchInfo = allBranches.find((br) => br.id === b.branchId);
              return (
                <div
                  key={b.branchId}
                  className="flex items-center justify-between rounded-md border border-border p-2.5 bg-muted/30 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <GitBranch className="h-4 w-4 text-primary shrink-0" />
                    <div>
                      <span className="font-medium text-foreground">
                        {b.branchName || branchInfo?.name || b.branchId}
                      </span>
                      {branchInfo && (
                        <span className="ml-1.5 font-mono text-[11px] text-muted-foreground num">
                          ({branchInfo.code})
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {onUpdateBranchRole ? (
                      <Select
                        value={b.role}
                        onValueChange={(val) => handleRoleChange(b.branchId, val as BranchRole)}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger className="h-6 text-[10px] w-24 px-1.5">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CASHIER">CASHIER</SelectItem>
                          <SelectItem value="MANAGER">MANAGER</SelectItem>
                          <SelectItem value="VIEWER">VIEWER</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge variant="outline" className="text-[10px]">
                        {b.role}
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemove(b.branchId)}
                      disabled={isSubmitting}
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      aria-label="Remove branch access"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Assign New Branch Form */}
      {availableBranches.length > 0 && (
        <div className="rounded-lg border border-border/80 p-3 bg-card space-y-3">
          <span className="text-xs font-medium text-foreground block">
            Assign Additional Branch
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Select value={selectedBranchId} onValueChange={setSelectedBranchId}>
              <SelectTrigger>
                <SelectValue placeholder="Select branch..." />
              </SelectTrigger>
              <SelectContent>
                {availableBranches.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name} ({b.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedRole}
              onValueChange={(val) => setSelectedRole(val as BranchRole)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Branch Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CASHIER">Cashier (POS)</SelectItem>
                <SelectItem value="MANAGER">Branch Manager</SelectItem>
                <SelectItem value="VIEWER">Viewer (Read-only)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            type="button"
            size="sm"
            onClick={handleAdd}
            disabled={!selectedBranchId || isSubmitting}
            className="w-full gap-2 bg-primary text-primary-foreground font-medium"
          >
            <Plus className="h-3.5 w-3.5" />
            Assign Branch Permission
          </Button>
        </div>
      )}
    </div>
  );
}
