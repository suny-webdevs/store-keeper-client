"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { branchSchema, type BranchInput } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import type { Branch } from "@/types/api";

interface BranchFormProps {
  initialData?: Branch | null;
  onSubmit: (data: BranchInput) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function BranchForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
}: BranchFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BranchInput>({
    resolver: zodResolver(branchSchema),
    defaultValues: {
      name: initialData?.name || "",
      code: initialData?.code || "",
      address: initialData?.address || "",
      phone: initialData?.phone || "",
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        code: initialData.code,
        address: initialData.address || "",
        phone: initialData.phone || "",
      });
    } else {
      reset({ name: "", code: "", address: "", phone: "" });
    }
  }, [initialData, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="branch-name">Branch Name *</Label>
        <Input
          id="branch-name"
          placeholder="e.g. Gulshan Flagship Store"
          {...register("name")}
          className={errors.name ? "border-destructive" : ""}
        />
        {errors.name && (
          <p className="text-[11px] text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="branch-code">Branch Code * (Max 10 chars)</Label>
        <Input
          id="branch-code"
          placeholder="e.g. GLS-01"
          {...register("code")}
          className={errors.code ? "border-destructive uppercase num" : "uppercase num"}
        />
        {errors.code && (
          <p className="text-[11px] text-destructive">{errors.code.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="branch-address">Physical Address</Label>
        <Input
          id="branch-address"
          placeholder="e.g. Road 11, Block D, Gulshan-1, Dhaka"
          {...register("address")}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="branch-phone">Contact Phone</Label>
        <Input
          id="branch-phone"
          placeholder="e.g. +880 1711-000111"
          {...register("phone")}
          className="num"
        />
      </div>

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
              Saving...
            </>
          ) : initialData ? (
            "Update Branch"
          ) : (
            "Create Branch"
          )}
        </Button>
      </div>
    </form>
  );
}
