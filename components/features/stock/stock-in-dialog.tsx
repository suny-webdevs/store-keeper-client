"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { stockInSchema, type StockInInput } from "@/lib/schemas";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Loader2, ArrowDownToLine } from "lucide-react";
import type { Product } from "@/types/api";

interface StockInDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: Product[];
  onSubmit: (data: StockInInput) => Promise<void>;
  isSubmitting: boolean;
}

export function StockInDialog({
  open,
  onOpenChange,
  products,
  onSubmit,
  isSubmitting,
}: StockInDialogProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<StockInInput>({
    resolver: zodResolver(stockInSchema),
    defaultValues: {
      productId: "",
      qty: 1,
      unitCost: 0,
      reference: "",
      notes: "",
    },
  });

  const selectedProductId = watch("productId");

  const handleProductSelect = (id: string) => {
    setValue("productId", id);
    const prod = products.find((p) => p.id === id);
    if (prod && !watch("unitCost")) {
      // Default initial cost estimation: 70% of base retail price
      setValue("unitCost", Math.round(prod.basePrice * 0.7));
    }
  };

  const handleFormSubmit = async (data: StockInInput) => {
    await onSubmit(data);
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowDownToLine className="h-5 w-5 text-primary" />
            Stock-In Intake
          </DialogTitle>
          <DialogDescription>
            Receive incoming vendor purchase orders or distributor shipments to replenish branch inventory.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Target Product *</Label>
            <Select value={selectedProductId} onValueChange={handleProductSelect}>
              <SelectTrigger className={errors.productId ? "border-destructive text-xs" : "text-xs"}>
                <SelectValue placeholder="Search and select product..." />
              </SelectTrigger>
              <SelectContent>
                {products.map((p) => (
                  <SelectItem key={p.id} value={p.id} className="text-xs">
                    {p.name} [{p.sku}]
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.productId && (
              <p className="text-[11px] text-destructive">{errors.productId.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="stockin-qty">Quantity Received *</Label>
              <Input
                id="stockin-qty"
                type="number"
                min="1"
                placeholder="10"
                {...register("qty", { valueAsNumber: true })}
                className={errors.qty ? "border-destructive num text-xs" : "num text-xs"}
              />
              {errors.qty && (
                <p className="text-[11px] text-destructive">{errors.qty.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="stockin-cost">Unit Cost (৳) *</Label>
              <Input
                id="stockin-cost"
                type="number"
                step="0.01"
                placeholder="1500"
                {...register("unitCost", { valueAsNumber: true })}
                className={errors.unitCost ? "border-destructive num text-xs" : "num text-xs"}
              />
              {errors.unitCost && (
                <p className="text-[11px] text-destructive">{errors.unitCost.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="stockin-ref">Reference (PO# / Invoice #)</Label>
            <Input
              id="stockin-ref"
              placeholder="e.g. PO-2026-118"
              {...register("reference")}
              className="text-xs font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="stockin-notes">Notes</Label>
            <Input
              id="stockin-notes"
              placeholder="Batch number, supplier name, condition notes..."
              {...register("notes")}
              className="text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
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
                  Receiving...
                </>
              ) : (
                "Confirm Stock Intake"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
