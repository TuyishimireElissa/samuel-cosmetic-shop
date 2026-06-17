"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Lang } from "./i18n";
import { detectInitialLang } from "./i18n";
import type { Currency } from "./format";

// ────────────────────────────────────────────────────────────
// Cart store
// ────────────────────────────────────────────────────────────
export interface CartItem {
  id: string; // product id
  qty: number;
  priceTTC: number; // current selling price TTC (RWF)
  name: string; // snapshot name (current lang)
  emoji: string;
}

interface CartState {
  items: CartItem[];
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  count: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (item, qty = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.id === item.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === item.id ? { ...i, qty: i.qty + qty } : i
              ),
            };
          }
          return { items: [...state.items, { ...item, qty }] };
        }),
      remove: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
      setQty: (id, qty) =>
        set((state) => ({
          items:
            qty <= 0
              ? state.items.filter((i) => i.id !== id)
              : state.items.map((i) => (i.id === id ? { ...i, qty } : i)),
        })),
      clear: () => set({ items: [] }),
      count: () => get().items.reduce((sum, i) => sum + i.qty, 0),
    }),
    {
      name: "sc_cart",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// ────────────────────────────────────────────────────────────
// UI store: language, currency, admin session, view
// ────────────────────────────────────────────────────────────
interface UIState {
  lang: Lang;
  currency: Currency;
  cartOpen: boolean;
  adminView: "storefront" | "admin-login" | "admin-app";
  adminToken: string | null;
  adminName: string | null;
  setLang: (l: Lang) => void;
  setCurrency: (c: Currency) => void;
  setCartOpen: (v: boolean) => void;
  enterAdmin: () => void;
  exitAdmin: () => void;
  adminLogin: (token: string, name: string) => void;
  adminLogout: () => void;
}

export const useUI = create<UIState>()(
  persist(
    (set) => ({
      lang: "rw", // SSR-safe default; client will rehydrate from localStorage/detect
      currency: "RWF",
      cartOpen: false,
      adminView: "storefront",
      adminToken: null,
      adminName: null,
      setLang: (l) => {
        if (typeof window !== "undefined") localStorage.setItem("sc_language", l);
        set({ lang: l });
      },
      setCurrency: (c) => set({ currency: c }),
      setCartOpen: (v) => set({ cartOpen: v }),
      enterAdmin: () => set({ adminView: "admin-login" }),
      exitAdmin: () => set({ adminView: "storefront" }),
      adminLogin: (token, name) => set({ adminView: "admin-app", adminToken: token, adminName: name }),
      adminLogout: () => set({ adminView: "storefront", adminToken: null, adminName: null }),
    }),
    {
      name: "sc_ui",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        lang: state.lang,
        currency: state.currency,
        adminToken: state.adminToken,
        adminName: state.adminName,
        adminView: state.adminView,
      }),
      onRehydrateStorage: () => (state) => {
        // Re-detect language if not set
        if (state && (!state.lang || !["rw", "en", "fr"].includes(state.lang))) {
          state.lang = detectInitialLang();
        }
      },
    }
  )
);
