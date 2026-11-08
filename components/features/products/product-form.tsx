"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, type ProductInput } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductImageUpload } from "@/components/features/products/product-image-upload";
import { Loader2, Sparkles } from "lucide-react";
import type { Product, Category, CategoryAttributeField } from "@/types/api";

interface ProductFormProps {
  categories: Category[];
  initialData?: Product | null;
  onSubmit: (data: ProductInput) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function ProductForm({
  categories,
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
}: ProductFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      categoryId: initialData?.categoryId || (categories[0]?.id || ""),
      name: initialData?.name || "",
      sku: initialData?.sku || "",
      barcode: initialData?.barcode || "",
      description: initialData?.description || "",
      basePrice: initialData?.basePrice ?? 0,
      imageUrl: initialData?.imageUrl || "",
      attributes: initialData?.attributes || {},
      hasVariants: initialData?.hasVariants || false,
    },
  });

  const selectedCategoryId = watch("categoryId");
  const attributesState = watch("attributes") || {};

  // Flattened categories for dropdown
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

  const selectedCategory = flatCategories.find((c) => c.id === selectedCategoryId);
  const dynamicFields: CategoryAttributeField[] = selectedCategory?.attributeSchema?.fields || [];

  useEffect(() => {
    if (initialData) {
      reset({
        categoryId: initialData.categoryId,
        name: initialData.name,
        sku: initialData.sku,
        barcode: initialData.barcode || "",
        description: initialData.description || "",
        basePrice: initialData.basePrice,
        imageUrl: initialData.imageUrl || "",
        attributes: initialData.attributes || {},
        hasVariants: initialData.hasVariants,
      });
    }
  }, [initialData, reset]);

  const handleAttributeChange = (key: string, value: unknown) => {
    setValue("attributes", {
      ...attributesState,
      [key]: value,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Photo Uploader */}
      <div className="space-y-1.5 pb-2 border-b border-border">
        <Label>Product Visual Asset</Label>
        <ProductImageUpload
          productId={initialData?.id}
          currentImageUrl={initialData?.imageUrl}
          onImageSelected={(url) => setValue("imageUrl", url)}
        />
      </div>

      {/* Core Identification */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="product-name">Product Name *</Label>
          <Input
            id="product-name"
            placeholder="e.g. Sony WH-1000XM5 Headphones"
            {...register("name")}
            className={errors.name ? "border-destructive" : ""}
          />
          {errors.name && (
            <p className="text-[11px] text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label>Category *</Label>
          <Select
            value={selectedCategoryId}
            onValueChange={(val) => setValue("categoryId", val)}
          >
            <SelectTrigger className={errors.categoryId ? "border-destructive" : ""}>
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              {flatCategories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.categoryId && (
            <p className="text-[11px] text-destructive">{errors.categoryId.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="product-sku">SKU Code *</Label>
          <Input
            id="product-sku"
            placeholder="e.g. SNY-WH-XM5"
            {...register("sku")}
            className={errors.sku ? "border-destructive font-mono num uppercase text-xs" : "font-mono num uppercase text-xs"}
          />
          {errors.sku && (
            <p className="text-[11px] text-destructive">{errors.sku.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="product-barcode">Barcode / EAN (Optional)</Label>
          <Input
            id="product-barcode"
            placeholder="e.g. 4905524987654"
            {...register("barcode")}
            className="font-mono num text-xs"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="product-price">Retail Base Price (BDT ৳) *</Label>
          <Input
            id="product-price"
            type="number"
            step="0.01"
            placeholder="0.00"
            {...register("basePrice", { valueAsNumber: true })}
            className={errors.basePrice ? "border-destructive font-mono num text-xs" : "font-mono num text-xs"}
          />
          {errors.basePrice && (
            <p className="text-[11px] text-destructive">{errors.basePrice.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="product-description">Description</Label>
        <Input
          id="product-description"
          placeholder="Brief specifications, manufacturer details, and notes..."
          {...register("description")}
        />
      </div>

      {/* Dynamic Attributes from Category Schema */}
      {dynamicFields.length > 0 && (
        <div className="rounded-lg border border-border p-3.5 bg-muted/20 space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>Category Attributes ({selectedCategory?.name})</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {dynamicFields.map((field) => {
              const currentVal = attributesState[field.key];

              if (field.type === "boolean") {
                return (
                  <label
                    key={field.key}
                    className="flex items-center gap-2 text-xs font-medium text-foreground cursor-pointer select-none pt-2"
                  >
                    <input
                      type="checkbox"
                      checked={Boolean(currentVal)}
                      onChange={(e) => handleAttributeChange(field.key, e.target.checked)}
                      className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                    />
                    <span>{field.label}</span>
                  </label>
                );
              }

              if (field.type === "enum" && field.options) {
                return (
                  <div key={field.key} className="space-y-1.5">
                    <Label>{field.label} {field.required && "*"}</Label>
                    <Select
                      value={typeof currentVal === "string" ? currentVal : ""}
                      onValueChange={(val) => handleAttributeChange(field.key, val)}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder={`Select ${field.label}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                );
              }

              const displayVal =
                typeof currentVal === "string" || typeof currentVal === "number"
                  ? currentVal
                  : "";

              return (
                <div key={field.key} className="space-y-1.5">
                  <Label htmlFor={`attr-${field.key}`}>
                    {field.label} {field.required && "*"}
                  </Label>
                  <Input
                    id={`attr-${field.key}`}
                    type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
                    value={displayVal}
                    onChange={(e) =>
                      handleAttributeChange(
                        field.key,
                        field.type === "number" ? Number(e.target.value) : e.target.value
                      )
                    }
                    className="h-8 text-xs"
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Variants Toggle */}
      <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer select-none pt-1">
        <input
          type="checkbox"
          {...register("hasVariants")}
          className="rounded border-border text-primary focus:ring-primary h-4 w-4"
        />
        <span>Product supports multiple variants (Color, Size, Dimensions)</span>
      </label>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2 pt-3 border-t border-border">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          size="sm"
          disabled={isSubmitting}
          className="bg-primary text-primary-foreground font-medium"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
              Saving...
            </>
          ) : initialData ? (
            "Update Product"
          ) : (
            "Create Product"
          )}
        </Button>
      </div>
    </form>
  );
}
