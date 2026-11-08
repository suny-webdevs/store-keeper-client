"use client";

import React from "react";
import Image from "next/image";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Barcode, DollarSign, Calendar, Pencil, Layers } from "lucide-react";
import type { Product } from "@/types/api";
import { formatCurrency, formatDate } from "@/lib/formatters";

interface ProductDetailSheetProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (product: Product) => void;
}

export function ProductDetailSheet({
  product,
  open,
  onOpenChange,
  onEdit,
}: ProductDetailSheetProps) {
  if (!product) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center justify-between pr-6">
            <Badge variant={product.isActive ? "success" : "secondary"}>
              {product.isActive ? "Active in Catalog" : "Inactive"}
            </Badge>
            <span className="font-mono text-xs text-muted-foreground num">
              SKU: {product.sku}
            </span>
          </div>
          <SheetTitle className="text-lg font-semibold tracking-tight text-foreground text-left mt-2">
            {product.name}
          </SheetTitle>
          <SheetDescription className="text-left">
            {product.categoryName || "Product Catalog Details"}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-5 py-4">
          {/* Photo */}
          {product.imageUrl && (
            <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border bg-muted/40">
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 400px"
              />
            </div>
          )}

          {/* Pricing & SKU Card */}
          <div className="grid grid-cols-2 gap-3 rounded-lg border border-border bg-muted/20 p-3.5">
            <div>
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">
                Retail Price
              </span>
              <span className="text-xl font-bold text-foreground num">
                {formatCurrency(product.basePrice)}
              </span>
            </div>
            <div>
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">
                Barcode / EAN
              </span>
              <span className="text-xs font-mono text-foreground num mt-1 block">
                {product.barcode || "No Barcode Assigned"}
              </span>
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div>
              <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                Description
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>
          )}

          {/* Dynamic Category Attributes */}
          {product.attributes && Object.keys(product.attributes).length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                Specifications & Attributes
              </h4>
              <div className="rounded-lg border border-border divide-y divide-border text-xs">
                {Object.entries(product.attributes).map(([key, val]) => (
                  <div key={key} className="flex justify-between p-2.5">
                    <span className="font-medium text-muted-foreground capitalize">
                      {key.replace(/_/g, " ")}
                    </span>
                    <span className="font-semibold text-foreground num">
                      {typeof val === "boolean" ? (val ? "Yes" : "No") : String(val)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Meta Info */}
          <div className="text-[11px] text-muted-foreground space-y-1 border-t border-border pt-3">
            <div className="flex justify-between">
              <span>Date Added</span>
              <span className="num">{formatDate(product.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span>Variants Support</span>
              <span>{product.hasVariants ? "Enabled" : "Single SKU"}</span>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-4 flex gap-2">
          <Button
            onClick={() => {
              onOpenChange(false);
              onEdit(product);
            }}
            size="sm"
            className="w-full gap-2 bg-primary text-primary-foreground font-medium"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit Product Information
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
