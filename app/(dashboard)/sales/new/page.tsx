"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Search,
  Barcode,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  CheckCircle,
  Loader2,
  Package,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useCartStore } from "@/stores/cart";
import { useProducts } from "@/hooks/use-products";
import { useSales } from "@/hooks/use-sales";
import { formatCurrency } from "@/lib/formatters";
import { toast } from "sonner";
import Link from "next/link";

export default function NewSalePosPage() {
  const router = useRouter();
  const [productQuery, setProductQuery] = useState("");
  const [barcodeScanInput, setBarcodeScanInput] = useState("");
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  const {
    items,
    discount,
    taxRate,
    addItem,
    removeItem,
    setQty,
    setDiscount,
    clearCart,
    subtotal,
    tax,
    total,
  } = useCartStore();

  const { products, isLoading: productsLoading } = useProducts({
    q: productQuery || undefined,
    limit: 30,
  });

  const { createSale, isCreatingSale } = useSales();

  // Handle Barcode Scanner Enter Key event
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeScanInput.trim()) return;

    const matchedProduct = products.find(
      (p) =>
        (p.barcode && p.barcode.trim() === barcodeScanInput.trim()) ||
        p.sku.toLowerCase() === barcodeScanInput.trim().toLowerCase()
    );

    if (matchedProduct) {
      addItem(matchedProduct, 1);
      toast.success(`Scanned: ${matchedProduct.name}`);
      setBarcodeScanInput("");
    } else {
      toast.error(`No product found with barcode / SKU "${barcodeScanInput}"`);
    }
  };

  const handleCheckout = async () => {
    if (items.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    try {
      const res = await createSale({
        items: items.map((it) => ({
          productId: it.productId,
          productName: it.productName,
          sku: it.sku,
          variantId: it.variantId || null,
          qty: it.qty,
          unitPrice: it.unitPrice,
          total: it.total || it.qty * it.unitPrice,
        })),
        discount,
        tax: tax(),
        notes: "POS Counter Checkout",
        immediate: true,
      });

      clearCart();
      toast.success(res.message || "Sale completed successfully!");
      router.push("/sales");
    } catch {
      // Error handled by mutation toast
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon" className="h-8 w-8">
            <Link href="/sales">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <span>POS Cashier Register</span>
              <Badge variant="outline" className="text-[10px] uppercase font-mono">
                Active Terminal
              </Badge>
            </h1>
            <p className="text-xs text-muted-foreground">
              Scan barcode or search products to build the customer cart.
            </p>
          </div>
        </div>

        {items.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearCart}
            className="text-xs text-muted-foreground hover:text-destructive"
          >
            Clear Cart
          </Button>
        )}
      </div>

      {/* POS Two-Column Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Product Search & Item Catalog (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Dual Input Controls: Barcode Scanner + Text Search */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <form onSubmit={handleBarcodeSubmit} className="relative">
              <Barcode className="absolute left-3 top-2.5 h-4 w-4 text-primary" />
              <Input
                ref={barcodeInputRef}
                placeholder="Scan barcode / SKU and press Enter..."
                value={barcodeScanInput}
                onChange={(e) => setBarcodeScanInput(e.target.value)}
                className="pl-9 h-9 text-xs font-mono bg-card"
              />
            </form>

            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search product name or keywords..."
                value={productQuery}
                onChange={(e) => setProductQuery(e.target.value)}
                className="pl-9 h-9 text-xs bg-card"
              />
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[620px] overflow-y-auto pr-1">
            {productsLoading ? (
              [1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-44 rounded-lg border border-border bg-card p-3 animate-pulse" />
              ))
            ) : products.length === 0 ? (
              <div className="col-span-full rounded-lg border border-border p-12 text-center text-xs text-muted-foreground">
                No matching merchandise found.
              </div>
            ) : (
              products.map((prod) => (
                <button
                  key={prod.id}
                  type="button"
                  onClick={() => addItem(prod, 1)}
                  className="group relative flex flex-col justify-between rounded-lg border border-border bg-card p-3 text-left transition-all hover:border-primary/50 hover:shadow-xs active:scale-[0.98]"
                >
                  <div>
                    <div className="relative aspect-4/3 w-full overflow-hidden rounded-md bg-muted/40 mb-2 border border-border/50">
                      {prod.imageUrl ? (
                        <Image
                          src={prod.imageUrl}
                          alt={prod.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-200"
                          sizes="(max-width: 640px) 50vw, 200px"
                        />
                      ) : (
                        <Package className="h-8 w-8 text-muted-foreground/40 m-auto mt-6" />
                      )}
                    </div>
                    <span className="font-semibold text-xs text-foreground line-clamp-2 leading-tight">
                      {prod.name}
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground num block mt-0.5">
                      {prod.sku}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between border-t border-border/60 pt-2">
                    <span className="font-mono text-xs font-bold text-foreground num">
                      {formatCurrency(prod.basePrice)}
                    </span>
                    <span className="flex h-5 w-5 items-center justify-center rounded bg-primary/10 text-primary text-xs font-bold group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      +
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Active Cart & Register Summary (5 cols) */}
        <div className="lg:col-span-5">
          <Card className="p-4 space-y-4 border-border bg-card sticky top-20 shadow-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-primary" />
                <span className="font-semibold text-sm text-foreground">
                  Current Sale Order
                </span>
              </div>
              <span className="font-mono text-xs text-muted-foreground num">
                {items.length} item{items.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Cart Items List */}
            <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1">
              {items.length === 0 ? (
                <div className="py-12 text-center text-xs text-muted-foreground">
                  <ShoppingCart className="mx-auto h-8 w-8 text-muted-foreground/30 mb-2" />
                  Cart is empty. Click a product or scan a barcode to add.
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.productId}
                    className="flex items-center justify-between rounded-md border border-border p-2.5 bg-muted/20 text-xs"
                  >
                    <div className="flex flex-col flex-1 mr-2">
                      <span className="font-semibold text-foreground line-clamp-1">
                        {item.productName}
                      </span>
                      <span className="font-mono text-[11px] text-muted-foreground num">
                        {formatCurrency(item.unitPrice)} each
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Qty Controls */}
                      <div className="flex items-center rounded border border-border bg-card">
                        <button
                          type="button"
                          onClick={() => setQty(item.productId, item.qty - 1)}
                          className="px-1.5 py-1 text-muted-foreground hover:text-foreground"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="font-mono text-xs font-semibold px-2 num">
                          {item.qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQty(item.productId, item.qty + 1)}
                          className="px-1.5 py-1 text-muted-foreground hover:text-foreground"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <span className="font-mono font-bold text-foreground num w-16 text-right">
                        {formatCurrency(item.total)}
                      </span>

                      <button
                        type="button"
                        onClick={() => removeItem(item.productId)}
                        className="text-muted-foreground hover:text-destructive p-1"
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Calculations & Discounts */}
            <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal:</span>
                <span className="font-mono text-foreground font-semibold num">
                  {formatCurrency(subtotal())}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Discount (BDT ৳):</span>
                <Input
                  type="number"
                  min="0"
                  step="10"
                  value={discount || ""}
                  onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-24 h-7 text-xs font-mono text-right num"
                />
              </div>

              <div className="flex justify-between text-muted-foreground">
                <span>Govt VAT / Tax ({taxRate * 100}%):</span>
                <span className="font-mono text-foreground num">
                  {formatCurrency(tax())}
                </span>
              </div>

              <div className="flex justify-between border-t border-border pt-2 text-base font-bold text-foreground">
                <span>Total Amount:</span>
                <span className="font-mono text-primary num text-lg">
                  {formatCurrency(total())}
                </span>
              </div>
            </div>

            {/* Complete Sale Button */}
            <Button
              onClick={handleCheckout}
              disabled={items.length === 0 || isCreatingSale}
              className="w-full h-11 bg-primary text-primary-foreground font-semibold text-sm shadow-sm gap-2"
            >
              {isCreatingSale ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing Transaction...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  <span>Complete Sale & Print Receipt</span>
                </>
              )}
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
