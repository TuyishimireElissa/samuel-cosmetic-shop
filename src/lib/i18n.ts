// Samuel Cosmetic Shop - i18n translations
// Default language: Kinyarwanda (rw) | English (en) | French (fr)

export type Lang = "rw" | "en" | "fr";

export const LANGS: { code: Lang; label: string; flag: string }[] = [
  { code: "rw", label: "Kinyarwanda", flag: "🇷🇼" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
];

type Dict = Record<string, { rw: string; en: string; fr: string }>;

const dict: Dict = {
  // Nav
  "nav.home": { rw: "Ahabanza", en: "Home", fr: "Accueil" },
  "nav.shop": { rw: "Iduka", en: "Shop", fr: "Boutique" },
  "nav.categories": { rw: "Inzego", en: "Categories", fr: "Catégories" },
  "nav.about": { rw: "Tware", en: "About", fr: "À propos" },
  "nav.contact": { rw: "Twuvugane", en: "Contact", fr: "Contact" },
  "nav.wholesale": { rw: "Gurisha Krisi", en: "Wholesale", fr: "Gros" },
  "nav.admin": { rw: "Umuyobozi", en: "Admin", fr: "Admin" },
  "nav.cart": { rw: "Igikoni", en: "Cart", fr: "Panier" },

  // Hero
  "hero.title": {
    rw: "Ubwiza Bwiza ku Buri Munyarwanda",
    en: "Beautiful Cosmetics for Every Rwandan",
    fr: "Beaux Cosmétiques pour Chaque Rwandais",
  },
  "hero.subtitle": {
    rw: "Inkoni ziza, amavuta y'isura, ibinyobwa bya parfume — byose hano huri mu Kigali.",
    en: "Quality makeup, skincare, and fragrances — all here in Kigali.",
    fr: "Maquillage de qualité, soins de la peau et parfums — tout ici à Kigali.",
  },
  "hero.cta.shop": { rw: "Tangira Gura", en: "Start Shopping", fr: "Commencer" },
  "hero.cta.whatsapp": { rw: "Vugana na Twe", en: "Chat on WhatsApp", fr: "Discuter sur WhatsApp" },

  // Categories
  "categories.title": { rw: "Inzego Zacu", en: "Our Categories", fr: "Nos Catégories" },
  "categories.subtitle": {
    rw: "Hitamo inzego z'ibicuruzwa byawe byo gukoresha.",
    en: "Choose from our product categories.",
    fr: "Choisissez parmi nos catégories de produits.",
  },
  "categories.all": { rw: "Byose", en: "All", fr: "Tous" },

  // Product card
  "product.addToCart": { rw: "Shyira mu Gikoni", en: "Add to Cart", fr: "Ajouter au panier" },
  "product.added": { rw: "Byongerewe!", en: "Added!", fr: "Ajouté!" },
  "product.outOfStock": { rw: "Byarangije", en: "Out of Stock", fr: "Rupture de stock" },
  "product.left": { rw: "bisigaye", en: "left", fr: "restants" },
  "product.only": { rw: "Bisigaye gusa", en: "Only", fr: "Seulement" },
  "product.lastOne": { rw: "Icya nyuma! Vuba!", en: "Last one! Hurry!", fr: "Dernier! Dépêche!" },
  "product.bestseller": { rw: "Kirisito", en: "Best Seller", fr: "Meilleure vente" },
  "product.new": { rw: "Gishya", en: "New", fr: "Nouveau" },
  "product.hot": { rw: "Bikabije", en: "Hot", fr: "Chaud" },
  "product.popular": { rw: "Bizwi cyane", en: "Popular", fr: "Populaire" },
  "product.reviews": { rw: "ibyifuzo", en: "reviews", fr: "avis" },

  // Search & filters
  "search.placeholder": {
    rw: "Shakisha ibicuruzwa...",
    en: "Search products...",
    fr: "Rechercher des produits...",
  },
  "search.noResults": {
    rw: "Nta bicuruzwa byabonetse. Gerageza: lipstick, kremu, parfum",
    en: "No products found. Try: lipstick, cream, perfume",
    fr: "Aucun produit trouvé. Essayez: rouge à lèvres, crème, parfum",
  },
  "filter.sortBy": { rw: "Shyira ku murongo", en: "Sort by", fr: "Trier par" },
  "filter.priceLow": { rw: "Igiciro (cyo hasi)", en: "Price (low to high)", fr: "Prix (croissant)" },
  "filter.priceHigh": { rw: "Igiciro (cyo hejuru)", en: "Price (high to low)", fr: "Prix (décroissant)" },
  "filter.rating": { rw: "Amanota", en: "Rating", fr: "Évaluation" },
  "filter.newest": { rw: "Bishya", en: "Newest", fr: "Plus récents" },
  "filter.priceRange": { rw: "Igiciro", en: "Price range", fr: "Gamme de prix" },

  // Cart
  "cart.title": { rw: "Igikoni Cyawe", en: "Your Cart", fr: "Votre Panier" },
  "cart.empty": { rw: "Igikoni cyawe kirimo ubusa", en: "Your cart is empty", fr: "Votre panier est vide" },
  "cart.browse": { rw: "Reba Ibicuruzwa", en: "Browse Products", fr: "Parcourir les Produits" },
  "cart.continue": { rw: "← Komeza Gura", en: "← Continue Shopping", fr: "← Continuer" },
  "cart.subtotal": { rw: "Igiteranyo", en: "Subtotal", fr: "Sous-total" },
  "cart.vat": { rw: "VAT 18%", en: "VAT 18%", fr: "TVA 18%" },
  "cart.delivery": { rw: "Amafunguro", en: "Delivery", fr: "Livraison" },
  "cart.total": { rw: "Igiteranyo Cyose", en: "Total", fr: "Total" },
  "cart.checkout": { rw: "Komeza →", en: "Checkout →", fr: "Paiement →" },
  "cart.orderWhatsapp": {
    rw: "Tumira kuri WhatsApp",
    en: "Order via WhatsApp",
    fr: "Commander sur WhatsApp",
  },
  "cart.coupon.placeholder": { rw: "Kode ya coupon", en: "Coupon code", fr: "Code promo" },
  "cart.coupon.apply": { rw: "Emeza", en: "Apply", fr: "Appliquer" },

  // Checkout
  "checkout.title": { rw: "Kwishyura", en: "Checkout", fr: "Paiement" },
  "checkout.step.review": { rw: "Reba", en: "Review", fr: "Vérifier" },
  "checkout.step.delivery": { rw: "Aho Bari", en: "Delivery", fr: "Livraison" },
  "checkout.step.payment": { rw: "Kwishyura", en: "Payment", fr: "Paiement" },
  "checkout.step.confirm": { rw: "Emeza", en: "Confirm", fr: "Confirmer" },
  "checkout.name": { rw: "Amazina", en: "Full Name", fr: "Nom complet" },
  "checkout.phone": { rw: "Telefone", en: "Phone Number", fr: "Téléphone" },
  "checkout.email": { rw: "Imeyili (bitari ngirabwibeshya)", en: "Email (optional)", fr: "Email (optionnel)" },
  "checkout.district": { rw: "Akarere", en: "District", fr: "District" },
  "checkout.address": { rw: "Aderesi", en: "Address", fr: "Adresse" },
  "checkout.notes": { rw: "Ibindi bisobanuro", en: "Notes (optional)", fr: "Notes (optionnel)" },
  "checkout.payment.whatsapp": { rw: "WhatsApp Order", en: "WhatsApp Order", fr: "Commande WhatsApp" },
  "checkout.payment.momo": { rw: "MTN MoMo", en: "MTN MoMo", fr: "MTN MoMo" },
  "checkout.payment.airtel": { rw: "Airtel Money", en: "Airtel Money", fr: "Airtel Money" },
  "checkout.payment.cash": { rw: "Amadorari (kugera)", en: "Cash on Delivery", fr: "Paiement à la livraison" },
  "checkout.back": { rw: "← Subira inyuma", en: "← Back", fr: "← Retour" },
  "checkout.next": { rw: "Komeza →", en: "Next →", fr: "Suivant →" },
  "checkout.placeOrder": { rw: "Tumira Oridere", en: "Place Order", fr: "Passer la commande" },
  "checkout.delivery.estimate": { rw: "Igihe cyo kugeza", en: "Delivery estimate", fr: "Délai de livraison" },

  // Order success
  "order.success.title": { rw: "Murakoze ku gicuruzwa cyawe!", en: "Thank you for your order!", fr: "Merci pour votre commande!" },
  "order.success.number": { rw: "Nomero ya oridere", en: "Order number", fr: "Numéro de commande" },
  "order.success.whatsapp": {
    rw: "Kanda hano ku bumanne na twe kuri WhatsApp shyiraho order yawe",
    en: "Click below to send your order to us on WhatsApp",
    fr: "Cliquez ci-dessous pour envoyer votre commande sur WhatsApp",
  },
  "order.success.sendWhatsapp": { rw: "Tumira kuri WhatsApp", en: "Send to WhatsApp", fr: "Envoyer sur WhatsApp" },
  "order.success.continue": { rw: "Komeza Gura", en: "Continue Shopping", fr: "Continuer les achats" },

  // Footer
  "footer.about": {
    rw: "Samuel Cosmetic Shop ni iduka ry'ibintu byo kwiteza mu Kigali, u Rwanda. Tugurisha ibyiza ku biciro byiza.",
    en: "Samuel Cosmetic Shop is a beauty store in Kigali, Rwanda. We sell quality products at fair prices.",
    fr: "Samuel Cosmetic Shop est un magasin de beauté à Kigali, Rwanda. Nous vendons des produits de qualité à des prix équitables.",
  },
  "footer.contact": { rw: "Twuvugane", en: "Contact Us", fr: "Contactez-nous" },
  "footer.hours": { rw: "Amasaha yo gukora", en: "Business Hours", fr: "Heures d'ouverture" },
  "footer.follow": { rw: "Dukurikire", en: "Follow Us", fr: "Suivez-nous" },
  "footer.rights": { rw: "Uburenganzira bwose bwizigamiwe.", en: "All rights reserved.", fr: "Tous droits réservés." },

  // Admin
  "admin.login.title": { rw: "Injira nk'umuyobozi", en: "Admin Login", fr: "Connexion Admin" },
  "admin.login.username": { rw: "Izina ryo gukoresha", en: "Username", fr: "Nom d'utilisateur" },
  "admin.login.password": { rw: "Ijambo ry'ibanga", en: "Password", fr: "Mot de passe" },
  "admin.login.submit": { rw: "Injira", en: "Sign In", fr: "Se connecter" },
  "admin.login.error": { rw: "Izina cyangwa ijambo ry'ibanga sibyo.", en: "Invalid username or password.", fr: "Nom d'utilisateur ou mot de passe invalide." },
  "admin.login.hint": { rw: "Gerageza: admin / admin123", en: "Try: admin / admin123", fr: "Essayez: admin / admin123" },

  "admin.dashboard": { rw: "Ibiro by'ubuyobozi", en: "Dashboard", fr: "Tableau de bord" },
  "admin.products": { rw: "Ibicuruzwa", en: "Products", fr: "Produits" },
  "admin.orders": { rw: "Oridere", en: "Orders", fr: "Commandes" },
  "admin.customers": { rw: "Abakiriya", en: "Customers", fr: "Clients" },
  "admin.vatReport": { rw: "Raporo ya VAT", en: "VAT Report", fr: "Rapport TVA" },
  "admin.logout": { rw: "Sohoka", en: "Logout", fr: "Déconnexion" },

  "admin.kpi.revenue": { rw: "Inkunga (uu munsi)", en: "Revenue (today)", fr: "Revenu (aujourd'hui)" },
  "admin.kpi.orders": { rw: "Oridere (uu munsi)", en: "Orders (today)", fr: "Commandes (aujourd'hui)" },
  "admin.kpi.products": { rw: "Ibicuruzwa", en: "Products", fr: "Produits" },
  "admin.kpi.lowStock": { rw: "Bikennye mu stock", en: "Low stock", fr: "Stock faible" },
  "admin.kpi.revenue.month": { rw: "Inkunga y'ukwezi", en: "Monthly revenue", fr: "Revenu mensuel" },
  "admin.kpi.customers": { rw: "Abakiriya bishye", en: "New customers", fr: "Nouveaux clients" },

  "admin.orders.status": { rw: "Imiterere", en: "Status", fr: "Statut" },
  "admin.orders.customer": { rw: "Umukiriya", en: "Customer", fr: "Client" },
  "admin.orders.total": { rw: "Igiteranyo", en: "Total", fr: "Total" },
  "admin.orders.date": { rw: "Itariki", en: "Date", fr: "Date" },
  "admin.orders.actions": { rw: "Ibikorwa", en: "Actions", fr: "Actions" },
  "admin.orders.view": { rw: "Reba", en: "View", fr: "Voir" },
  "admin.orders.notify": { rw: "📱 Menyesha", en: "📱 Notify", fr: "📱 Notifier" },
  "admin.orders.receipt": { rw: "🧾 EBM", en: "🧾 EBM", fr: "🧾 EBM" },
  "admin.orders.invoice": { rw: "📄 Invoice", en: "📄 Invoice", fr: "📄 Facture" },

  "admin.products.add": { rw: "+ Ongera Igicuruzwa", en: "+ Add Product", fr: "+ Ajouter Produit" },
  "admin.products.edit": { rw: "Hindura", en: "Edit", fr: "Modifier" },
  "admin.products.delete": { rw: "Siba", en: "Delete", fr: "Supprimer" },
  "admin.products.name": { rw: "Izina", en: "Name", fr: "Nom" },
  "admin.products.category": { rw: "Inzego", en: "Category", fr: "Catégorie" },
  "admin.products.price": { rw: "Igiciro (TTC)", en: "Price (TTC)", fr: "Prix (TTC)" },
  "admin.products.cost": { rw: "Igiciro cyo kugura (HT)", en: "Cost Price (HT)", fr: "Prix d'achat (HT)" },
  "admin.products.stock": { rw: "Stock", en: "Stock", fr: "Stock" },
  "admin.products.wholesale": { rw: "Igiciro cya gros", en: "Wholesale price", fr: "Prix de gros" },
  "admin.products.emoji": { rw: "Emojis", en: "Emoji", fr: "Emoji" },
  "admin.products.sku": { rw: "SKU", en: "SKU", fr: "SKU" },
  "admin.products.badge": { rw: "Ikirango", en: "Badge", fr: "Badge" },
  "admin.products.save": { rw: "Bika", en: "Save", fr: "Enregistrer" },
  "admin.products.cancel": { rw: "Hakana", en: "Cancel", fr: "Annuler" },
  "admin.products.calc.ht": { rw: "Igiciro HT", en: "Price HT", fr: "Prix HT" },
  "admin.products.calc.vat": { rw: "VAT", en: "VAT", fr: "TVA" },
  "admin.products.calc.profit": { rw: "Inyungu", en: "Profit", fr: "Profit" },
  "admin.products.calc.margin": { rw: "Marisi %", en: "Margin %", fr: "Marge %" },

  "admin.vat.title": { rw: "Raporo ya VAT y'ukwezi", en: "Monthly VAT Report", fr: "Rapport TVA Mensuel" },
  "admin.vat.collected": { rw: "VAT yakiriwe", en: "VAT Collected", fr: "TVA Collectée" },
  "admin.vat.salesHT": { rw: "Icuru HT", en: "Sales HT", fr: "Ventes HT" },
  "admin.vat.salesTTC": { rw: "Icuru TTC", en: "Sales TTC", fr: "Ventes TTC" },
  "admin.vat.export": { rw: "↧ Mura CSV", en: "↧ Export CSV", fr: "↧ Exporter CSV" },

  // Common
  "common.close": { rw: "Funga", en: "Close", fr: "Fermer" },
  "common.loading": { rw: "Tegereza...", en: "Loading...", fr: "Chargement..." },
  "common.save": { rw: "Bika", en: "Save", fr: "Enregistrer" },
  "common.cancel": { rw: "Hakana", en: "Cancel", fr: "Annuler" },
  "common.yes": { rw: "Yego", en: "Yes", fr: "Oui" },
  "common.no": { rw: "Oya", en: "No", fr: "Non" },
  "common.search": { rw: "Shakisha", en: "Search", fr: "Rechercher" },
  "common.all": { rw: "Byose", en: "All", fr: "Tous" },
  "common.back": { rw: "Subira inyuma", en: "Back", fr: "Retour" },
  "common.optional": { rw: "(bitari ngirabwibeshya)", en: "(optional)", fr: "(optionnel)" },
};

export function t(key: string, lang: Lang): string {
  const entry = dict[key];
  if (!entry) return key;
  return entry[lang] || entry.en || entry.rw || key;
}

export function pickLang<T extends { nameEn: string; nameFr: string; nameRw: string }>(
  obj: T,
  lang: Lang
): string {
  if (lang === "rw") return obj.nameRw || obj.nameEn;
  if (lang === "fr") return obj.nameFr || obj.nameEn;
  return obj.nameEn;
}

export function detectInitialLang(): Lang {
  if (typeof window === "undefined") return "rw";
  const stored = localStorage.getItem("sc_language") as Lang | null;
  if (stored && ["rw", "en", "fr"].includes(stored)) return stored;
  // Per spec: only switch if browser is explicitly rw or fr; otherwise default to Kinyarwanda
  const nav = navigator.language?.toLowerCase() || "";
  if (nav.startsWith("fr")) return "fr";
  if (nav.startsWith("rw")) return "rw";
  return "rw"; // default Kinyarwanda (per Samuel Cosmetic Shop spec)
}
