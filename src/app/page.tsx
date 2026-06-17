"use client";

import { useEffect, useState } from "react";
import { useUI } from "@/lib/store";
import { detectInitialLang } from "@/lib/i18n";
import { Storefront } from "@/components/shop/storefront";
import { AdminLogin } from "@/components/admin/login";
import { AdminApp } from "@/components/admin/app";

export default function Home() {
  const { adminView, setLang } = useUI();
  // Always render the loader on the very first client paint (matches SSR output),
  // then swap to the real app once mounted.
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Detect language only on first mount
    const stored = typeof window !== "undefined" ? localStorage.getItem("sc_language") : null;
    if (!stored) {
      const detected = detectInitialLang();
      // Defer to next frame to avoid the setState-in-effect lint
      requestAnimationFrame(() => setLang(detected));
    }
    requestAnimationFrame(() => setMounted(true));
  }, [setLang]);

  // Avoid hydration mismatch — render nothing until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen grid place-items-center bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-pink-400 to-pink-600 grid place-items-center text-3xl text-white mb-3 animate-pulse">
            ✿
          </div>
          <div className="text-pink-700 text-sm">Samuel Cosmetic Shop...</div>
        </div>
      </div>
    );
  }

  if (adminView === "admin-login") return <AdminLogin />;
  if (adminView === "admin-app") return <AdminApp />;
  return <Storefront />;
}
