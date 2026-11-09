export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export type PaginationMeta =
  | {
      type?: "offset";
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
      requestId?: string;
      timestamp?: string;
      pagination?: PaginationInfo;
    }
  | {
      type: "cursor";
      limit: number;
      nextCursor?: string | null;
      prevCursor?: string | null;
      hasMore: boolean;
      requestId?: string;
      timestamp?: string;
      pagination?: PaginationInfo;
    };

export interface ResponseMeta {
  requestId?: string;
  timestamp?: string;
  pagination?: PaginationInfo;
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  hasNext?: boolean;
  hasPrev?: boolean;
  type?: "offset" | "cursor";
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: ResponseMeta & PaginationMeta;
}

export type ApiErrorCode =
  | "AUTH_REQUIRED"
  | "AUTH_INVALID"
  | "CSRF_MISSING"
  | "CSRF_MISMATCH"
  | "FORBIDDEN"
  | "VALIDATION_FAILED"
  | "NOT_FOUND"
  | "DUPLICATE_CODE"
  | "DUPLICATE_ENTRY"
  | "DUPLICATE_EMAIL"
  | "BRANCH_HAS_STOCK"
  | "SERVICE_UNAVAILABLE"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR";

export interface ApiErrorDetail {
  field?: string;
  code?: ApiErrorCode | string;
  message: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: ApiErrorDetail[];
  meta?: {
    requestId?: string;
    timestamp?: string;
  };
}

/* Health & Readiness */
export interface HealthLiveness {
  status: "ok" | string;
  timestamp: string;
  uptime: number;
}

export interface HealthReadiness {
  status: "ready" | string;
  database: "up" | "down" | string;
  redis: "up" | "down" | string;
  timestamp: string;
}

/* User & Auth */
export type GlobalRole = "OWNER" | "ADMIN" | "STAFF";
export type BranchRole = "MANAGER" | "CASHIER" | "VIEWER" | "STOCKIST";

export interface UserBranchMembership {
  branchId: string;
  branchName?: string;
  role: BranchRole;
}

export interface UserBranchAccess {
  id?: string;
  userId?: string;
  branchId: string;
  role: BranchRole;
  branch?: {
    id?: string;
    name: string;
    code: string;
  };
}

export interface CurrentUser {
  userId: string;
  email?: string;
  fullName?: string;
  tenantId: string;
  globalRole: GlobalRole | null;
  branches: UserBranchMembership[];
}

export interface UserItem {
  id: string;
  email: string;
  fullName: string;
  tenantId?: string;
  globalRole: GlobalRole | null;
  isActive: boolean;
  branchAccess?: UserBranchAccess[];
  branches: UserBranchMembership[];
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

/* Branch */
export interface Branch {
  id: string;
  name: string;
  code: string;
  address?: string | null;
  phone?: string | null;
  tenantId?: string;
  isActive: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt?: string;
}

/* Categories */
export interface CategoryAttributeField {
  key: string;
  label: string;
  type: "string" | "number" | "boolean" | "date" | "enum";
  required: boolean;
  options?: string[];
}

export interface CategoryAttributeSchema {
  fields: CategoryAttributeField[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
  attributeSchema?: CategoryAttributeSchema;
  productCount?: number;
  children?: Category[];
  createdAt?: string;
}

/* Products */
export interface Product {
  id: string;
  categoryId: string;
  categoryName?: string;
  name: string;
  sku: string;
  barcode?: string | null;
  description?: string | null;
  basePrice: number;
  imageUrl?: string | null;
  attributes: Record<string, unknown>;
  hasVariants: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

/* Stock */
export interface StockItem {
  id: string;
  branchId: string;
  productId: string;
  product: Product;
  qtyOnHand: number;
  qtyReserved: number;
  qtyAvailable: number;
  weightedAverageCost: number;
  totalValue: number;
  lowStockThreshold: number;
  updatedAt?: string;
}

export type LedgerEntryType = "STOCK_IN" | "SALE" | "ADJUSTMENT" | "RETURN" | "TRANSFER";

export interface StockLedgerEntry {
  id: string;
  branchId: string;
  productId: string;
  productName?: string;
  sku?: string;
  type: LedgerEntryType;
  delta: number;
  balanceAfter: number;
  unitCost: number;
  reference?: string | null;
  notes?: string | null;
  createdAt: string;
}

/* Sales */
export type SaleStatus = "COMPLETED" | "CANCELLED" | "DRAFT";
export type PaymentMethod = "CASH" | "CARD" | "MOBILE" | "BANK";

export interface SaleItem {
  id?: string;
  productId: string;
  productName: string;
  sku: string;
  variantId?: string | null;
  qty: number;
  unitPrice: number;
  total: number;
}

export interface Payment {
  id?: string;
  method: PaymentMethod;
  amount: number;
  reference?: string | null;
  createdAt?: string;
}

export interface Sale {
  id: string;
  branchId: string;
  branchName?: string;
  invoiceNumber: string;
  status: SaleStatus;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  items: SaleItem[];
  payments: Payment[];
  notes?: string | null;
  createdAt: string;
  updatedAt?: string;
}

/* Analytics */
export interface SalesSummaryPoint {
  date: string;
  revenue: number;
  profit: number;
  orders: number;
}

export interface ProfitLossSummary {
  revenue: number;
  cogs: number;
  grossProfit: number;
  marginPercent: number;
}

export interface TopProductItem {
  productId: string;
  productName: string;
  sku: string;
  qtySold: number;
  revenue: number;
  profit: number;
  marginPercent: number;
}

export interface DeadStockItem {
  productId: string;
  productName: string;
  sku: string;
  qtyOnHand: number;
  value: number;
  lastSoldDate?: string | null;
  daysDormant: number;
}

export interface StockValuation {
  totalItems: number;
  totalQty: number;
  totalValuation: number;
}

/* Exports */
export type ExportType = "sales" | "inventory" | "profit_loss";
export type ExportFormat = "CSV" | "PDF";
export type ExportStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

export interface ExportResponse {
  mode: "sync" | "async";
  url?: string;
  jobId?: string;
  status?: ExportStatus;
  rowCount?: number;
}

export interface ExportJob {
  id: string;
  type: ExportType;
  format: ExportFormat;
  status: ExportStatus;
  url?: string | null;
  rowCount?: number;
  createdAt: string;
}
