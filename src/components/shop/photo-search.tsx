"use client";
import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera, Upload } from "lucide-react";

interface Props { onMatch: (categoryHint: string) => void; onClose: () => void; }

function classifyColor(r: number, g: number, b: number) {
  // SHOP-009 fix: hints must match actual category IDs from the database.
  // Previously "perfume" was returned but the real category ID is "fragrance",
  // so setActiveCat("perfume") matched nothing and showed 0 products.
  if (r > 180 && g < 150 && b < 180) return { hint: "makeup", label: "Makeup", emoji: "💄" };
  if (r > 200 && g > 200 && b > 180) return { hint: "skincare", label: "Skincare", emoji: "🧴" };
  if (b > 150 && r < 150) return { hint: "fragrance", label: "Fragrances", emoji: "🌸" };
  if (g > 130 && r < 180) return { hint: "haircare", label: "Hair care", emoji: "💆🏾‍♀️" };
  return { hint: "all", label: "All products", emoji: "🛍️" };
}

async function extractColor(file: File): Promise<{ r: number; g: number; b: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => { const img = new Image(); img.onload = () => { const canvas = document.createElement("canvas"); const size = 50; canvas.width = size; canvas.height = size; const ctx = canvas.getContext("2d"); if (!ctx) return reject(new Error("no ctx")); ctx.drawImage(img, 0, 0, size, size); const data = ctx.getImageData(0, 0, size, size).data; let r = 0, g = 0, b = 0, c = 0; for (let i = 0; i < data.length; i += 4) { r += data[i]; g += data[i + 1]; b += data[i + 2]; c++; } resolve({ r: Math.round(r / c), g: Math.round(g / c), b: Math.round(b / c) }); }; img.onerror = reject; img.src = e.target?.result as string; };
    reader.onerror = reject; reader.readAsDataURL(file);
  });
}

export function PhotoSearchModal({ onMatch, onClose }: Props) {
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  async function handleFile(file: File) { setBusy(true); setPreview(URL.createObjectURL(file)); try { const rgb = await extractColor(file); const cls = classifyColor(rgb.r, rgb.g, rgb.b); setResult({ ...cls, rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` }); } catch {} finally { setBusy(false); } }
  return (
    <Dialog open onOpenChange={onClose}><DialogContent className="max-w-md"><DialogHeader><DialogTitle className="flex items-center gap-2"><Camera size={20} className="text-pink-600" /> Photo Search</DialogTitle></DialogHeader>
      <p className="text-sm text-muted-foreground">Upload a photo of a cosmetic product. We'll match its color to a category.</p>
      <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
      {preview && <div className="rounded-xl overflow-hidden border border-pink-100"><img src={preview} alt="Preview" className="w-full h-48 object-cover" /></div>}
      {result && <div className="bg-pink-50/50 rounded-xl p-3 space-y-2"><div className="flex items-center gap-3"><div className="w-12 h-12 rounded-full border-2 border-white shadow" style={{ background: result.rgb }} /><div><div className="text-xs text-muted-foreground">Color:</div><div className="font-mono text-xs">{result.rgb}</div></div></div><div className="text-sm"><div className="text-muted-foreground">Category:</div><div className="text-lg font-bold text-pink-700">{result.emoji} {result.label}</div></div></div>}
      <div className="flex gap-2"><Button variant="outline" onClick={() => fileRef.current?.click()} className="border-pink-200 text-pink-700 flex-1"><Upload size={14} className="mr-1" /> Upload</Button><Button variant="outline" onClick={() => fileRef.current?.click()} className="border-pink-200 text-pink-700 flex-1"><Camera size={14} className="mr-1" /> Camera</Button>{result && <Button onClick={() => { onMatch(result.hint); onClose(); }} className="bg-pink-600 hover:bg-pink-700 flex-1">Show Products</Button>}</div>
      {busy && <div className="text-center text-sm text-pink-600">Analyzing...</div>}
    </DialogContent></Dialog>
  );
}
