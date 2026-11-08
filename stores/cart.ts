import { create } from "zustand";
import type { SaleItem } from "@/types/api";

interface CartState {
  items: SaleItem[];
  discount: number; // Flat discount in BDT
  taxRate: number; // e.g. 0.05 for 5% VAT
  addItem: (product: { id: string; name: string; sku: string; basePrice: number }, qty?: number) => void;
  removeItem: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  setDiscount: (amount: number) => void;
  setTaxRate: (rate: number) => void;
  clearCart: () => void;
  subtotal: () => number;
  tax: () => number;
  total: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  discount: 0,
  taxRate: 0.05, // 5% standard VAT

  addItem: (product, qty = 1) => {
    set((state) => {
      const existingIndex = state.items.findIndex((item) => item.productId === product.id);
      if (existingIndex > -1) {
        const updated = [...state.items];
        const newQty = updated[existingIndex].qty + qty;
        updated[existingIndex] = {
          ...updated[existingIndex],
          qty: newQty,
          total: newQty * updated[existingIndex].unitPrice,
        };
        return { items: updated };
      }
      return {
        items: [
          ...state.items,
          {
            productId: product.id,
            productName: product.name,
            sku: product.sku,
            qty,
            unitPrice: product.basePrice,
            total: qty * product.basePrice,
          },
        ],
      };
    });
  },

  removeItem: (productId) => {
    set((state) => ({
      items: state.items.filter((item) => item.productId !== productId),
    }));
  },

  setQty: (productId, qty) => {
    if (qty <= 0) {
      get().removeItem(productId);
      return;
    }
    set((state) => ({
      items: state.items.map((item) =>
        item.productId === productId
          ? {
              ...item,
              qty,
              total: qty * item.unitPrice,
            }
          : item
      ),
    }));
  },

  setDiscount: (amount) => set({ discount: Math.max(0, amount) }),
  setTaxRate: (rate) => set({ taxRate: Math.max(0, rate) }),
  clearCart: () => set({ items: [], discount: 0 }),

  subtotal: () => {
    return get().items.reduce((sum, item) => sum + item.total, 0);
  },

  tax: () => {
    const subtotal = get().subtotal();
    const afterDiscount = Math.max(0, subtotal - get().discount);
    return afterDiscount * get().taxRate;
  },

  total: () => {
    const subtotal = get().subtotal();
    const afterDiscount = Math.max(0, subtotal - get().discount);
    return afterDiscount + get().tax();
  },
}));
