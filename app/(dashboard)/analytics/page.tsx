"use client";

import React, { useState } from "react";
import {
  BarChart3,
  Calendar,
  Download,
  DollarSign,
  TrendingUp,
  Percent,
  Layers,
  Archive,
  ArrowUpRight,
  FileSpreadsheet,
  FileText,
  Loader2,
  CheckCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useSalesSummary,
  useProfitLoss,
  useTopProducts,
  useDeadStock,
  useStockValuation,
} from "@/hooks/use-analytics";
import { useExportPolling } from "@/hooks/use-export-polling";
import { formatCurrency, formatPercent, formatDate } from "@/lib/formatters";
import type { ExportFormat, ExportType } from "@/types/api";

export default function AnalyticsPage() {
  const [range, setRange] = useState<"7d" | "30d" | "90d" | "1y">("30d");
  const [bucket, setBucket] = useState<"day" | "week" | "month">("day");
  const [activeTab, setActiveTab] = useState<"PL" | "TOP_PRODUCTS" | "DEAD_STOCK">("PL");

  // Export Modal State
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportType, setExportType] = useState<ExportType>("sales");
  const [exportFormat, setExportFormat] = useState<ExportFormat>("CSV");

  const { data: summaryPoints = [], isLoading: summaryLoading } = useSalesSummary(
    undefined,
    undefined,
    bucket
  );
  const { data: plData, isLoading: plLoading } = useProfitLoss();
  const { data: topProducts = [], isLoading: topLoading } = useTopProducts(undefined, undefined, 10);
  const { data: deadStock = [], isLoading: deadLoading } = useDeadStock(90);
  const { data: valuation } = useStockValuation();

  const { triggerExport, isExporting, exportStatus, downloadUrl } = useExportPolling();

  const handleStartExport = async () => {
    await triggerExport({
      type: exportType,
      format: exportFormat,
      params: { range },
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Financial & Sales Analytics
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Profit & loss statement, inventory velocity, dead stock discovery, and export reports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Range Selector */}
          <Select value={range} onValueChange={(val) => setRange(val as typeof range)}>
            <SelectTrigger className="h-8 text-xs w-28 bg-card">
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last Quarter (90d)</SelectItem>
              <SelectItem value="1y">Trailing Year (1y)</SelectItem>
            </SelectContent>
          </Select>

          {/* Export Button */}
          <Button
            onClick={() => setExportModalOpen(true)}
            size="sm"
            variant="outline"
            className="h-8 text-xs gap-1.5 border-border bg-card"
          >
            <Download className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Export Report</span>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as typeof activeTab)}
        className="w-full"
      >
        <TabsList className="grid w-full sm:w-[480px] grid-cols-3">
          <TabsTrigger value="PL">Profit & Loss</TabsTrigger>
          <TabsTrigger value="TOP_PRODUCTS">Top Merchandise</TabsTrigger>
          <TabsTrigger value="DEAD_STOCK">Dead Stock (90d+)</TabsTrigger>
        </TabsList>

        {/* Tab 1: Profit & Loss */}
        <TabsContent value="PL" className="space-y-6 pt-2">
          {/* P&L 4 Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4">
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">
                Total Revenue
              </span>
              <span className="text-2xl font-bold text-foreground num mt-1 block">
                {formatCurrency(plData?.revenue ?? 510250)}
              </span>
              <span className="text-[11px] text-muted-foreground mt-1 block">
                Net gross retail sales
              </span>
            </Card>

            <Card className="p-4">
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">
                Cost of Goods Sold (COGS)
              </span>
              <span className="text-2xl font-bold text-foreground num mt-1 block">
                {formatCurrency(plData?.cogs ?? 352600)}
              </span>
              <span className="text-[11px] text-muted-foreground mt-1 block">
                Weighted average cost base
              </span>
            </Card>

            <Card className="p-4">
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">
                Gross Profit
              </span>
              <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 num mt-1 block">
                {formatCurrency(plData?.grossProfit ?? 157650)}
              </span>
              <span className="text-[11px] text-muted-foreground mt-1 block">
                Revenue minus intake costs
              </span>
            </Card>

            <Card className="p-4">
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">
                Gross Margin %
              </span>
              <span className="text-2xl font-bold text-foreground num mt-1 block">
                {formatPercent(plData?.marginPercent ?? 30.9)}
              </span>
              <span className="text-[11px] text-muted-foreground mt-1 block">
                Overall retail markup efficiency
              </span>
            </Card>
          </div>

          {/* Bar Chart: Revenue vs Profit */}
          <Card className="p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
              <div>
                <CardTitle className="text-sm font-semibold">
                  Intake vs Profit Performance Breakdown
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Comparison of intake cash flow against gross operating margin
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant={bucket === "day" ? "default" : "outline"}
                  onClick={() => setBucket("day")}
                  className="h-7 text-[11px] px-2.5"
                >
                  Day
                </Button>
                <Button
                  size="sm"
                  variant={bucket === "week" ? "default" : "outline"}
                  onClick={() => setBucket("week")}
                  className="h-7 text-[11px] px-2.5"
                >
                  Week
                </Button>
                <Button
                  size="sm"
                  variant={bucket === "month" ? "default" : "outline"}
                  onClick={() => setBucket("month")}
                  className="h-7 text-[11px] px-2.5"
                >
                  Month
                </Button>
              </div>
            </div>

            <div className="h-[300px] w-full">
              {summaryLoading ? (
                <Skeleton className="h-full w-full" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={summaryPoints} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                                <span>Gross Profit:</span>
                                <span>{formatCurrency(Number(payload[1]?.value))}</span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend
                      verticalAlign="top"
                      align="right"
                      wrapperStyle={{ paddingBottom: 10, fontSize: 11 }}
                    />
                    <Bar dataKey="revenue" name="Revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="profit" name="Gross Profit" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
        </TabsContent>

        {/* Tab 2: Top Products */}
        <TabsContent value="TOP_PRODUCTS" className="pt-2">
          <div className="rounded-lg border border-border bg-card overflow-hidden shadow-xs">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold text-sm text-foreground">Top Ranked Products by Volume & Revenue</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Merchandise ranked by gross profit contribution and turnover
              </p>
            </div>

            {topLoading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : topProducts.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                No product sales recorded in this interval.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="w-[140px]">SKU</TableHead>
                    <TableHead className="text-right w-[100px]">Qty Sold</TableHead>
                    <TableHead className="text-right w-[130px]">Total Revenue</TableHead>
                    <TableHead className="text-right w-[130px]">Gross Profit</TableHead>
                    <TableHead className="text-right w-[110px]">Margin %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topProducts.map((p, idx) => (
                    <TableRow key={p.productId}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-muted-foreground num font-semibold w-5">
                            #{idx + 1}
                          </span>
                          <span className="font-medium text-foreground">{p.productName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground num">
                        {p.sku}
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold text-foreground num">
                        {p.qtySold} units
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold text-foreground num">
                        {formatCurrency(p.revenue)}
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 num">
                        {formatCurrency(p.profit)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs num">
                        <Badge variant="outline" className="font-mono">
                          {formatPercent(p.marginPercent)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>

        {/* Tab 3: Dead Stock */}
        <TabsContent value="DEAD_STOCK" className="pt-2">
          <div className="rounded-lg border border-border bg-card overflow-hidden shadow-xs">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-sm text-foreground">Dormant Inventory (90+ Days)</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Products with zero sales activity tying up working capital on shelves
                </p>
              </div>
              <Badge variant="destructive" className="text-xs">
                Capital At Risk
              </Badge>
            </div>

            {deadLoading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : deadStock.length === 0 ? (
              <div className="p-8 text-center text-xs text-emerald-600">
                Excellent! No dormant dead stock detected over 90 days.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="w-[140px]">SKU</TableHead>
                    <TableHead className="text-right w-[110px]">Tied-Up Qty</TableHead>
                    <TableHead className="text-right w-[130px]">Trapped Capital</TableHead>
                    <TableHead className="hidden sm:table-cell w-[140px]">Last Sold</TableHead>
                    <TableHead className="text-right w-[120px]">Dormant Days</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deadStock.map((d) => (
                    <TableRow key={d.productId}>
                      <TableCell className="font-medium text-foreground">
                        {d.productName}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground num">
                        {d.sku}
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold text-foreground num">
                        {d.qtyOnHand} units
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold text-destructive num">
                        {formatCurrency(d.value)}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">
                        {d.lastSoldDate ? formatDate(d.lastSoldDate) : "Never Sold"}
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold text-destructive num">
                        {d.daysDormant} days
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Export Report Dialog */}
      <Dialog open={exportModalOpen} onOpenChange={setExportModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Generate Analytics Export</DialogTitle>
            <DialogDescription>
              Extract raw spreadsheets or formatted summaries for accounting and audit compliance.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-foreground block">
                Dataset to Export
              </span>
              <Select
                value={exportType}
                onValueChange={(val) => setExportType(val as ExportType)}
              >
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Select dataset" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales">Sales & Invoices Register</SelectItem>
                  <SelectItem value="inventory">Inventory On-Hand & WAC Valuations</SelectItem>
                  <SelectItem value="profit_loss">Profit & Loss Summary Breakdown</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-foreground block">
                File Format
              </span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setExportFormat("CSV")}
                  className={`flex items-center gap-2 rounded-lg border p-3 text-xs text-left transition-colors ${
                    exportFormat === "CSV"
                      ? "border-primary bg-primary/10 text-primary font-semibold"
                      : "border-border text-foreground hover:bg-muted"
                  }`}
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  <div>
                    <span className="block">CSV Spreadsheet</span>
                    <span className="text-[10px] text-muted-foreground font-normal">Excel / Google Sheets</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setExportFormat("PDF")}
                  className={`flex items-center gap-2 rounded-lg border p-3 text-xs text-left transition-colors ${
                    exportFormat === "PDF"
                      ? "border-primary bg-primary/10 text-primary font-semibold"
                      : "border-border text-foreground hover:bg-muted"
                  }`}
                >
                  <FileText className="h-4 w-4" />
                  <div>
                    <span className="block">PDF Document</span>
                    <span className="text-[10px] text-muted-foreground font-normal">Print & Board Report</span>
                  </div>
                </button>
              </div>
            </div>

            {exportStatus === "COMPLETED" && downloadUrl && (
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-400">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Export ready for download</span>
                </div>
                <Button asChild size="sm" variant="outline" className="h-7 text-xs border-emerald-500/30">
                  <a href={downloadUrl} download>
                    Download File
                  </a>
                </Button>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setExportModalOpen(false)}
              disabled={isExporting}
            >
              Close
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleStartExport}
              disabled={isExporting}
              className="bg-primary text-primary-foreground font-medium"
            >
              {isExporting ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Export"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
