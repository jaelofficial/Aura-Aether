import { randomUUID } from "crypto";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export const runtime = "nodejs";

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("aura_admin_token")?.value;
  const payload = token ? await verifyToken(token) : null;

  if (!payload || payload.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin authorization required" }, { status: 403 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || "product-images";

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      {
        error:
          "Supabase image uploads are not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your server environment.",
      },
      { status: 503 }
    );
  }

  try {
    const form = await req.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Choose an image file to upload." }, { status: 400 });
    }
    const extension = ALLOWED_TYPES[file.type];
    if (!extension) {
      return NextResponse.json(
        { error: "Use a JPG, PNG, WebP, GIF or AVIF image. SVG uploads are disabled for security." },
        { status: 415 }
      );
    }
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Images must be 10 MB or smaller." }, { status: 413 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const objectName = `products/${randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(objectName, file, {
        contentType: file.type,
        cacheControl: "31536000",
        upsert: false,
      });

    if (uploadError) {
      console.error("Supabase Storage upload failed:", uploadError.message);
      return NextResponse.json(
        { error: "Supabase could not upload this image. Check that the storage bucket exists and the server key has permission." },
        { status: 502 }
      );
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(objectName);
    return NextResponse.json({ url: data.publicUrl });
  } catch (error) {
    console.error("Admin Supabase image upload error:", error);
    return NextResponse.json(
      { error: "Could not upload image. Check your Supabase Storage configuration." },
      { status: 500 }
    );
  }
}
