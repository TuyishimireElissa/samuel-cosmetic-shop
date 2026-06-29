"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useUI } from "@/lib/store";
import { pickLang } from "@/lib/i18n";
import { formatPrice } from "@/lib/format";
import { useSearchHistory, TRENDING_SEARCHES } from "@/lib/search-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, Clock, TrendingUp, ArrowRight, ImageIcon } from "lucide-react";

interface Suggestion {
  id: string;
  nameEn: string;
  nameFr: string;
  nameRw: string;
  sellingPrice: number;
  wholesalePrice: number;
  sku: string;
  stockQty: number;
  categoryName: string;
  image: string | null;
  badge: string;
}

interface SearchSuggestionsProps {
  value: string;
  onChange: (val: string) => void;
  onSubmit: (val: string) => void;
  onSelectProduct?: (id: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

// ── Highlight matched text ──────────────────────────────────────────────
function Highlight({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const q = query.trim().toLowerCase();
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    const idx = remaining.toLowerCase().indexOf(q);
    if (idx === -1) {
      parts.push(remaining);
      break;
    }
    if (idx > 0) parts.push(remaining.slice(0, idx));
    parts.push(
      <mark key={key++} className="bg-pink-200 text-pink-900 rounded px-0.5 font-semibold">
        {remaining.slice(idx, idx + q.length)}
      </mark>
    );
    remaining = remaining.slice(idx + q.length);
  }
  return <>{parts}</>;
}

export function SearchSuggestions({
  value,
  onChange,
  onSubmit,
  onSelectProduct,
  placeholder = "Search products...",
  autoFocus,
}: SearchSuggestionsProps) {
  const { lang, currency, wholesaleUser } = useUI();
  const { recent, addRecent, clearRecent, removeRecent } = useSearchHistory();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1); // -1 = none, 0..n = suggestions
  const containerRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isWholesale = !!(wholesaleUser && wholesaleUser.status === "approved");

  // ── Fetch suggestions with debounce + abort ──────────────────────────
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim() || value.trim().length < 1) {
      setSuggestions([]);
      setLoading(false);
      if (abortRef.current) abortRef.current.abort();
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      // Abort previous request
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch(
          `/api/products/search?q=${encodeURIComponent(value)}&limit=8`,
          { signal: controller.signal }
        );
        const data = await res.json();
        if (!controller.signal.aborted && data.ok) {
          setSuggestions(data.suggestions || []);
          setIsOpen(true);
          setActiveIndex(-1);
        }
      } catch (e: any) {
        if (e?.name !== "AbortError") {
          // Silently fail — don't crash the UI
          setSuggestions([]);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 200);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value]);

  // ── Close on outside click ───────────────────────────────────────────
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── Keyboard navigation ──────────────────────────────────────────────
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" && suggestions.length > 0) {
        setIsOpen(true);
        setActiveIndex(0);
        e.preventDefault();
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex(prev => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < suggestions.length) {
        const s = suggestions[activeIndex];
        addRecent(value);
        setIsOpen(false);
        if (onSelectProduct) {
          onSelectProduct(s.id);
        } else {
          onSubmit(value);
        }
      } else {
        addRecent(value);
        setIsOpen(false);
        onSubmit(value);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
      setActiveIndex(-1);
    }
  }, [isOpen, suggestions, activeIndex, value, addRecent, onSelectProduct, onSubmit]);

  // ── Submit handler ───────────────────────────────────────────────────
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (value.trim()) {
      addRecent(value);
      setIsOpen(false);
      onSubmit(value);
    }
  }

  function handleSuggestionClick(s: Suggestion) {
    addRecent(value);
    setIsOpen(false);
    if (onSelectProduct) {
      onSelectProduct(s.id);
    } else {
      // Navigate to product via quick view
      onSubmit(s.nameEn);
    }
  }

  function handleRecentClick(query: string) {
    onChange(query);
    addRecent(query);
    setIsOpen(false);
    onSubmit(query);
  }

  const showDropdown = isOpen && (value.trim().length > 0 || (!value && recent.length > 0));

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={handleSubmit} className="relative">
        <Input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            if (e.target.value.trim()) setIsOpen(true);
            else setIsOpen(false);
          }}
          onFocus={() => {
            if (value.trim() || recent.length > 0) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pr-10 h-11 bg-pink-50/50 border-pink-100 focus-visible:ring-pink-400"
          aria-label="Search products"
          aria-expanded={showDropdown}
          aria-autocomplete="list"
          aria-controls="search-suggestions"
          autoFocus={autoFocus}
        />
        {value ? (
          <button
            type="button"
            onClick={() => {
              onChange("");
              setSuggestions([]);
              setIsOpen(false);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-pink-400 hover:text-pink-700 p-1 rounded-full hover:bg-pink-100"
            aria-label="Clear search"
          >
            <X size={16} />
          </button>
        ) : (
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-pink-500 hover:text-pink-700"
            aria-label="Search"
          >
            <Search size={18} />
          </button>
        )}
      </form>

      {/* ── Suggestions Dropdown ──────────────────────────────────────── */}
      {showDropdown && (
        <div
          id="search-suggestions"
          role="listbox"
          className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-pink-100 max-h-[70vh] overflow-y-auto z-50"
        >
          {/* Loading state */}
          {loading && (
            <div className="p-3 text-center text-sm text-muted-foreground">
              <div className="inline-flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-pink-300 border-t-pink-600 rounded-full animate-spin" />
                {lang === "rw" ? "Gushakisha..." : lang === "fr" ? "Recherche..." : "Searching..."}
              </div>
            </div>
          )}

          {/* No results */}
          {!loading && value.trim() && suggestions.length === 0 && (
            <div className="p-4 text-center">
              <div className="mx-auto mb-2 w-12 h-12 rounded-full bg-pink-50 grid place-items-center">
                <Search size={24} className="text-pink-300" />
              </div>
              <p className="text-sm font-medium text-pink-800">
                {lang === "rw" ? "Nta bicuruzwa byabonetse" : lang === "fr" ? "Aucun produit trouvé" : "No products found"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {lang === "rw" ? "Gerageza: lipstick, kremu, parfum" : lang === "fr" ? "Essayez: lipstick, crème, parfum" : "Try: lipstick, cream, perfume"}
              </p>
            </div>
          )}

          {/* Product suggestions */}
          {!loading && suggestions.length > 0 && (
            <ul className="py-1">
              {suggestions.map((s, i) => {
                const name = pickLang(s, lang);
                const price = isWholesale && s.wholesalePrice > 0 ? s.wholesalePrice : s.sellingPrice;
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={i === activeIndex}
                      onClick={() => handleSuggestionClick(s)}
                      onMouseEnter={() => setActiveIndex(i)}
                      className={`w-full flex items-center gap-3 p-2 text-left transition-colors ${
                        i === activeIndex ? "bg-pink-50" : "hover:bg-pink-50/50"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-pink-50 shrink-0 grid place-items-center">
                        {s.image ? (
                          <img src={s.image} alt={name} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon size={16} className="text-pink-300" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-pink-900 truncate">
                          <Highlight text={name} query={value} />
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {s.categoryName} · {formatPrice(price, currency)}
                        </div>
                      </div>
                      {s.stockQty <= 0 && (
                        <span className="text-[10px] text-red-500 font-medium shrink-0">Out</span>
                      )}
                      <ArrowRight size={14} className="text-pink-400 shrink-0" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {/* Recent searches (only when no active query) */}
          {!loading && !value.trim() && recent.length > 0 && (
            <div className="py-1">
              <div className="flex items-center justify-between px-3 py-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1">
                  <Clock size={12} /> {lang === "rw" ? "Ibyashizwe ho" : lang === "fr" ? "Récents" : "Recent"}
                </span>
                <button onClick={clearRecent} className="text-[10px] text-pink-500 hover:text-pink-700">
                  {lang === "rw" ? "Siba" : lang === "fr" ? "Effacer" : "Clear"}
                </button>
              </div>
              {recent.map((q) => (
                <div key={q} className="flex items-center group">
                  <button
                    type="button"
                    onClick={() => handleRecentClick(q)}
                    className="flex-1 flex items-center gap-2 px-3 py-1.5 text-sm text-left hover:bg-pink-50"
                  >
                    <Clock size={12} className="text-pink-400" />
                    <span className="truncate">{q}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => removeRecent(q)}
                    className="px-2 py-1 opacity-0 group-hover:opacity-100 text-pink-400 hover:text-pink-600"
                    aria-label={`Remove ${q}`}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Trending searches (when no query and no recent) */}
          {!loading && !value.trim() && recent.length === 0 && (
            <div className="py-1">
              <div className="px-3 py-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1">
                  <TrendingUp size={12} /> {lang === "rw" ? "Bizwi cyane" : lang === "fr" ? "Tendances" : "Trending"}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 px-3 pb-2">
                {TRENDING_SEARCHES.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => handleRecentClick(q)}
                    className="px-2.5 py-1 rounded-full bg-pink-50 text-pink-700 text-xs font-medium hover:bg-pink-100 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
