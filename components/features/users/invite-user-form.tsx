"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { inviteUserSchema, type InviteUserInput } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import type { Branch, BranchRole } from "@/types/api";

interface InviteUserFormProps {
  branches: Branch[];
  onSubmit: (data: InviteUserInput) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function InviteUserForm({
  branches,
  onSubmit,
  onCancel,
  isSubmitting,
}: InviteUserFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<InviteUserInput>({
    resolver: zodResolver(inviteUserSchema),
    defaultValues: {
      email: "",
      fullName: "",
      globalRole: "STAFF",
      branchRole: "CASHIER",
    },
  });

  const selectedGlobalRole = watch("globalRole");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="user-fullname">Full Name *</Label>
        <Input
          id="user-fullname"
          placeholder="e.g. Mahfuzur Rahman"
          {...register("fullName")}
          className={errors.fullName ? "border-destructive" : ""}
        />
        {errors.fullName && (
          <p className="text-[11px] text-destructive">{errors.fullName.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="user-email">Work Email *</Label>
        <Input
          id="user-email"
          type="email"
          placeholder="mahfuz@storekeeper.dev"
          {...register("email")}
          className={errors.email ? "border-destructive" : ""}
        />
        {errors.email && (
          <p className="text-[11px] text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label>Global Workspace Role</Label>
        <Select
          defaultValue={selectedGlobalRole}
          onValueChange={(val) => setValue("globalRole", val as "OWNER" | "ADMIN" | "STAFF")}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="STAFF">Staff (POS & Stock operations only)</SelectItem>
            <SelectItem value="ADMIN">Admin (Catalog, users, reports)</SelectItem>
            <SelectItem value="OWNER">Owner (Full tenant access)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {branches.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="space-y-1.5">
            <Label>Initial Assigned Branch</Label>
            <Select
              onValueChange={(val) => setValue("branchId", val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Assign branch..." />
              </SelectTrigger>
              <SelectContent>
                {branches.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name} ({b.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Branch Duty Role</Label>
            <Select
              defaultValue="CASHIER"
              onValueChange={(val) => setValue("branchRole", val as BranchRole)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Branch role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CASHIER">Cashier (Sales & POS)</SelectItem>
                <SelectItem value="MANAGER">Branch Manager</SelectItem>
                <SelectItem value="VIEWER">Viewer (Read-only)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2 border-t border-border">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          size="sm"
          disabled={isSubmitting}
          className="bg-primary text-primary-foreground font-medium"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
              Sending Invite...
            </>
          ) : (
            "Send Invitation"
          )}
        </Button>
      </div>
    </form>
  );
}
