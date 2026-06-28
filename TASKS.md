# TASKS.md — Samuel Cosmetic Shop

**Last Updated:** June 28, 2026
**Current Milestone:** Post-Round-14 stabilization

Tasks are ordered by priority. Each task has: ID, priority, status, description, and acceptance criteria.

---

## Priority Legend
- **P0 (Critical)** — Security vulnerabilities, data loss risks, broken core functionality
- **P1 (High)** — Features blocking business operations or user-facing bugs
- **P2 (Medium)** — Feature completion, UX improvements
- **P3 (Low)** — Technical debt, cosmetic improvements, nice-to-haves

## Status Legend
- `[ ]` Not started
- `[~]` In progress
- `[x]` Completed

---

## P0 — Critical (Security)

### TASK-001: Set SESSION_SECRET on Vercel
- **Status:** [ ]
- **Description:** `src/lib/route-auth.ts` and `src/lib/session.ts` both fall back to `DEV_SECRET = "samuel-cosmetic-shop-dev-secret-CHANGE-IN-PRODUCTION"` when `process.env.SESSION_SECRET` is missing. On Vercel, this env var is not set, so anyone who reads the source code can forge valid admin JWT tokens.
- **Acceptance Criteria:**
  - [ ] Generate a strong random secret (64+ characters)
  - [ ] Set `SESSION_SECRET` in Vercel Project Settings → Environment Variables
  - [ ] Add a production guard in `session.ts`: `if (process.env.NODE_ENV === 'production' && !process.env.SESSION_SECRET) throw new Error("SESSION_SECRET must be set")`
  - [ ] Redeploy and verify admin login still works
  - [ ] Verify token verification uses the new secret

### TASK-002: Server-side permission enforcement
- **Status:** [ ]
- **Description:** `checkAuth()` only verifies token signature and expiry — it does NOT check `payload.type` (admin vs staff) or any permission field. Every admin API endpoint accepts ANY valid token. A staff member with zero permissions can call `/api/admin/orders` directly and receive all orders.
- **Acceptance Criteria:**
  - [ ] Extend `TokenPayload` in `session.ts` to include `permissions: string[]`
  - [ ] Update `issueToken()` to accept and embed permissions
  - [ ] Update `/api/admin/login` to include staff permissions in token
  - [ ] Add `requirePermission(req, perm)` helper in `route-auth.ts` that checks `payload.type === "admin"` OR `payload.permissions.includes(perm)`
  - [ ] Apply `requirePermission` to all admin routes with appropriate permission keys
  - [ ] Test: staff with `view_products` only cannot access `/api/admin/orders`

### TASK-003: Protect PII endpoints (orders/lookup by phone)
- **Status:** [ ]
- **Description:** `GET /api/orders?phone=X` and `GET /api/customers/lookup?phone=X` return full order history and customer data for ANY phone number, with no verification that the requester owns the phone. Phone numbers are enumerable.
- **Acceptance Criteria:**
  - [ ] Implement SMS OTP verification flow: POST `/api/otp/send` → sends code to phone → POST `/api/otp/verify` → returns short-lived signed token → token required for `/api/orders?phone=X` and `/api/customers/lookup`
  - [ ] Alternative: require the customer to log in via wholesale-style flow (phone + password)
  - [ ] Rate-limit OTP requests (max 3 per 10 minutes per IP)

### TASK-004: Protect payment transactions endpoint
- **Status:** [ ]
- **Description:** `GET /api/payments/transactions` is public — returns all MoMo/Airtel transactions (phone, amount, orderId, status) to anonymous callers.
- **Acceptance Criteria:**
  - [ ] Add `checkAuth(req)` to the route
  - [ ] Require `view_analytics` permission

---

## P1 — High (Feature Completion)

### TASK-005: Complete MTN MoMo Collection API integration
- **Status:** [~] (subscription keys obtained, API User/Key missing)
- **Description:** Currently simulated. Need to generate API User/Key and subscribe to the Collection API product.
- **Acceptance Criteria:**
  - [ ] Subscribe to "Collection" API product in MTN MoMo developer portal
  - [ ] Generate API User via `/v1_0/apiuser` endpoint
  - [ ] Generate API Key via `/v1_0/apiuser/{userId}/apikey`
  - [ ] Set `MOMO_API_USER` and `MOMO_API_KEY` env vars on Vercel
  - [ ] Update `/api/payments/momo/initiate` to call real Collection API
  - [ ] Implement `/api/payments/momo/callback` webhook for payment confirmation
  - [ ] Update order `paymentStatus` to `paid` on callback
  - [ ] Test end-to-end with a real MoMo payment

### TASK-006: Create WhatsApp Business Cloud API app
- **Status:** [~] (code ready in `whatsapp-api.ts`, no Meta app)
- **Description:** Currently uses wa.me links only. Automated WhatsApp notifications (order confirmation, shipping updates) require a Meta Business app.
- **Acceptance Criteria:**
  - [ ] Create Meta Business app at developers.facebook.com
  - [ ] Add WhatsApp product to the app
  - [ ] Get `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_APP_SECRET`, `WHATSAPP_VERIFY_TOKEN`
  - [ ] Set env vars on Vercel
  - [ ] Configure webhook URL: `https://samuel-cosmetic-shop.vercel.app/api/whatsapp/webhook`
  - [ ] Test: order placed → customer receives automated WhatsApp confirmation
  - [ ] Test: order status changed → customer receives WhatsApp update

### TASK-007: Migrate cache to Vercel KV / Upstash Redis
- **Status:** [ ]
- **Description:** `src/lib/cache.ts` uses an in-memory `Map` that is per-instance on Vercel serverless. `bustCache()` only clears the local instance's map, not other instances or Vercel's edge cache. Admin product edits can take up to 5 minutes to appear on the storefront (until cache TTL expires).
- **Acceptance Criteria:**
  - [ ] Create Vercel KV (Redis) instance or Upstash Redis account
  - [ ] Set `KV_REST_API_URL` and `KV_REST_API_TOKEN` env vars
  - [ ] Rewrite `cache.ts` to use `@vercel/kv` for shared cache
  - [ ] Update `bustCache()` to delete keys from Redis
  - [ ] Update `withCache()` to use `Cache-Control: private, no-cache` for frequently-changing endpoints, or use `revalidateTag`/`revalidatePath`
  - [ ] Test: admin edits product → storefront shows new data within 5 seconds

### TASK-008: Complete i18n coverage
- **Status:** [~] (~85% complete)
- **Description:** ~15% of admin strings are still hardcoded English. Major gaps: dashboard chart titles, ProductForm labels, OrderDetailModal, VatView, ProductImageManager.
- **Acceptance Criteria:**
  - [ ] Audit all components for hardcoded strings (grep for `"[A-Z][a-z]+` in JSX)
  - [ ] Add missing i18n keys to `src/lib/i18n.ts` with rw/en/fr translations
  - [ ] Replace all hardcoded strings with `t("key", lang)`
  - [ ] Test: switch to Kinyarwanda → no English strings visible in admin
  - [ ] Test: switch to French → no English strings visible in admin

---

## P2 — Medium (Growth Features)

### TASK-009: Price alert notification system
- **Status:** [ ]
- **Description:** Price alerts are stored in the `PriceAlert` table but no mechanism sends notifications when a product's price drops below the target.
- **Acceptance Criteria:**
  - [ ] Create a Vercel Cron Job (or external scheduler) that runs daily
  - [ ] Query all `PriceAlert` records where `notified = false`
  - [ ] For each alert, check if the product's `sellingPrice <= targetPrice`
  - [ ] If yes, send WhatsApp notification via WhatsApp Business API (requires TASK-006)
  - [ ] Mark `notified = true` and set `notifiedAt = now()`
  - [ ] Log to `NotificationLog` table

### TASK-010: Email notification service
- **Status:** [ ]
- **Description:** No email service is configured. Order confirmations, shipping updates, and newsletter broadcasts are email-less.
- **Acceptance Criteria:**
  - [ ] Choose an email provider (Resend, SendGrid, or AWS SES)
  - [ ] Set email API key env var
  - [ ] Create email templates (order confirmation, shipping, welcome)
  - [ ] Add `POST /api/notifications/email` endpoint
  - [ ] Wire into order creation and status update flows
  - [ ] Add unsubscribe link to all emails

### TASK-011: Abandoned cart recovery
- **Status:** [ ]
- **Description:** No mechanism to recover carts that were started but not completed.
- **Acceptance Criteria:**
  - [ ] Track cart abandonment (cart has items but no order placed within 1 hour)
  - [ ] Store abandoned cart with customer phone (if entered in checkout)
  - [ ] Send WhatsApp reminder after 1 hour (requires TASK-006)
  - [ ] Send email reminder after 24 hours (requires TASK-010)
  - [ ] Add admin view to see abandoned carts

### TASK-012: Airtel Money API integration
- **Status:** [ ]
- **Description:** Not started. Developer account not created at developers.airtel.africa.
- **Acceptance Criteria:**
  - [ ] Create Airtel developer account
  - [ ] Register application, get `AIRTEL_CLIENT_ID` and `AIRTEL_CLIENT_SECRET`
  - [ ] Set env vars on Vercel
  - [ ] Update `/api/payments/airtel/initiate` to call real API
  - [ ] Implement callback webhook
  - [ ] Test end-to-end

### TASK-013: Product review photo upload
- **Status:** [ ]
- **Description:** `Review` model has an `images` field (JSON string), but no UI exists for customers to upload photos with their reviews.
- **Acceptance Criteria:**
  - [ ] Add photo upload to review form in QuickViewModal
  - [ ] Max 3 photos per review, 5MB each
  - [ ] Upload to Cloudinary under `samuel-cosmetic/reviews` folder
  - [ ] Store URLs in `Review.images` as JSON array
  - [ ] Display review photos in QuickViewModal review list
  - [ ] Admin can moderate (remove) review photos

### TASK-014: Bundle image upload
- **Status:** [ ]
- **Description:** Bundles currently use the first product's photo as a fallback. No dedicated bundle image upload exists.
- **Acceptance Criteria:**
  - [ ] Add `imageUrl` field to `Bundle` model in Prisma schema
  - [ ] Run `prisma db push` to update database
  - [ ] Add image upload to BundleForm in admin
  - [ ] Use uploaded image in storefront bundle display
  - [ ] Fallback to first product photo if no bundle image

---

## P3 — Low (Technical Debt & Polish)

### TASK-015: Remove `typescript.ignoreBuildErrors` from next.config.ts
- **Status:** [ ]
- **Description:** `next.config.ts` has `typescript: { ignoreBuildErrors: true }`. This was needed when there were 94 TS errors, but after Round 14 there are 0 errors in project source. Should remove this safety net to catch future type errors at build time.
- **Acceptance Criteria:**
  - [ ] Verify `bunx tsc --noEmit` returns 0 errors
  - [ ] Remove `typescript: { ignoreBuildErrors: true }` from `next.config.ts`
  - [ ] Run `bun run build` locally to verify it passes
  - [ ] Push and verify Vercel build succeeds

### TASK-016: Replace remaining emoji in non-product UI
- **Status:** [ ]
- **Description:** While product displays no longer use emoji (user's #1 rule), some non-product UI still uses emoji: flash sale banner (⚡), services section (📦👤📅🏢), testimonials section (💬), bundles heading (🎁), empty cart (🛒). Consider replacing with lucide icons for consistency.
- **Acceptance Criteria:**
  - [ ] Audit all emoji usage in storefront and admin
  - [ ] Replace with appropriate lucide icons where appropriate
  - [ ] Keep emoji in language flags (🇷🇼🇬🇧🇫🇷) and currency flags (these are appropriate)

### TASK-017: Implement real-time exchange rates
- **Status:** [ ]
- **Description:** Currency rates are hardcoded in `src/lib/format.ts`. Exchange rates fluctuate.
- **Acceptance Criteria:**
  - [ ] Sign up for a free exchange rate API (exchangerate-api.com, open.er-api.com)
  - [ ] Create `/api/exchange-rates` endpoint that fetches and caches rates daily
  - [ ] Update `format.ts` to use dynamic rates
  - [ ] Display "rates updated X hours ago" in currency switcher tooltip

### TASK-018: Add `tsconfig.tsbuildinfo` to .gitignore
- **Status:** [ ]
- **Description:** `tsconfig.tsbuildinfo` is a build artifact that should not be committed to git.
- **Acceptance Criteria:**
  - [ ] Add `tsconfig.tsbuildinfo` to `.gitignore`
  - [ ] Remove from git tracking: `git rm --cached tsconfig.tsbuildinfo`

### TASK-019: Implement advanced analytics
- **Status:** [ ]
- **Description:** Current analytics shows basic KPIs (revenue, orders, products, low stock). No cohort analysis, conversion funnel, or customer lifetime value.
- **Acceptance Criteria:**
  - [ ] Add conversion funnel: visitors → product views → cart adds → checkout starts → orders placed
  - [ ] Add customer cohort analysis (retention by signup month)
  - [ ] Add customer lifetime value calculation
  - [ ] Add average order value trend
  - [ ] Add top-performing products by revenue
  - [ ] Display in new "Advanced Analytics" admin tab

### TASK-020: PWA / Mobile app
- **Status:** [ ]
- **Description:** No progressive web app or native mobile app. Users must use the browser.
- **Acceptance Criteria:**
  - [ ] Add `manifest.json` for PWA
  - [ ] Add service worker for offline product browsing
  - [ ] Add "Add to Home Screen" prompt
  - [ ] Or: build React Native app with Expo sharing the API

---

## Completed Tasks (Recent)

### TASK-DONE-001: Comprehensive audit & 40+ bug fixes (Round 14)
- **Completed:** June 28, 2026
- **Summary:** 3-agent audit found 135 bugs. Fixed 40+ critical/high bugs including: cart drawer ReferenceError (orders were broken), 16 unauthenticated admin API routes, emoji in product displays, mobile admin nav (4→20 tabs), TypeScript errors (94→0).
- **Commit:** `1b04466`

### TASK-DONE-002: Storefront search fix (Round 13)
- **Completed:** June 28, 2026
- **Summary:** Fixed race condition in storefront useEffect, added debounced live search, hid featured/bundles sections during search, added clear button and search results indicator.
- **Commits:** `f46f0f7`, `5d05b1f`

### TASK-DONE-003: Category management system (Round 12)
- **Completed:** June 28, 2026
- **Summary:** Created admin Categories tab with CRUD, removed emoji from categories, added category filter to storefront, fixed featured section visibility.
- **Commits:** `1092a74`, `fbf9d70`

### TASK-DONE-004: Wholesale pricing system
- **Completed:** June 28, 2026
- **Summary:** Approved wholesale buyers see `wholesalePrice` instead of `sellingPrice` automatically across product cards, quick view, and cart.
- **Commit:** `8e52e0d`

### TASK-DONE-005: Product photos in cart
- **Completed:** June 28, 2026
- **Summary:** Cart items now display product photos. Added `image` field to `CartItem` interface.
- **Commit:** `2e41fcf`

### TASK-DONE-006: Logo photo upload
- **Completed:** June 28, 2026
- **Summary:** Admin can upload a logo photo that replaces the emoji placeholder in header, admin sidebar, and storefront about section.
- **Commit:** `b10bcfe`

### TASK-DONE-007: EBM receipt system
- **Completed:** June 28, 2026
- **Summary:** RRA-compliant EBM receipts with MRC codes, receipt numbers, and 18% VAT breakdown.
- **Commit:** `a9e97d1`

### TASK-DONE-008: Route-level auth (replacing Edge middleware)
- **Completed:** June 28, 2026
- **Summary:** Moved auth from Edge middleware (incompatible with Node.js `crypto`) to route-level `checkAuth()` in each API handler.
- **Commit:** `0b9f886`
