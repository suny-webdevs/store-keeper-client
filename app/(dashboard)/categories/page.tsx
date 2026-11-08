"use client";

import React, { useState } from "react";
import {
  FolderTree,
  Plus,
  Pencil,
  Trash2,
  ChevronRight,
  Folder,
  Layers,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { useCategories } from "@/hooks/use-categories";
import { AttributeSchemaBuilder } from "@/components/features/categories/attribute-schema-builder";
import type { Category, CategoryAttributeField } from "@/types/api";
import type { CategoryInput } from "@/lib/schemas";

export default function CategoriesPage() {
  const {
    categories,
    isLoading,
    createCategory,
    isCreating,
    updateCategory,
    isUpdating,
    deleteCategory,
    isDeleting,
  } = useCategories(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteTargetCategory, setDeleteTargetCategory] = useState<Category | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [parentId, setParentId] = useState<string | null>(null);
  const [schemaFields, setSchemaFields] = useState<CategoryAttributeField[]>([]);

  const handleOpenCreate = (parentCategory?: Category) => {
    setEditingCategory(null);
    setName("");
    setSlug("");
    setParentId(parentCategory ? parentCategory.id : null);
    setSchemaFields([]);
    setDialogOpen(true);
  };

  const handleOpenEdit = (category: Category) => {
    setEditingCategory(category);
    setName(category.name);
    setSlug(category.slug);
    setParentId(category.parentId || null);
    setSchemaFields(category.attributeSchema?.fields || []);
    setDialogOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) return;

    const payload: CategoryInput = {
      name: name.trim(),
      slug: slug.trim(),
      parentId: parentId || null,
      attributeSchema: {
        fields: schemaFields,
      },
    };

    if (editingCategory) {
      await updateCategory({ id: editingCategory.id, data: payload });
    } else {
      await createCategory(payload);
    }
    setDialogOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (deleteTargetCategory) {
      await deleteCategory(deleteTargetCategory.id);
      setDeleteTargetCategory(null);
    }
  };

  const renderCategoryTree = (categoryList: Category[], depth = 0) => {
    return (
      <div className="space-y-1">
        {categoryList.map((cat) => (
          <div key={cat.id} className="space-y-1">
            <div
              className="group flex items-center justify-between rounded-lg border border-border/80 bg-card p-3 transition-colors hover:bg-muted/30"
              style={{ marginLeft: `${depth * 24}px` }}
            >
              <div className="flex items-center gap-3">
                {depth > 0 && (
                  <span className="text-muted-foreground/50">└</span>
                )}
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Folder className="h-4 w-4" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-foreground">
                      {cat.name}
                    </span>
                    <span className="font-mono text-[11px] text-muted-foreground num">
                      /{cat.slug}
                    </span>
                    {cat.attributeSchema?.fields && cat.attributeSchema.fields.length > 0 && (
                      <Badge variant="outline" className="text-[10px] gap-1">
                        <Sparkles className="h-2.5 w-2.5 text-primary" />
                        {cat.attributeSchema.fields.length} dynamic attributes
                      </Badge>
                    )}
                  </div>
                  <span className="text-[11px] text-muted-foreground mt-0.5">
                    {cat.productCount ?? 0} active products cataloged
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenCreate(cat)}
                  className="h-7 px-2 text-[11px] gap-1"
                >
                  <Plus className="h-3 w-3" />
                  <span>Subcategory</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleOpenEdit(cat)}
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  aria-label="Edit category"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeleteTargetCategory(cat)}
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  aria-label="Delete category"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {cat.children && cat.children.length > 0 && (
              <div className="pl-3 border-l border-border/40 ml-4">
                {renderCategoryTree(cat.children, depth + 1)}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Title & CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Categories & Schema Models
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Build hierarchical taxonomy trees and dynamic attribute schemas (specifications, dimensions, expiration dates).
          </p>
        </div>
        <Button onClick={() => handleOpenCreate()} size="sm" className="bg-primary text-primary-foreground gap-2">
          <Plus className="h-4 w-4" />
          <span>New Root Category</span>
        </Button>
      </div>

      {/* Main Categories Tree View */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-3">
            <FolderTree className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">No categories defined</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Create categories to organize your product inventory and define dynamic attributes for POS and barcode lookup.
          </p>
          <Button onClick={() => handleOpenCreate()} size="sm" className="mt-4 gap-2">
            <Plus className="h-4 w-4" />
            Create Category
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {renderCategoryTree(categories)}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? `Edit Category: ${editingCategory.name}` : "Create Category"}
            </DialogTitle>
            <DialogDescription>
              Define the classification name, URL slug, optional parent category, and dynamic custom attributes.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="cat-name">Category Name *</Label>
                <Input
                  id="cat-name"
                  placeholder="e.g. Footwear & Shoes"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!editingCategory) {
                      setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "-"));
                    }
                  }}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cat-slug">URL Slug *</Label>
                <Input
                  id="cat-slug"
                  placeholder="e.g. footwear-shoes"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="font-mono text-xs num"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Parent Category</Label>
              <Select
                value={parentId || "root"}
                onValueChange={(val) => setParentId(val === "root" ? null : val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Root level (No parent)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="root">None (Top-level Root Category)</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Dynamic Attribute Schema Builder */}
            <div className="pt-2 border-t border-border">
              <AttributeSchemaBuilder
                fields={schemaFields}
                onChange={setSchemaFields}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDialogOpen(false)}
                disabled={isCreating || isUpdating}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isCreating || isUpdating || !name.trim() || !slug.trim()}
                className="bg-primary text-primary-foreground font-medium"
              >
                {isCreating || isUpdating
                  ? "Saving..."
                  : editingCategory
                  ? "Update Category"
                  : "Save Category"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog
        open={Boolean(deleteTargetCategory)}
        onOpenChange={(open) => !open && setDeleteTargetCategory(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Delete Category
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete category{" "}
              <strong className="text-foreground">
                &ldquo;{deleteTargetCategory?.name}&rdquo;
              </strong>? Products assigned to this category will need to be re-categorized.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete Category"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
