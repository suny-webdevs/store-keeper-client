"use client";

import React, { useState } from "react";
import {
  Boxes,
  ArrowDownToLine,
  SlidersHorizontal,
  History,
  AlertCircle,
  CheckCircle,
  PackageX,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useStock } from "@/hooks/use-stock";
import { useProducts } from "@/hooks/use-products";
import { StockInDialog } from "@/components/features/stock/stock-in-dialog";
import { AdjustmentDialog } from "@/components/features/stock/adjustment-dialog";
import { LedgerDrawer } from "@/components/features/stock/ledger-drawer";
import type { StockItem } from "@/types/api";
import { formatCurrency, formatNumber } from "@/lib/formatters";

export default function StockPage() {
  const [filterMode, setFilterMode] = useState<"ALL" | "LOW" | "OUT">("ALL");
  const [search, setSearch] = useState("");
  const [stockInOpen, setStockInOpen] = useState(false);
  const [adjustmentOpen, setAdjustmentOpen] = useState(false);
  const [ledgerOpen, setLedgerOpen] = useState(false);
  const [selectedStockItem, setSelectedStockItem] = useState<StockItem | null>(null);

  const {
    stock,
    isLoading,
    stockIn,
    isStockInPending,
    adjustStock,
    isAdjustPending,
  } = useStock({
    lowStock: filterMode === "LOW",
  });

  const { products } = useProducts({ limit: 100 });

  // Client-side filtering for search & out-of-stock
  const filteredStock = stock.filter((item) => {
    if (filterMode === "OUT" && item.qtyOnHand > 0) return false;
    if (filterMode === "LOW" && item.qtyOnHand >= 5) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        item.product.name.toLowerCase().includes(q) ||
        item.product.sku.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalValuation = stock.reduce((sum, item) => sum + item.totalValue, 0);
  const lowStockCount = stock.filter((item) => item.qtyOnHand < 5).length;

  const handleOpenAdjustment = (item: StockItem) => {
    setSelectedStockItem(item);
    setAdjustmentOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Inventory & Stock Control
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Track on-hand balances, weighted average costs (WAC), inventory valuations, and discrepancies.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setLedgerOpen(true)}
            variant="outline"
            size="sm"
            className="gap-2 border-border"
          >
            <History className="h-4 w-4" />
            <span>Audit Ledger</span>
          </Button>
          <Button
            onClick={() => setStockInOpen(true)}
            size="sm"
            className="bg-primary text-primary-foreground gap-2 font-medium"
          >
            <ArrowDownToLine className="h-4 w-4" />
            <span>Stock-In Intake</span>
          </Button>
        </div>
      </div>

      {/* KPI Highlights Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">
            Total Inventory Valuation (WAC)
          </span>
          <span className="text-2xl font-semibold text-foreground num mt-1 block">
            {formatCurrency(totalValuation)}
          </span>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">
            Stock Keeping Units (SKUs)
          </span>
          <span className="text-2xl font-semibold text-foreground num mt-1 block">
            {formatNumber(stock.length)} Active SKUs
          </span>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">
            Critical Alerts
          </span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl font-semibold text-destructive num">
              {lowStockCount}
            </span>
            <span className="text-xs text-muted-foreground">items below safety buffer (&lt;5 units)</span>
          </div>
        </div>
      </div>

      {/* Filters and Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <Tabs
          value={filterMode}
          onValueChange={(val) => setFilterMode(val as "ALL" | "LOW" | "OUT")}
          className="w-full sm:w-auto"
        >
          <TabsList>
            <TabsTrigger value="ALL">All Items</TabsTrigger>
            <TabsTrigger value="LOW" className="gap-1.5">
              <span>Low Stock</span>
              {lowStockCount > 0 && (
                <span className="rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 px-1.5 py-0.2 text-[10px] num font-semibold">
                  {lowStockCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="OUT">Out of Stock</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search SKU or product title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>
      </div>

      {/* Stock Table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : filteredStock.length === 0 ? (
          <div className="p-12 text-center">
            <Boxes className="mx-auto h-10 w-10 text-muted-foreground/60 mb-3" />
            <h3 className="text-sm font-semibold text-foreground">No stock records found</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              No inventory balances match the selected filter. Receive incoming purchase orders using Stock-In.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product / SKU</TableHead>
                <TableHead className="text-right w-[90px]">On Hand</TableHead>
                <TableHead className="hidden sm:table-cell text-right w-[90px]">Reserved</TableHead>
                <TableHead className="text-right w-[100px]">Available</TableHead>
                <TableHead className="hidden md:table-cell text-right w-[120px]">WAC Unit Cost</TableHead>
                <TableHead className="text-right w-[130px]">Total Valuation</TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
                <TableHead className="text-right w-[90px]">Adjust</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStock.map((item) => {
                const isOutOfStock = item.qtyOnHand === 0;
                const isLow = item.qtyOnHand > 0 && item.qtyOnHand < 5;

                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground text-xs sm:text-sm line-clamp-1">
                          {item.product.name}
                        </span>
                        <span className="font-mono text-[11px] text-muted-foreground num">
                          {item.product.sku}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono font-semibold text-foreground num">
                      {item.qtyOnHand}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-right font-mono text-xs text-muted-foreground num">
                      {item.qtyReserved}
                    </TableCell>
                    <TableCell className="text-right font-mono font-semibold text-foreground num">
                      {item.qtyAvailable}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-right font-mono text-xs text-muted-foreground num">
                      {formatCurrency(item.weightedAverageCost)}
                    </TableCell>
                    <TableCell className="text-right font-mono font-semibold text-foreground num">
                      {formatCurrency(item.totalValue)}
                    </TableCell>
                    <TableCell>
                      {isOutOfStock ? (
                        <Badge variant="destructive" className="text-[10px]">
                          Out of Stock
                        </Badge>
                      ) : isLow ? (
                        <Badge variant="warning" className="text-[10px]">
                          Low Stock
                        </Badge>
                      ) : (
                        <Badge variant="success" className="text-[10px]">
                          In Stock
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenAdjustment(item)}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        title="Adjust balance"
                      >
                        <SlidersHorizontal className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Stock-In Intake Dialog */}
      <StockInDialog
        open={stockInOpen}
        onOpenChange={setStockInOpen}
        products={products}
        onSubmit={async (data) => {
          await stockIn(data);
        }}
        isSubmitting={isStockInPending}
      />

      {/* Inventory Adjustment Dialog */}
      <AdjustmentDialog
        open={adjustmentOpen}
        onOpenChange={setAdjustmentOpen}
        stockItem={selectedStockItem}
        onSubmit={async (data) => {
          await adjustStock(data);
        }}
        isSubmitting={isAdjustPending}
      />

      {/* Historical Ledger Audit Drawer */}
      <LedgerDrawer open={ledgerOpen} onOpenChange={setLedgerOpen} />
    </div>
  );
}
