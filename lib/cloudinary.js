import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export function isCloudinaryConfigured() {
  return Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
}

export async function uploadServiceImage(buffer, originalName = "service-image") {
  if (!isCloudinaryConfigured()) throw new Error("Cloudinary is not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET to .env.local.");
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({
      folder: "home-service/services",
      resource_type: "image",
      use_filename: true,
      unique_filename: true,
      overwrite: false,
      transformation: [{ width: 1200, height: 900, crop: "limit", quality: "auto", fetch_format: "auto" }],
      context: { source: originalName.slice(0, 200) },
    }, (error, result) => error ? reject(error) : resolve(result));
    stream.end(buffer);
  });
}

export async function deleteCloudinaryImage(publicId) {
  if (!publicId || !isCloudinaryConfigured()) return;
  try { await cloudinary.uploader.destroy(publicId, { resource_type: "image", invalidate: true }); }
  catch (error) { console.error("CLOUDINARY_DELETE_ERROR", error); }
}

export async function uploadCompanyLogo(buffer, originalName = "company-logo") {
  if (!isCloudinaryConfigured()) throw new Error("Cloudinary is not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET to .env.local.");
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({
      folder: "home-service/company",
      resource_type: "image",
      use_filename: true,
      unique_filename: true,
      overwrite: false,
      transformation: [{ width: 500, height: 200, crop: "limit", quality: "auto", fetch_format: "auto" }]
    }, (error, result) => error ? reject(error) : resolve(result));
    stream.end(buffer);
  });
}
