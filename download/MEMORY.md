# 🧠 SAMUEL COSMETIC SHOP — COMPLETE PROJECT MEMORY
**Last Updated:** June 28, 2026
**Purpose:** Permanent record of ALL project information, credentials, and history.
**This file must be read at the START of every new conversation.**

---

## 👤 USER IDENTITY

| Field | Value |
|-------|-------|
| **Full Name** | Tuyishimire Elisa (fuyishimire elisa) |
| **Email** | thruxb2@gmail.com |
| **Shop Name** | Samuel Cosmetic Shop |
| **Shop Location** | Kigali, Rwanda |
| **Shop WhatsApp** | +250 790 215 965 |
| **Shop Email** | samuelcosmeticshop@gmail.com |
| **TIN** | 102345678 |
| **SDC ID** | SCS-EBM-001 |
| **VAT Rate** | 18% (RRA standard) |
| **Currency** | RWF (Rwandan Franc) |
| **Default Language** | Kinyarwanda (rw) — also English, French |

---

## 🔑 ALL CREDENTIALS (LIVE STATUS)

### ✅ Cloudinary (Image Storage) — LIVE & WORKING
```
CLOUDINARY_CLOUD_NAME=dohoc0tmp
CLOUDINARY_API_KEY=524578837153868
CLOUDINARY_API_SECRET=ggf5-0eqMOIvtxQXokzy6-Nr1yU
```
- **Status:** Tested and working. Images upload to `https://res.cloudinary.com/dohoc0tmp/...`
- **Free tier:** 25GB storage, 25GB bandwidth/month

### ✅ Supabase (PostgreSQL Database) — CONFIGURED
```
DATABASE_URL=postgresql://postgres.hsdqahltrqjeaskhheis:Mama%23%23311%4020@aws-1-eu-central-1.pooler.supabase.com:5432/postgres
```
- **Project URL:** `https://vgsddtzfwyfq.supabase.co`
- **Project Ref:** `hsdqahltrqjeaskhheis`
- **Database Password:** `Mama##311@20` (URL-encoded as `Mama%23%23311%4020`)
- **Region:** eu-central-1 (Frankfurt)
- **Org:** TuyishimireElissa's Org (FREE tier)
- **Project Name:** TuyishimireElissa's Project
- **Status:** Database created, needs `prisma db push` to create tables

### ✅ GitHub Repository — CONNECTED
```
Repo: https://github.com/TuyishimireElissa/samuel-cosmetic-shop
Branch: main
```
- **Status:** Code pushed, auto-deploys to Vercel on push

### ⚠️ Vercel Deployment — CONFIGURED BUT FAILING
```
Vercel URL: https://vercel.com/tuyishimire-elissa/samuel-cosmetic-shop
Project Name: samuel-cosmetic-shop
Account: tuyishimire-elissa (Pro Trial)
```
- **Status:** All deployments showing "Error" status
- **Root cause:** Likely Prisma client generation or build configuration issue
- **DATABASE_URL** is set in Vercel environment variables (confirmed from screenshot)
- **Trial expires:** ~12 days from Jun 25 screenshot

### ⏳ MTN MoMo (Mobile Money) — PARTIAL
```
MOMO_SUBSCRIPTION_KEY=923f8099e6bc4dfb8813d28786c78ca3
Secondary Key=86c5661abc044050b02edb573ee14447
```
- **Account:** thruxb2@gmail.com
- **Subscription Name:** SamuelCosmeticShop
- **Created:** 06/27/2026
- **Active Products:** Disbursements, Remittances, Collection Widget
- **Missing:** Need to subscribe to "Collection" API product + generate API User + API Key
- **Additional subscriptions found:**
  - SamuelCOSMETICSHOP (Remittances): Primary=29d1cbb32f204e4d8a705dd21c0a536a, Secondary=c4c67b5850ac4d7e865962aaf29b9156
  - SamuelCOSMETICSHOP (Collection Widget): Primary=82dafb5f9d824900901bb470cce3863d, Secondary=a22619d7ab55406f8ed71d12829b61ef

### ❌ Airtel Money — NOT STARTED
- User has not created an Airtel developer account yet
- Portal: https://developers.airtel.africa/

### ❌ WhatsApp Business API — NOT STARTED
- User has not created a Meta app yet
- Portal: https://developers.facebook.com/apps/

---

## 🏗️ PROJECT TECH STACK

| Component | Technology |
|-----------|------------|
| **Frontend** | Next.js 16 + React 19 + TypeScript |
| **Styling** | Tailwind CSS 4 + shadcn/ui |
| **Database** | Prisma ORM + PostgreSQL (Supabase) |
| **Auth** | bcryptjs + JWT (HMAC-signed) |
| **Image Storage** | Cloudinary (with local fallback) |
| **Payments** | MTN MoMo + Airtel Money (simulated) |
| **Messaging** | WhatsApp Business Cloud API (code ready, not connected) |
| **State** | Zustand |
| **Forms** | React Hook Form + Zod |
| **Charts** | Recharts |
| **Icons** | lucide-react |
| **Package Manager** | Bun |

---

## 📁 KEY FILE LOCATIONS

### API Routes (60+ endpoints)
- `/src/app/api/admin/*` — All admin CRUD endpoints
- `/src/app/api/products/*` — Public product endpoints
- `/src/app/api/orders/*` — Order creation and tracking
- `/src/app/api/payments/momo/*` — MoMo initiate + callback
- `/src/app/api/payments/airtel/*` — Airtel initiate + callback
- `/src/app/api/whatsapp/webhook/` — WhatsApp webhook
- `/src/app/api/admin/upload/` — Cloudinary image upload

### Core Libraries
- `/src/lib/db.ts` — Prisma client
- `/src/lib/i18n.ts` — All translations (rw/en/fr)
- `/src/lib/whatsapp.ts` — WhatsApp helper (wa.me links)
- `/src/lib/whatsapp-api.ts` — WhatsApp Business Cloud API
- `/src/lib/cloudinary.ts` — Cloudinary config
- `/src/lib/auth.ts` — JWT auth
- `/src/lib/format.ts` — Price/VAT formatting
- `/src/lib/store.ts` — Zustand stores

### Components
- `/src/components/shop/` — Storefront (storefront, header, cart, modals, product-card)
- `/src/components/admin/` — Admin panel (app, login, views-extra)
- `/src/components/ui/` — shadcn/ui components

### Database
- `/prisma/schema.prisma` — 32 models (PostgreSQL provider)
- `/scripts/seed.ts` — Seed script
- `/src/app/api/seed/route.ts` — Seed API endpoint

---

## 🐛 BUGS FIXED (31 total across 5 rounds)

### Round 1 (8 bugs):
1. Prisma schema postgresql→sqlite mismatch (root cause of all 500s)
2. Loyalty points not awarded on first order
3. HTML lang attribute not updating on language switch
4. Image upload crashed without Cloudinary creds (added local fallback)
5. ProductForm crash on new product (product?.id null deref)
6. Radix Select error on empty string value
7. 16 admin sidebar labels hardcoded English
8. MoMo/Airtel simulation noisy errors on non-existent orders

### Round 2 (6 bugs):
9. Main shop grid ProductCards not wired to onQuickView
10. PhotoSearchModal imported but no button triggered it
11. Flash sale banner missing from storefront
12. 4 section headings hardcoded English (Featured, Bundles, Quick Services, Testimonials)
13. 8 Quick Services labels hardcoded English
14. Missing SEO (Schema.org JSON-LD, sitemap.xml, favicon)

### Round 3 (5 bugs):
15. All 4 storefront modals had 60+ hardcoded English strings
16. Quick View modal had 15+ untranslated strings
17. Bundle cards used hardcoded nameEn instead of pickLang
18. "Add Bundle to Cart" button hardcoded English
19. Bundle add-to-cart pricing bug (used full sellingPrice instead of proportional bundlePrice)

### Round 4 (5 bugs):
20. 11 admin views in views-extra.tsx had hardcoded English
21. 3 admin views (Customers, Reviews, Inventory) missed in round 3
22. Orders status filter dropdown had 7 English options
23. ProductForm had untranslated labels
24. ProductForm duplicate suffix bug ("(HT) (HT)")

### Round 5 (7 bugs):
25. CouponForm: 13 hardcoded English strings
26. BundleForm: 8 hardcoded English strings
27. FlashSaleForm: 11 hardcoded English strings
28. StaffForm: 13 hardcoded English strings
29. CustomerModal: 9 hardcoded English strings
30. StockView: 9 hardcoded English strings
31. CustomersView table headers: 6 hardcoded English strings

---

## 🚀 DEPLOYMENT HISTORY

### Local Development (WORKING)
- Dev server: `http://localhost:3000`
- Start: `cd /home/z/my-project && bun run dev`
- Admin login: `admin` / `admin123`
- Staff login: `staff1` / `staff123`
- Wholesale: TIN `102998877` / password `wholesale123` (after admin approval)

### Vercel Deployment (FAILING)
- Project: `samuel-cosmetic-shop` under `tuyishimire-elissa` account
- All deployments from Jun 22-25 showed "Error" status
- DATABASE_URL is set in Vercel env vars (confirmed)
- **Likely fix needed:** Ensure `prisma generate` runs during build, check build logs

### GitHub
- Repo: `TuyishimireElissa/samuel-cosmetic-shop`
- Latest commit: `c4e59db` (Jun 27)
- Auto-deploys to Vercel on push to main

---

## 📋 WHAT'S WORKING vs WHAT'S NOT

### ✅ Working:
- Full storefront (Kinyarwanda/English/French)
- Admin panel with 18 tabs (all translated)
- Cart → Checkout → Order flow
- RRA-compliant EBM receipts + VAT reports with CSV export
- Cloudinary image upload (LIVE)
- All API integration code written (Cloudinary, MoMo, Airtel, WhatsApp)
- Simulation fallbacks for all payment APIs
- SEO (JSON-LD, sitemap, Open Graph)
- Mobile responsive (360px)
- 31 bugs fixed

### ❌ Not Working / Pending:
- Vercel deployment (build errors)
- MTN MoMo real API (need Collection product + API User + Key)
- Airtel Money real API (not started)
- WhatsApp Business API (not started)
- Supabase database not initialized (needs `prisma db push`)

---

## 🎯 NEXT STEPS (Priority Order)

1. **Fix Vercel deployment** — check build logs, ensure prisma generate runs
2. **Initialize Supabase database** — run `prisma db push` with the DATABASE_URL
3. **Seed the database** — call `/api/seed` endpoint
4. **Complete MoMo setup** — subscribe to Collection product, generate API User + Key
5. **Set up Airtel Money** — create developer account, get Client ID + Secret
6. **Set up WhatsApp Business** — create Meta app, get token, verify business

---

## 📸 SCREENSHOT INVENTORY (48 images)

All screenshots are in `/home/z/my-project/upload/`. Key ones:
- `pasted_image_1782150540269.png` — Supabase dashboard
- `pasted_image_1782274638444.png` — Vercel env vars (has DATABASE_URL)
- `pasted_image_1782275909089.png` — Vercel deployment success
- `pasted_image_1782561228798.png` — MoMo dashboard with subscription keys
- `pasted_image_1782564186425.png` — MoMo all subscriptions
- `pasted_image_1781884047308.png` — Admin panel screenshot

---

## ⚠️ IMPORTANT NOTES

1. **The .env file is gitignored** — credentials are only in local `.env`, not in GitHub
2. **Vercel has the DATABASE_URL** set as environment variable (confirmed from screenshot)
3. **Supabase password** `Mama##311@20` is URL-encoded in the connection string as `Mama%23%23311%4020`
4. **The user's name** is "fuyishimire elisa" (first/last name order may vary)
5. **Admin credentials**: username `admin`, password `admin123`
6. **The project was originally specified** to use Django + PostgreSQL, but was rebuilt as Next.js + Prisma + PostgreSQL

---

## 🔄 CONVERSATION HISTORY SUMMARY

1. **Initial request** — User provided a massive Django-based e-commerce spec (2000+ lines)
2. **Project was rebuilt** as Next.js 16 + Prisma + PostgreSQL (current stack)
3. **5 rounds of bug fixing** — 31 bugs total, all fixed
4. **Cloudinary configured** and tested live
5. **Supabase database created** — connection string found in Vercel env vars screenshot
6. **Vercel deployment attempted** multiple times — all failed with build errors
7. **MoMo developer account created** — has subscription key, missing API User + Key
8. **Airtel and WhatsApp** — not started yet

---

**THIS FILE MUST BE READ AT THE START OF EVERY NEW CONVERSATION.**
**DO NOT FORGET ANY OF THIS INFORMATION.**
