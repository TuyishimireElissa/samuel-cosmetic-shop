import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/route-auth";
import { v2 as cloudinary } from "cloudinary";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const HAS_CLOUDINARY = !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);

export async function POST(req: NextRequest) {
  const auth = checkAuth(req);
  if (!auth.ok) return auth.response;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ ok: false, error: "no_file" }, { status: 400 });
    if (!file.type.startsWith("image/")) return NextResponse.json({ ok: false, error: "not_image" }, { status: 400 });
    if (file.size > 5 * 1024 * 1024) return NextResponse.json({ ok: false, error: "too_large" }, { status: 400 });

    const bytes = Buffer.from(await file.arrayBuffer());

    if (HAS_CLOUDINARY) {
      try {
        const result = await new Promise<any>((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { folder: "samuel-cosmetic/products", resource_type: "image", transformation: [{ width: 800, height: 800, crop: "limit" }, { quality: "auto" }, { fetch_format: "auto" }] },
            (error, result) => { if (error) reject(new Error(error.message || "Upload failed")); else resolve(result); }
          ).end(bytes);
        });
        return NextResponse.json({ ok: true, url: result.secure_url, filename: file.name, size: file.size, provider: "cloudinary" });
      } catch (cloudErr: any) {
        console.warn("Cloudinary failed, local fallback:", cloudErr?.message);
      }
    }

    // Local filesystem fallback
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
    const safeExt = ["jpg", "jpeg", "png", "webp", "gif"].includes(ext) ? ext : "jpg";
    const fname = `${crypto.randomUUID()}.${safeExt}`;
    await writeFile(path.join(uploadsDir, fname), bytes);
    return NextResponse.json({ ok: true, url: `/uploads/${fname}`, filename: file.name, size: file.size, provider: "local" });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "server_error" }, { status: 500 });
  }
}
