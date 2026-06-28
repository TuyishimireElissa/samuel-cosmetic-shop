"use client";

import { useState, useEffect } from "react";
import { useUI } from "@/lib/store";
import { t } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, User, ArrowLeft, Sparkles } from "lucide-react";
import { toast } from "sonner";

export function AdminLogin() {
  const { lang, adminLogin, exitAdmin } = useUI();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(t("admin.login.error", lang));
        return;
      }
      adminLogin(data.token, data.user.fullName, data.user.type, data.user.permissions || ["*"]);
      toast.success("Welcome back, " + data.user.fullName);
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-br from-pink-100 via-pink-50 to-purple-100 p-4">
      <div className="w-full max-w-md">
        <button
          onClick={exitAdmin}
          className="mb-4 text-sm text-pink-700 hover:underline inline-flex items-center gap-1"
        >
          <ArrowLeft size={14} /> {t("common.back", lang)}
        </button>

        <div className="bg-white rounded-3xl shadow-xl p-8 border border-pink-100">
          <div className="text-center mb-6">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="w-16 h-16 mx-auto rounded-full object-cover mb-3" />
            ) : (
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-pink-400 to-pink-600 grid place-items-center text-2xl text-white mb-3">
                {logoEmoji}
              </div>
            )}
            <h1 className="text-2xl font-bold text-pink-900" style={{ fontFamily: "var(--font-playfair)" }}>
              {t("admin.login.title", lang)}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Samuel Cosmetic Shop</p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="flex items-center gap-1">
                <User size={14} /> {t("admin.login.username", lang)}
              </Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
                className="h-11 bg-pink-50/50 border-pink-100"
                placeholder="admin"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-1">
                <Lock size={14} /> {t("admin.login.password", lang)}
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 bg-pink-50/50 border-pink-100"
                placeholder="••••••••"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-pink-600 hover:bg-pink-700"
            >
              {loading ? t("common.loading", lang) : t("admin.login.submit", lang)}
            </Button>
          </form>

          <div className="mt-4 p-3 rounded-lg bg-pink-50 text-xs text-pink-700 text-center">
            <Sparkles size={12} className="inline mr-1" />
            {t("admin.login.hint", lang)}
          </div>
        </div>
      </div>
    </div>
  );
}
