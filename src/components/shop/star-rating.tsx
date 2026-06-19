"use client";
import { useState } from "react";
import { Star } from "lucide-react";
const LABELS: Record<number, { rw: string; en: string; fr: string }> = { 1: { rw: "Bibi", en: "Terrible", fr: "Terrible" }, 2: { rw: "Mibi", en: "Bad", fr: "Mauvais" }, 3: { rw: "Bisanzwe", en: "OK", fr: "OK" }, 4: { rw: "Byiza", en: "Good", fr: "Bien" }, 5: { rw: "Byiza cyane", en: "Excellent", fr: "Excellent" } };
interface Props { value: number; onChange?: (n: number) => void; lang?: "rw" | "en" | "fr"; size?: number; readOnly?: boolean; }
export function StarRating({ value, onChange, lang = "en", size = 28, readOnly = false }: Props) {
  const [hover, setHover] = useState(0);
  const [focused, setFocused] = useState(0);
  const display = hover || focused || value;
  if (readOnly) { return <div className="inline-flex items-center gap-0.5">{Array.from({length:5}).map((_,i)=><Star key={i} size={size} className={i<Math.round(value)?"text-amber-500 fill-amber-500":"text-gray-300 fill-gray-200"} />)}</div>; }
  return <div className="inline-flex flex-col gap-1"><div className="inline-flex gap-0.5" onMouseLeave={()=>setHover(0)}>{[1,2,3,4,5].map(n=><button key={n} type="button" className="p-0.5 rounded focus:outline-none focus:ring-2 focus:ring-pink-400" onClick={()=>onChange?.(n)} onMouseEnter={()=>setHover(n)} onFocus={()=>setFocused(n)} onBlur={()=>setFocused(0)} onTouchStart={(e)=>{e.preventDefault();onChange?.(n);}}><Star size={size} className={n<=display?"text-amber-500 fill-amber-500":"text-gray-300 fill-gray-100"} /></button>)}</div>{display>0&&<div className="text-xs text-pink-700 font-medium">{LABELS[display]?.[lang]||LABELS[display]?.en}</div>}</div>;
}
