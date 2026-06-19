"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    const isChunkError =
      error?.message?.includes("ChunkLoadError") ||
      error?.message?.includes("Loading chunk") ||
      error?.message?.includes("Loading CSS chunk") ||
      error?.name === "ChunkLoadError";

    if (isChunkError) {
      console.warn("[GlobalError] ChunkLoadError — auto-reloading...");
      if ("caches" in window) {
        caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)));
      }
      try { sessionStorage.clear(); } catch {}
      setTimeout(() => window.location.reload(), 200);
    } else {
      console.error("[GlobalError]", error);
    }
  }, [error]);

  return (
    <html lang="rw">
      <body style={{ margin: 0, padding: 0, fontFamily: "system-ui, sans-serif", background: "linear-gradient(135deg, #fef0f5, #f5f3ff)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", padding: "2rem", maxWidth: "400px" }}>
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>✿</div>
          <h1 style={{ color: "#e75480", fontFamily: "Georgia, serif", marginBottom: "0.5rem" }}>Samuel Cosmetic Shop</h1>
          <p style={{ color: "#666", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
            {error?.message?.includes("ChunkLoadError") ? "Updating... Auto-reloading." : "Something went wrong."}
          </p>
          {!error?.message?.includes("ChunkLoadError") && (
            <button onClick={reset} style={{ background: "#e75480", color: "white", border: "none", padding: "0.75rem 2rem", borderRadius: "9999px", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer" }}>Try Again</button>
          )}
          {error?.message?.includes("ChunkLoadError") && (
            <div style={{ width: "40px", height: "40px", border: "3px solid #fef0f5", borderTop: "3px solid #e75480", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "1rem auto" }} />
          )}
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      </body>
    </html>
  );
}
