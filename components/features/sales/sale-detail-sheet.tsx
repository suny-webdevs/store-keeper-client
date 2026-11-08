"use client";

import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import {
  Receipt,
  Printer,
  Ban,
  CreditCard,
  Banknote,
  Smartphone,
  Building,
  CheckCircle,
  Clock,
  Plus,
} from "lucide-react";
import type { Sale } from "@/types/api";
import { formatCurrency, formatDate } from "@/lib/formatters";

interface SaleDetailSheetProps {
  sale: Sale | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancelSale: (id: string) => Promise<void>;
  onAddPayment: (sale: Sale) => void;
}

export function SaleDetailSheet({
  sale,
  open,
  onOpenChange,
  onCancelSale,
  onAddPayment,
}: SaleDetailSheetProps) {
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  if (!sale) return null;

  const totalPaid = sale.payments.reduce((s, p) => s + p.amount, 0);
  const remainingDue = Math.max(0, sale.total - totalPaid);

  const handleConfirmCancel = async () => {
    setIsCancelling(true);
    try {
      await onCancelSale(sale.id);
      setCancelConfirmOpen(false);
    } finally {
      setIsCancelling(false);
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="sm:max-w-lg w-full overflow-y-auto">
          <SheetHeader>
            <div className="flex items-center justify-between pr-6">
              <Badge
                variant={
                  sale.status === "COMPLETED"
                    ? "success"
                    : sale.status === "CANCELLED"
                    ? "destructive"
                    : "secondary"
                }
              >
                {sale.status}
              </Badge>
              <span className="font-mono text-xs text-muted-foreground num">
                {formatDate(sale.createdAt)}
              </span>
            </div>
            <SheetTitle className="text-xl font-bold tracking-tight text-foreground text-left mt-2">
              {sale.invoiceNumber}
            </SheetTitle>
            <SheetDescription className="text-left">
              Branch: {sale.branchName || "Main Store"}
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-5 py-4">
            {/* Line Items List */}
            <div>
              <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                Purchased Items ({sale.items.length})
              </h4>
              <div className="rounded-lg border border-border divide-y divide-border">
                {sale.items.map((it) => (
                  <div key={it.id || it.productId} className="flex justify-between p-3 text-xs">
                    <div className="flex flex-col">
                      <span className="font-semibold text-foreground">{it.productName}</span>
                      <span className="font-mono text-[11px] text-muted-foreground num">
                        {it.sku} • {it.qty} × {formatCurrency(it.unitPrice)}
                      </span>
                    </div>
                    <div className="font-mono font-semibold text-foreground num">
                      {formatCurrency(it.total)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-1.5 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal:</span>
                <span className="font-mono text-foreground num">{formatCurrency(sale.subtotal)}</span>
              </div>
              {sale.discount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>Discount Applied:</span>
                  <span className="font-mono num">-{formatCurrency(sale.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span>VAT / Tax (5%):</span>
                <span className="font-mono text-foreground num">{formatCurrency(sale.tax)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2 text-sm font-bold text-foreground">
                <span>Grand Total:</span>
                <span className="font-mono text-primary num">{formatCurrency(sale.total)}</span>
              </div>
            </div>

            {/* Payments List */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  Payment History ({sale.payments.length})
                </h4>
                {remainingDue > 0 && sale.status !== "CANCELLED" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onAddPayment(sale)}
                    className="h-6 text-[11px] px-2 gap-1 text-primary"
                  >
                    <Plus className="h-3 w-3" />
                    Record Settlement
                  </Button>
                )}
              </div>
              <div className="space-y-2">
                {sale.payments.map((pmt) => (
                  <div
                    key={pmt.id || pmt.amount}
                    className="flex items-center justify-between rounded-md border border-border p-2.5 bg-card text-xs"
                  >
                    <div className="flex items-center gap-2">
                      {pmt.method === "CASH" ? (
                        <Banknote className="h-4 w-4 text-emerald-600" />
                      ) : pmt.method === "CARD" ? (
                        <CreditCard className="h-4 w-4 text-blue-600" />
                      ) : pmt.method === "MOBILE" ? (
                        <Smartphone className="h-4 w-4 text-pink-600" />
                      ) : (
                        <Building className="h-4 w-4 text-amber-600" />
                      )}
                      <div>
                        <span className="font-semibold text-foreground">{pmt.method}</span>
                        {pmt.reference && (
                          <span className="ml-1.5 font-mono text-[10px] text-muted-foreground num">
                            ({pmt.reference})
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="font-mono font-semibold text-foreground num">
                      {formatCurrency(pmt.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            {sale.notes && (
              <div className="text-xs text-muted-foreground border-t border-border pt-3">
                <span className="font-semibold text-foreground block mb-1">Invoice Notes:</span>
                {sale.notes}
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="border-t border-border pt-4 flex items-center justify-between gap-2">
            <Button
              onClick={handlePrintReceipt}
              variant="outline"
              size="sm"
              className="gap-2 text-xs"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print POS Receipt</span>
            </Button>

            {sale.status !== "CANCELLED" && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setCancelConfirmOpen(true)}
                className="gap-2 text-xs"
              >
                <Ban className="h-3.5 w-3.5" />
                <span>Void / Cancel</span>
              </Button>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Cancel Confirmation Alert */}
      <AlertDialog open={cancelConfirmOpen} onOpenChange={setCancelConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive flex items-center gap-2">
              <Ban className="h-5 w-5" />
              Void Invoice Transaction
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to void invoice{" "}
              <strong className="text-foreground">{sale.invoiceNumber}</strong>? The order status will be marked as CANCELLED and items will be restored to branch inventory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>Keep Order</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmCancel}
              disabled={isCancelling}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isCancelling ? "Cancelling..." : "Void Invoice"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
