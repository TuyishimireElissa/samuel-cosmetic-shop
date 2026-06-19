// Seed v2 — 5 categories, 20 products, 30 districts, reviews, bundles, testimonials, staff, templates
import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

function hash(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = (h * 33) ^ s.charCodeAt(i);
  return `sc$${(h >>> 0).toString(16)}$${s.length}`;
}

async function main() {
  console.log("🌱 Seeding Samuel Cosmetic Shop (v2)...");

  await db.siteSetting.upsert({ where: { id: "singleton" }, update: {}, create: { id: "singleton" } });
  console.log("✓ Site settings");

  await db.adminUser.upsert({ where: { username: "admin" }, update: {}, create: { username: "admin", passwordHash: hash("admin123"), email: "samuelcosmeticshop@gmail.com", fullName: "Samuel — Shop Administrator" } });
  console.log("✓ Admin user (admin / admin123)");

  const staff = [
    { name: "Aline Uwase", username: "sales", passwordHash: hash("sales123"), role: "sales", permissions: JSON.stringify(["view_dashboard","view_orders","update_order_status","notify_customer","view_customers","view_analytics","view_messages","manage_reviews","export_data"]) },
    { name: "Eric Mwangi", username: "stock", passwordHash: hash("stock123"), role: "inventory", permissions: JSON.stringify(["view_dashboard","view_products","manage_products","manage_stock","view_orders","view_analytics"]) },
  ];
  for (const s of staff) await db.staffAccount.upsert({ where: { username: s.username }, update: {}, create: s });
  console.log(`✓ ${staff.length} staff accounts`);

  const categories = [
    { id: "makeup", nameEn: "Makeup", nameFr: "Maquillage", nameRw: "Isura", emoji: "💄", slug: "makeup", sortOrder: 1 },
    { id: "skincare", nameEn: "Skincare", nameFr: "Soins de la peau", nameRw: "Kwita ku gusura", emoji: "🧴", slug: "skincare", sortOrder: 2 },
    { id: "perfume", nameEn: "Fragrances", nameFr: "Parfums", nameRw: "Parfume", emoji: "🌸", slug: "fragrances", sortOrder: 3 },
    { id: "haircare", nameEn: "Hair Care", nameFr: "Soins capillaires", nameRw: "Kwita ku misatsi", emoji: "💆🏾‍♀️", slug: "hair-care", sortOrder: 4 },
    { id: "mens", nameEn: "Men's Grooming", nameFr: "Soins hommes", nameRw: "Iby'abagabo", emoji: "🪒", slug: "mens", sortOrder: 5 },
  ];
  for (const c of categories) await db.category.upsert({ where: { id: c.id }, update: c as any, create: c as any });
  console.log(`✓ ${categories.length} categories`);

  const products = [
    { id: "MK-001", sku: "MAC-RW-RED", categoryId: "makeup", emoji: "💄", nameEn: "MAC Matte Lipstick — Ruby Rose", nameFr: "MAC Rouge à Lèvres Mat — Ruby Rose", nameRw: "MAC Iwirabura rw'Iminwa — Ruby Rose", descEn: "Long-lasting matte finish.", descFr: "Finition mate longue durée.", descRw: "Iwirabura rya kera cyane.", costPrice: 12000, sellingPrice: 25000, wholesalePrice: 19000, stockQty: 47, badge: "bestseller" },
    { id: "MK-002", sku: "NARS-BLUSH", categoryId: "makeup", emoji: "🌸", nameEn: "NARS Blush — Orgasm", nameFr: "NARS Blush — Orgasm", nameRw: "NARS Blush — Orgasm", descEn: "Peachy-pink shimmer.", descFr: "Pêche-rose.", descRw: "Peachy-pink.", costPrice: 15000, sellingPrice: 32000, wholesalePrice: 25000, stockQty: 28, badge: "popular" },
    { id: "MK-003", sku: "MAYB-FOND", categoryId: "makeup", emoji: "🧴", nameEn: "Maybelline Fit Me Foundation", nameFr: "Maybelline Fond de Teint Fit Me", nameRw: "Maybelline Foundation Fit Me", descEn: "Lightweight coverage.", descFr: "Couvrance légère.", descRw: "Byoroshye.", costPrice: 8000, sellingPrice: 18000, wholesalePrice: 13500, stockQty: 60, badge: "popular" },
    { id: "MK-004", sku: "FENT-GLOS", categoryId: "makeup", emoji: "✨", nameEn: "Fenty Gloss Bomb", nameFr: "Fenty Gloss Bomb", nameRw: "Fenty Gloss Bomb", descEn: "Shimmering lip gloss.", descFr: "Gloss brillant.", descRw: "Gloss irabagira.", costPrice: 9000, sellingPrice: 22000, wholesalePrice: 17000, stockQty: 4, badge: "hot" },
    { id: "SK-001", sku: "CERA-MOIST", categoryId: "skincare", emoji: "🧴", nameEn: "CeraVe Moisturizing Cream", nameFr: "CeraVe Crème Hydratante", nameRw: "CeraVe Kremu yo Kwubaka Gusura", descEn: "24-hour hydration.", descFr: "Hydratation 24h.", descRw: "Kwubaka amazi.", costPrice: 9000, sellingPrice: 19500, wholesalePrice: 15000, stockQty: 80, badge: "bestseller" },
    { id: "SK-002", sku: "NIA-SERUM", categoryId: "skincare", emoji: "💧", nameEn: "The Ordinary Niacinamide 10%", nameFr: "The Ordinary Niacinamide 10%", nameRw: "The Ordinary Niacinamide 10%", descEn: "Reduces blemishes.", descFr: "Réduit les imperfections.", descRw: "Byoroze imyanda.", costPrice: 5000, sellingPrice: 12000, wholesalePrice: 9000, stockQty: 120, badge: "popular" },
    { id: "SK-003", sku: "CET-WASH", categoryId: "skincare", emoji: "🧼", nameEn: "Cetaphil Gentle Skin Cleanser", nameFr: "Cetaphil Nettoyant Doux", nameRw: "Cetaphil Sabo yo Gusukura Gusura", descEn: "Mild cleanser.", descFr: "Nettoyant doux.", descRw: "Sabo yoroshye.", costPrice: 7000, sellingPrice: 15500, wholesalePrice: 11500, stockQty: 50, badge: "" },
    { id: "SK-004", sku: "SUN-SPF50", categoryId: "skincare", emoji: "☀️", nameEn: "La Roche-Posay SPF50 Sunscreen", nameFr: "La Roche-Posay Écran Solaire SPF50", nameRw: "La Roche-Posay Izenguruka z'Urima SPF50", descEn: "High-protection sunscreen.", descFr: "Écran solaire haute protection.", descRw: "Izenguruka z'irinda cyane.", costPrice: 13000, sellingPrice: 28000, wholesalePrice: 22000, stockQty: 35, badge: "new" },
    { id: "PF-001", sku: "CH-COCO", categoryId: "perfume", emoji: "🌸", nameEn: "Chanel Coco Mademoiselle EDP 50ml", nameFr: "Chanel Coco Mademoiselle EDP 50ml", nameRw: "Chanel Coco Mademoiselle EDP 50ml", descEn: "Iconic oriental fragrance.", descFr: "Parfum oriental iconique.", descRw: "Parfume nziza cyane.", costPrice: 55000, sellingPrice: 110000, wholesalePrice: 90000, stockQty: 12, badge: "bestseller" },
    { id: "PF-002", sku: "DIOR-SAU", categoryId: "perfume", emoji: "💧", nameEn: "Dior Sauvage EDT 100ml", nameFr: "Dior Sauvage EDT 100ml", nameRw: "Dior Sauvage EDT 100ml", descEn: "Fresh and noble.", descFr: "Frais et noble.", descRw: "Parfume y'abagabo nziza.", costPrice: 65000, sellingPrice: 135000, wholesalePrice: 110000, stockQty: 9, badge: "hot" },
    { id: "PF-003", sku: "YSL-BLACK", categoryId: "perfume", emoji: "🌙", nameEn: "YSL Black Opium 50ml", nameFr: "YSL Black Opium 50ml", nameRw: "YSL Black Opium 50ml", descEn: "Seductive and addictive.", descFr: "Séduisant.", descRw: "Parfume nziza.", costPrice: 60000, sellingPrice: 125000, wholesalePrice: 100000, stockQty: 7, badge: "popular" },
    { id: "PF-004", sku: "CK-ONE", categoryId: "perfume", emoji: "🌿", nameEn: "Calvin Klein CK One 100ml", nameFr: "Calvin Klein CK One 100ml", nameRw: "Calvin Klein CK One 100ml", descEn: "Unisex citrus aromatic.", descFr: "Agrumes unisexes.", descRw: "Parfume y'abagabo n'abagore.", costPrice: 28000, sellingPrice: 55000, wholesalePrice: 43000, stockQty: 22, badge: "" },
    { id: "HC-001", sku: "SHEM-OIL", categoryId: "haircare", emoji: "💆🏾‍♀️", nameEn: "Shea Moisture Coconut Oil", nameFr: "Shea Moisture Huile de Coco", nameRw: "Shea Moisture Amavuta ya Kokonati", descEn: "Nourishing hair oil.", descFr: "Huile nourrissante.", descRw: "Amavuta yiza.", costPrice: 6000, sellingPrice: 14500, wholesalePrice: 11000, stockQty: 65, badge: "" },
    { id: "HC-002", sku: "OR-SHAM", categoryId: "haircare", emoji: "🧴", nameEn: "ORIBE Gold Shampoo 250ml", nameFr: "ORIBE Shampoing Gold 250ml", nameRw: "ORIBE Shampoing ya Zahabu 250ml", descEn: "Luxurious shampoo.", descFr: "Shampoing luxueux.", descRw: "Shampoong nziza.", costPrice: 18000, sellingPrice: 38000, wholesalePrice: 30000, stockQty: 18, badge: "new" },
    { id: "HC-003", sku: "CAN-COND", categoryId: "haircare", emoji: "🧴", nameEn: "Cantu Shea Butter Conditioner", nameFr: "Cantu Après-shampoing au Karité", nameRw: "Cantu Conditioner y'Amavuta ya Karite", descEn: "Deep conditioning.", descFr: "Conditionnement profond.", descRw: "Conditioner y'imbyatsi.", costPrice: 5000, sellingPrice: 12500, wholesalePrice: 9500, stockQty: 75, badge: "popular" },
    { id: "HC-004", sku: "MOR-OIL", categoryId: "haircare", emoji: "✨", nameEn: "Moroccanoil Treatment 100ml", nameFr: "Moroccanoil Traitement 100ml", nameRw: "Moroccanoil Amavuta yo Kwita 100ml", descEn: "Argan oil treatment.", descFr: "Traitement à l'huile d'argan.", descRw: "Amavuta ya Argan.", costPrice: 22000, sellingPrice: 45000, wholesalePrice: 36000, stockQty: 3, badge: "hot" },
    { id: "MN-001", sku: "NIVEA-MEN", categoryId: "mens", emoji: "🪒", nameEn: "Nivea Men Face Wash", nameFr: "Nivea Men Nettoyant Visage", nameRw: "Nivea Men Sabo y'Isura", descEn: "Deep cleansing face wash.", descFr: "Nettoyant profond.", descRw: "Sabo yo gusukura isura.", costPrice: 5000, sellingPrice: 8500, wholesalePrice: 6500, stockQty: 90, badge: "" },
    { id: "MN-002", sku: "GIL-PRO", categoryId: "mens", emoji: "🪒", nameEn: "Gillette ProGlide Razor", nameFr: "Gillette Rasoir ProGlide", nameRw: "Gillette ProGlide Razoo", descEn: "5-blade razor.", descFr: "Rasoir 5 lames.", descRw: "Razoo y'amacanga atanu.", costPrice: 12000, sellingPrice: 20000, wholesalePrice: 16000, stockQty: 40, badge: "popular" },
    { id: "MN-003", sku: "OLD-SPICE", categoryId: "mens", emoji: "🌊", nameEn: "Old Spice Original Deodorant", nameFr: "Old Spice Déodorant Original", nameRw: "Old Spice Deodorant ya Kera", descEn: "Classic masculine scent.", descFr: "Parfum masculin classique.", descRw: "Imvugo y'abagabo izima cyane.", costPrice: 4000, sellingPrice: 7500, wholesalePrice: 5500, stockQty: 110, badge: "" },
    { id: "MN-004", sku: "ARMANI-CODE", categoryId: "mens", emoji: "🌙", nameEn: "Armani Code EDT 75ml", nameFr: "Armani Code EDT 75ml", nameRw: "Armani Code EDT 75ml", descEn: "Sophisticated men's fragrance.", descFr: "Parfum masculin sophistiqué.", descRw: "Parfume y'abagabo nziza cyane.", costPrice: 45000, sellingPrice: 95000, wholesalePrice: 78000, stockQty: 14, badge: "new" },
  ];
  for (const p of products) await db.product.upsert({ where: { id: p.id }, update: p as any, create: p as any });
  console.log(`✓ ${products.length} products`);

  const districts = [
    { name: "Gasabo", province: "Kigali", fee: 2000, etaHours: 6 }, { name: "Kicukiro", province: "Kigali", fee: 2000, etaHours: 6 }, { name: "Nyarugenge", province: "Kigali", fee: 2000, etaHours: 6 },
    { name: "Musanze", province: "Northern", fee: 3500, etaHours: 48 }, { name: "Burera", province: "Northern", fee: 3500, etaHours: 48 }, { name: "Gicumbi", province: "Northern", fee: 3000, etaHours: 48 }, { name: "Rulindo", province: "Northern", fee: 3000, etaHours: 48 }, { name: "Gakenke", province: "Northern", fee: 3000, etaHours: 48 },
    { name: "Nyanza", province: "Southern", fee: 3000, etaHours: 48 }, { name: "Gisagara", province: "Southern", fee: 3000, etaHours: 48 }, { name: "Huye", province: "Southern", fee: 3000, etaHours: 48 }, { name: "Nyaruguru", province: "Southern", fee: 3500, etaHours: 72 }, { name: "Nyamagabe", province: "Southern", fee: 3500, etaHours: 72 }, { name: "Muhanga", province: "Southern", fee: 2500, etaHours: 48 }, { name: "Ruhango", province: "Southern", fee: 2500, etaHours: 48 }, { name: "Kamonyi", province: "Southern", fee: 2500, etaHours: 48 },
    { name: "Bugesera", province: "Eastern", fee: 2500, etaHours: 48 }, { name: "Ngoma", province: "Eastern", fee: 3000, etaHours: 48 }, { name: "Kirehe", province: "Eastern", fee: 3500, etaHours: 72 }, { name: "Rwamagana", province: "Eastern", fee: 2500, etaHours: 48 }, { name: "Kayonza", province: "Eastern", fee: 3000, etaHours: 48 }, { name: "Gatsibo", province: "Eastern", fee: 3000, etaHours: 72 }, { name: "Nyagatare", province: "Eastern", fee: 3500, etaHours: 72 },
    { name: "Karongi", province: "Western", fee: 3500, etaHours: 72 }, { name: "Rutsiro", province: "Western", fee: 3500, etaHours: 72 }, { name: "Rubavu", province: "Western", fee: 4000, etaHours: 72 }, { name: "Nyabihu", province: "Western", fee: 3500, etaHours: 72 }, { name: "Ngororero", province: "Western", fee: 3000, etaHours: 72 }, { name: "Rusizi", province: "Western", fee: 4000, etaHours: 96 }, { name: "Nyamasheke", province: "Western", fee: 4000, etaHours: 96 },
  ];
  for (const d of districts) { const data = { ...d, district: d.name, nameEn: d.name, nameFr: d.name, nameRw: d.name }; const ex = await db.deliveryZone.findFirst({ where: { name: d.name } }); if (ex) await db.deliveryZone.update({ where: { id: ex.id }, data }); else await db.deliveryZone.create({ data }); }
  console.log(`✓ ${districts.length} delivery districts`);

  const coupons = [
    { code: "WELCOME5", type: "percent", value: 5, minOrder: 15000, isPublic: true, description: "5% off first order" },
    { code: "MOMO500", type: "fixed", value: 500, minOrder: 10000, isPublic: true, description: "RWF 500 off with MoMo" },
    { code: "BEAUTY10", type: "percent", value: 10, minOrder: 50000, isPublic: false, description: "10% off big orders" },
  ];
  for (const c of coupons) await db.coupon.upsert({ where: { code: c.code }, update: {}, create: c });
  console.log(`✓ ${coupons.length} coupons`);

  // Bundles
  const bundles = [
    { nameEn: "Skincare Essentials Kit", nameFr: "Kit Soins", nameRw: "Igikoresho cyo Kwita", descEn: "CeraVe + Niacinamide + Sunscreen", normalPrice: 59500, bundlePrice: 49900, emoji: "🎁", productIds: ["SK-001","SK-002","SK-004"] },
    { nameEn: "Men's Grooming Pack", nameFr: "Pack Homme", nameRw: "Iby'umugabo", descEn: "Face wash + razor + deodorant + Armani", normalPrice: 131000, bundlePrice: 109900, emoji: "🪒", productIds: ["MN-001","MN-002","MN-003","MN-004"] },
    { nameEn: "Makeup Artist Set", nameFr: "Set Maquillage", nameRw: "Ibyo gukora isura", descEn: "Lipstick + blush + foundation + gloss", normalPrice: 97000, bundlePrice: 82400, emoji: "💄", productIds: ["MK-001","MK-002","MK-003","MK-004"] },
  ];
  for (const b of bundles) { const { productIds, ...bd } = b; const savingsPct = Math.round((1 - b.bundlePrice / b.normalPrice) * 100); const ex = await db.bundle.findFirst({ where: { nameEn: b.nameEn } }); const bundle = ex ? await db.bundle.update({ where: { id: ex.id }, data: { ...bd, savingsPct } }) : await db.bundle.create({ data: { ...bd, savingsPct, stockQty: 20 } }); await db.bundleItem.deleteMany({ where: { bundleId: bundle.id } }); for (const pid of productIds) await db.bundleItem.create({ data: { bundleId: bundle.id, productId: pid } }); }
  console.log(`✓ ${bundles.length} bundles`);

  // Reviews
  const reviews = [
    { productId: "MK-001", customerName: "Aline U.", customerPhone: "+250788111222", rating: 5, title: "Perfect shade!", body: "Lasts all day at work.", isApproved: true },
    { productId: "MK-001", customerName: "Claudine M.", customerPhone: "+250788222333", rating: 4, title: "Good but dry", body: "Color is gorgeous but a bit drying.", isApproved: true },
    { productId: "SK-001", customerName: "Immaculée K.", customerPhone: "+250788333444", rating: 5, title: "My skin loves it", body: "After 2 weeks my skin feels hydrated.", isApproved: true },
    { productId: "PF-001", customerName: "Sophie B.", customerPhone: "+250788444555", rating: 5, title: "Worth every RWF", body: "Long-lasting and elegant.", isApproved: true },
    { productId: "PF-002", customerName: "Patrick N.", customerPhone: "+250788555666", rating: 5, title: "My signature scent", body: "Fresh and masculine.", isApproved: true },
    { productId: "HC-003", customerName: "Diane U.", customerPhone: "+250788666777", rating: 4, title: "Great for textured hair", body: "Leaves my curls soft.", isApproved: true },
  ];
  for (const r of reviews) await db.review.create({ data: r });
  for (const pid of [...new Set(reviews.map(r => r.productId))]) { const approved = reviews.filter(r => r.productId === pid && r.isApproved); if (approved.length > 0) { const avg = approved.reduce((s, r) => s + r.rating, 0) / approved.length; await db.product.update({ where: { id: pid }, data: { ratingAvg: Math.round(avg * 100) / 100, ratingCount: approved.length } }); } }
  console.log(`✓ ${reviews.length} reviews`);

  // Testimonials
  const testimonials = [
    { customerName: "Aline Uwase", district: "Gasabo", messageEn: "Best MAC lipstick prices in Kigali. Fast delivery!", messageFr: "Meilleurs prix MAC à Kigali.", messageRw: "Ibiciro byiza bya MAC mu Kigali.", rating: 5, isApproved: true },
    { customerName: "Eric Mugisha", district: "Musanze", messageEn: "Ordered Dior Sauvage — 100% authentic, delivered in 2 days.", messageFr: "Dior Sauvage — authentique, livré en 2 jours.", messageRw: "Dior Sauvage — nziza cyane.", rating: 5, isApproved: true },
    { customerName: "Claudine Nirere", district: "Kicukiro", messageEn: "Loyalty points got me 10% off. Love this shop!", messageFr: "Points de fidélité — 10% de réduction.", messageRw: "Amanota byampaye 10%.", rating: 5, isApproved: true },
  ];
  for (const t of testimonials) await db.testimonial.create({ data: t });
  console.log(`✓ ${testimonials.length} testimonials`);

  console.log("\n✅ Seed v2 complete!");
  console.log("Admin: admin / admin123");
  console.log("Staff: sales / sales123 | stock / stock123");
}

main().catch(e => { console.error(e); process.exit(1); }).finally(async () => { await db.$disconnect(); });
