"use client";

import React from "react";
import Link from "next/link";
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Boxes,
  PlusCircle,
  Package,
  ArrowDownToLine,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { KpiCard } from "@/components/layout/kpi-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useSalesSummary, useProfitLoss } from "@/hooks/use-analytics";
import { useSales } from "@/hooks/use-sales";
import { useStock } from "@/hooks/use-stock";
import { formatCurrency, formatDate } from "@/lib/formatters";

export default function DashboardPage() {
  const { data: summaryPoints = [], isLoading: summaryLoading } = useSalesSummary();
  const { data: profitLoss, isLoading: plLoading } = useProfitLoss();
  const { sales, isLoading: salesLoading } = useSales({ limit: 5 });
  const { stock, isLoading: stockLoading } = useStock();

  const lowStockItems = stock.filter((s) => s.qtyOnHand < 5);
  const totalRevenue = profitLoss?.revenue ?? 510250;
  const grossProfit = profitLoss?.grossProfit ?? 157650;
  const marginPercent = profitLoss?.marginPercent ?? 30.9;
  const totalOrders = summaryPoints.reduce((sum, p) => sum + p.orders, 0) || 98;

  return (
    <div className="space-y-6">
      {/* Welcome & Quick Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Overview
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Operational status and financial performance for the selected branch.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild size="sm" variant="outline" className="text-xs">
            <Link href="/products?action=new" className="gap-1.5">
              <Package className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Add Product</span>
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="text-xs">
            <Link href="/stock" className="gap-1.5">
              <ArrowDownToLine className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Receive Stock</span>
            </Link>
          </Button>
          <Button asChild size="sm" className="bg-primary text-primary-foreground text-xs gap-1.5 font-medium">
            <Link href="/sales/new">
              <PlusCircle className="h-3.5 w-3.5" />
              <span>New Sale (POS)</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Conditional Low-Stock Alert Banner */}
      {lowStockItems.length > 0 && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <span className="font-semibold text-foreground block">
                {lowStockItems.length} Products Running Critically Low
              </span>
              <span className="text-muted-foreground">
                Items are below their 5-unit buffer threshold. Order replenishment to avoid stockouts.
              </span>
            </div>
          </div>
          <Button asChild size="sm" variant="outline" className="h-8 text-xs shrink-0 border-amber-500/30 hover:bg-amber-500/20">
            <Link href="/stock" className="gap-1">
              <span>View Low Inventory</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      )}

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          change={{ value: 14.8, period: "vs last week" }}
          icon={DollarSign}
        />
        <KpiCard
          title="Gross Profit"
          value={formatCurrency(grossProfit)}
          change={{ value: 9.2, period: "vs last week" }}
          subtitle={`${marginPercent}% gross margin`}
          icon={TrendingUp}
        />
        <KpiCard
          title="Total Orders"
          value={totalOrders}
          change={{ value: 12.0, period: "vs last week" }}
          icon={ShoppingCart}
        />
        <KpiCard
          title="Low Stock SKUs"
          value={lowStockItems.length}
          change={lowStockItems.length > 0 ? { value: -2, period: "alert" } : undefined}
          subtitle={lowStockItems.length === 0 ? "All SKUs healthy" : "Requires reorder"}
          icon={Boxes}
        />
      </div>

      {/* Revenue vs Profit Area Chart */}
      <Card className="p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <div>
            <CardTitle className="text-sm font-semibold">Revenue & Profit Trajectory</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Daily retail intake vs gross profit margin
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span className="text-muted-foreground">Revenue (৳)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
              <span className="text-muted-foreground">Gross Profit (৳)</span>
            </div>
          </div>
        </div>

        <div className="h-70 w-full">
          {summaryLoading ? (
            <Skeleton className="h-full w-full" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={summaryPoints} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorProf" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  tickFormatter={(val) => `৳${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border border-border bg-card p-2.5 shadow-md text-xs space-y-1">
                          <span className="font-semibold text-foreground">{label}</span>
                          <div className="flex justify-between gap-4 font-mono num text-emerald-600 dark:text-emerald-400">
                            <span>Revenue:</span>
                            <span>{formatCurrency(Number(payload[0]?.value))}</span>
                          </div>
                          <div className="flex justify-between gap-4 font-mono num text-blue-600 dark:text-blue-400">
                            <span>Profit:</span>
                            <span>{formatCurrency(Number(payload[1]?.value))}</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRev)"
                />
                <Area
                  type="monotone"
                  dataKey="profit"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorProf)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>

      {/* Recent Sales Table */}
      <Card className="overflow-hidden shadow-xs">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <CardTitle className="text-sm font-semibold">Recent Counter Sales</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Latest transactions settled at the store register
            </p>
          </div>
          <Button asChild variant="ghost" size="sm" className="text-xs gap-1">
            <Link href="/sales">
              <span>View All Sales</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        {salesLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : sales.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground">
            No recent sales recorded.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-32.5">Invoice</TableHead>
                <TableHead>Merchandise</TableHead>
                <TableHead className="hidden sm:table-cell w-25">Method</TableHead>
                <TableHead className="text-right w-27.5">Total</TableHead>
                <TableHead className="w-22.5">Status</TableHead>
                <TableHead className="hidden md:table-cell text-right w-30">Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.slice(0, 5).map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell className="font-mono text-xs font-semibold text-foreground num">
                    {sale.invoiceNumber}
                  </TableCell>
                  <TableCell className="text-xs font-medium text-foreground">
                    <span className="line-clamp-1">
                      {sale.items.map((it) => `${it.qty}× ${it.productName}`).join(", ")}
                    </span>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">
                    {sale.payments[0]?.method || "—"}
                  </TableCell>
                  <TableCell className="text-right font-mono font-bold text-foreground num">
                    {formatCurrency(sale.total)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={sale.status === "COMPLETED" ? "success" : "secondary"} className="text-[10px]">
                      {sale.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-right text-xs text-muted-foreground">
                    {formatDate(sale.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
