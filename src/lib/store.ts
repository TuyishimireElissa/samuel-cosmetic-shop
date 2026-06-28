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
  image?: string; // product photo URL
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
// Wishlist store
// ────────────────────────────────────────────────────────────
interface WishlistState {
  ids: string[];
  toggle: (id: string) => void;
  has: (id: string) => boolean;
  clear: () => void;
}
export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) => set((s) => ({ ids: s.ids.includes(id) ? s.ids.filter((x) => x !== id) : [...s.ids, id] })),
      has: (id) => get().ids.includes(id),
      clear: () => set({ ids: [] }),
    }),
    { name: "sc_wishlist", storage: createJSONStorage(() => localStorage) }
  )
);

// ────────────────────────────────────────────────────────────
// Compare store (max 3)
// ────────────────────────────────────────────────────────────
interface CompareState {
  ids: string[];
  toggle: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
}
export const useCompare = create<CompareState>()(
  persist(
    (set) => ({
      ids: [],
      toggle: (id) => set((s) => {
        if (s.ids.includes(id)) return { ids: s.ids.filter((x) => x !== id) };
        if (s.ids.length >= 3) return s;
        return { ids: [...s.ids, id] };
      }),
      remove: (id) => set((s) => ({ ids: s.ids.filter((x) => x !== id) })),
      clear: () => set({ ids: [] }),
    }),
    { name: "sc_compare", storage: createJSONStorage(() => localStorage) }
  )
);

// ────────────────────────────────────────────────────────────
// Recently Viewed store (max 8, 24h expiry)
// ────────────────────────────────────────────────────────────
interface RecentlyViewedState {
  items: { id: string; at: number }[];
  add: (id: string) => void;
  clear: () => void;
}
const RECENTLY_TTL = 24 * 60 * 60 * 1000;
export const useRecentlyViewed = create<RecentlyViewedState>()(
  persist(
    (set) => ({
      items: [],
      add: (id) => {
        const now = Date.now();
        set((s) => {
          const filtered = s.items.filter((i) => i.id !== id && now - i.at < RECENTLY_TTL);
          return { items: [{ id, at: now }, ...filtered].slice(0, 8) };
        });
      },
      clear: () => set({ items: [] }),
    }),
    { name: "sc_recently", storage: createJSONStorage(() => localStorage) }
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
  adminType: "admin" | "staff" | null;
  adminPermissions: string[];
  wholesaleToken: string | null;
  wholesaleUser: any | null;
  setLang: (l: Lang) => void;
  setCurrency: (c: Currency) => void;
  setCartOpen: (v: boolean) => void;
  enterAdmin: () => void;
  exitAdmin: () => void;
  adminLogin: (token: string, name: string, type: "admin" | "staff", permissions: string[]) => void;
  adminLogout: () => void;
  wholesaleLogin: (token: string, user: any) => void;
  wholesaleLogout: () => void;
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
      adminType: null,
      adminPermissions: [],
      wholesaleToken: null,
      wholesaleUser: null,
      setLang: (l) => {
        if (typeof window !== "undefined") localStorage.setItem("sc_language", l);
        set({ lang: l });
      },
      setCurrency: (c) => set({ currency: c }),
      setCartOpen: (v) => set({ cartOpen: v }),
      enterAdmin: () => set({ adminView: "admin-login" }),
      exitAdmin: () => set({ adminView: "storefront" }),
      adminLogin: (token, name, type, permissions) => set({ adminView: "admin-app", adminToken: token, adminName: name, adminType: type, adminPermissions: permissions }),
      adminLogout: () => set({ adminView: "storefront", adminToken: null, adminName: null, adminType: null, adminPermissions: [] }),
      wholesaleLogin: (token, user) => set({ wholesaleToken: token, wholesaleUser: user }),
      wholesaleLogout: () => set({ wholesaleToken: null, wholesaleUser: null }),
    }),
    {
      name: "sc_ui",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        lang: state.lang,
        currency: state.currency,
        adminToken: state.adminToken,
        adminName: state.adminName,
        adminType: state.adminType,
        adminPermissions: state.adminPermissions,
        adminView: state.adminView,
        wholesaleToken: state.wholesaleToken,
        wholesaleUser: state.wholesaleUser,
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
