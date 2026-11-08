import { NextResponse, type NextRequest } from "next/server";
import type {
  Branch,
  UserItem,
  Category,
  Product,
  StockItem,
  StockLedgerEntry,
  Sale,
  ExportJob,
  Payment,
  PaymentMethod,
} from "@/types/api";

// Stateful mock in-memory database to fulfill contract when running standalone
const branches: Branch[] = [
  {
    id: "br_main",
    name: "Gulshan Flagship Store",
    code: "GLS-01",
    address: "Road 11, Block D, Gulshan-1, Dhaka",
    phone: "+880 1711-000111",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "br_dhanmondi",
    name: "Dhanmondi Branch",
    code: "DHN-02",
    address: "Satmasjid Road, Dhanmondi 27, Dhaka",
    phone: "+880 1819-222333",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "br_uttara",
    name: "Uttara Outlet",
    code: "UTT-03",
    address: "Sector 3, Jashimuddin Ave, Uttara, Dhaka",
    phone: "+880 1912-333444",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

const users: UserItem[] = [
  {
    id: "usr_owner_01",
    email: "owner@storekeeper.dev",
    fullName: "Tanvir Ahmed",
    globalRole: "OWNER",
    isActive: true,
    branches: [
      { branchId: "br_main", branchName: "Gulshan Flagship Store", role: "MANAGER" },
      { branchId: "br_dhanmondi", branchName: "Dhanmondi Branch", role: "MANAGER" },
      { branchId: "br_uttara", branchName: "Uttara Outlet", role: "MANAGER" },
    ],
    createdAt: "2026-01-10T10:00:00Z",
  },
  {
    id: "usr_mgr_02",
    email: "rafiq.manager@storekeeper.dev",
    fullName: "Rafiqul Islam",
    globalRole: "ADMIN",
    isActive: true,
    branches: [{ branchId: "br_main", branchName: "Gulshan Flagship Store", role: "MANAGER" }],
    createdAt: "2026-01-15T12:00:00Z",
  },
  {
    id: "usr_cashier_03",
    email: "shirin.pos@storekeeper.dev",
    fullName: "Shirin Akter",
    globalRole: "STAFF",
    isActive: true,
    branches: [{ branchId: "br_main", branchName: "Gulshan Flagship Store", role: "CASHIER" }],
    createdAt: "2026-02-01T09:30:00Z",
  },
];

const categories: Category[] = [
  {
    id: "cat_electronics",
    name: "Electronics & Gadgets",
    slug: "electronics-gadgets",
    parentId: null,
    productCount: 14,
    attributeSchema: {
      fields: [
        { key: "warrantyMonths", label: "Warranty (Months)", type: "number", required: true },
        { key: "voltage", label: "Voltage Rating", type: "string", required: false },
        { key: "brand", label: "Brand Manufacturer", type: "string", required: true },
      ],
    },
    children: [
      {
        id: "cat_audio",
        name: "Audio & Headphones",
        slug: "audio-headphones",
        parentId: "cat_electronics",
        productCount: 6,
        attributeSchema: {
          fields: [
            { key: "connectivity", label: "Connectivity", type: "enum", required: true, options: ["Bluetooth 5.3", "Wired 3.5mm", "USB-C", "Wireless 2.4G"] },
            { key: "noiseCancelling", label: "Active Noise Cancelling", type: "boolean", required: false },
          ],
        },
      },
    ],
  },
  {
    id: "cat_apparel",
    name: "Apparel & Fashion",
    slug: "apparel-fashion",
    parentId: null,
    productCount: 22,
    attributeSchema: {
      fields: [
        { key: "material", label: "Fabric Material", type: "string", required: true },
        { key: "season", label: "Season", type: "enum", required: false, options: ["Summer", "Winter", "All-Season"] },
      ],
    },
    children: [],
  },
  {
    id: "cat_grocery",
    name: "Premium Groceries & Pantry",
    slug: "groceries-pantry",
    parentId: null,
    productCount: 35,
    attributeSchema: {
      fields: [
        { key: "expiryDate", label: "Expiry Date", type: "date", required: true },
        { key: "isOrganic", label: "Certified Organic", type: "boolean", required: false },
      ],
    },
    children: [],
  },
];

const products: Product[] = [
  {
    id: "prd_wh1000",
    categoryId: "cat_audio",
    categoryName: "Audio & Headphones",
    name: "Sony WH-1000XM5 Noise Cancelling Headphones",
    sku: "SNY-WH-XM5-BLK",
    barcode: "4905524987654",
    description: "Industry leading noise canceling headphones with dual processors and 8 microphones.",
    basePrice: 38500,
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&q=80",
    attributes: { brand: "Sony", warrantyMonths: 12, connectivity: "Bluetooth 5.3", noiseCancelling: true },
    hasVariants: false,
    isActive: true,
    createdAt: "2026-01-20T11:00:00Z",
  },
  {
    id: "prd_airpods",
    categoryId: "cat_audio",
    categoryName: "Audio & Headphones",
    name: "Apple AirPods Pro (2nd Generation USB-C)",
    sku: "APL-APP-2ND",
    barcode: "194253397472",
    description: "Next-level active noise cancellation with adaptive audio and transparency mode.",
    basePrice: 28900,
    imageUrl: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=300&q=80",
    attributes: { brand: "Apple", warrantyMonths: 12, connectivity: "Bluetooth 5.3", noiseCancelling: true },
    hasVariants: false,
    isActive: true,
    createdAt: "2026-01-22T14:30:00Z",
  },
  {
    id: "prd_shirt",
    categoryId: "cat_apparel",
    categoryName: "Apparel & Fashion",
    name: "Oxford Tailored Egyptian Cotton Shirt",
    sku: "APL-OXF-WHT-L",
    barcode: "8901234567890",
    description: "100% fine Egyptian cotton formal button down shirt in tailored modern fit.",
    basePrice: 3450,
    imageUrl: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=300&q=80",
    attributes: { material: "100% Giza Cotton", season: "All-Season" },
    hasVariants: true,
    isActive: true,
    createdAt: "2026-02-05T08:15:00Z",
  },
  {
    id: "prd_coffee",
    categoryId: "cat_grocery",
    categoryName: "Premium Groceries & Pantry",
    name: "Ethiopian Yirgacheffe Single Origin Beans 500g",
    sku: "CFE-ETH-YIRG-500",
    barcode: "793573179012",
    description: "Washed process light roast with notes of bergamot, jasmine, and citrus acidity.",
    basePrice: 2150,
    imageUrl: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=300&q=80",
    attributes: { isOrganic: true, expiryDate: "2026-12-31" },
    hasVariants: false,
    isActive: true,
    createdAt: "2026-02-10T16:00:00Z",
  },
  {
    id: "prd_olive_oil",
    categoryId: "cat_grocery",
    categoryName: "Premium Groceries & Pantry",
    name: "Kalamata Extra Virgin Olive Oil 1L",
    sku: "OIL-EVOO-KAL-1L",
    barcode: "5201056789123",
    description: "Cold-pressed Greek single estate extra virgin olive oil with <0.3% acidity.",
    basePrice: 2800,
    imageUrl: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300&q=80",
    attributes: { isOrganic: true, expiryDate: "2027-06-30" },
    hasVariants: false,
    isActive: true,
    createdAt: "2026-02-12T10:20:00Z",
  },
  {
    id: "prd_charger",
    categoryId: "cat_electronics",
    categoryName: "Electronics & Gadgets",
    name: "Anker 65W GaNPrime Fast Wall Charger",
    sku: "ANK-GAN-65W",
    barcode: "194644084530",
    description: "Compact 3-port fast charger with PowerIQ 4.0 dynamic power distribution.",
    basePrice: 4200,
    imageUrl: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=300&q=80",
    attributes: { brand: "Anker", warrantyMonths: 18, voltage: "100-240V" },
    hasVariants: false,
    isActive: true,
    createdAt: "2026-02-14T11:45:00Z",
  },
];

// Initial stock per branch
const stockItems: StockItem[] = [
  {
    id: "stk_01",
    branchId: "br_main",
    productId: "prd_wh1000",
    product: products[0],
    qtyOnHand: 18,
    qtyReserved: 2,
    qtyAvailable: 16,
    weightedAverageCost: 31000,
    totalValue: 558000,
    lowStockThreshold: 5,
  },
  {
    id: "stk_02",
    branchId: "br_main",
    productId: "prd_airpods",
    product: products[1],
    qtyOnHand: 4, // low stock!
    qtyReserved: 1,
    qtyAvailable: 3,
    weightedAverageCost: 23500,
    totalValue: 94000,
    lowStockThreshold: 5,
  },
  {
    id: "stk_03",
    branchId: "br_main",
    productId: "prd_shirt",
    product: products[2],
    qtyOnHand: 45,
    qtyReserved: 0,
    qtyAvailable: 45,
    weightedAverageCost: 2200,
    totalValue: 99000,
    lowStockThreshold: 10,
  },
  {
    id: "stk_04",
    branchId: "br_main",
    productId: "prd_coffee",
    product: products[3],
    qtyOnHand: 2, // low stock!
    qtyReserved: 0,
    qtyAvailable: 2,
    weightedAverageCost: 1550,
    totalValue: 3100,
    lowStockThreshold: 5,
  },
  {
    id: "stk_05",
    branchId: "br_main",
    productId: "prd_olive_oil",
    product: products[4],
    qtyOnHand: 28,
    qtyReserved: 0,
    qtyAvailable: 28,
    weightedAverageCost: 1950,
    totalValue: 54600,
    lowStockThreshold: 5,
  },
  {
    id: "stk_06",
    branchId: "br_main",
    productId: "prd_charger",
    product: products[5],
    qtyOnHand: 0, // Out of stock!
    qtyReserved: 0,
    qtyAvailable: 0,
    weightedAverageCost: 2900,
    totalValue: 0,
    lowStockThreshold: 5,
  },
];

const ledgerEntries: StockLedgerEntry[] = [
  {
    id: "ldg_01",
    branchId: "br_main",
    productId: "prd_wh1000",
    productName: "Sony WH-1000XM5 Headphones",
    sku: "SNY-WH-XM5-BLK",
    type: "STOCK_IN",
    delta: 20,
    balanceAfter: 20,
    unitCost: 31000,
    reference: "PO-2026-088",
    notes: "Initial shipment from Sony Bangladesh distributor",
    createdAt: "2026-02-15T10:00:00Z",
  },
  {
    id: "ldg_02",
    branchId: "br_main",
    productId: "prd_wh1000",
    productName: "Sony WH-1000XM5 Headphones",
    sku: "SNY-WH-XM5-BLK",
    type: "SALE",
    delta: -2,
    balanceAfter: 18,
    unitCost: 31000,
    reference: "INV-2026-001",
    notes: "Retail counter checkout",
    createdAt: "2026-02-18T14:20:00Z",
  },
  {
    id: "ldg_03",
    branchId: "br_main",
    productId: "prd_airpods",
    productName: "Apple AirPods Pro (2nd Gen)",
    sku: "APL-APP-2ND",
    type: "STOCK_IN",
    delta: 10,
    balanceAfter: 10,
    unitCost: 23500,
    reference: "PO-2026-092",
    notes: "Apple Authorized Distributor",
    createdAt: "2026-02-16T11:30:00Z",
  },
];

const sales: Sale[] = [
  {
    id: "sal_001",
    branchId: "br_main",
    branchName: "Gulshan Flagship Store",
    invoiceNumber: "INV-2026-0001",
    status: "COMPLETED",
    subtotal: 77000,
    discount: 2000,
    tax: 3750,
    total: 78750,
    items: [
      {
        id: "item_01",
        productId: "prd_wh1000",
        productName: "Sony WH-1000XM5 Noise Cancelling Headphones",
        sku: "SNY-WH-XM5-BLK",
        qty: 2,
        unitPrice: 38500,
        total: 77000,
      },
    ],
    payments: [
      {
        id: "pmt_01",
        method: "CARD",
        amount: 78750,
        reference: "VISA-9041-AUTH889",
        createdAt: "2026-02-18T14:22:00Z",
      },
    ],
    notes: "VIP customer loyalty discount applied",
    createdAt: "2026-02-18T14:20:00Z",
  },
  {
    id: "sal_002",
    branchId: "br_main",
    branchName: "Gulshan Flagship Store",
    invoiceNumber: "INV-2026-0002",
    status: "COMPLETED",
    subtotal: 6900,
    discount: 0,
    tax: 345,
    total: 7245,
    items: [
      {
        id: "item_02",
        productId: "prd_shirt",
        productName: "Oxford Tailored Egyptian Cotton Shirt",
        sku: "APL-OXF-WHT-L",
        qty: 2,
        unitPrice: 3450,
        total: 6900,
      },
    ],
    payments: [
      {
        id: "pmt_02",
        method: "MOBILE",
        amount: 7245,
        reference: "bKash: 9J382X71AA",
        createdAt: "2026-02-19T11:15:00Z",
      },
    ],
    notes: null,
    createdAt: "2026-02-19T11:14:00Z",
  },
  {
    id: "sal_003",
    branchId: "br_main",
    branchName: "Gulshan Flagship Store",
    invoiceNumber: "INV-2026-0003",
    status: "COMPLETED",
    subtotal: 31700,
    discount: 500,
    tax: 1560,
    total: 32760,
    items: [
      {
        id: "item_03",
        productId: "prd_airpods",
        productName: "Apple AirPods Pro (2nd Generation USB-C)",
        sku: "APL-APP-2ND",
        qty: 1,
        unitPrice: 28900,
        total: 28900,
      },
      {
        id: "item_04",
        productId: "prd_olive_oil",
        productName: "Kalamata Extra Virgin Olive Oil 1L",
        sku: "OIL-EVOO-KAL-1L",
        qty: 1,
        unitPrice: 2800,
        total: 2800,
      },
    ],
    payments: [
      {
        id: "pmt_03",
        method: "CASH",
        amount: 32760,
        reference: null,
        createdAt: "2026-02-20T16:45:00Z",
      },
    ],
    notes: null,
    createdAt: "2026-02-20T16:42:00Z",
  },
];

const exportJobs: ExportJob[] = [
  {
    id: "exp_01",
    type: "sales",
    format: "CSV",
    status: "COMPLETED",
    url: "/api/v1/exports/download/sales-feb-2026.csv",
    rowCount: 142,
    createdAt: "2026-02-20T10:00:00Z",
  },
];

// Master Router Handler
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ route: string[] }> }
) {
  const { route } = await params;
  const path = route.join("/");
  const searchParams = request.nextUrl.searchParams;

  // 1. /auth/me
  if (path === "auth/me") {
    return NextResponse.json({
      success: true,
      message: "Session authenticated",
      data: users[0],
    });
  }

  // 2. /branches
  if (path === "branches") {
    return NextResponse.json({
      success: true,
      message: "Branches retrieved",
      data: branches,
      meta: {
        type: "offset",
        page: 1,
        limit: 50,
        total: branches.length,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    });
  }

  // 2b. /branches/:id
  if (path.startsWith("branches/") && !path.includes("/stock") && !path.includes("/sales") && !path.includes("/ledger")) {
    const branchId = path.split("/")[1];
    const branch = branches.find((b) => b.id === branchId);
    if (!branch) {
      return NextResponse.json({ success: false, message: "Branch not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Branch details", data: branch });
  }

  // 3. /users
  if (path === "users") {
    return NextResponse.json({
      success: true,
      message: "Users list",
      data: users,
      meta: {
        type: "offset",
        page: 1,
        limit: 50,
        total: users.length,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    });
  }

  // 4. /categories
  if (path === "categories") {
    return NextResponse.json({
      success: true,
      message: "Categories retrieved",
      data: categories,
    });
  }

  // 5. /products
  if (path === "products") {
    const q = searchParams.get("q")?.toLowerCase();
    const categoryId = searchParams.get("filter[categoryId]");
    let filtered = [...products];

    if (q) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          (p.barcode && p.barcode.includes(q))
      );
    }
    if (categoryId) {
      filtered = filtered.filter((p) => p.categoryId === categoryId);
    }

    return NextResponse.json({
      success: true,
      message: "Products catalog",
      data: filtered,
      meta: {
        type: "offset",
        page: 1,
        limit: 20,
        total: filtered.length,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    });
  }

  // 5b. /products/:id
  if (path.startsWith("products/") && !path.includes("/image")) {
    const id = path.split("/")[1];
    const product = products.find((p) => p.id === id);
    if (!product) {
      return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Product details", data: product });
  }

  // 6. /branches/:branchId/stock
  if (path.includes("/stock") && path.startsWith("branches/")) {
    const parts = path.split("/");
    const branchId = parts[1];
    const lowStockOnly = searchParams.get("filter[lowStock=true]") === "true";

    let branchStock = stockItems.filter((s) => s.branchId === branchId);
    if (branchStock.length === 0) {
      // Default to main stock if branch is empty
      branchStock = stockItems;
    }
    if (lowStockOnly) {
      branchStock = branchStock.filter((s) => s.qtyAvailable <= s.lowStockThreshold);
    }

    return NextResponse.json({
      success: true,
      message: "Stock inventory list",
      data: branchStock,
      meta: {
        type: "offset",
        page: 1,
        limit: 20,
        total: branchStock.length,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    });
  }

  // 6b. /branches/:branchId/ledger
  if (path.includes("/ledger") && path.startsWith("branches/")) {
    return NextResponse.json({
      success: true,
      message: "Stock ledger records",
      data: ledgerEntries,
      meta: {
        type: "cursor",
        limit: 20,
        nextCursor: null,
        prevCursor: null,
        hasMore: false,
      },
    });
  }

  // 7. /branches/:branchId/sales
  if (path.includes("/sales") && path.startsWith("branches/")) {
    const status = searchParams.get("filter[status]");
    let filtered = [...sales];
    if (status && status !== "ALL") {
      filtered = filtered.filter((s) => s.status === status);
    }

    return NextResponse.json({
      success: true,
      message: "Sales transactions",
      data: filtered,
      meta: {
        type: "cursor",
        limit: 20,
        nextCursor: null,
        prevCursor: null,
        hasMore: false,
      },
    });
  }

  // 7b. /sales/:id
  if (path.startsWith("sales/")) {
    const id = path.split("/")[1];
    const sale = sales.find((s) => s.id === id);
    if (!sale) {
      return NextResponse.json({ success: false, message: "Sale order not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Sale order details", data: sale });
  }

  // 8. /analytics
  if (path === "analytics/sales-summary") {
    return NextResponse.json({
      success: true,
      message: "Sales summary points",
      data: {
        points: [
          { date: "Feb 14", revenue: 42000, profit: 12500, orders: 8 },
          { date: "Feb 15", revenue: 58000, profit: 17200, orders: 12 },
          { date: "Feb 16", revenue: 39000, profit: 11000, orders: 7 },
          { date: "Feb 17", revenue: 72000, profit: 22400, orders: 15 },
          { date: "Feb 18", revenue: 94000, profit: 29500, orders: 19 },
          { date: "Feb 19", revenue: 86500, profit: 26800, orders: 16 },
          { date: "Feb 20", revenue: 118750, profit: 38200, orders: 23 },
        ],
      },
    });
  }

  if (path === "analytics/profit-loss") {
    return NextResponse.json({
      success: true,
      message: "Profit & Loss calculation",
      data: {
        revenue: 510250,
        cogs: 352600,
        grossProfit: 157650,
        marginPercent: 30.9,
      },
    });
  }

  if (path === "analytics/top-products") {
    return NextResponse.json({
      success: true,
      message: "Top performing products",
      data: [
        {
          productId: "prd_wh1000",
          productName: "Sony WH-1000XM5 Headphones",
          sku: "SNY-WH-XM5-BLK",
          qtySold: 14,
          revenue: 539000,
          profit: 105000,
          marginPercent: 19.5,
        },
        {
          productId: "prd_airpods",
          productName: "Apple AirPods Pro (2nd Gen)",
          sku: "APL-APP-2ND",
          qtySold: 18,
          revenue: 520200,
          profit: 97200,
          marginPercent: 18.7,
        },
        {
          productId: "prd_shirt",
          productName: "Oxford Tailored Egyptian Cotton Shirt",
          sku: "APL-OXF-WHT-L",
          qtySold: 42,
          revenue: 144900,
          profit: 52500,
          marginPercent: 36.2,
        },
        {
          productId: "prd_olive_oil",
          productName: "Kalamata Extra Virgin Olive Oil 1L",
          sku: "OIL-EVOO-KAL-1L",
          qtySold: 25,
          revenue: 70000,
          profit: 21250,
          marginPercent: 30.4,
        },
      ],
    });
  }

  if (path === "analytics/dead-stock") {
    return NextResponse.json({
      success: true,
      message: "Dormant / dead stock analysis",
      data: [
        {
          productId: "prd_charger",
          productName: "Anker 65W GaNPrime Fast Wall Charger",
          sku: "ANK-GAN-65W",
          qtyOnHand: 15,
          value: 43500,
          lastSoldDate: "2025-11-12T00:00:00Z",
          daysDormant: 102,
        },
        {
          productId: "prd_coffee",
          productName: "Ethiopian Yirgacheffe Beans 500g",
          sku: "CFE-ETH-YIRG-500",
          qtyOnHand: 8,
          value: 12400,
          lastSoldDate: "2025-11-28T00:00:00Z",
          daysDormant: 86,
        },
      ],
    });
  }

  if (path === "analytics/stock-valuation") {
    return NextResponse.json({
      success: true,
      message: "Valuation of inventory",
      data: {
        totalItems: 6,
        totalQty: 97,
        totalValuation: 808700,
      },
    });
  }

  // 9. /exports/:id
  if (path.startsWith("exports/")) {
    const id = path.split("/")[1];
    const job = exportJobs.find((j) => j.id === id) || exportJobs[0];
    return NextResponse.json({ success: true, message: "Export status", data: job });
  }

  return NextResponse.json(
    { success: false, message: `Endpoint /api/v1/${path} not recognized` },
    { status: 404 }
  );
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ route: string[] }> }
) {
  const { route } = await params;
  const path = route.join("/");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let body: Record<string, any> = {};
  try {
    body = await request.json();
  } catch {
    // empty body
  }

  // 1. Branches
  if (path === "branches") {
    const newBranch = {
      id: `br_${Date.now()}`,
      name: body.name,
      code: body.code,
      address: body.address || null,
      phone: body.phone || null,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    branches.push(newBranch);
    return NextResponse.json({
      success: true,
      message: `Branch "${newBranch.name}" created`,
      data: newBranch,
    });
  }

  // 2. Users invite
  if (path === "users/invite") {
    const newUser = {
      id: `usr_${Date.now()}`,
      email: body.email,
      fullName: body.fullName,
      globalRole: body.globalRole || "STAFF",
      isActive: true,
      branches: body.branches || [],
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    return NextResponse.json({
      success: true,
      message: `Invitation sent to ${body.email}`,
      data: newUser,
    });
  }

  // 3. Categories
  if (path === "categories") {
    const newCategory = {
      id: `cat_${Date.now()}`,
      name: body.name,
      slug: body.slug || body.name.toLowerCase().replace(/\s+/g, "-"),
      parentId: body.parentId || null,
      productCount: 0,
      attributeSchema: body.attributeSchema || { fields: [] },
      children: [],
    };
    categories.push(newCategory);
    return NextResponse.json({
      success: true,
      message: `Category "${newCategory.name}" created`,
      data: newCategory,
    });
  }

  // 4. Products
  if (path === "products") {
    const category = categories.find((c) => c.id === body.categoryId);
    const newProduct = {
      id: `prd_${Date.now()}`,
      categoryId: body.categoryId,
      categoryName: category?.name || "General",
      name: body.name,
      sku: body.sku,
      barcode: body.barcode || null,
      description: body.description || null,
      basePrice: Number(body.basePrice),
      imageUrl: body.imageUrl || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&q=80",
      attributes: body.attributes || {},
      hasVariants: Boolean(body.hasVariants),
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    products.unshift(newProduct);

    // Also auto-initialize stock in main branch
    stockItems.push({
      id: `stk_${Date.now()}`,
      branchId: "br_main",
      productId: newProduct.id,
      product: newProduct,
      qtyOnHand: 0,
      qtyReserved: 0,
      qtyAvailable: 0,
      weightedAverageCost: newProduct.basePrice * 0.7,
      totalValue: 0,
      lowStockThreshold: 5,
    });

    return NextResponse.json({
      success: true,
      message: `Product "${newProduct.name}" added to catalog`,
      data: newProduct,
    });
  }

  // 4b. Cloudinary sign
  if (path.includes("/image/sign") && path.startsWith("products/")) {
    return NextResponse.json({
      success: true,
      message: "Upload signature generated",
      data: {
        cloudName: "storekeeper-assets",
        apiKey: "847291847192",
        timestamp: Math.floor(Date.now() / 1000),
        signature: "8f6a9b4c2e1d0f",
        folder: "products/inventory",
      },
    });
  }

  // 5. Stock-in
  if (path.includes("/stock-in") && path.startsWith("branches/")) {
    const parts = path.split("/");
    const branchId = parts[1];
    const { productId, qty, unitCost, reference, notes } = body;

    let item = stockItems.find((s) => s.productId === productId && s.branchId === branchId);
    if (!item) {
      const prd = products.find((p) => p.id === productId) || products[0];
      item = {
        id: `stk_${Date.now()}`,
        branchId,
        productId,
        product: prd,
        qtyOnHand: 0,
        qtyReserved: 0,
        qtyAvailable: 0,
        weightedAverageCost: unitCost,
        totalValue: 0,
        lowStockThreshold: 5,
      };
      stockItems.push(item);
    }

    const prevQty = item.qtyOnHand;
    const prevCost = item.weightedAverageCost;
    const newQty = prevQty + Number(qty);
    const newWac = newQty > 0 ? (prevQty * prevCost + Number(qty) * Number(unitCost)) / newQty : Number(unitCost);

    item.qtyOnHand = newQty;
    item.qtyAvailable = item.qtyOnHand - item.qtyReserved;
    item.weightedAverageCost = Math.round(newWac * 100) / 100;
    item.totalValue = item.qtyOnHand * item.weightedAverageCost;

    ledgerEntries.unshift({
      id: `ldg_${Date.now()}`,
      branchId,
      productId,
      productName: item.product.name,
      sku: item.product.sku,
      type: "STOCK_IN",
      delta: Number(qty),
      balanceAfter: item.qtyOnHand,
      unitCost: Number(unitCost),
      reference: reference || null,
      notes: notes || null,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: `Received ${qty} units of ${item.product.name}`,
      data: item,
    });
  }

  // 6. Adjustments
  if (path.includes("/adjustments") && path.startsWith("branches/")) {
    const parts = path.split("/");
    const branchId = parts[1];
    const { productId, qty, reason, notes } = body;

    const item = stockItems.find((s) => s.productId === productId && s.branchId === branchId) || stockItems[0];
    item.qtyOnHand = Math.max(0, item.qtyOnHand + Number(qty));
    item.qtyAvailable = Math.max(0, item.qtyOnHand - item.qtyReserved);
    item.totalValue = item.qtyOnHand * item.weightedAverageCost;

    ledgerEntries.unshift({
      id: `ldg_${Date.now()}`,
      branchId,
      productId,
      productName: item.product.name,
      sku: item.product.sku,
      type: "ADJUSTMENT",
      delta: Number(qty),
      balanceAfter: item.qtyOnHand,
      unitCost: item.weightedAverageCost,
      reference: reason,
      notes: notes || null,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: `Stock adjusted by ${qty} units (${reason})`,
      data: item,
    });
  }

  // 7. Sales creation
  if (path.includes("/sales") && path.startsWith("branches/")) {
    const parts = path.split("/");
    const branchId = parts[1];
    const branch = branches.find((b) => b.id === branchId) || branches[0];
    const rawItems = (body.items as Array<{ productId: string; productName: string; sku: string; qty: number; unitPrice: number }>) || [];
    const subtotal = rawItems.reduce((s: number, i) => s + i.qty * i.unitPrice, 0);
    const discount = Number(body.discount || 0);
    const tax = Number(body.tax || 0);
    const total = subtotal - discount + tax;

    const newSale: Sale = {
      id: `sal_${Date.now()}`,
      branchId,
      branchName: branch.name,
      invoiceNumber: `INV-2026-${String(sales.length + 1).padStart(4, "0")}`,
      status: "COMPLETED" as const,
      subtotal,
      discount,
      tax,
      total,
      items: rawItems.map((it, idx: number) => ({
        id: `item_${Date.now()}_${idx}`,
        productId: it.productId,
        productName: it.productName,
        sku: it.sku,
        qty: it.qty,
        unitPrice: it.unitPrice,
        total: it.qty * it.unitPrice,
      })),
      payments: [
        {
          id: `pmt_${Date.now()}`,
          method: "CASH" as const,
          amount: total,
          reference: "Counter Settlement",
          createdAt: new Date().toISOString(),
        },
      ],
      notes: typeof body.notes === "string" ? body.notes : null,
      createdAt: new Date().toISOString(),
    };

    // Decrement stock and write to ledger
    rawItems.forEach((it) => {
      const stock = stockItems.find((s) => s.productId === it.productId && s.branchId === branchId);
      if (stock) {
        stock.qtyOnHand = Math.max(0, stock.qtyOnHand - it.qty);
        stock.qtyAvailable = Math.max(0, stock.qtyOnHand - stock.qtyReserved);
        stock.totalValue = stock.qtyOnHand * stock.weightedAverageCost;

        ledgerEntries.unshift({
          id: `ldg_${Date.now()}_${it.productId}`,
          branchId,
          productId: it.productId,
          productName: it.productName,
          sku: it.sku,
          type: "SALE",
          delta: -Number(it.qty),
          balanceAfter: stock.qtyOnHand,
          unitCost: stock.weightedAverageCost,
          reference: newSale.invoiceNumber,
          notes: "POS Checkout",
          createdAt: new Date().toISOString(),
        });
      }
    });

    sales.unshift(newSale);
    return NextResponse.json({
      success: true,
      message: `Sale ${newSale.invoiceNumber} completed (৳${total.toFixed(2)})`,
      data: newSale,
    });
  }

  // 7b. Cancel sale
  if (path.includes("/cancel") && path.startsWith("sales/")) {
    const id = path.split("/")[1];
    const sale = sales.find((s) => s.id === id);
    if (sale) {
      sale.status = "CANCELLED";
    }
    return NextResponse.json({
      success: true,
      message: `Sale ${sale?.invoiceNumber || id} cancelled`,
      data: sale,
    });
  }

  // 7c. Payments
  if (path.includes("/payments") && path.startsWith("sales/")) {
    const id = path.split("/")[1];
    const sale = sales.find((s) => s.id === id);
    if (sale) {
      const pmt: Payment = {
        id: `pmt_${Date.now()}`,
        method: body.method as PaymentMethod,
        amount: Number(body.amount),
        reference: body.reference || null,
        createdAt: new Date().toISOString(),
      };
      sale.payments.push(pmt);
    }
    return NextResponse.json({
      success: true,
      message: "Payment recorded",
      data: sale,
    });
  }

  // 8. Exports
  if (path === "exports") {
    const job = {
      id: `exp_${Date.now()}`,
      type: body.type || "sales",
      format: body.format || "CSV",
      status: "COMPLETED" as const,
      url: `data:text/csv;charset=utf-8,${encodeURIComponent(
        "id,date,total\n1,2026-02-20,78750\n2,2026-02-19,7245\n3,2026-02-18,32760"
      )}`,
      rowCount: 38,
      createdAt: new Date().toISOString(),
    };
    exportJobs.unshift(job);
    return NextResponse.json({
      success: true,
      message: "Export ready",
      data: {
        mode: "sync",
        url: job.url,
        rowCount: job.rowCount,
      },
    });
  }

  return NextResponse.json({ success: true, message: "Action recorded", data: body });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ route: string[] }> }
) {
  const { route } = await params;
  const path = route.join("/");
  const body = await request.json();

  if (path.startsWith("branches/")) {
    const id = path.split("/")[1];
    const b = branches.find((branch) => branch.id === id);
    if (b) Object.assign(b, body);
    return NextResponse.json({ success: true, message: "Branch updated", data: b });
  }

  if (path.startsWith("users/")) {
    const id = path.split("/")[1];
    const u = users.find((user) => user.id === id);
    if (u) Object.assign(u, body);
    return NextResponse.json({ success: true, message: "User updated", data: u });
  }

  if (path.startsWith("categories/")) {
    const id = path.split("/")[1];
    const c = categories.find((cat) => cat.id === id);
    if (c) Object.assign(c, body);
    return NextResponse.json({ success: true, message: "Category updated", data: c });
  }

  if (path.startsWith("products/")) {
    const id = path.split("/")[1];
    const p = products.find((prod) => prod.id === id);
    if (p) Object.assign(p, body);
    return NextResponse.json({ success: true, message: "Product updated", data: p });
  }

  return NextResponse.json({ success: true, message: "Updated", data: body });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ route: string[] }> }
) {
  const { route } = await params;
  const path = route.join("/");

  if (path.startsWith("branches/")) {
    const id = path.split("/")[1];
    const idx = branches.findIndex((b) => b.id === id);
    if (idx > -1) branches.splice(idx, 1);
    return NextResponse.json({ success: true, message: "Branch deleted", data: { id } });
  }

  if (path.startsWith("users/")) {
    const id = path.split("/")[1];
    const idx = users.findIndex((u) => u.id === id);
    if (idx > -1) users.splice(idx, 1);
    return NextResponse.json({ success: true, message: "User removed", data: { id } });
  }

  if (path.startsWith("categories/")) {
    const id = path.split("/")[1];
    const idx = categories.findIndex((c) => c.id === id);
    if (idx > -1) categories.splice(idx, 1);
    return NextResponse.json({ success: true, message: "Category deleted", data: { id } });
  }

  if (path.startsWith("products/")) {
    const id = path.split("/")[1];
    const idx = products.findIndex((p) => p.id === id);
    if (idx > -1) products.splice(idx, 1);
    return NextResponse.json({ success: true, message: "Product deleted", data: { id } });
  }

  return NextResponse.json({ success: true, message: "Resource deleted", data: { path } });
}
