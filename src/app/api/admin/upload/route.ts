import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ ok: false, error: "no_file" }, { status: 400 });
    if (!file.type.startsWith("image/")) return NextResponse.json({ ok: false, error: "not_image" }, { status: 400 });
    if (file.size > 5 * 1024 * 1024) return NextResponse.json({ ok: false, error: "too_large" }, { status: 400 });

    const bytes = Buffer.from(await file.arrayBuffer());

    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "samuel-cosmetic/products",
            resource_type: "image",
            transformation: [
              { width: 800, height: 800, crop: "limit" },
              { quality: "auto" },
              { fetch_format: "auto" },
            ],
          },
          (error, result) => {
            if (error) reject(new Error(error.message || "Upload failed"));
            else resolve(result);
          }
        )
        .end(bytes);
    });

    return NextResponse.json({
      ok: true,
      url: result.secure_url,
      filename: file.name,
      size: file.size,
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "server_error" }, { status: 500 });
  }
}
