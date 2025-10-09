import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// Prefer server-side env vars, but fall back to NEXT_PUBLIC_* values (useful when
// the developer placed keys in .env.local with NEXT_PUBLIC_ prefixes).
const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY || process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET || process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET;
const cloudinaryUrl = process.env.CLOUDINARY_URL || process.env.NEXT_PUBLIC_CLOUDINARY_URL;

if (cloudinaryUrl) {
  // If CLOUDINARY_URL is present it contains all credentials, let cloudinary parse it.
  cloudinary.config({ url: cloudinaryUrl });
} else {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
}

// Validate configuration early and fail with a helpful message if missing
// cloudinary.config() returns the current config. Ensure both cloud_name and api_key are present.
const cfg = cloudinary.config();
const hasCreds = Boolean(cfg.cloud_name && cfg.api_key && cfg.api_secret);
if (!hasCreds) {
  // Log detailed info for developers (never leak secrets to clients)
  // eslint-disable-next-line no-console
  console.error(
    "Cloudinary not configured. Set CLOUDINARY_URL or CLOUDINARY_API_KEY/CLOUDINARY_API_SECRET/CLOUDINARY_CLOUD_NAME (or NEXT_PUBLIC_ variants) in your environment."
  );
}

export async function POST(request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  // Convert file to buffer
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  try {
    if (!hasCreds) {
      return NextResponse.json(
        {
          error:
            "Cloudinary is not configured on the server. Please set CLOUDINARY_URL or CLOUDINARY_API_KEY/CLOUDINARY_API_SECRET and CLOUDINARY_CLOUD_NAME.",
        },
        { status: 500 }
      );
    }
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "roadcare" },
        (error, result) => {
          if (error) reject(error);
          resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    return NextResponse.json({ url: result.secure_url });
  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
