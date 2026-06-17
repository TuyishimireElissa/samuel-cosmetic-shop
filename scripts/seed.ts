// Seed script - run via: bun run scripts/seed.ts
// Seeds: 4 categories, 16 products, 5 delivery zones, admin user, site settings

import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

function hash(s: string): string {
  // Simple hash for demo admin (NOT for production — would use bcrypt/argon2)
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = (h * 33) ^ s.charCodeAt(i);
  }
  return `sc$${(h >>> 0).toString(16)}$${s.length}`;
}

async function main() {
  console.log("🌱 Seeding Samuel Cosmetic Shop...");

  // ── Site settings ───────────────────────────────────────────
  await db.siteSetting.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });
  console.log("✓ Site settings");

  // ── Admin user ──────────────────────────────────────────────
  await db.adminUser.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      passwordHash: hash("admin123"),
      email: "samuelcosmeticshop@gmail.com",
      fullName: "Samuel — Shop Administrator",
    },
  });
  console.log("✓ Admin user (admin / admin123)");

  // ── Categories ──────────────────────────────────────────────
  const categories = [
    {
      id: "makeup",
      nameEn: "Makeup",
      nameFr: "Maquillage",
      nameRw: "Isura",
      emoji: "💄",
      slug: "makeup",
      sortOrder: 1,
    },
    {
      id: "skincare",
      nameEn: "Skincare",
      nameFr: "Soins de la peau",
      nameRw: "Kwita ku gusura",
      emoji: "🧴",
      slug: "skincare",
      sortOrder: 2,
    },
    {
      id: "perfume",
      nameEn: "Fragrances",
      nameFr: "Parfums",
      nameRw: "Parfume",
      emoji: "🌸",
      slug: "fragrances",
      sortOrder: 3,
    },
    {
      id: "haircare",
      nameEn: "Hair Care",
      nameFr: "Soins capillaires",
      nameRw: "Kwita ku misatsi",
      emoji: "💇🏾‍♀️",
      slug: "hair-care",
      sortOrder: 4,
    },
  ];

  for (const c of categories) {
    await db.category.upsert({
      where: { id: c.id },
      update: c,
      create: c,
    });
  }
  console.log(`✓ ${categories.length} categories`);

  // ── Products (16) ───────────────────────────────────────────
  // cost_price is HT (what shop paid), selling_price is TTC (what customer pays, incl 18% VAT)
  const products = [
    {
      id: "MK-001", sku: "MAC-RW-RED", categoryId: "makeup", emoji: "💄",
      nameEn: "MAC Matte Lipstick — Ruby Rose",
      nameFr: "MAC Rouge à Lèvres Mat — Ruby Rose",
      nameRw: "MAC Iwirabura rw'Iminwa — Ruby Rose",
      descEn: "Long-lasting matte finish in iconic ruby red.",
      descFr: "Finition mate longue durée en rouge rubis emblématique.",
      descRw: "Iwirabura rya kera cyane mu ruby red.",
      costPrice: 12000, sellingPrice: 25000, wholesalePrice: 19000,
      stockQty: 47, badge: "bestseller",
    },
    {
      id: "MK-002", sku: "NARS-BLUSH", categoryId: "makeup", emoji: "🌸",
      nameEn: "NARS Blush — Orgasm",
      nameFr: "NARS Blush — Orgasm",
      nameRw: "NARS Blush — Orgasm",
      descEn: "Peachy-pink with golden shimmer for a natural flush.",
      descFr: "Pêche-rose avec éclat doré pour un teint naturel.",
      descRw: "Peachy-pink n'umugabane urabagiro ku isura.",
      costPrice: 15000, sellingPrice: 32000, wholesalePrice: 25000,
      stockQty: 28, badge: "popular",
    },
    {
      id: "MK-003", sku: "MAYB-FOND", categoryId: "makeup", emoji: "🧴",
      nameEn: "Maybelline Fit Me Foundation",
      nameFr: "Maybelline Fond de Teint Fit Me",
      nameRw: "Maybelline Foundation Fit Me",
      descEn: "Lightweight, breathable coverage for normal-to-oily skin.",
      descFr: "Couvrance légère et respirante pour peau normale à grasse.",
      descRw: "Byoroshye ku gusura, byiza cyane.",
      costPrice: 8000, sellingPrice: 18000, wholesalePrice: 13500,
      stockQty: 60, badge: "popular",
    },
    {
      id: "MK-004", sku: "FENT-GLOS", categoryId: "makeup", emoji: "✨",
      nameEn: "Fenty Gloss Bomb",
      nameFr: "Fenty Gloss Bomb",
      nameRw: "Fenty Gloss Bomb",
      descEn: "Shimmering lip gloss that nourishes and shines.",
      descFr: "Gloss à lèvres brillant et nourrissant.",
      descRw: "Gloss y'iminwa irabagira ikazana imuriro.",
      costPrice: 9000, sellingPrice: 22000, wholesalePrice: 17000,
      stockQty: 4, badge: "hot",
    },
    // Skincare
    {
      id: "SK-001", sku: "CERA-MOIST", categoryId: "skincare", emoji: "🧴",
      nameEn: "CeraVe Moisturizing Cream",
      nameFr: "CeraVe Crème Hydratante",
      nameRw: "CeraVe Kremu yo Kwubaka Gusura",
      descEn: "24-hour hydration with ceramides and hyaluronic acid.",
      descFr: "Hydratation 24h avec céramides et acide hyaluronique.",
      descRw: "Kwubaka amazi ku gusura mu masaha 24.",
      costPrice: 9000, sellingPrice: 19500, wholesalePrice: 15000,
      stockQty: 80, badge: "bestseller",
    },
    {
      id: "SK-002", sku: "NIA-SERUM", categoryId: "skincare", emoji: "💧",
      nameEn: "The Ordinary Niacinamide 10%",
      nameFr: "The Ordinary Niacinamide 10%",
      nameRw: "The Ordinary Niacinamide 10%",
      descEn: "Reduces blemishes and visible pores with zinc.",
      descFr: "Réduit les imperfections et pores visibles au zinc.",
      descRw: "Byoroze imyanda ku gusura.",
      costPrice: 5000, sellingPrice: 12000, wholesalePrice: 9000,
      stockQty: 120, badge: "popular",
    },
    {
      id: "SK-003", sku: "CET-WASH", categoryId: "skincare", emoji: "🧼",
      nameEn: "Cetaphil Gentle Skin Cleanser",
      nameFr: "Cetaphil Nettoyant Doux",
      nameRw: "Cetaphil Sabo yo Gusukura Gusura",
      descEn: "Mild, non-irritating cleanser for all skin types.",
      descFr: "Nettoyant doux non irritant pour tous types de peau.",
      descRw: "Sabo yoroshye ku bwa moko yose y'isura.",
      costPrice: 7000, sellingPrice: 15500, wholesalePrice: 11500,
      stockQty: 50, badge: "",
    },
    {
      id: "SK-004", sku: "SUN-SPF50", categoryId: "skincare", emoji: "☀️",
      nameEn: "La Roche-Posay SPF50 Sunscreen",
      nameFr: "La Roche-Posay Écran Solaire SPF50",
      nameRw: "La Roche-Posay Izenguruka z'Urima SPF50",
      descEn: "High-protection broad-spectrum sunscreen for sensitive skin.",
      descFr: "Écran solaire haute protection pour peau sensible.",
      descRw: "Izenguruka z'urima z'irinda cyane.",
      costPrice: 13000, sellingPrice: 28000, wholesalePrice: 22000,
      stockQty: 35, badge: "new",
    },
    // Perfumes
    {
      id: "PF-001", sku: "CH-COCO", categoryId: "perfume", emoji: "🌸",
      nameEn: "Chanel Coco Mademoiselle EDP 50ml",
      nameFr: "Chanel Coco Mademoiselle EDP 50ml",
      nameRw: "Chanel Coco Mademoiselle EDP 50ml",
      descEn: "Iconic oriental fragrance with patchouli and musk.",
      descFr: "Parfum oriental iconique au patchouli et musc.",
      descRw: "Parfume nziza cyane y'umuco w'Uburasirazuba.",
      costPrice: 55000, sellingPrice: 110000, wholesalePrice: 90000,
      stockQty: 12, badge: "bestseller",
    },
    {
      id: "PF-002", sku: "DIOR-SAU", categoryId: "perfume", emoji: "💧",
      nameEn: "Dior Sauvage EDT 100ml",
      nameFr: "Dior Sauvage EDT 100ml",
      nameRw: "Dior Sauvage EDT 100ml",
      descEn: "Fresh, raw, and noble. Bergamot and amber woods.",
      descFr: "Frais, brut et noble. Bergamote et bois ambrés.",
      descRw: "Parfume y'abagabo nziza cyane.",
      costPrice: 65000, sellingPrice: 135000, wholesalePrice: 110000,
      stockQty: 9, badge: "hot",
    },
    {
      id: "PF-003", sku: "YSL-BLACK", categoryId: "perfume", emoji: "🌙",
      nameEn: "YSL Black Opium 50ml",
      nameFr: "YSL Black Opium 50ml",
      nameRw: "YSL Black Opium 50ml",
      descEn: "Coffee, vanilla, and white flowers — seductive and addictive.",
      descFr: "Café, vanille et fleurs blanches — séduisant.",
      descRw: "Kawa n'amabara yera — parfume nziza.",
      costPrice: 60000, sellingPrice: 125000, wholesalePrice: 100000,
      stockQty: 7, badge: "popular",
    },
    {
      id: "PF-004", sku: "CK-ONE", categoryId: "perfume", emoji: "🌿",
      nameEn: "Calvin Klein CK One 100ml",
      nameFr: "Calvin Klein CK One 100ml",
      nameRw: "Calvin Klein CK One 100ml",
      descEn: "Unisex citrus aromatic — fresh and youthful.",
      descFr: "Agrumes aromatiques unisexes — frais.",
      descRw: "Parfume y'abagabo n'abagore nziza.",
      costPrice: 28000, sellingPrice: 55000, wholesalePrice: 43000,
      stockQty: 22, badge: "",
    },
    // Hair care
    {
      id: "HC-001", sku: "SHEM-OIL", categoryId: "haircare", emoji: "💆🏾‍♀️",
      nameEn: "Shea Moisture Coconut Oil",
      nameFr: "Shea Moisture Huile de Coco",
      nameRw: "Shea Moisture Amavuta ya Kokonati",
      descEn: "Nourishing hair oil with coconut and hibiscus.",
      descFr: "Huile nourrissante à la noix de coco et hibiscus.",
      descRw: "Amavuta yiza yo kwita ku misatsi.",
      costPrice: 6000, sellingPrice: 14500, wholesalePrice: 11000,
      stockQty: 65, badge: "",
    },
    {
      id: "HC-002", sku: "OR-SHAM", categoryId: "haircare", emoji: "🧴",
      nameEn: "ORIBE Gold Shampoo 250ml",
      nameFr: "ORIBE Shampoing Gold 250ml",
      nameRw: "ORIBE Shampoing ya Zahabu 250ml",
      descEn: "Luxurious shampoo for shine and softness.",
      descFr: "Shampoing luxueux pour brillance et douceur.",
      descRw: "Shampoong nziza cyane yo guha ubagara.",
      costPrice: 18000, sellingPrice: 38000, wholesalePrice: 30000,
      stockQty: 18, badge: "new",
    },
    {
      id: "HC-003", sku: "CAN-COND", categoryId: "haircare", emoji: "🧴",
      nameEn: "Cantu Shea Butter Conditioner",
      nameFr: "Cantu Après-shampoing au Karité",
      nameRw: "Cantu Conditioner y'Amavuta ya Karite",
      descEn: "Deep conditioning with shea butter for textured hair.",
      descFr: "Conditionnement profond au karité.",
      descRw: "Conditioner y'imbyatsi ikomeye.",
      costPrice: 5000, sellingPrice: 12500, wholesalePrice: 9500,
      stockQty: 75, badge: "popular",
    },
    {
      id: "HC-004", sku: "MOR-OIL", categoryId: "haircare", emoji: "✨",
      nameEn: "Moroccanoil Treatment 100ml",
      nameFr: "Moroccanoil Traitement 100ml",
      nameRw: "Moroccanoil Amavuta yo Kwita 100ml",
      descEn: "Argan oil treatment for shine and conditioning.",
      descFr: "Traitement à l'huile d'argan.",
      descRw: "Amavuta ya Argan yo kwita ku misatsi.",
      costPrice: 22000, sellingPrice: 45000, wholesalePrice: 36000,
      stockQty: 3, badge: "hot",
    },
  ];

  for (const p of products) {
    await db.product.upsert({
      where: { id: p.id },
      update: p,
      create: p,
    });
  }
  console.log(`✓ ${products.length} products`);

  // ── Delivery zones ──────────────────────────────────────────
  const zones = [
    { name: "Gasabo", nameEn: "Gasabo", nameFr: "Gasabo", nameRw: "Gasabo", district: "Gasabo", fee: 2000, etaHours: 6 },
    { name: "Kicukiro", nameEn: "Kicukiro", nameFr: "Kicukiro", nameRw: "Kicukiro", district: "Kicukiro", fee: 2000, etaHours: 6 },
    { name: "Nyarugenge", nameEn: "Nyarugenge", nameFr: "Nyarugenge", nameRw: "Nyarugenge", district: "Nyarugenge", fee: 2000, etaHours: 6 },
    { name: "Musanze", nameEn: "Musanze", nameFr: "Musanze", nameRw: "Musanze", district: "Musanze", fee: 4000, etaHours: 48 },
    { name: "Rubavu", nameEn: "Rubavu", nameFr: "Rubavu", nameRw: "Rubavu", district: "Rubavu", fee: 5000, etaHours: 72 },
  ];

  for (const z of zones) {
    const existing = await db.deliveryZone.findFirst({ where: { name: z.name } });
    if (existing) {
      await db.deliveryZone.update({ where: { id: existing.id }, data: z });
    } else {
      await db.deliveryZone.create({ data: z });
    }
  }
  console.log(`✓ ${zones.length} delivery zones`);

  // ── Coupon ──────────────────────────────────────────────────
  await db.coupon.upsert({
    where: { code: "WELCOME5" },
    update: {},
    create: {
      code: "WELCOME5",
      type: "percent",
      value: 5,
      minOrder: 15000,
      maxUses: 0,
      isActive: true,
      isPublic: true,
    },
  });
  console.log("✓ Sample coupon (WELCOME5)");

  console.log("\n✅ Seed complete! Admin login: admin / admin123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
