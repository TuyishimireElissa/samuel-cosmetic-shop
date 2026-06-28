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
  "product.reviews": { rw: "Ibyatoranyijwe", en: "Reviews", fr: "Avis" },
  "product.writeReview": { rw: "Andika Icyatoranyijwe", en: "Write a Review", fr: "Écrire un Avis" },
  "product.noReviews": { rw: "Nta byatoranyijwe bishyitse.", en: "No reviews yet.", fr: "Aucun avis pour l'instant." },
  "product.shopReply": { rw: "Igisubizo cy'iduka:", en: "Shop reply:", fr: "Réponse du magasin :" },
  "product.reviewSubmitted": { rw: "Icyatoranyijwe cyoherejwe!", en: "Review submitted!", fr: "Avis soumis !" },

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
  "search.photo": { rw: "Shakisha n'Ifoto", en: "Photo Search", fr: "Recherche Photo" },
  "search.resultsFor": { rw: "Ibisubizo byo gushakisha", en: "Search results for", fr: "Résultats de recherche pour" },
  "search.searchResults": { rw: "Ibisubizo byo Gushakisha", en: "Search Results", fr: "Résultats de Recherche" },
  "search.clear": { rw: "Siba Gushakisha", en: "Clear search", fr: "Effacer la recherche" },
  "search.resultSingular": { rw: "igicuruzwa", en: "product", fr: "produit" },
  "search.resultPlural": { rw: "ibicuruzwa", en: "products", fr: "produits" },

  "sections.featured": { rw: "Ibicuruzwa Byiza", en: "Featured Products", fr: "Produits en Vedette" },
  "sections.bundles": { rw: "Imibonano Yihariye", en: "Special Bundles", fr: "Ensembles Spéciaux" },
  "sections.quickServices": { rw: "Serivisi Zihuta", en: "Quick Services", fr: "Services Rapides" },
  "sections.testimonials": { rw: "Ibyabakiriya Bivuga", en: "What Our Customers Say", fr: "Ce Que Disent Nos Clients" },

  "services.trackOrder": { rw: "Kurikirana Oridere", en: "Track Order", fr: "Suivre Commande" },
  "services.trackOrderDesc": { rw: "Kureba imiterere", en: "Check status", fr: "Vérifier le statut" },
  "services.myAccount": { rw: "Konti Yanjye", en: "My Account", fr: "Mon Compte" },
  "services.myAccountDesc": { rw: "Amanota & amateka", en: "Loyalty & history", fr: "Fidélité & historique" },
  "services.book": { rw: "Fungura Itariki", en: "Book", fr: "Réserver" },
  "services.bookDesc": { rw: "Igihe cyo gukorera", en: "Appointment", fr: "Rendez-vous" },
  "services.wholesale": { rw: "Igurisha Ryinshi", en: "Wholesale", fr: "Vente en Gros" },
  "services.wholesaleDesc": { rw: "Umuguzi winshi", en: "Bulk buyer", fr: "Acheteur en gros" },

  "flash.defaultBanner": { rw: "Icyiciro cyihuse cyo gusubiza!", en: "Flash Sale! Limited time!", fr: "Vente Flash ! Temps limité !" },
  "flash.endsOn": { rw: "Ehera ku", en: "Ends on", fr: "Se termine le" },
  "flash.shopNow": { rw: "Gura None", en: "Shop Now", fr: "Acheter Maintenant" },
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
  "admin.reviews": { rw: "Ibyatoranyijwe", en: "Reviews", fr: "Avis" },
  "admin.inventory": { rw: "Ibyari mu Stock", en: "Inventory", fr: "Stock" },
  "admin.coupons": { rw: "Icupon", en: "Coupons", fr: "Coupons" },
  "admin.bundles": { rw: "Imibonano", en: "Bundles", fr: "Ensembles" },
  "admin.flashSales": { rw: "Icyiciro cyihuse", en: "Flash Sales", fr: "Ventes Flash" },
  "admin.bookings": { rw: "Ibyifuzo", en: "Bookings", fr: "Réservations" },
  "admin.wholesale": { rw: "Igurisha ryinshi", en: "Wholesale", fr: "Vente en gros" },
  "admin.messages": { rw: "Ubutumwa", en: "Messages", fr: "Messages" },
  "admin.subscribers": { rw: "Abiyandikishije", en: "Subscribers", fr: "Abonnés" },
  "admin.testimonials": { rw: "Ibyabaye", en: "Testimonials", fr: "Témoignages" },
  "admin.staff": { rw: "Abakozi", en: "Staff", fr: "Personnel" },
  "admin.branding": { rw: "Ibidukikije", en: "Branding", fr: "Marque" },
  "admin.notifications": { rw: "Ibyerekeye", en: "Notifications", fr: "Notifications" },
  "admin.siteHealth": { rw: "Imiterere y'urubuga", en: "Site Health", fr: "Santé du site" },
  "admin.categoriesTab": { rw: "Inzego", en: "Categories", fr: "Catégories" },
  "admin.category.nameEn": { rw: "Izina (EN)", en: "Name (EN)", fr: "Nom (EN)" },
  "admin.category.nameFr": { rw: "Izina (FR)", en: "Name (FR)", fr: "Nom (FR)" },
  "admin.category.nameRw": { rw: "Izina (RW)", en: "Name (RW)", fr: "Nom (RW)" },
  "admin.category.id": { rw: "IKID", en: "ID", fr: "ID" },
  "admin.category.slug": { rw: "Slug", en: "Slug", fr: "Slug" },
  "admin.category.active": { rw: "Gikora", en: "Active", fr: "Actif" },
  "admin.category.sortOrder": { rw: "Itondekano", en: "Sort Order", fr: "Ordre" },
  "admin.category.products": { rw: "Ibicuruzwa", en: "Products", fr: "Produits" },

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

  "modal.track.title": { rw: "Kurikirana Oridere Zawe", en: "Track Your Orders", fr: "Suivre Vos Commandes" },
  "modal.track.enterPhone": { rw: "Injiza nimero yawe ya WhatsApp", en: "Enter your WhatsApp number", fr: "Entrez votre numéro WhatsApp" },
  "modal.track.button": { rw: "Kurikirana", en: "Track", fr: "Suivre" },
  "modal.track.noOrders": { rw: "Nta oridere zabonetse", en: "No orders found", fr: "Aucune commande trouvée" },
  "modal.track.askOrder": { rw: "Wibaze ku nyandiko", en: "Ask about this order", fr: "Demander sur cette commande" },

  "modal.portal.title": { rw: "Konti Yanjye", en: "My Account", fr: "Mon Compte" },
  "modal.portal.enterPhone": { rw: "Injiza nimero yawe ya WhatsApp", en: "Enter your WhatsApp number", fr: "Entrez votre numéro WhatsApp" },
  "modal.portal.view": { rw: "Reba", en: "View", fr: "Voir" },
  "modal.portal.notFound": { rw: "Nta konti yabonetse. Tangira gukora oridere!", en: "No account found. Place an order first!", fr: "Aucun compte trouvé. Passez d'abord une commande !" },
  "modal.portal.welcome": { rw: "Murakaza neza,", en: "Welcome back,", fr: "Bon retour," },
  "modal.portal.points": { rw: "Amanota", en: "Points", fr: "Points" },
  "modal.portal.orders": { rw: "Oridere", en: "Orders", fr: "Commandes" },
  "modal.portal.spent": { rw: "Byakoreshejwe", en: "Spent", fr: "Dépensé" },
  "modal.portal.progress": { rw: "Intambwe yo ku rwego rwakurikiyeho", en: "Progress to next tier", fr: "Progression au niveau suivant" },
  "modal.portal.history": { rw: "Amateka y'Oridere", en: "Order History", fr: "Historique des Commandes" },
  "modal.portal.noOrders": { rw: "Nta oridere zijyanye", en: "No orders yet", fr: "Aucune commande" },

  "modal.booking.title": { rw: "Fungura Itariki", en: "Book an Appointment", fr: "Prendre Rendez-vous" },
  "modal.booking.chooseService": { rw: "Hitamo serivisi", en: "Choose a service", fr: "Choisir un service" },
  "modal.booking.service1": { rw: "Inama y'ubwiza", en: "Beauty Consultation", fr: "Consultation Beauté" },
  "modal.booking.service2": { rw: "Isura y'Isura", en: "Makeup Session", fr: "Séance de Maquillage" },
  "modal.booking.service3": { rw: "Gusuzuma Gusura", en: "Skincare Analysis", fr: "Analyse de la Peau" },
  "modal.booking.pickDate": { rw: "Hitamo itariki", en: "Pick a date", fr: "Choisir une date" },
  "modal.booking.availableSlots": { rw: "Igihe kiboneka", en: "Available slots", fr: "Créneaux disponibles" },
  "modal.booking.name": { rw: "Amazina *", en: "Name *", fr: "Nom *" },
  "modal.booking.phone": { rw: "Telefone *", en: "Phone *", fr: "Téléphone *" },
  "modal.booking.email": { rw: "Imeyili", en: "Email", fr: "Email" },
  "modal.booking.notes": { rw: "Ibindi", en: "Notes", fr: "Notes" },
  "modal.booking.next": { rw: "Ibikurikiyeho →", en: "Next →", fr: "Suivant →" },
  "modal.booking.confirm": { rw: "Emeza Itariki", en: "Confirm Booking", fr: "Confirmer le Rendez-vous" },
  "modal.booking.booking": { rw: "Kora Itariki...", en: "Booking...", fr: "Réservation..." },
  "modal.booking.confirmed": { rw: "Itariki Yemejwe!", en: "Booking Confirmed!", fr: "Rendez-vous Confirmé !" },
  "modal.booking.confirmMsg": { rw: "Tugiye kubyemeza kuri WhatsApp", en: "We'll confirm via WhatsApp", fr: "Nous confirmerons via WhatsApp" },
  "modal.booking.service": { rw: "Serivisi", en: "Service", fr: "Service" },
  "modal.booking.date": { rw: "Itariki", en: "Date", fr: "Date" },
  "modal.booking.time": { rw: "Igihe", en: "Time", fr: "Heure" },
  "modal.booking.done": { rw: "Byarangiye", en: "Done", fr: "Terminé" },

  "modal.wholesale.title": { rw: "Konti y'Igurisha Ryinshi", en: "Wholesale Account", fr: "Compte de Gros" },
  "modal.wholesale.why": { rw: "Kuki waba umuguzi winshi?", en: "Why become a wholesale buyer?", fr: "Pourquoi devenir acheteur en gros ?" },
  "modal.wholesale.benefit1": { rw: "✓ 5-18% ku biciro byo kugura", en: "✓ 5-18% off retail prices", fr: "✓ 5-18% de réduction" },
  "modal.wholesale.benefit2": { rw: "✓ Inyandiko za pro-forma", en: "✓ Pro-forma invoices", fr: "✓ Factures pro-forma" },
  "modal.wholesale.benefit3": { rw: "✓ Byihutisha kohereza", en: "✓ Priority delivery", fr: "✓ Livraison prioritaire" },
  "modal.wholesale.apply": { rw: "Saba", en: "Apply", fr: "Postuler" },
  "modal.wholesale.login": { rw: "Injira", en: "Login", fr: "Connexion" },
  "modal.wholesale.businessName": { rw: "Izina ry'Ubucuruzi *", en: "Business Name *", fr: "Nom de l'entreprise *" },
  "modal.wholesale.ownerName": { rw: "Izina ry'Umworozi *", en: "Owner Name *", fr: "Nom du propriétaire *" },
  "modal.wholesale.tin": { rw: "TIN *", en: "TIN *", fr: "TIN *" },
  "modal.wholesale.phone": { rw: "Telefone *", en: "Phone *", fr: "Téléphone *" },
  "modal.wholesale.password": { rw: "Ijambo ry'ibanga *", en: "Password *", fr: "Mot de passe *" },
  "modal.wholesale.submit": { rw: "Tumiza", en: "Submit", fr: "Soumettre" },
  "modal.wholesale.submitting": { rw: "Kohereza...", en: "Submitting...", fr: "Envoi..." },
  "modal.wholesale.loggingIn": { rw: "Kwinjira...", en: "Logging in...", fr: "Connexion..." },
  "modal.wholesale.welcome": { rw: "Murakaza neza", en: "Welcome", fr: "Bienvenue" },
  "modal.wholesale.approved": { rw: "Byemewe! Twuvugane ku muguzi winshi ku", en: "Approved! Contact us for bulk orders at", fr: "Approuvé ! Contactez-nous pour les commandes en gros à" },
  "modal.wholesale.off": { rw: "kubiciro byo hasi", en: "off", fr: "de réduction" },
  "modal.wholesale.placeBulkOrder": { rw: "Tumiza Oridere Yinshi", en: "Place Bulk Order", fr: "Passer Commande en Gros" },
  "modal.wholesale.status": { rw: "Imiterere:", en: "Status:", fr: "Statut :" },

  "bundle.addToCart": { rw: "Ongera Imibonano mu Gikoni", en: "Add Bundle to Cart", fr: "Ajouter l'Ensemble au Panier" },

  // Admin common
  "admin.new": { rw: "Gishya", en: "New", fr: "Nouveau" },
  "admin.add": { rw: "Ongera", en: "Add", fr: "Ajouter" },
  "admin.edit": { rw: "Hindura", en: "Edit", fr: "Modifier" },
  "admin.save": { rw: "Bika", en: "Save", fr: "Enregistrer" },
  "admin.cancel": { rw: "Hakana", en: "Cancel", fr: "Annuler" },
  "admin.delete": { rw: "Siba", en: "Delete", fr: "Supprimer" },
  "admin.saving": { rw: "Mu kubika...", en: "Saving...", fr: "Enregistrement..." },
  "admin.loading": { rw: "Mu gutegura...", en: "Loading...", fr: "Chargement..." },
  "admin.active": { rw: "Gikora", en: "Active", fr: "Actif" },
  "admin.off": { rw: "Byacitse", en: "Off", fr: "Inactif" },
  "admin.send": { rw: "Tumiza", en: "Send", fr: "Envoyer" },
  "admin.approve": { rw: "Emeza", en: "Approve", fr: "Approuver" },
  "admin.reject": { rw: "Hakana", en: "Reject", fr: "Rejeter" },
  "admin.suspend": { rw: "Hagarika", en: "Suspend", fr: "Suspendre" },
  "admin.confirm": { rw: "Emeza", en: "Confirm", fr: "Confirmer" },
  "admin.complete": { rw: "Byarangiye", en: "Complete", fr: "Terminer" },
  "admin.pending": { rw: "Bitegereje", en: "Pending", fr: "En attente" },
  "admin.approved": { rw: "Byemejwe", en: "Approved", fr: "Approuvé" },
  "admin.rejected": { rw: "Byanze", en: "Rejected", fr: "Rejeté" },
  "admin.suspended": { rw: "Byahagaritswe", en: "Suspended", fr: "Suspendu" },
  "admin.all": { rw: "Byose", en: "All", fr: "Tous" },
  "admin.deleteConfirm": { rw: "Siba?", en: "Delete?", fr: "Supprimer ?" },
  "admin.saved": { rw: "Byabitswe!", en: "Saved!", fr: "Enregistré !" },
  "admin.broadcast": { rw: "Tangaza", en: "Broadcast", fr: "Diffuser" },
  "admin.markAllRead": { rw: "Soma Byose", en: "Mark all read", fr: "Tout marquer lu" },
  "admin.csv": { rw: "CSV", en: "CSV", fr: "CSV" },

  // Admin coupons
  "admin.coupon.code": { rw: "Kode", en: "Code", fr: "Code" },
  "admin.coupon.type": { rw: "Ubwoko", en: "Type", fr: "Type" },
  "admin.coupon.value": { rw: "Agaciro", en: "Value", fr: "Valeur" },
  "admin.coupon.minOrder": { rw: "Oridere ntoya", en: "Min Order", fr: "Commande min." },
  "admin.coupon.description": { rw: "Igisobanuro", en: "Description", fr: "Description" },
  "admin.coupon.percent": { rw: "Ku ijana", en: "Percent", fr: "Pourcentage" },
  "admin.coupon.fixed": { rw: "Fixe", en: "Fixed", fr: "Fixe" },
  "admin.coupon.public": { rw: "By'rusange", en: "Public", fr: "Public" },
  "admin.coupon.used": { rw: "Byakoreshejwe", en: "Used", fr: "Utilisé" },
  "admin.coupon.off": { rw: "ku biciro", en: "off", fr: "de réduction" },

  // Admin bundles
  "admin.bundle.emoji": { rw: "Emojis", en: "Emoji", fr: "Emoji" },
  "admin.bundle.name": { rw: "Izina", en: "Name", fr: "Nom" },
  "admin.bundle.normalPrice": { rw: "Igiciro cyisanzwe", en: "Normal Price", fr: "Prix normal" },
  "admin.bundle.bundlePrice": { rw: "Igiciro cy'umubonano", en: "Bundle Price", fr: "Prix ensemble" },
  "admin.bundle.products": { rw: "Ibicuruzwa", en: "Products", fr: "Produits" },

  // Admin flash sales
  "admin.flash.title": { rw: "Umutwe", en: "Title", fr: "Titre" },
  "admin.flash.start": { rw: "Gutangira", en: "Start", fr: "Début" },
  "admin.flash.end": { rw: "Kurangiza", en: "End", fr: "Fin" },
  "admin.flash.productsAll": { rw: "Ibicuruzwa (ubusa = byose)", en: "Products (empty = all)", fr: "Produits (vide = tous)" },
  "admin.flash.live": { rw: "HOZWE", en: "LIVE", fr: "EN DIRECT" },
  "admin.flash.noSales": { rw: "Nta cyiciro cyihuse", en: "No flash sales", fr: "Aucune vente flash" },

  // Admin bookings
  "admin.booking.noBookings": { rw: "Nta bibanza", en: "No bookings", fr: "Aucune réservation" },
  "admin.booking.at": { rw: "ku", en: "at", fr: "à" },

  // Admin wholesale
  "admin.wholesale.owner": { rw: "Nyir'ubucuruzi:", en: "Owner:", fr: "Propriétaire :" },
  "admin.wholesale.noApps": { rw: "Nta bisabwa", en: "No applications", fr: "Aucune demande" },

  // Admin messages
  "admin.messages.noMsgs": { rw: "Nta butumwa", en: "No messages", fr: "Aucun message" },
  "admin.messages.replyTo": { rw: "Subira kuri", en: "Reply to", fr: "Répondre à" },
  "admin.messages.sendWA": { rw: "Tumiza kuri WhatsApp", en: "Send via WhatsApp", fr: "Envoyer via WhatsApp" },

  // Admin subscribers
  "admin.subscribers.active": { rw: "bikora", en: "active", fr: "actifs" },
  "admin.subscribers.broadcastTitle": { rw: "Ubutumwa bwa Tangaza", en: "Broadcast Message", fr: "Message Diffusion" },
  "admin.subscribers.broadcastConfirm": { rw: "Tumiza kuri", en: "Send to", fr: "Envoyer à" },
  "admin.subscribers.subscribers": { rw: "abiyandikishije?", en: "subscribers?", fr: "abonnés ?" },

  // Admin testimonials
  "admin.testimonials.noItems": { rw: "Nta byabaye", en: "No testimonials", fr: "Aucun témoignage" },

  // Admin staff
  "admin.staff.name": { rw: "Amazina", en: "Name", fr: "Nom" },
  "admin.staff.username": { rw: "Izina ryo gukoresha", en: "Username", fr: "Nom d'utilisateur" },
  "admin.staff.password": { rw: "Ijambo ry'ibanga", en: "Password", fr: "Mot de passe" },
  "admin.staff.newPassword": { rw: "Ijambo ry'ibanga rishya", en: "New Password", fr: "Nouveau mot de passe" },
  "admin.staff.role": { rw: "Inshingano", en: "Role", fr: "Rôle" },
  "admin.staff.permissions": { rw: "Uburyo", en: "Permissions", fr: "Permissions" },
  "admin.staff.permissionsCount": { rw: "uburyo", en: "permissions", fr: "permissions" },
  "admin.staff.sales": { rw: "Icuruza", en: "Sales", fr: "Ventes" },
  "admin.staff.inventory": { rw: "Ibyari mu stock", en: "Inventory", fr: "Inventaire" },
  "admin.staff.viewer": { rw: "Mureba", en: "Viewer", fr: "Spectateur" },
  "admin.staff.custom": { rw: "Bisanzwe", en: "Custom", fr: "Personnalisé" },

  // Admin branding
  "admin.branding.title": { rw: "Ibidukikije", en: "Branding", fr: "Marque" },
  "admin.branding.identity": { rw: "Ikiranga Iduka", en: "Shop Identity", fr: "Identité du Magasin" },
  "admin.branding.shopName": { rw: "Izina ry'Iduka", en: "Shop Name", fr: "Nom du Magasin" },
  "admin.branding.logoEmoji": { rw: "Emojis y'Ikirango", en: "Logo Emoji", fr: "Emoji du Logo" },
  "admin.branding.whatsapp": { rw: "Nimero ya WhatsApp", en: "WhatsApp Number", fr: "Numéro WhatsApp" },
  "admin.branding.email": { rw: "Imeyili", en: "Email", fr: "Email" },
  "admin.branding.tin": { rw: "TIN", en: "TIN", fr: "TIN" },
  "admin.branding.hours": { rw: "Amasaha", en: "Hours", fr: "Heures" },
  "admin.branding.uploaded": { rw: "Byohererejwe — kanda Bika", en: "Uploaded — click Save", fr: "Téléversé — cliquer Enregistrer" },

  // Admin notifications
  "admin.notifications.title": { rw: "Ibyerekeye", en: "Notifications", fr: "Notifications" },
  "admin.notifications.noNotifs": { rw: "Nta byerekeye", en: "No notifications", fr: "Aucune notification" },

  // Admin site health
  "admin.health.title": { rw: "Imiterere y'urubuga", en: "Site Health", fr: "Santé du Site" },
  "admin.health.services": { rw: "Serivisi", en: "Services", fr: "Services" },
  "admin.health.database": { rw: "Ububiko", en: "Database", fr: "Base de données" },
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
