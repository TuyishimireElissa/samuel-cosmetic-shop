"use client";

import { useState, useEffect, useRef } from "react";
import { useUI, useCart } from "@/lib/store";
import { LANGS, t } from "@/lib/i18n";
import { CURRENCIES } from "@/lib/format";
import { WHATSAPP_LINK } from "@/lib/whatsapp";
import { WhatsAppIcon } from "@/components/whatsapp-icon";
import {
  ShoppingCart,
  Search,
  Menu,
  X,
  Globe,
  ChevronDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ShopHeader({
  onSearch,
  onNav,
}: {
  onSearch: (q: string) => void;
  onNav: (target: string) => void;
}) {
  const { lang, setLang, currency, setCurrency, setCartOpen, enterAdmin } = useUI();
  const count = useCart((s) => s.items.reduce((a, i) => a + i.qty, 0));
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoEmoji, setLogoEmoji] = useState<string>("✿");

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.ok && d.settings) {
          if (d.settings.logoUrl) setLogoUrl(d.settings.logoUrl);
          if (d.settings.logoEmoji) setLogoEmoji(d.settings.logoEmoji);
        }
      })
      .catch(() => {});
  }, []);
  const [bounce, setBounce] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const prevCountRef = useRef(count);

  // Bounce when cart count increases
  useEffect(() => {
    if (count > prevCountRef.current) {
      prevCountRef.current = count;
      const id = setTimeout(() => setBounce(false), 350);
      // use requestAnimationFrame to defer setState to next frame
      requestAnimationFrame(() => setBounce(true));
      return () => clearTimeout(id);
    }
    prevCountRef.current = count;
  }, [count]);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    onSearch(searchVal);
  }

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/85 border-b border-pink-100 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-3">
        {/* Logo */}
        <button
          onClick={() => onNav("home")}
          className="flex items-center gap-2 shrink-0"
          aria-label="Samuel Cosmetic Shop home"
        >
          {logoUrl ? (
            <img src={logoUrl} alt="Samuel Cosmetic Shop" className="w-10 h-10 rounded-full object-cover shadow-md" />
          ) : (
            <span className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 text-white grid place-items-center text-xl shadow-md">
              {logoEmoji}
            </span>
          )}
          <div className="hidden sm:block leading-tight text-left">
            <div className="font-bold text-[15px]" style={{ fontFamily: "var(--font-playfair)" }}>
              Samuel Cosmetic
            </div>
            <div className="text-[10px] text-pink-600 uppercase tracking-wider">
              Kigali · Rwanda
            </div>
          </div>
        </button>

        {/* Search (desktop) */}
        <form
          onSubmit={submitSearch}
          className="hidden md:flex flex-1 max-w-xl mx-2 relative"
        >
          <Input
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder={t("search.placeholder", lang)}
            className="pr-10 h-11 bg-pink-50/50 border-pink-100 focus-visible:ring-pink-400"
            aria-label="Search products"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-pink-500 hover:text-pink-700"
            aria-label="Search"
          >
            <Search size={18} />
          </button>
        </form>

        {/* Right side */}
        <div className="flex items-center gap-1 sm:gap-2 ml-auto">
          {/* Language */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-10 px-2 text-sm hover:bg-pink-50"
                aria-label="Change language"
              >
                <Globe size={16} className="text-pink-500" />
                <span className="ml-1 hidden sm:inline">
                  {LANGS.find((l) => l.code === lang)?.flag} {lang.toUpperCase()}
                </span>
                <ChevronDown size={14} className="opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              {LANGS.map((l) => (
                <DropdownMenuItem
                  key={l.code}
                  onClick={() => setLang(l.code)}
                  className={`cursor-pointer ${lang === l.code ? "bg-pink-50 font-medium" : ""}`}
                >
                  <span className="mr-2">{l.flag}</span>
                  {l.label}
                  {lang === l.code && <span className="ml-auto text-pink-500">✓</span>}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Currency */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-10 px-2 text-sm hover:bg-pink-50"
                aria-label="Change currency"
              >
                <span className="font-semibold">{currency}</span>
                <ChevronDown size={14} className="opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {CURRENCIES.map((c) => (
                <DropdownMenuItem
                  key={c.code}
                  onClick={() => setCurrency(c.code)}
                  className={`cursor-pointer ${currency === c.code ? "bg-pink-50 font-medium" : ""}`}
                >
                  <span className="mr-2">{c.flag}</span>
                  {c.code}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Cart */}
          <Button
            variant="ghost"
            size="sm"
            className={`h-10 px-2 relative hover:bg-pink-50 ${bounce ? "bounce-once" : ""}`}
            onClick={() => setCartOpen(true)}
            aria-label={`Cart with ${count} items`}
          >
            <ShoppingCart size={20} className="text-pink-600" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-pink-600 text-white text-[10px] font-bold grid place-items-center">
                {count}
              </span>
            )}
          </Button>

          {/* WhatsApp */}
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 h-10 px-3 rounded-full bg-[#25D366] hover:bg-[#1ebe5d] text-white text-sm font-semibold transition-colors shadow-sm"
            aria-label="Chat with us on WhatsApp"
          >
            <WhatsAppIcon size={16} />
            <span className="hidden lg:inline">WhatsApp</span>
          </a>

          {/* Admin */}
          <Button
            variant="ghost"
            size="sm"
            onClick={enterAdmin}
            className="h-10 px-2 text-xs text-pink-700 hover:bg-pink-100"
            aria-label="Admin login"
          >
            Admin
          </Button>

          {/* Mobile menu */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden h-10 w-10 p-0"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
        </div>
      </div>

      {/* Mobile search */}
      {mobileOpen && (
        <div className="md:hidden px-4 pb-3 space-y-2 border-t border-pink-100 bg-white">
          <form onSubmit={submitSearch} className="relative">
            <Input
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              placeholder={t("search.placeholder", lang)}
              className="pr-10 h-11 bg-pink-50/50 border-pink-100"
              aria-label="Search products"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-pink-500">
              <Search size={18} />
            </button>
          </form>
          <nav className="flex flex-col gap-1">
            {[
              { id: "home", label: t("nav.home", lang) },
              { id: "shop", label: t("nav.shop", lang) },
              { id: "categories", label: t("nav.categories", lang) },
              { id: "about", label: t("nav.about", lang) },
              { id: "contact", label: t("nav.contact", lang) },
            ].map((n) => (
              <button
                key={n.id}
                onClick={() => {
                  onNav(n.id);
                  setMobileOpen(false);
                }}
                className="text-left px-3 py-2 rounded-lg hover:bg-pink-50 text-sm font-medium"
              >
                {n.label}
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* Desktop nav */}
      <nav className="hidden md:block border-t border-pink-100/70 bg-white/70">
        <div className="mx-auto max-w-7xl px-4 flex items-center gap-1 h-10 text-sm">
          {[
            { id: "home", label: t("nav.home", lang) },
            { id: "shop", label: t("nav.shop", lang) },
            { id: "categories", label: t("nav.categories", lang) },
            { id: "about", label: t("nav.about", lang) },
            { id: "contact", label: t("nav.contact", lang) },
          ].map((n) => (
            <button
              key={n.id}
              onClick={() => onNav(n.id)}
              className="px-3 h-10 inline-flex items-center rounded-md text-foreground/80 hover:text-pink-600 hover:bg-pink-50 transition-colors"
            >
              {n.label}
            </button>
          ))}
        </div>
      </nav>
    </header>
  );
}
