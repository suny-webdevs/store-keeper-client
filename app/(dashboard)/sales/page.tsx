"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  Plus,
  Eye,
  CreditCard,
  Search,
  Filter,
  FileText,
  Ban,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useSales } from "@/hooks/use-sales";
import { SaleDetailSheet } from "@/components/features/sales/sale-detail-sheet";
import { PaymentDialog } from "@/components/features/sales/payment-dialog";
import type { Sale } from "@/types/api";
import { formatCurrency, formatDate } from "@/lib/formatters";

export default function SalesPage() {
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentTargetSale, setPaymentTargetSale] = useState<Sale | null>(null);

  const {
    sales,
    isLoading,
    cancelSale,
    addPayment,
    isAddingPayment,
  } = useSales({
    status: statusFilter !== "ALL" ? statusFilter : undefined,
  });

  const filteredSales = sales.filter((s) => {
    if (search) {
      const q = search.toLowerCase();
      return (
        s.invoiceNumber.toLowerCase().includes(q) ||
        s.items.some((it) => it.productName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleOpenDetail = (sale: Sale) => {
    setSelectedSale(sale);
    setDetailOpen(true);
  };

  const handleOpenPayment = (sale: Sale) => {
    setPaymentTargetSale(sale);
    setPaymentDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Title & Top Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Sales & Invoices
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Review completed counter sales, invoice numbers, customer payments, and void orders.
          </p>
        </div>
        <Button asChild size="sm" className="bg-primary text-primary-foreground gap-2 font-medium">
          <Link href="/sales/new">
            <Plus className="h-4 w-4" />
            <span>New Sale (POS)</span>
          </Link>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search invoice number or product title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="w-full sm:w-[180px]">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Sales Table Card */}
      <div className="rounded-lg border border-border bg-card overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : filteredSales.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingCart className="mx-auto h-10 w-10 text-muted-foreground/60 mb-3" />
            <h3 className="text-sm font-semibold text-foreground">No sales transactions found</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              No orders matched your criteria. Ring up a customer order in the POS register.
            </p>
            <Button asChild size="sm" className="mt-4 gap-2">
              <Link href="/sales/new">
                <Plus className="h-4 w-4" />
                Go to POS Register
              </Link>
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[140px]">Invoice #</TableHead>
                <TableHead>Purchased Items</TableHead>
                <TableHead className="hidden sm:table-cell w-[110px]">Payment</TableHead>
                <TableHead className="text-right w-[120px]">Total (BDT)</TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
                <TableHead className="hidden md:table-cell w-[130px]">Date</TableHead>
                <TableHead className="w-[100px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSales.map((s) => {
                const totalPaid = s.payments.reduce((sum, p) => sum + p.amount, 0);
                const isPaid = totalPaid >= s.total;

                return (
                  <TableRow
                    key={s.id}
                    className="cursor-pointer"
                    onClick={() => handleOpenDetail(s)}
                  >
                    <TableCell className="font-mono text-xs font-semibold text-foreground num">
                      {s.invoiceNumber}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-xs text-foreground line-clamp-1">
                          {s.items.map((it) => `${it.qty}× ${it.productName}`).join(", ")}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {s.items.length} item{s.items.length > 1 ? "s" : ""}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-xs">
                      {s.payments.length > 0 ? (
                        <span className="font-medium text-foreground">
                          {s.payments[0].method}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Unpaid</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold text-foreground num">
                      {formatCurrency(s.total)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          s.status === "COMPLETED"
                            ? "success"
                            : s.status === "CANCELLED"
                            ? "destructive"
                            : "secondary"
                        }
                        className="text-[10px]"
                      >
                        {s.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                      {formatDate(s.createdAt)}
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDetail(s)}
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          title="View receipt"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        {!isPaid && s.status !== "CANCELLED" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenPayment(s)}
                            className="h-8 w-8 text-primary hover:text-primary"
                            title="Collect payment"
                          >
                            <CreditCard className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Sale Detail Sheet */}
      <SaleDetailSheet
        sale={selectedSale}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onCancelSale={async (id) => {
          await cancelSale(id);
          setDetailOpen(false);
        }}
        onAddPayment={(sale) => {
          setDetailOpen(false);
          handleOpenPayment(sale);
        }}
      />

      {/* Collect Payment Dialog */}
      <PaymentDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        sale={paymentTargetSale}
        onSubmit={async (data) => {
          if (paymentTargetSale) {
            await addPayment({
              saleId: paymentTargetSale.id,
              method: data.method,
              amount: data.amount,
              reference: data.reference || undefined,
            });
          }
        }}
        isSubmitting={isAddingPayment}
      />
    </div>
  );
}
