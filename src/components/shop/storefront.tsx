"use client";

import { useEffect, useState, useRef } from "react";
import { useUI, useCart } from "@/lib/store";
import { pickLang, t } from "@/lib/i18n";
import { formatPrice } from "@/lib/format";
import { WHATSAPP_LINK, SHOP_NAME, SHOP_LOCATION, SHOP_WHATSAPP, SHOP_EMAIL } from "@/lib/whatsapp";
import type { Product, Category } from "@prisma/client";
import { ShopHeader } from "./header";
import { ProductCard, ProductCardSkeleton } from "./product-card";
import { CartDrawer } from "./cart-drawer";
import { QuickViewModal } from "./quick-view-modal";
import { OrderTrackingModal, CustomerPortalModal, BookingModal, WholesaleModal } from "./modals";
import { PhotoSearchModal } from "./photo-search";
import { WishlistCompareBar } from "./wishlist-compare-bar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WhatsAppIcon } from "@/components/whatsapp-icon";
import {
  Search,
  Filter,
  Sparkles,
  Truck,
  Shield,
  Heart,
  Star,
  TrendingUp,
  MapPin,
  Phone,
  Mail,
  Clock,
  ArrowUp,
  Camera,
  X,
  Gift,
} from "lucide-react";

type ProductWithCat = Product & { category: Category | null };

export function Storefront() {
  const { lang, currency, setCartOpen } = useUI();
  const [products, setProducts] = useState<ProductWithCat[]>([]);
  const [featured, setFeatured] = useState<ProductWithCat[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [bundles, setBundles] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [flashSale, setFlashSale] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoEmoji, setLogoEmoji] = useState<string>("✿");
  const [activeCat, setActiveCat] = useState("all");
  const [sort, setSort] = useState("newest");
  const [quickView, setQuickView] = useState<ProductWithCat | null>(null);
  const [trackOpen, setTrackOpen] = useState(false);
  const [portalOpen, setPortalOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [wholesaleOpen, setWholesaleOpen] = useState(false);
  const [photoSearchOpen, setPhotoSearchOpen] = useState(false);

  const shopRef = useRef<HTMLDivElement>(null);
  const catsRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  useEffect(() => {
    Promise.all([
      fetch("/api/categories").then((r) => r.json()),
      fetch("/api/products/featured").then((r) => r.json()),
      fetch("/api/bundles").then((r) => r.json()),
      fetch("/api/testimonials").then((r) => r.json()),
      fetch("/api/flash-sales").then((r) => r.json()),
      fetch("/api/settings").then((r) => r.json()),
    ]).then(([c, f, b, ts, fs, st]) => {
      // NOTE: do NOT fetch /api/products here.
      // The dedicated filter useEffect below is the ONLY place that calls
      // setProducts. Calling setProducts here too caused a race condition
      // (Bug #67): a slow Promise.all resolution would overwrite filtered
      // search results with the full product list, because the closure here
      // captures the initial search="" / activeCat="all" values from mount
      // time and could fire AFTER the user had already typed a search.
      if (c.ok) setCategories(c.categories);
      if (f?.ok) setFeatured(f.products);
      if (b?.ok) setBundles(b.bundles);
      if (ts?.ok) setTestimonials(ts.testimonials);
      if (fs?.ok && fs.sales && fs.sales.length > 0) {
        const now = new Date();
        const active = fs.sales.find((s: any) => s.isActive && new Date(s.startTime) <= now && new Date(s.endTime) >= now);
        if (active) setFlashSale(active);
      }
      if (st?.ok && st.settings) {
        if (st.settings.logoUrl) setLogoUrl(st.settings.logoUrl);
        if (st.settings.logoEmoji) setLogoEmoji(st.settings.logoEmoji);
      }
    });
  }, []);

  // Re-fetch products when filters change
  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams();
    if (activeCat !== "all") params.set("category", activeCat);
    if (search) params.set("search", search);
    if (sort) params.set("sort", sort);
    (async () => {
      try {
        const r = await fetch(`/api/products?${params}`);
        const d = await r.json();
        if (cancelled) return;
        if (d.ok) {
          setProducts(d.products);
        }
        // Always hide skeletons once a response (success or error) arrives,
        // so the grid never gets stuck in the loading state.
        setLoading(false);
      } catch {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeCat, search, sort]);

  // Auto-scroll to the shop section when the user starts searching, so they
  // immediately see the filtered results instead of having to scroll down
  // past the hero. We skip the very first render (no search on mount).
  const prevSearchRef = useRef("");
  useEffect(() => {
    const prev = prevSearchRef.current;
    prevSearchRef.current = search;
    if (search && !prev) {
      // User just started typing — scroll to the shop section.
      shopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [search]);

  function handleNav(target: string) {
    // API-019 fix: React 19 useRef returns RefObject<T | null>, so the map
    // must accept null in the generic parameter.
    const refs: Record<string, React.RefObject<HTMLDivElement | null>> = {
      home: shopRef,
      shop: shopRef,
      categories: catsRef,
      about: aboutRef,
      contact: contactRef,
    };
    refs[target]?.current?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-pink-50/30 via-white to-purple-50/30">
      <ShopHeader onSearch={setSearch} onNav={handleNav} searchValue={search} />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-100 via-pink-50 to-purple-100" />
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-pink-300/30 rounded-full blur-3xl overflow-hidden pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-purple-300/30 rounded-full blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:py-24 grid lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-5 text-center lg:text-left">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 backdrop-blur text-xs font-medium text-pink-700 border border-pink-200">
              <Sparkles size={12} />
              {SHOP_LOCATION} · 🇷🇼 Made for Rwanda
            </span>
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-pink-900"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              {t("hero.title", lang)}
            </h1>
            <p className="text-base sm:text-lg text-pink-800/80 max-w-xl mx-auto lg:mx-0">
              {t("hero.subtitle", lang)}
            </p>
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
              <Button
                size="lg"
                onClick={() => handleNav("shop")}
                className="h-12 px-7 bg-pink-600 hover:bg-pink-700 text-base"
              >
                {t("hero.cta.shop", lang)}
              </Button>
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-[#25D366] hover:bg-[#1ebe5d] text-white text-base font-semibold transition-colors"
              >
                <WhatsAppIcon size={20} />
                {t("hero.cta.whatsapp", lang)}
              </a>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 justify-center lg:justify-start text-sm text-pink-800/70">
              <div className="flex items-center gap-1.5">
                <Truck size={14} /> Kigali same-day
              </div>
              <div className="flex items-center gap-1.5">
                <Shield size={14} /> 100% authentic
              </div>
              <div className="flex items-center gap-1.5">
                <Heart size={14} /> Loyalty rewards
              </div>
            </div>
          </div>

          {/* Hero visual */}
          <div className="relative hidden lg:block">
            <div className="grid grid-cols-2 gap-4">
              {[
                { e: "💄", l: "Makeup", c: "from-pink-200 to-pink-100" },
                { e: "🧴", l: "Skincare", c: "from-purple-200 to-pink-100" },
                { e: "🌸", l: "Fragrances", c: "from-rose-200 to-pink-100" },
                { e: "💆🏾‍♀️", l: "Hair", c: "from-purple-200 to-rose-100" },
              ].map((x, i) => (
                <div
                  key={i}
                  className={`aspect-square rounded-3xl bg-gradient-to-br ${x.c} grid place-items-center shadow-lg hover:scale-105 transition-transform`}
                >
                  <div className="text-center">
                    <div className="text-6xl mb-2">{x.e}</div>
                    <div className="font-semibold text-pink-800">{x.l}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-2">
              <div className="text-2xl">⭐</div>
              <div>
                <div className="font-bold text-pink-800">4.9/5</div>
                <div className="text-xs text-muted-foreground">2,400+ reviews</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FLASH SALE BANNER */}
      {flashSale && (
        <section className="mx-auto max-w-7xl px-4 py-3">
          <div
            className="rounded-2xl p-4 sm:p-5 text-white shadow-lg flex items-center justify-between gap-4 flex-wrap"
            style={{ background: `linear-gradient(135deg, ${flashSale.bannerColor || "#ff4757"}, #c0392b)` }}
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl sm:text-4xl">⚡</span>
              <div>
                <div className="text-lg sm:text-xl font-bold">
                  {lang === "rw" ? flashSale.titleRw : lang === "fr" ? flashSale.titleFr : flashSale.titleEn}
                </div>
                <div className="text-xs sm:text-sm opacity-90">
                  {flashSale.bannerTextEn || t("flash.defaultBanner", lang)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-2xl sm:text-3xl font-extrabold">
                  -{flashSale.discountValue}{flashSale.discountType === "percent" ? "%" : " RWF"}
                </div>
                <div className="text-[10px] sm:text-xs opacity-80">
                  {t("flash.endsOn", lang)}: {new Date(flashSale.endTime).toLocaleDateString()}
                </div>
              </div>
              <button
                onClick={() => shopRef.current?.scrollIntoView({ behavior: "smooth" })}
                className="px-4 py-2 rounded-full bg-white text-sm font-bold hover:bg-white/90 transition-colors"
                style={{ color: flashSale.bannerColor || "#ff4757" }}
              >
                {t("flash.shopNow", lang)}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* CATEGORIES */}
      <section ref={catsRef} className="mx-auto max-w-7xl px-4 py-12 sm:py-16">
        <div className="text-center mb-8">
          <h2
            className="text-3xl sm:text-4xl font-bold text-pink-900 mb-2"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            {t("categories.title", lang)}
          </h2>
          <p className="text-muted-foreground">{t("categories.subtitle", lang)}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setActiveCat(c.id);
                shopRef.current?.scrollIntoView({ behavior: "smooth" });
              }}
              className={`group p-4 sm:p-6 rounded-2xl border-2 transition-all hover:shadow-lg ${
                activeCat === c.id
                  ? "border-pink-500 bg-pink-50"
                  : "border-pink-100 bg-white hover:border-pink-300"
              }`}
            >
              <div className="font-semibold text-pink-800 text-sm sm:text-base">
                {pickLang(c, lang)}
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* SHOP / PRODUCT GRID */}
      <section ref={shopRef} className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
        {/* Active search indicator with clear button */}
        {search && (
          <div className="mb-4 flex items-center gap-3 flex-wrap p-3 rounded-xl bg-pink-50 border border-pink-200">
            <Search size={16} className="text-pink-600 shrink-0" />
            <span className="text-sm text-pink-900">
              <span className="text-muted-foreground">{t("search.resultsFor", lang)}: </span>
              <span className="font-semibold">&ldquo;{search}&rdquo;</span>
              <span className="ml-2 text-muted-foreground">
                ({products.length} {products.length === 1 ? t("search.resultSingular", lang) : t("search.resultPlural", lang)})
              </span>
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearch("")}
              className="ml-auto h-8 px-2 text-pink-700 hover:bg-pink-100"
              aria-label={t("search.clear", lang)}
            >
              <X size={14} className="mr-1" />
              {t("search.clear", lang)}
            </Button>
          </div>
        )}

        <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
          <h2
            className="text-2xl sm:text-3xl font-bold text-pink-900"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            {search ? t("search.searchResults", lang) : t("nav.shop", lang)}
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              {products.length} {products.length === 1 ? t("search.resultSingular", lang) : t("search.resultPlural", lang)}
            </span>
          </h2>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Category pills */}
            <div className="flex items-center gap-1 flex-wrap">
              <Button
                variant={activeCat === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCat("all")}
                className={
                  activeCat === "all"
                    ? "bg-pink-600 hover:bg-pink-700"
                    : "border-pink-200 text-pink-700"
                }
              >
                {t("categories.all", lang)}
              </Button>
              {categories.map((c) => (
                <Button
                  key={c.id}
                  variant={activeCat === c.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveCat(c.id)}
                  className={
                    activeCat === c.id
                      ? "bg-pink-600 hover:bg-pink-700"
                      : "border-pink-200 text-pink-700"
                  }
                >
{pickLang(c, lang)}
                </Button>
              ))}
            </div>

            {/* Sort */}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="h-9 rounded-md border border-pink-200 bg-white text-sm px-2"
              aria-label="Sort products"
            >
              <option value="newest">{t("filter.newest", lang)}</option>
              <option value="priceLow">{t("filter.priceLow", lang)}</option>
              <option value="priceHigh">{t("filter.priceHigh", lang)}</option>
              <option value="rating">{t("filter.rating", lang)}</option>
              <option value="popular">Popular</option>
            </select>
            {/* Photo Search */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPhotoSearchOpen(true)}
              className="border-pink-200 text-pink-700 hover:bg-pink-50"
              title={t("search.photo", lang)}
            >
              <Camera size={14} className="sm:mr-1" />
              <span className="hidden sm:inline">{t("search.photo", lang)}</span>
            </Button>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <div className="mx-auto mb-3 w-16 h-16 rounded-full bg-pink-100 grid place-items-center">
              <Search size={28} className="text-pink-400" />
            </div>
            <p className="text-pink-800 font-medium text-lg">{t("search.noResults", lang)}</p>
            {search && (
              <p className="text-sm text-muted-foreground mt-1">
                {t("search.resultsFor", lang)}: <span className="font-semibold">&ldquo;{search}&rdquo;</span>
              </p>
            )}
            <Button
              onClick={() => {
                setSearch("");
                setActiveCat("all");
              }}
              className="mt-4 bg-pink-600 hover:bg-pink-700"
            >
              {t("categories.all", lang)}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} currency={currency} onQuickView={(prod) => setQuickView(prod as any)} />
            ))}
          </div>
        )}
      </section>

      {/* FEATURED PRODUCTS — hidden when a category filter OR search is active */}
      {featured.length > 0 && activeCat === "all" && !search && (
        <section className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-pink-900 mb-4 sm:mb-6 flex items-center gap-2" style={{ fontFamily: "var(--font-playfair)" }}>
            <TrendingUp size={24} className="text-pink-600" /> {t("sections.featured", lang)}
          </h2>
          <div className="flex md:grid md:grid-cols-4 gap-3 sm:gap-4 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 md:mx-0 md:px-0">
            {featured.slice(0, 8).map((p) => (
              <div key={p.id} className="shrink-0 w-60 sm:w-auto md:w-full">
                <ProductCard product={p} currency={currency} onQuickView={(prod) => setQuickView(prod as any)} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* BUNDLES — hidden when a search is active */}
      {bundles.length > 0 && !search && (
        <section className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-pink-900 mb-4 sm:mb-6 text-center" style={{ fontFamily: "var(--font-playfair)" }}>{t("sections.bundles", lang)}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {bundles.map((b) => {
              // SHOP-008 fix: use first product's photo instead of emoji (user's #1 rule).
              const firstProductImage = b.items?.find((it: any) => it.product?.images?.[0]?.url)?.product?.images?.[0]?.url;
              return (
              <div key={b.id} className="bg-white rounded-2xl border border-pink-100 overflow-hidden hover:shadow-lg transition-all">
                <div className="aspect-video bg-gradient-to-br from-pink-100 to-purple-100 grid place-items-center overflow-hidden">
                  {firstProductImage ? (
                    <img src={firstProductImage} alt={b.nameEn} className="w-full h-full object-cover" />
                  ) : (
                    <Gift size={48} className="text-pink-400" />
                  )}
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="font-bold text-pink-900 text-lg" style={{ fontFamily: "var(--font-playfair)" }}>{lang === "rw" ? b.nameRw || b.nameEn : lang === "fr" ? b.nameFr || b.nameEn : b.nameEn}</h3>
                  <p className="text-sm text-muted-foreground">{lang === "rw" ? b.descRw || b.descEn || "" : lang === "fr" ? b.descFr || b.descEn || "" : b.descEn || ""}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-pink-700">{formatPrice(b.bundlePrice, currency)}</span>
                    <span className="text-sm text-muted-foreground line-through">{formatPrice(b.normalPrice, currency)}</span>
                    <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-bold">-{b.savingsPct}%</span>
                  </div>
                  <Button className="w-full bg-pink-600 hover:bg-pink-700 h-10" onClick={() => {
                    if (b.items && b.items.length > 0) {
                      b.items.forEach((item: any) => {
                        if (item.product) {
                          const prod = item.product;
                          // SHOP-020 fix: respect BundleItem.qty (was always 1).
                          const bundleQty = item.qty || 1;
                          const perItemPrice = Math.round(b.bundlePrice / b.items.length);
                          useCart.getState().add({ id: prod.id, priceTTC: perItemPrice, name: pickLang(prod, lang), image: prod?.images?.[0]?.url }, bundleQty);
                        }
                      });
                    } else {
                      useCart.getState().add({ id: b.id, priceTTC: b.bundlePrice, name: lang === "rw" ? b.nameRw || b.nameEn : lang === "fr" ? b.nameFr || b.nameEn : b.nameEn, image: firstProductImage });
                    }
                    setCartOpen(true);
                  }}>{t("bundle.addToCart", lang)}</Button>
                </div>
              </div>
              );
            })}
          </div>
        </section>
      )}

      {/* SERVICES */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:py-12 lg:py-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-pink-900 mb-5 sm:mb-6 text-center" style={{ fontFamily: "var(--font-playfair)" }}>{t("sections.quickServices", lang)}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <button onClick={() => setTrackOpen(true)} className="bg-white rounded-2xl border border-pink-100 p-4 sm:p-6 hover:shadow-lg hover:border-pink-300 transition-all text-center">
            <div className="text-4xl sm:text-5xl mb-2">📦</div><div className="font-semibold text-sm sm:text-base text-pink-800">{t("services.trackOrder", lang)}</div><div className="text-xs sm:text-sm text-muted-foreground mt-0.5">{t("services.trackOrderDesc", lang)}</div>
          </button>
          <button onClick={() => setPortalOpen(true)} className="bg-white rounded-2xl border border-pink-100 p-4 sm:p-6 hover:shadow-lg hover:border-pink-300 transition-all text-center">
            <div className="text-4xl sm:text-5xl mb-2">👤</div><div className="font-semibold text-sm sm:text-base text-pink-800">{t("services.myAccount", lang)}</div><div className="text-xs sm:text-sm text-muted-foreground mt-0.5">{t("services.myAccountDesc", lang)}</div>
          </button>
          <button onClick={() => setBookingOpen(true)} className="bg-white rounded-2xl border border-pink-100 p-4 sm:p-6 hover:shadow-lg hover:border-pink-300 transition-all text-center">
            <div className="text-4xl sm:text-5xl mb-2">📅</div><div className="font-semibold text-sm sm:text-base text-pink-800">{t("services.book", lang)}</div><div className="text-xs sm:text-sm text-muted-foreground mt-0.5">{t("services.bookDesc", lang)}</div>
          </button>
          <button onClick={() => setWholesaleOpen(true)} className="bg-white rounded-2xl border border-pink-100 p-4 sm:p-6 hover:shadow-lg hover:border-pink-300 transition-all text-center">
            <div className="text-4xl sm:text-5xl mb-2">🏢</div><div className="font-semibold text-sm sm:text-base text-pink-800">{t("services.wholesale", lang)}</div><div className="text-xs sm:text-sm text-muted-foreground mt-0.5">{t("services.wholesaleDesc", lang)}</div>
          </button>
        </div>
      </section>

      {/* TESTIMONIALS */}
      {testimonials.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-pink-900 mb-5 sm:mb-6 text-center" style={{ fontFamily: "var(--font-playfair)" }}>💬 {t("sections.testimonials", lang)}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {testimonials.map((tm) => (
              <div key={tm.id} className="bg-white rounded-2xl border border-pink-100 p-4 sm:p-6 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 grid place-items-center text-white font-bold">{tm.customerName.charAt(0)}</div>
                  <div><div className="font-semibold text-sm">{tm.customerName}</div><div className="text-xs text-muted-foreground">{tm.district}</div></div>
                </div>
                <div className="flex gap-0.5">{[1,2,3,4,5].map(n => <Star key={n} size={14} className={n <= tm.rating ? "text-amber-500 fill-amber-500" : "text-gray-300"} />)}</div>
                <p className="text-sm text-foreground/80 italic">"{tm.messageEn}"</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ABOUT */}
      <section ref={aboutRef} className="mx-auto max-w-7xl px-3 sm:px-4 py-8 sm:py-16">
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 items-center">
          <div className="space-y-4">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-pink-900" style={{ fontFamily: "var(--font-playfair)" }}>
              {SHOP_NAME}
            </h2>
            <p className="text-sm sm:text-base text-pink-800/80 leading-relaxed">
              {t("footer.about", lang)}
            </p>
            <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-2">
              <div className="bg-pink-50 rounded-xl p-2 sm:p-3 text-center">
                <div className="text-2xl font-bold text-pink-700">2,400+</div>
                <div className="text-xs text-muted-foreground">Happy customers</div>
              </div>
              <div className="bg-purple-50 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-purple-700">500+</div>
                <div className="text-xs text-muted-foreground">Products</div>
              </div>
              <div className="bg-green-50 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-green-700">30</div>
                <div className="text-xs text-muted-foreground">Districts</div>
              </div>
            </div>
          </div>
          <div className="relative aspect-video rounded-3xl bg-gradient-to-br from-pink-200 via-purple-100 to-pink-100 grid place-items-center overflow-hidden">
            {logoUrl ? (
              <img src={logoUrl} alt="Samuel Cosmetic Shop" className="w-32 h-32 rounded-full object-cover shadow-lg" />
            ) : (
              <div className="text-9xl">{logoEmoji}</div>
            )}
            <div className="absolute bottom-4 left-4 right-4 bg-white/80 backdrop-blur rounded-xl p-3 text-sm">
              <div className="font-semibold text-pink-800">{SHOP_LOCATION}</div>
              <div className="text-xs text-muted-foreground">Serving all 30 districts of Rwanda</div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section ref={contactRef} className="mx-auto max-w-7xl px-3 sm:px-4 py-8 sm:py-16">
        <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-pink-100 p-4 sm:p-6 space-y-4">
            <h3 className="text-xl sm:text-2xl font-bold text-pink-900" style={{ fontFamily: "var(--font-playfair)" }}>
              {t("footer.contact", lang)}
            </h3>
            <div className="space-y-2 sm:space-y-3">
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl bg-green-50 hover:bg-green-100 transition-colors"
              >
                <WhatsAppIcon size={20} className="text-[#25D366] shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs text-muted-foreground">WhatsApp</div>
                  <div className="font-semibold">+250 790 215 965</div>
                </div>
              </a>
              <a
                href={`mailto:${SHOP_EMAIL}`}
                className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl bg-pink-50 hover:bg-pink-100 transition-colors"
              >
                <Mail size={20} className="text-pink-600 shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs text-muted-foreground">Email</div>
                  <div className="font-semibold text-sm break-all">{SHOP_EMAIL}</div>
                </div>
              </a>
              <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl bg-purple-50">
                <MapPin size={20} className="text-purple-600 shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs text-muted-foreground">Address</div>
                  <div className="font-semibold text-sm">{SHOP_LOCATION}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl bg-amber-50">
                <Clock size={20} className="text-amber-600 shrink-0" />
                <div>
                  <div className="text-xs text-muted-foreground">{t("footer.hours", lang)}</div>
                  <div className="font-semibold">Mon–Sat: 8AM – 8PM</div>
                </div>
              </div>
            </div>
          </div>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const data = new FormData(form);
              await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  name: data.get("name"),
                  phone: data.get("phone"),
                  email: data.get("email"),
                  subject: data.get("subject") || "General",
                  message: data.get("message"),
                }),
              });
              form.reset();
              alert("Message sent! We will reply on WhatsApp.");
            }}
            className="bg-white rounded-2xl sm:rounded-3xl border border-pink-100 p-4 sm:p-6 space-y-3"
          >
            <h3 className="text-xl sm:text-2xl font-bold text-pink-900" style={{ fontFamily: "var(--font-playfair)" }}>
              Send us a message
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <Input name="name" placeholder={t("checkout.name", lang)} required className="h-11 bg-pink-50/50 border-pink-100" />
              <Input name="phone" placeholder={t("checkout.phone", lang)} required className="h-11 bg-pink-50/50 border-pink-100" />
            </div>
            <Input name="email" type="email" placeholder={t("checkout.email", lang)} className="h-11 bg-pink-50/50 border-pink-100" />
            <Input name="subject" placeholder="Subject" className="h-11 bg-pink-50/50 border-pink-100" />
            <textarea
              name="message"
              placeholder="Your message..."
              required
              rows={4}
              className="w-full rounded-md border border-pink-100 bg-pink-50/50 p-3 text-sm"
            />
            <Button type="submit" className="w-full h-11 bg-pink-600 hover:bg-pink-700">
              Send Message
            </Button>
          </form>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-auto bg-pink-900 text-pink-50">
        <div className="mx-auto max-w-7xl px-3 sm:px-4 py-8 sm:py-10 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-9 h-9 rounded-full object-cover" />
              ) : (
                <span className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-300 to-pink-500 grid place-items-center text-lg">
                  {logoEmoji}
                </span>
              )}
              <span className="font-bold text-lg" style={{ fontFamily: "var(--font-playfair)" }}>
                Samuel Cosmetic
              </span>
            </div>
            <p className="text-sm text-pink-200">{t("footer.about", lang)}</p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">{t("footer.contact", lang)}</h4>
            <ul className="space-y-1 text-sm text-pink-200">
              <li>+250 790 215 965</li>
              <li>{SHOP_EMAIL}</li>
              <li>{SHOP_LOCATION}</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">{t("footer.hours", lang)}</h4>
            <ul className="space-y-1 text-sm text-pink-200">
              <li>Mon–Fri: 8AM – 8PM</li>
              <li>Sat: 9AM – 7PM</li>
              <li>Sun: Closed</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">{t("footer.follow", lang)}</h4>
            <div className="flex gap-2">
              <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="w-10 h-10 grid place-items-center rounded-full bg-[#25D366] hover:bg-[#1ebe5d] transition-colors">
                <WhatsAppIcon size={18} />
              </a>
              <a href={`mailto:${SHOP_EMAIL}`} className="w-10 h-10 grid place-items-center rounded-full bg-pink-700 hover:bg-pink-600 transition-colors">
                <Mail size={18} />
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-pink-800 py-4 text-center text-xs text-pink-300">
          © {new Date().getFullYear()} {SHOP_NAME} · TIN: 102345678 · {t("footer.rights", lang)}
        </div>
      </footer>

      {/* Floating WhatsApp */}
      <a
        href={WHATSAPP_LINK}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#1ebe5d] text-white grid place-items-center shadow-xl wa-pulse"
        aria-label="WhatsApp us"
      >
        <WhatsAppIcon size={28} />
      </a>

      {/* Back to top */}
      <BackToTop />

      {/* Mobile bottom nav */}
      <MobileBottomNav
        onHome={() => handleNav("home")}
        onShop={() => handleNav("shop")}
        onCart={() => setCartOpen(true)}
      />

      <CartDrawer />

      {/* Lazy modals */}
      {quickView && <QuickViewModal product={quickView} onClose={() => setQuickView(null)} />}
      {trackOpen && <OrderTrackingModal onClose={() => setTrackOpen(false)} />}
      {portalOpen && <CustomerPortalModal onClose={() => setPortalOpen(false)} />}
      {bookingOpen && <BookingModal onClose={() => setBookingOpen(false)} />}
      {wholesaleOpen && <WholesaleModal onClose={() => setWholesaleOpen(false)} />}
      {photoSearchOpen && <PhotoSearchModal onClose={() => setPhotoSearchOpen(false)} onMatch={(hint) => { setActiveCat(hint); shopRef.current?.scrollIntoView({ behavior: "smooth" }); }} />}
      <WishlistCompareBar />
    </div>
  );
}

function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 300);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  if (!show) return null;
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-36 sm:bottom-6 right-4 sm:left-6 sm:right-auto z-40 w-10 h-10 rounded-full bg-pink-600 text-white grid place-items-center shadow-lg hover:bg-pink-700"
      aria-label="Back to top"
    >
      <ArrowUp size={18} />
    </button>
  );
}

function MobileBottomNav({
  onHome,
  onShop,
  onCart,
}: {
  onHome: () => void;
  onShop: () => void;
  onCart: () => void;
}) {
  const { lang } = useUI();
  const cartItems = useCartItems();
  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-pink-100 grid grid-cols-4 backdrop-blur-xl" style={{ height: "calc(3.75rem + env(safe-area-inset-bottom))", paddingBottom: "env(safe-area-inset-bottom)" }}>
      <button onClick={onHome} className="flex flex-col items-center justify-center text-[10px] text-pink-700">
        🏠 {t("nav.home", lang)}
      </button>
      <button onClick={onShop} className="flex flex-col items-center justify-center text-[10px] text-pink-700">
        🛍️ {t("nav.shop", lang)}
      </button>
      <button onClick={onCart} className="flex flex-col items-center justify-center text-[10px] text-pink-700 relative">
        🛒 {t("nav.cart", lang)}
        {cartItems > 0 && (
          <span className="absolute top-1 right-4 min-w-4 h-4 px-1 rounded-full bg-pink-600 text-white text-[9px] grid place-items-center">
            {cartItems}
          </span>
        )}
      </button>
      <a
        href={WHATSAPP_LINK}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col items-center justify-center text-[10px] text-[#25D366]"
      >
        💬 WhatsApp
      </a>
    </nav>
  );
}

// Tiny hook to subscribe to cart count
function useCartItems() {
  return useCart((s) => s.items.reduce((a, i) => a + i.qty, 0));
}
