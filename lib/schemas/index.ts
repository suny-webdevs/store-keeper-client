import { z } from "zod";

/* Auth Schemas */
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginInput = z.infer<typeof loginSchema>;

/* Branch Schemas */
export const branchSchema = z.object({
  name: z.string().min(2, "Branch name must be at least 2 characters"),
  code: z
    .string()
    .min(2, "Code must be at least 2 characters")
    .max(10, "Code cannot exceed 10 characters")
    .transform((val) => val.trim().toUpperCase()),
  address: z.string().optional(),
  phone: z.string().optional(),
});

export type BranchInput = z.infer<typeof branchSchema>;

/* User Schemas */
export const inviteUserSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  globalRole: z.enum(["OWNER", "ADMIN", "STAFF"]).optional(),
  branchId: z.string().optional(),
  branchRole: z.enum(["MANAGER", "CASHIER", "VIEWER", "STOCKIST"]).optional(),
});

export type InviteUserInput = z.infer<typeof inviteUserSchema>;

export const updateUserSchema = z.object({
  fullName: z.string().min(2).optional(),
  isActive: z.boolean().optional(),
  globalRole: z.enum(["OWNER", "ADMIN", "STAFF"]).nullable().optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export const updateBranchRoleSchema = z.object({
  role: z.enum(["MANAGER", "CASHIER", "VIEWER"]),
});

export type UpdateBranchRoleInput = z.infer<typeof updateBranchRoleSchema>;

/* Category Schemas */
export const categoryAttributeFieldSchema = z.object({
  key: z.string().min(1, "Key is required"),
  label: z.string().min(1, "Label is required"),
  type: z.enum(["string", "number", "boolean", "date", "enum"]),
  required: z.boolean(),
  options: z.array(z.string()).optional(),
});

export const categorySchema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters"),
  parentId: z.string().nullable().optional(),
  attributeSchema: z.object({
    fields: z.array(categoryAttributeFieldSchema),
  }).optional(),
});

export type CategoryInput = z.infer<typeof categorySchema>;

/* Product Schemas */
export const productSchema = z.object({
  categoryId: z.string().min(1, "Please select a category"),
  name: z.string().min(2, "Product name must be at least 2 characters"),
  sku: z.string().min(2, "SKU must be at least 2 characters"),
  barcode: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  basePrice: z.number().min(0, "Base price must be 0 or greater"),
  imageUrl: z.string().optional().nullable(),
  attributes: z.record(z.string(), z.unknown()),
  hasVariants: z.boolean(),
});

export type ProductInput = z.infer<typeof productSchema>;

/* Stock Schemas */
export const stockInSchema = z.object({
  productId: z.string().min(1, "Please select a product"),
  variantId: z.string().nullable().optional(),
  qty: z.number().int().positive("Quantity must be a positive integer"),
  unitCost: z.number().min(0, "Unit cost must be 0 or greater"),
  reference: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type StockInInput = z.infer<typeof stockInSchema>;

export const stockAdjustmentSchema = z.object({
  productId: z.string().min(1, "Please select a product"),
  variantId: z.string().nullable().optional(),
  qty: z.number().int().refine((val) => val !== 0, "Adjustment delta cannot be 0"),
  reason: z.enum(["DAMAGED", "THEFT", "EXPIRED", "COUNT_ADJUSTMENT", "RETURN", "OTHER"]),
  notes: z.string().optional().nullable(),
});

export type StockAdjustmentInput = z.infer<typeof stockAdjustmentSchema>;

/* Sale / POS Schemas */
export const saleItemSchema = z.object({
  productId: z.string(),
  productName: z.string(),
  sku: z.string(),
  variantId: z.string().nullable().optional(),
  qty: z.number().int().positive(),
  unitPrice: z.number().min(0),
  total: z.number().min(0),
});

export const checkoutSaleSchema = z.object({
  localId: z.string().optional(),
  items: z.array(saleItemSchema).min(1, "Cart cannot be empty"),
  discount: z.number().min(0),
  tax: z.number().min(0),
  notes: z.string().optional().nullable(),
});

export type CheckoutSaleInput = z.infer<typeof checkoutSaleSchema>;

export const paymentSchema = z.object({
  method: z.enum(["CASH", "CARD", "MOBILE", "BANK"]),
  amount: z.number().positive("Amount must be greater than 0"),
  reference: z.string().optional().nullable(),
});

export type PaymentInput = z.infer<typeof paymentSchema>;

/* Export Schema */
export const exportSchema = z.object({
  type: z.enum(["sales", "inventory", "profit_loss"]),
  format: z.enum(["CSV", "PDF"]),
  params: z.record(z.string(), z.unknown()).optional(),
});

export type ExportInput = z.infer<typeof exportSchema>;
