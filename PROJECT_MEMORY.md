# PROJECT_MEMORY.md — Samuel Cosmetic Shop

**Last Updated:** June 28, 2026
**Maintained by:** Project Memory Manager
**Source of Truth:** This document + the repository itself. If code changes, update this file.

---

## 1. Project Objective

Samuel Cosmetic Shop is a full-stack e-commerce web application for a cosmetics retailer based in Kigali, Rwanda. The platform serves three user roles:

1. **Retail customers** — browse products, search, add to cart, place orders via WhatsApp/MoMo/Airtel/Cash, track orders, write reviews, book appointments, subscribe to alerts.
2. **Wholesale buyers** — register with TIN, get approved by admin, see wholesale pricing automatically, place bulk orders.
3. **Admin & Staff** — manage products, categories, orders, customers, inventory, coupons, bundles, flash sales, bookings, wholesale applications, messages, subscribers, testimonials, staff, branding, notifications, VAT reports, site health.

The app is **RRA-compliant** (Rwanda Revenue Authority) with 18% VAT calculation and EBM-compatible receipt generation (MRC codes, receipt numbers).

**Default language:** Kinyarwanda (rw). Also supports English (en) and French (fr).

---

## 2. Current Architecture

| Layer | Technology | Notes |
|-------|-----------|-------|
| **Frontend** | Next.js 16.1.1 + React 19 + TypeScript 5 | App Router, Turbopack dev |
| **Styling** | Tailwind CSS 4 + shadcn/ui (48 components) | Pink/purple theme, Playfair Display + Poppins fonts |
| **State** | Zustand 5 (persisted to localStorage) | UI store, Cart, Wishlist, Compare, RecentlyViewed |
| **Database** | Prisma 6.11 ORM | SQLite (local dev) / PostgreSQL via Supabase (production) |
| **Auth** | bcryptjs + HMAC-SHA256 tokens (custom, no NextAuth) | 24h TTL, route-level `checkAuth()` |
| **Image Storage** | Cloudinary (live) | Local filesystem fallback if creds missing |
| **Payments** | MTN MoMo + Airtel Money | Simulated mode (APIs not fully connected) |
| **Messaging** | WhatsApp Business Cloud API | Code ready, not connected; wa.me links work |
| **Charts** | Recharts 2.15 | Admin dashboard analytics |
| **Icons** | lucide-react 0.525 | No emoji in product displays (user rule) |
| **Package Manager** | Bun | `bun install`, `bun run build` |
| **Deployment** | Vercel (fra1 region) | Auto-deploy from GitHub `main` branch |

### Key Architectural Decisions

- **No Edge Middleware:** Auth is route-level (`checkAuth(req)` in each API handler) because Node.js `crypto` module is incompatible with Edge Runtime. The old `middleware.ts` was renamed to `middleware.ts.bak`.
- **Dynamic Prisma Provider:** `scripts/set-provider.js` runs before every build to switch the Prisma schema between `sqlite` (local) and `postgresql` (Vercel) based on `DATABASE_URL` prefix.
- **Single PrismaClient:** `src/lib/db.ts` exports one shared instance to avoid exhausting Supabase's 15-connection pool limit.
- **In-memory Cache:** `src/lib/cache.ts` provides a `Map`-based cache with TTL. On Vercel serverless, each instance has its own cache (not shared). `bustCache()` clears the local map + HTTP `s-maxage` headers are set via `withCache()`.
- **Token Format:** `base64url(payload).base64url(hmac_sig)` — not JWT standard, but functionally equivalent. Payload contains `{id, type, role, iat}`.

---

## 3. Folder Structure

```
samuel-cosmetic-shop/
├── prisma/
│   └── schema.prisma              # 32 models, dynamic provider
├── scripts/
│   ├── set-provider.js            # Switches sqlite↔postgresql before build
│   ├── seed.ts                    # Database seed script
│   └── fix-admin-auth.py          # One-off: added checkAuth to 16 routes
├── src/
│   ├── app/
│   │   ├── layout.tsx             # Root layout, fonts, JSON-LD, Toaster
│   │   ├── page.tsx               # Entry point: switches storefront/admin
│   │   ├── globals.css            # Tailwind imports + custom styles
│   │   ├── global-error.tsx       # Error boundary
│   │   ├── sitemap.xml/route.ts   # SEO sitemap
│   │   └── api/                   # 72 API route files (see §6)
│   ├── components/
│   │   ├── shop/                  # 9 storefront components
│   │   │   ├── storefront.tsx     # Main storefront (832 lines)
│   │   │   ├── header.tsx         # Sticky header, search, nav, lang/currency switch
│   │   │   ├── product-card.tsx   # Product card with photo, pricing, add-to-cart
│   │   │   ├── cart-drawer.tsx    # Cart + 4-step checkout (745 lines)
│   │   │   ├── quick-view-modal.tsx # Product detail modal with reviews
│   │   │   ├── modals.tsx         # Order tracking, customer portal, booking, wholesale
│   │   │   ├── photo-search.tsx   # Color-based photo search
│   │   │   ├── wishlist-compare-bar.tsx # Wishlist + compare dialogs
│   │   │   └── star-rating.tsx    # Star rating display
│   │   ├── admin/                 # 3 admin components
│   │   │   ├── app.tsx            # Admin shell + 4 views (1313 lines)
│   │   │   ├── views-extra.tsx    # 16 additional admin views (531 lines)
│   │   │   └── login.tsx          # Admin/staff login form
│   │   ├── ui/                    # 48 shadcn/ui components
│   │   └── whatsapp-icon.tsx      # WhatsApp SVG icon
│   ├── lib/
│   │   ├── db.ts                  # PrismaClient singleton
│   │   ├── auth.ts                # bcrypt hash/verify + legacy hash migration
│   │   ├── session.ts             # Token issue/verify (HMAC-SHA256)
│   │   ├── route-auth.ts          # checkAuth() for API routes
│   │   ├── store.ts               # Zustand stores (UI, Cart, Wishlist, Compare, RecentlyViewed)
│   │   ├── i18n.ts                # 482 lines of rw/en/fr translations
│   │   ├── format.ts              # Currency, VAT, price calculations, order numbers, MRC
│   │   ├── cache.ts               # In-memory cache + HTTP cache headers
│   │   ├── cloudinary.ts          # Cloudinary config + upload helper
│   │   ├── whatsapp.ts            # WhatsApp URL builders + order message template
│   │   ├── whatsapp-api.ts        # WhatsApp Business Cloud API (not connected)
│   │   └── utils.ts               # cn() className helper
│   ├── hooks/
│   │   ├── use-toast.ts           # Toast hook
│   │   └── use-mobile.ts          # Mobile detection hook
│   └── middleware.ts.bak          # Disabled (Edge Runtime incompatible)
├── public/
│   ├── logo.svg
│   └── uploads/                   # Local image fallback
├── .env                           # Local env (gitignored)
├── .gitignore
├── next.config.ts                 # Next.js 16 config
├── package.json
├── tsconfig.json
├── vercel.json                    # fra1 region, bun build
├── MEMORY.md                      # Permanent project memory (104 bugs logged)
├── worklog.md                     Multi-agent work log
└── PROJECT_MEMORY.md              # THIS FILE
```

---

## 4. Features Completed

### Storefront (Main Website)
- [x] Product grid with category filter, live debounced search, sort (newest/price/rating/popular)
- [x] Product cards with photos (no emoji), badges (bestseller/new/hot/popular), stock indicators
- [x] Quick View modal with image gallery, wholesale pricing, reviews, price alerts, wishlist, compare
- [x] Cart drawer with 4-step checkout (review → delivery → payment → confirm → success)
- [x] Order placement via WhatsApp / MTN MoMo / Airtel Money / Cash on Delivery
- [x] EBM receipt generation (MRC code, receipt number, VAT breakdown)
- [x] Stock validation (prevents negative stock)
- [x] Coupon validation and discount (applies to subtotal only, not delivery)
- [x] Delivery zone selection with fee calculation
- [x] Wholesale pricing (approved buyers see wholesalePrice automatically)
- [x] Order tracking by phone number
- [x] Customer portal (loyalty points, tier, order history)
- [x] Booking system (service appointments)
- [x] Wholesale registration + login (TIN-based)
- [x] Photo search (color-based category matching)
- [x] Wishlist + Compare (max 3) with product photos
- [x] Flash sale banner
- [x] Product bundles with savings calculation
- [x] Testimonials section
- [x] Contact form
- [x] Language switch (rw/en/fr) with persisted preference
- [x] Currency switch (RWF/USD/EUR/KES/UGX) with hardcoded rates
- [x] WhatsApp floating button + header link
- [x] SEO: JSON-LD Schema.org, sitemap.xml, OpenGraph metadata
- [x] Mobile responsive (hamburger menu, horizontal scroll admin tabs)

### Admin Panel (20 tabs)
- [x] **Dashboard** — KPIs (revenue, orders, products, low stock), revenue chart, orders by district, top products, low stock alerts, order status pie
- [x] **Products** — CRUD, photo upload (max 5 images via Cloudinary), SKU auto-generation, cost/sell/wholesale prices, stock, low-stock threshold, badges
- [x] **Orders** — list, filter by status, update status, notify customer via WhatsApp, EBM receipt modal
- [x] **Customers** — list, search, adjust loyalty points, view order history
- [x] **Reviews** — approve/reject/hide/delete/reply, recalc product rating
- [x] **Inventory** — stock levels, OUT/LOW badges, total value, stock adjustment with reason logging
- [x] **Coupons** — CRUD, percent/fixed, min order, max uses, expiry
- [x] **Bundles** — CRUD, product selection, savings calculation
- [x] **Flash Sales** — CRUD, time window, discount, banner color
- [x] **Bookings** — list, confirm/cancel status update
- [x] **Wholesale** — approve/reject/suspend applications, TIN verification
- [x] **Messages** — contact messages, mark read, WhatsApp reply to customer
- [x] **Subscribers** — list, toggle active, broadcast message, CSV export
- [x] **Testimonials** — approve/delete
- [x] **Staff** — CRUD, role (sales/inventory/viewer/custom), permissions, toggle active
- [x] **Branding** — logo photo upload, shop name, tagline, WhatsApp number, colors, feature toggles
- [x] **Notifications** — admin notifications, mark all read
- [x] **VAT Report** — monthly RRA-compliant report, TVA Collectée/Déductible/Nette
- [x] **Site Health** — database connectivity, API status, cache stats
- [x] **Categories** — CRUD, multi-language names, slug, sort order, active toggle

### Security & Auth
- [x] Route-level authentication on all 49 admin API routes (16 GET routes were fixed in Round 14)
- [x] bcrypt password hashing with legacy hash migration
- [x] HMAC-SHA256 signed tokens with 24h TTL
- [x] Staff passwordHash stripped from API responses
- [x] Seed route protected (was public — critical security fix)
- [x] Stock validation before order placement (prevents overselling)

---

## 5. Features Remaining

### Not Yet Implemented / Partial
- [ ] **MTN MoMo Collection API** — subscription keys obtained, but API User/Key not generated. Currently simulated.
- [ ] **Airtel Money API** — developer account not created. Currently simulated.
- [ ] **WhatsApp Business Cloud API** — code is ready (`whatsapp-api.ts`), but no Meta app created. Currently uses wa.me links only.
- [ ] **Server-side permission enforcement** — staff permissions are checked client-side (UI hides tabs), but API routes only verify token validity, not specific permissions. Any staff token can call any admin endpoint.
- [ ] **Order payment confirmation webhooks** — MoMo/Airtel callback routes exist but are not wired to real payment gateways.
- [ ] **Price alert notifications** — alerts are stored in DB but no cron job sends notifications when price drops.
- [ ] **Abandoned cart recovery** — not implemented.
- [ ] **Email notifications** — no email service configured.
- [ ] **Product reviews photos** — Review schema has `images` field but upload UI not built.
- [ ] **Bundle photo upload** — bundles use first product's photo as fallback; no dedicated bundle image upload.
- [ ] **Advanced analytics** — no cohort analysis, no conversion funnel, no A/B testing.
- [ ] **Multi-currency real rates** — rates are hardcoded in `format.ts`; no live exchange rate API.

### Technical Debt
- [ ] In-memory cache (`cache.ts`) is per-instance on Vercel serverless — should migrate to Vercel KV / Upstash Redis for shared cache.
- [ ] `SESSION_SECRET` falls back to a public dev secret if env var is missing — should throw in production.
- [ ] `/api/orders?phone=X` and `/api/customers/lookup?phone=X` expose PII without verification — should require SMS OTP or signed token.
- [ ] Many admin views still have hardcoded English strings (dashboard chart titles, ProductForm labels, OrderDetailModal). i18n coverage is ~85%.
- [ ] `next.config.ts` has `typescript.ignoreBuildErrors: true` — should be removed once all types are clean (currently 0 errors in project source).

---

## 6. Database Schema

**32 Prisma models** (see `prisma/schema.prisma`):

| Model | Purpose | Key Fields |
|-------|---------|------------|
| `AdminUser` | Admin accounts | username (unique), passwordHash, isActive |
| `StaffAccount` | Staff accounts | username, passwordHash, role, permissions (JSON string) |
| `Category` | Product categories | id (string, manual), nameEn/Fr/Rw, slug, sortOrder |
| `Product` | Products | id (string, manual), nameEn/Fr/Rw, descEn/Fr/Rw, categoryId, sku, costPrice, sellingPrice, wholesalePrice, moq, stockQty, lowStockThreshold, badge, ratingAvg, ratingCount, salesCount, tier1/2/3Discount |
| `ProductImage` | Product photos | productId, url, isPrimary, sortOrder |
| `Customer` | Customers | phone (unique), loyaltyPoints, totalSpent, tier (bronze/silver/gold) |
| `LoyaltyTransaction` | Points history | customerId, type (earn/redeem), points, balance, orderId |
| `Order` | Orders | orderNumber (unique), customerName/Phone/Email, district, subtotalHT, vatAmount, deliveryFee, discount, totalTTC, paymentMethod, paymentStatus, status, mrcCode, receiptNumber, isWholesale, itemsJson |
| `DeliveryZone` | Delivery zones | district, province, fee, etaHours |
| `Coupon` | Discount coupons | code (unique), type (percent/fixed), value, minOrder, maxUses, expiresAt |
| `FlashSale` | Flash sales | titleEn/Fr/Rw, discountType, discountValue, startTime, endTime, bannerColor |
| `FlashSaleItem` | Products in flash sale | flashSaleId, productId |
| `Bundle` | Product bundles | nameEn/Fr/Rw, normalPrice, bundlePrice, savingsPct, emoji |
| `BundleItem` | Products in bundle | bundleId, productId, qty |
| `Review` | Product reviews | productId, customerName, rating, title, body, isApproved, isHidden, adminReply |
| `Booking` | Appointments | customerName/Phone, service, date, timeSlot, status |
| `WholesaleUser` | Wholesale buyers | businessName, ownerName, tin (unique), status (pending/approved/rejected/suspended), passwordHash |
| `Subscriber` | SMS/WhatsApp subscribers | phone (unique), source, isActive |
| `PriceAlert` | Price drop alerts | productId, customerPhone, targetPrice, notified |
| `WhatsAppTemplate` | Message templates | key (unique), message, category |
| `NotificationLog` | Notification history | recipientPhone, type, templateKey, status |
| `AdminNotification` | Admin in-app notifications | type, title, body, isRead |
| `MoMoTransaction` | MoMo payment records | phoneNumber, amount, status, providerRef |
| `StockAdjustment` | Stock change audit | productId, oldQty, newQty, delta, reason |
| `PageView` | Analytics | path, referrer, userAgent, ip, sessionId |
| `AuditLog` | Admin action audit | adminId/staffId, action, modelName, objectId |
| `ContactMessage` | Contact form | name, phone, email, subject, message, isRead |
| `Testimonial` | Customer testimonials | customerName, district, messageEn/Fr/Rw, rating, isApproved |
| `SiteSetting` | Singleton site config | shopName, logoUrl, whatsappNumber, tin, sdcId, vatRate, feature toggles |
| `SiteContent` | Dynamic content blocks | key (unique), valueEn/Fr/Rw |
| `AutoReplyTemplate` | WhatsApp auto-replies | trigger (unique), replyEn/Fr/Rw |
| `BlockedDate` | Booking blackout dates | date, reason |

**Provider:** Dynamically set to `sqlite` (local) or `postgresql` (Vercel/Supabase) by `scripts/set-provider.js`.

---

## 7. API Routes

**72 API route files** total. All admin routes use `checkAuth(req)` for authentication.

### Public API (no auth required)
| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/products` | List products (filter by category, search, sort). Cached 300s. |
| GET | `/api/products/[id]` | Single product detail |
| GET | `/api/products/featured` | Top 8 featured products. Cached 120s. |
| GET/POST | `/api/products/[id]/reviews` | Get/post product reviews |
| GET | `/api/categories` | All active categories |
| GET | `/api/bundles` | All active bundles |
| GET | `/api/testimonials` | Approved testimonials |
| GET | `/api/flash-sales` | Active flash sales |
| GET | `/api/settings` | Public site settings (singleton) |
| GET | `/api/delivery-zones` | Active delivery zones |
| GET/POST | `/api/orders` | List orders by phone / Create new order |
| GET | `/api/orders/track` | Track order by phone |
| POST | `/api/contact` | Submit contact form |
| GET/POST | `/api/bookings` | List/Create bookings |
| POST | `/api/wholesale/register` | Wholesale buyer registration |
| POST | `/api/wholesale/login` | Wholesale login (TIN + password) |
| POST | `/api/coupon/validate` | Validate coupon code |
| GET | `/api/customers/lookup` | Customer lookup by phone (PII exposure risk) |
| POST | `/api/price-alerts` | Create price alert |
| POST | `/api/payments/momo/initiate` | Initiate MoMo payment (simulated) |
| POST | `/api/payments/airtel/initiate` | Initiate Airtel payment (simulated) |
| GET | `/api/payments/momo/[id]` | Check MoMo transaction status |
| GET | `/api/payments/transactions` | List payment transactions (should be admin-only) |
| GET/POST | `/api/whatsapp/webhook` | WhatsApp webhook (verify + receive) |
| GET | `/api/seed` | Seed database (admin-only, fixed in Round 14) |
| GET | `/api/route` | Health check |

### Admin API (requires `x-admin-token` header or `Authorization: Bearer`)
| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/admin/login` | Admin/staff login, returns HMAC token |
| GET | `/api/admin/analytics` | Dashboard analytics |
| GET/POST | `/api/admin/products` | List/Create products |
| GET/PUT/DELETE | `/api/admin/products/[id]` | Product CRUD |
| POST/DELETE | `/api/admin/products/[id]/images` | Product image upload/delete (Cloudinary) |
| GET | `/api/admin/orders` | List all orders |
| GET/PATCH | `/api/admin/orders/[id]` | Order detail / update status |
| GET | `/api/admin/customers` | List customers |
| POST | `/api/admin/customers/[id]/points` | Adjust loyalty points |
| GET/PATCH | `/api/admin/reviews` | List reviews / approve/reject/hide/delete/reply |
| GET | `/api/admin/inventory` | Stock levels |
| POST | `/api/admin/inventory/adjust` | Stock adjustment |
| GET/POST | `/api/admin/coupons` | Coupon CRUD |
| PUT/DELETE | `/api/admin/coupons/[id]` | Coupon update/delete |
| GET/POST | `/api/admin/bundles` | Bundle CRUD |
| PUT/DELETE | `/api/admin/bundles/[id]` | Bundle update/delete |
| GET/POST | `/api/admin/flash-sales` | Flash sale CRUD |
| PUT/DELETE | `/api/admin/flash-sales/[id]` | Flash sale update/delete |
| GET | `/api/admin/bookings` | List bookings |
| PATCH | `/api/admin/bookings/[id]` | Update booking status |
| GET | `/api/admin/wholesale` | List wholesale applications |
| PATCH | `/api/admin/wholesale/[id]/approve` | Approve wholesale |
| PATCH | `/api/admin/wholesale/[id]/reject` | Reject wholesale |
| PATCH | `/api/admin/wholesale/[id]/suspend` | Suspend wholesale |
| GET | `/api/admin/messages` | List contact messages |
| PATCH | `/api/admin/messages/[id]/read` | Mark message read |
| DELETE | `/api/admin/messages/[id]` | Delete message |
| GET | `/api/admin/subscribers` | List subscribers |
| PATCH | `/api/admin/subscribers/[id]/toggle` | Toggle subscriber |
| POST | `/api/admin/broadcast` | Broadcast to subscribers |
| GET | `/api/admin/testimonials` | List testimonials |
| PATCH | `/api/admin/testimonials/[id]/approve` | Approve testimonial |
| DELETE | `/api/admin/testimonials/[id]` | Delete testimonial |
| GET/POST | `/api/admin/staff` | List/Create staff |
| PUT/DELETE | `/api/admin/staff/[id]` | Staff update/delete |
| PATCH | `/api/admin/staff/[id]/toggle` | Toggle staff active |
| GET/POST | `/api/admin/categories` | Category CRUD |
| PUT/DELETE | `/api/admin/categories/[id]` | Category update/delete |
| GET/PUT | `/api/admin/branding` | Get/Update site settings |
| GET/PUT/DELETE | `/api/admin/content` | Site content blocks |
| GET/PUT/DELETE | `/api/admin/ebm` | EBM config |
| GET | `/api/admin/notifications` | List admin notifications |
| PATCH | `/api/admin/notifications/mark-all-read` | Mark all read |
| POST | `/api/admin/upload` | Generic image upload (Cloudinary + local fallback) |
| GET | `/api/admin/vat-report` | Monthly VAT report |
| GET | `/api/admin/site-health` | System health check |

---

## 8. UI Structure

### Storefront Component Tree
```
<page.tsx>
  └── <Storefront> (storefront.tsx)
      ├── <ShopHeader> (header.tsx) — sticky, search, lang/currency, cart badge, nav
      ├── HERO section — title, CTA buttons, trust badges, visual tiles
      ├── FLASH SALE BANNER — conditional (active flash sale)
      ├── CATEGORIES section — category buttons
      ├── SHOP section — product grid, filter pills, sort, photo search
      │   ├── Search results indicator (conditional)
      │   └── <ProductCard> × N (product-card.tsx)
      ├── FEATURED PRODUCTS — conditional (hidden when search/category active)
      ├── BUNDLES — conditional (hidden when search active)
      ├── QUICK SERVICES — 4 service buttons
      ├── TESTIMONIALS — conditional
      ├── ABOUT section
      ├── CONTACT section — form + info
      ├── FOOTER
      ├── <CartDrawer> (cart-drawer.tsx) — slide-out, 4-step checkout
      ├── <QuickViewModal> (quick-view-modal.tsx)
      ├── <OrderTrackingModal> (modals.tsx)
      ├── <CustomerPortalModal> (modals.tsx)
      ├── <BookingModal> (modals.tsx)
      ├── <WholesaleModal> (modals.tsx)
      ├── <PhotoSearchModal> (photo-search.tsx)
      └── <WishlistCompareBar> (wishlist-compare-bar.tsx)
```

### Admin Component Tree
```
<page.tsx>
  └── <AdminApp> (app.tsx)
      ├── Sidebar (desktop) — 20 nav items with permission filtering
      ├── Mobile header — logo, logout
      ├── Mobile nav — horizontal scroll, all 20 tabs
      └── Main content — switches on `view` state:
          ├── <DashboardView> — KPIs, charts, low stock
          ├── <ProductsView> — table, ProductForm, ProductImageManager
          ├── <OrdersView> — table, status filter, OrderDetailModal (EBM receipt)
          ├── <CustomersView> — table, CustomerModal (points adjustment)
          ├── <ReviewsView> — table, approve/reject/reply
          ├── <StockView> — inventory grid
          ├── <CouponsView> — table, CouponForm
          ├── <BundlesView> — table, BundleForm
          ├── <FlashSalesView> — table, FlashSaleForm
          ├── <BookingsView> — table, status update
          ├── <WholesaleAdminView> — cards, approve/reject/suspend
          ├── <MessagesView> — list, reply dialog
          ├── <SubscribersView> — table, broadcast, CSV export
          ├── <TestimonialsView> — table, approve/delete
          ├── <StaffView> — table, StaffForm
          ├── <BrandingView> — logo upload, settings form
          ├── <NotificationsView> — list, mark all read
          ├── <VatView> — monthly report table
          ├── <SiteHealthView> — status cards
          └── <CategoriesView> — table, CategoryForm
```

---

## 9. Third-Party Integrations

| Service | Status | Env Vars | Notes |
|---------|--------|----------|-------|
| **Supabase (PostgreSQL)** | LIVE | `DATABASE_URL` | eu-central-1 (Frankfurt), free tier, 15 connection limit, PgBouncer pooling |
| **Cloudinary** | LIVE | `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Image storage, 800px limit, auto quality, free tier (25GB) |
| **GitHub** | LIVE | — | Repo: `TuyishimireElissa/samuel-cosmetic-shop`, branch `main` |
| **Vercel** | LIVE | — | Project: `samuel-cosmetic-shop`, region fra1, auto-deploy on push |
| **MTN MoMo** | PARTIAL | `MOMO_SUBSCRIPTION_KEY`, `MOMO_API_USER`, `MOMO_API_KEY`, `MOMO_ENVIRONMENT` | Subscription keys obtained, API User/Key not generated. Simulated mode. |
| **Airtel Money** | NOT STARTED | `AIRTEL_CLIENT_ID`, `AIRTEL_CLIENT_SECRET`, `AIRTEL_ENVIRONMENT` | No developer account. Simulated mode. |
| **WhatsApp Business Cloud API** | NOT STARTED | `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_APP_SECRET`, `WHATSAPP_VERIFY_TOKEN`, `WHATSAPP_API_URL` | Code ready in `whatsapp-api.ts`. Currently uses wa.me links only. |

---

## 10. Authentication Flow

### Admin/Staff Login
1. User clicks "Admin" button in storefront header
2. `useUI.enterAdmin()` sets `adminView = "admin-login"`
3. `<AdminLogin>` renders username/password form
4. POST `/api/admin/login` with `{username, password}`
5. Server checks `AdminUser` table first, then `StaffAccount`
6. `verifyPassword()` uses `bcrypt.compareSync()` (with legacy `sc$` hash migration)
7. On success: `issueToken({id, type, role})` creates `base64url(payload).base64url(hmac_sig)`
8. Token stored in Zustand `adminToken` (persisted to localStorage `sc_ui`)
9. All admin API calls include `x-admin-token` header via `adminFetch()` helper
10. `checkAuth(req)` verifies HMAC signature + 24h TTL on every admin route
11. Logout: `adminLogout()` clears token from store

### Wholesale Login
1. Buyer registers via `/api/wholesale/register` with businessName, TIN, password, etc.
2. Admin approves via `/api/admin/wholesale/[id]/approve`
3. Buyer logs in via `/api/wholesale/login` with `{tin, password}`
4. On success: `makeToken()` generates random 32-byte token, `wholesaleUser` stored in Zustand
5. `wholesaleUser.status === "approved"` triggers wholesale pricing in product cards/quick-view
6. Orders created with `isWholesale: true` and `wholesaleUserId`

### Token Format
```
payload = base64url(JSON.stringify({id, type, role, iat}))
sig = HMAC-SHA256(payload, SESSION_SECRET)
token = `${payload}.${base64url(sig)}`
```
- TTL: 24 hours
- Secret: `process.env.SESSION_SECRET` (falls back to `DEV_SECRET` — security risk in production)
- Verification: `timingSafeEqual()` to prevent timing attacks

---

## 11. Deployment Flow

```
Local Dev:
  bun run dev → http://localhost:3000
  DATABASE_URL=file:./dev.db (SQLite)
  Admin: admin / admin123
  Staff: staff1 / staff123

Production (Vercel):
  git push origin main
    → GitHub webhook triggers Vercel
    → Build: node scripts/set-provider.js && prisma generate && next build
    → set-provider.js switches schema to "postgresql" (because DATABASE_URL starts with "postgresql://")
    → Deploy to fra1 region
    → Live at https://samuel-cosmetic-shop.vercel.app/

Vercel Environment Variables (set in dashboard):
  - DATABASE_URL (Supabase PostgreSQL pooler URL)
  - CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
  - SESSION_SECRET (should be set — currently falls back to dev secret)
  - MOMO_SUBSCRIPTION_KEY, MOMO_API_USER, MOMO_API_KEY, MOMO_ENVIRONMENT (partial)
```

**Build command:** `bun run build`
**Install command:** `bun install`
**Region:** fra1 (Frankfurt — closest to Supabase eu-central-1)

---

## 12. Coding Conventions

### General
- **Language:** TypeScript (strict mode, `noImplicitAny: false`, `useUnknownInCatchVariables: false`)
- **Package manager:** Bun
- **No emoji in product displays** — use product photos only (user's #1 rule). Emoji allowed in non-product UI (section icons, service tiles).
- **i18n:** All user-facing text uses `t("key", lang)` from `src/lib/i18n.ts`. Three languages: rw (default), en, fr.
- **Naming:** Files use kebab-case (`cart-drawer.tsx`). Components use PascalCase (`CartDrawer`). API routes use Next.js App Router conventions.
- **State:** Zustand with `persist` middleware for client-side state. No React Context for global state.
- **Styling:** Tailwind CSS 4 + shadcn/ui. Pink/purple theme. `cn()` helper for conditional classes.
- **Icons:** lucide-react. Import only what's needed.

### API Routes
- Every admin route must call `checkAuth(req)` first: `const auth = checkAuth(req); if (!auth.ok) return auth.response;`
- Error handling: `try { ... } catch (e: any) { return NextResponse.json({ ok: false, error: e?.message }, { status: 500 }); }`
- Response format: `{ ok: true, data }` or `{ ok: false, error: "error_code" }`
- Cache: use `cached()` for expensive queries, `bustCache()` after writes, `withCache()` for HTTP headers
- Prisma: use the singleton `db` from `src/lib/db.ts` — never create new PrismaClient instances

### Components
- `"use client"` directive at top of client components
- `useUI()` for global state (lang, currency, admin session, wholesale user)
- `useCart()` for cart operations
- `adminFetch()` or `safeFetch()` for API calls from admin (auto-attaches `x-admin-token` header)
- `pickLang(obj, lang)` to select nameEn/Fr/Rw based on current language
- `formatPrice(rwf, currency)` for price display

### Git
- Commit messages: descriptive, reference bug IDs (e.g., "Fix storefront search: race condition (Bug #67)")
- Push to `main` branch for auto-deploy
- Never commit `.env`, `node_modules`, `.next/`, `prisma/dev.db`

---

## 13. Known Issues

### Security
1. **`SESSION_SECRET` not set on Vercel** — falls back to public `DEV_SECRET`. Anyone can forge admin tokens. **Priority: HIGH**
2. **Server-side permissions not enforced** — `checkAuth()` only verifies token validity, not staff permissions. Any staff token can call any admin endpoint. **Priority: HIGH**
3. **`/api/orders?phone=X` exposes PII** — anyone can query any phone number's order history. **Priority: MEDIUM**
4. **`/api/customers/lookup?phone=X` exposes PII** — same issue. **Priority: MEDIUM**
5. **`/api/payments/transactions` is public** — should require admin auth. **Priority: MEDIUM**

### Performance
6. **In-memory cache is per-instance** — on Vercel serverless, cache writes only affect one instance. `bustCache()` doesn't clear other instances' caches or Vercel's edge cache. **Priority: MEDIUM**
7. **Sequential Prisma queries** — analytics runs queries sequentially to avoid pool exhaustion. Could be parallelized with a connection pool upgrade. **Priority: LOW**

### i18n
8. **~15% of admin strings still hardcoded English** — dashboard chart titles, ProductForm labels, OrderDetailModal, VatView. **Priority: LOW**

### UX
9. **MoMo/Airtel payment flow is simulated** — no real payment gateway integration. **Priority: MEDIUM** (blocked on MTN API User generation)
10. **WhatsApp notifications are wa.me links only** — no automated sending. **Priority: MEDIUM** (blocked on Meta app creation)

---

## 14. Current Milestone

**Round 14 Complete (June 28, 2026)** — Comprehensive 3-agent audit identified 135 bugs; 40+ critical/high bugs fixed in one sweep. TypeScript errors reduced from 94 → 0. All 16 unauthenticated admin API routes secured. Cart checkout ReferenceError fixed (orders were 100% broken). Mobile admin nav expanded from 4 → 20 tabs. Emoji removed from all product displays.

**Total bugs fixed: 104 across 14 rounds** (see `MEMORY.md` for complete history).

**Live deployment:** https://samuel-cosmetic-shop.vercel.app/ — verified working with browser tests.

---

## 15. Next Priorities

### Immediate (Security)
1. Set `SESSION_SECRET` environment variable on Vercel to a strong random string
2. Implement server-side permission checks in `checkAuth()` — extend token payload to include `permissions[]`, add `requirePermission(perm)` helper
3. Add phone verification (SMS OTP) before `/api/orders?phone=X` and `/api/customers/lookup` return data
4. Move `/api/payments/transactions` behind admin auth

### Short-term (Feature Completion)
5. Complete MTN MoMo Collection API integration (generate API User/Key, subscribe to Collection product)
6. Create Meta app for WhatsApp Business Cloud API (automated order notifications)
7. Migrate in-memory cache to Vercel KV or Upstash Redis for shared cache across instances
8. Finish i18n coverage for remaining admin strings

### Medium-term (Growth)
9. Email notification service (order confirmation, shipping updates)
10. Price alert cron job (check prices, send WhatsApp when target reached)
11. Abandoned cart recovery sequence
12. Advanced analytics (cohort analysis, conversion funnel)
13. Live exchange rate API for multi-currency

### Long-term (Scale)
14. A/B testing framework
15. Product review photo upload UI
16. Dedicated bundle image upload
17. Mobile app (React Native) or PWA
