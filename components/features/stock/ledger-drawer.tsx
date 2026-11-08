"use client";

import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { History, ArrowUpRight, ArrowDownRight, RefreshCcw } from "lucide-react";
import { useLedger } from "@/hooks/use-ledger";
import { formatDate, formatCurrency } from "@/lib/formatters";

interface LedgerDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LedgerDrawer({ open, onOpenChange }: LedgerDrawerProps) {
  const { data: ledgerRes, isLoading, refetch } = useLedger();
  const entries = ledgerRes?.data || [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-xl w-full overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center justify-between pr-6">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              <SheetTitle>Stock Audit Ledger</SheetTitle>
            </div>
            <button
              onClick={() => refetch()}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <RefreshCcw className="h-3.5 w-3.5" />
              <span>Refresh</span>
            </button>
          </div>
          <SheetDescription>
            Chronological audit log of all inventory movements, sales deductions, and intake receipts.
          </SheetDescription>
        </SheetHeader>

        <div className="py-4">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : entries.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              No ledger activity recorded yet.
            </div>
          ) : (
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px]">Event / Time</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right w-[70px]">Delta</TableHead>
                    <TableHead className="text-right w-[80px]">Balance</TableHead>
                    <TableHead className="hidden sm:table-cell text-right w-[90px]">Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((entry) => {
                    const isPositive = entry.delta > 0;
                    return (
                      <TableRow key={entry.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-semibold text-[11px] text-foreground">
                              {entry.type}
                            </span>
                            <span className="text-[10px] text-muted-foreground num">
                              {formatDate(entry.createdAt)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium text-xs text-foreground line-clamp-1">
                              {entry.productName}
                            </span>
                            <span className="font-mono text-[10px] text-muted-foreground num">
                              {entry.sku} {entry.reference ? `• ${entry.reference}` : ""}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs font-semibold num">
                          <span
                            className={
                              isPositive
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-destructive"
                            }
                          >
                            {isPositive ? `+${entry.delta}` : entry.delta}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs text-foreground num font-semibold">
                          {entry.balanceAfter}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-right font-mono text-xs text-muted-foreground num">
                          {formatCurrency(entry.unitCost)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
