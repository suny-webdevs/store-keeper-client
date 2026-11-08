"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Package,
  Plus,
  Search,
  Filter,
  Eye,
  Pencil,
  Trash2,
  AlertTriangle,
  FolderTree,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useProducts } from "@/hooks/use-products";
import { useCategories } from "@/hooks/use-categories";
import { ProductForm } from "@/components/features/products/product-form";
import { ProductDetailSheet } from "@/components/features/products/product-detail-sheet";
import type { Product, Category } from "@/types/api";
import type { ProductInput } from "@/lib/schemas";
import { formatCurrency } from "@/lib/formatters";

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("ALL");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteTargetProduct, setDeleteTargetProduct] = useState<Product | null>(null);

  const {
    products,
    isLoading,
    createProduct,
    isCreating,
    updateProduct,
    isUpdating,
    deleteProduct,
    isDeleting,
  } = useProducts({
    q: search || undefined,
    categoryId: selectedCategoryFilter !== "ALL" ? selectedCategoryFilter : undefined,
  });

  const { categories } = useCategories();

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setDialogOpen(true);
  };

  const handleOpenDetail = (product: Product) => {
    setActiveProduct(product);
    setDetailOpen(true);
  };

  const handleFormSubmit = async (data: ProductInput) => {
    if (editingProduct) {
      await updateProduct({ id: editingProduct.id, data });
    } else {
      await createProduct(data);
    }
    setDialogOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (deleteTargetProduct) {
      await deleteProduct(deleteTargetProduct.id);
      setDeleteTargetProduct(null);
    }
  };

  // Flattened categories for filter dropdown
  const flattenCategories = (cats: Category[]): Category[] => {
    let result: Category[] = [];
    cats.forEach((c) => {
      result.push(c);
      if (c.children && c.children.length > 0) {
        result = result.concat(flattenCategories(c.children));
      }
    });
    return result;
  };
  const flatCategories = flattenCategories(categories);

  return (
    <div className="space-y-6">
      {/* Title & Top Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Product Catalog
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Browse merchandise, manage SKUs, barcode tracking, and retail pricing.
          </p>
        </div>
        <Button onClick={handleOpenCreate} size="sm" className="bg-primary text-primary-foreground gap-2">
          <Plus className="h-4 w-4" />
          <span>New Product</span>
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by product name, SKU, or barcode... (Press P to focus)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="w-full sm:w-[220px]">
          <Select
            value={selectedCategoryFilter}
            onValueChange={setSelectedCategoryFilter}
          >
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Categories</SelectItem>
              {flatCategories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Products Table Card */}
      <div className="rounded-lg border border-border bg-card overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-3">
              <Package className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">No products found</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              {search || selectedCategoryFilter !== "ALL"
                ? "No products matched your search or category filters. Try resetting the filter."
                : "Your catalog is empty. Add your first retail product to start selling."}
            </p>
            <Button onClick={handleOpenCreate} size="sm" className="mt-4 gap-2">
              <Plus className="h-4 w-4" />
              Add First Product
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>Product</TableHead>
                <TableHead className="w-[140px]">SKU</TableHead>
                <TableHead className="hidden md:table-cell w-[140px]">Barcode</TableHead>
                <TableHead className="hidden sm:table-cell">Category</TableHead>
                <TableHead className="text-right w-[120px]">Base Price</TableHead>
                <TableHead className="w-[80px]">Status</TableHead>
                <TableHead className="w-[100px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p) => (
                <TableRow
                  key={p.id}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleOpenDetail(p);
                    }
                  }}
                  className="cursor-pointer"
                  onClick={() => handleOpenDetail(p)}
                >
                  <TableCell className="p-2" onClick={(e) => e.stopPropagation()}>
                    <div className="relative h-8 w-8 overflow-hidden rounded bg-muted/60 border border-border shrink-0">
                      {p.imageUrl ? (
                        <Image
                          src={p.imageUrl}
                          alt={p.name}
                          fill
                          className="object-cover"
                          sizes="32px"
                        />
                      ) : (
                        <Package className="h-4 w-4 text-muted-foreground m-auto mt-2" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-foreground">
                    <span className="line-clamp-1">{p.name}</span>
                  </TableCell>
                  <TableCell className="font-mono text-xs font-semibold text-muted-foreground num">
                    {p.sku}
                  </TableCell>
                  <TableCell className="hidden md:table-cell font-mono text-xs text-muted-foreground num">
                    {p.barcode || "—"}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">
                    {p.categoryName || "General"}
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold text-foreground num">
                    {formatCurrency(p.basePrice)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={p.isActive ? "success" : "secondary"}>
                      {p.isActive ? "Active" : "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDetail(p)}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        aria-label="View product details"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenEdit(p)}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        aria-label="Edit product"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteTargetProduct(p)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        aria-label="Delete product"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? `Edit Product: ${editingProduct.name}` : "Create New Product"}
            </DialogTitle>
            <DialogDescription>
              Specify SKU identifier, category schema attributes, barcode, and base retail pricing.
            </DialogDescription>
          </DialogHeader>
          <ProductForm
            categories={categories}
            initialData={editingProduct}
            onSubmit={handleFormSubmit}
            onCancel={() => setDialogOpen(false)}
            isSubmitting={isCreating || isUpdating}
          />
        </DialogContent>
      </Dialog>

      {/* Product Detail Sheet */}
      <ProductDetailSheet
        product={activeProduct}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onEdit={(p) => handleOpenEdit(p)}
      />

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog
        open={Boolean(deleteTargetProduct)}
        onOpenChange={(open) => !open && setDeleteTargetProduct(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Delete Product
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong className="text-foreground">
                &ldquo;{deleteTargetProduct?.name}&rdquo;
              </strong>{" "}
              (SKU: {deleteTargetProduct?.sku})? Historical sales will retain record copies, but it will be removed from inventory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete Product"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
