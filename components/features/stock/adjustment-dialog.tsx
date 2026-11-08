"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { stockAdjustmentSchema, type StockAdjustmentInput } from "@/lib/schemas";
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
import { Loader2, SlidersHorizontal } from "lucide-react";
import type { StockItem } from "@/types/api";

interface AdjustmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stockItem: StockItem | null;
  onSubmit: (data: StockAdjustmentInput) => Promise<void>;
  isSubmitting: boolean;
}

export function AdjustmentDialog({
  open,
  onOpenChange,
  stockItem,
  onSubmit,
  isSubmitting,
}: AdjustmentDialogProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<StockAdjustmentInput>({
    resolver: zodResolver(stockAdjustmentSchema),
    defaultValues: {
      productId: stockItem?.productId || "",
      qty: 0,
      reason: "COUNT_ADJUSTMENT",
      notes: "",
    },
  });

  React.useEffect(() => {
    if (stockItem) {
      setValue("productId", stockItem.productId);
    }
  }, [stockItem, setValue]);

  const selectedReason = watch("reason");
  const deltaQty = watch("qty") || 0;
  const currentOnHand = stockItem?.qtyOnHand ?? 0;
  const projectedOnHand = Math.max(0, currentOnHand + deltaQty);

  const handleFormSubmit = async (data: StockAdjustmentInput) => {
    await onSubmit(data);
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5 text-primary" />
            Inventory Adjustment
          </DialogTitle>
          <DialogDescription>
            Record positive or negative discrepancies, damages, audit count corrections, or shrinkage.
          </DialogDescription>
        </DialogHeader>

        {stockItem && (
          <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="font-semibold text-foreground">{stockItem.product.name}</span>
              <span className="font-mono text-muted-foreground num">[{stockItem.product.sku}]</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Current On-Hand:</span>
              <span className="font-mono font-semibold text-foreground num">{currentOnHand} units</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="adj-qty">
              Delta Quantity (Positive to add, Negative to deduct) *
            </Label>
            <Input
              id="adj-qty"
              type="number"
              placeholder="-2 or +5"
              {...register("qty", { valueAsNumber: true })}
              className={errors.qty ? "border-destructive font-mono num text-xs" : "font-mono num text-xs"}
            />
            {errors.qty && (
              <p className="text-[11px] text-destructive">{errors.qty.message}</p>
            )}
            <p className="text-[11px] text-muted-foreground flex justify-between">
              <span>Projected Balance After Adjustment:</span>
              <span className="font-mono font-semibold text-foreground num">{projectedOnHand} units</span>
            </p>
          </div>

          <div className="space-y-1.5">
            <Label>Adjustment Reason Code *</Label>
            <Select
              value={selectedReason}
              onValueChange={(val) => setValue("reason", val as StockAdjustmentInput["reason"])}
            >
              <SelectTrigger className="text-xs">
                <SelectValue placeholder="Select reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="COUNT_ADJUSTMENT">Physical Audit Count Adjustment</SelectItem>
                <SelectItem value="DAMAGED">Damaged / Broken in Warehouse</SelectItem>
                <SelectItem value="EXPIRED">Expired Shelf Life</SelectItem>
                <SelectItem value="THEFT">Shrinkage / Discrepancy</SelectItem>
                <SelectItem value="RETURN">Customer Return to Shelf</SelectItem>
                <SelectItem value="OTHER">Other Reason</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="adj-notes">Audit Notes</Label>
            <Input
              id="adj-notes"
              placeholder="Reason justification, shelf location..."
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
              disabled={isSubmitting || deltaQty === 0}
              className="bg-primary text-primary-foreground font-medium"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  Applying...
                </>
              ) : (
                "Post Adjustment"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
