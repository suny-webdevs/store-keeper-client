"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { paymentSchema, type PaymentInput } from "@/lib/schemas";
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
import { Loader2, CreditCard, Banknote, Smartphone, Building } from "lucide-react";
import type { Sale } from "@/types/api";
import { formatCurrency } from "@/lib/formatters";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sale: Sale | null;
  onSubmit: (data: PaymentInput) => Promise<void>;
  isSubmitting: boolean;
}

export function PaymentDialog({
  open,
  onOpenChange,
  sale,
  onSubmit,
  isSubmitting,
}: PaymentDialogProps) {
  const totalPaid = sale?.payments.reduce((s, p) => s + p.amount, 0) || 0;
  const remainingDue = Math.max(0, (sale?.total || 0) - totalPaid);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<PaymentInput>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      method: "CASH",
      amount: remainingDue || 0,
      reference: "",
    },
  });

  React.useEffect(() => {
    if (sale) {
      setValue("amount", remainingDue);
    }
  }, [sale, remainingDue, setValue]);

  const selectedMethod = watch("method");

  const handleFormSubmit = async (data: PaymentInput) => {
    await onSubmit(data);
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Record Payment Settlement</DialogTitle>
          <DialogDescription>
            Collect invoice payment for invoice{" "}
            <strong className="text-foreground">{sale?.invoiceNumber}</strong>.
          </DialogDescription>
        </DialogHeader>

        {sale && (
          <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Order Total:</span>
              <span className="font-semibold text-foreground num">
                {formatCurrency(sale.total)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Paid to Date:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold num">
                {formatCurrency(totalPaid)}
              </span>
            </div>
            <div className="flex justify-between border-t border-border pt-1 font-semibold text-foreground">
              <span>Remaining Balance:</span>
              <span className="num">{formatCurrency(remainingDue)}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Payment Method</Label>
            <Select
              value={selectedMethod}
              onValueChange={(val) => setValue("method", val as PaymentInput["method"])}
            >
              <SelectTrigger className="text-xs">
                <SelectValue placeholder="Select payment channel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CASH">
                  <span className="flex items-center gap-2">
                    <Banknote className="h-4 w-4 text-emerald-600" />
                    <span>Cash on Counter</span>
                  </span>
                </SelectItem>
                <SelectItem value="CARD">
                  <span className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-blue-600" />
                    <span>Credit / Debit POS Card (Visa/Mastercard)</span>
                  </span>
                </SelectItem>
                <SelectItem value="MOBILE">
                  <span className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-pink-600" />
                    <span>Mobile Financial Service (bKash / Nagad)</span>
                  </span>
                </SelectItem>
                <SelectItem value="BANK">
                  <span className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-amber-600" />
                    <span>Direct Bank Wire / BEFTN</span>
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pmt-amount">Amount Collected (BDT ৳) *</Label>
            <Input
              id="pmt-amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register("amount", { valueAsNumber: true })}
              className={errors.amount ? "border-destructive font-mono num text-xs" : "font-mono num text-xs"}
            />
            {errors.amount && (
              <p className="text-[11px] text-destructive">{errors.amount.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pmt-ref">Transaction Reference / Auth Code</Label>
            <Input
              id="pmt-ref"
              placeholder={
                selectedMethod === "MOBILE"
                  ? "e.g. bKash TrxID: 9J382X71AA"
                  : selectedMethod === "CARD"
                  ? "e.g. Auth Code: 884912"
                  : "Optional note or receipt slip number"
              }
              {...register("reference")}
              className="text-xs font-mono"
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
                  Recording...
                </>
              ) : (
                "Complete Payment"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
