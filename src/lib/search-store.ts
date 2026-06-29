"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface SearchHistoryState {
  recent: string[];
  addRecent: (query: string) => void;
  clearRecent: () => void;
  removeRecent: (query: string) => void;
}

const MAX_HISTORY = 10;

export const useSearchHistory = create<SearchHistoryState>()(
  persist(
    (set) => ({
      recent: [],
      addRecent: (query) => {
        const q = query.trim();
        if (!q || q.length < 2) return;
        set((state) => ({
          recent: [q, ...state.recent.filter(x => x.toLowerCase() !== q.toLowerCase())].slice(0, MAX_HISTORY),
        }));
      },
      clearRecent: () => set({ recent: [] }),
      removeRecent: (query) => set((state) => ({
        recent: state.recent.filter(x => x !== query),
      })),
    }),
    { name: "sc_search_history", storage: createJSONStorage(() => localStorage) }
  )
);

// Trending searches — hardcoded based on the shop's product catalog
// These are the most common cosmetic search terms in Rwanda
export const TRENDING_SEARCHES = [
  "lipstick",
  "perfume",
  "cream",
  "shampoo",
  "foundation",
  "mascara",
  "serum",
  "deodorant",
];
