import { v2 as cloudinary } from "cloudinary";
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
export async function uploadToCloudinary(file: Buffer, folder: string = "samuel-cosmetic/products"): Promise<string> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder, resource_type: "image", transformation: [{ width: 800, height: 800, crop: "limit" }, { quality: "auto" }] },
      (error, result) => { if (error) reject(error); else resolve(result!.secure_url); }
    ).end(file);
  });
}
export default cloudinary;
