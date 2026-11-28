import { NextResponse } from "next/server";
import { Readable } from "node:stream";
import cloudinary from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = (formData.get("file") || formData.get("image")) as File | null;

    if (!file) {
      return NextResponse.json({ ok: false, error: "No image file provided." }, { status: 400 });
    }

    // Validate mime type
    const validMimes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/avif",
    ];
    if (!validMimes.includes(file.type.toLowerCase())) {
      return NextResponse.json(
        { ok: false, error: "Invalid file format. Please upload a JPEG, PNG, or WebP photo." },
        { status: 400 },
      );
    }

    // Max 10MB
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { ok: false, error: "Image file is too large. Maximum allowed size is 10 MB." },
        { status: 400 },
      );
    }

    const uploadResult = await new Promise<{
      secure_url: string;
      public_id: string;
      width: number;
      height: number;
      format: string;
    }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "perfectjodi/profiles",
          resource_type: "image",
          transformation: [
            { width: 1000, height: 1000, crop: "limit", quality: "auto:good", fetch_format: "auto" },
          ],
        },
        (error: unknown, result: any) => {
          if (error || !result) {
            reject(error || new Error("Failed to upload image to Cloudinary."));
          } else {
            resolve({
              secure_url: result.secure_url,
              public_id: result.public_id,
              width: result.width,
              height: result.height,
              format: result.format,
            });
          }
        },
      );

      // Stream the file chunk by chunk without allocating the full array buffer in Node memory
      if (typeof file.stream === "function") {
        try {
          const nodeReadable = Readable.fromWeb(file.stream() as any);
          nodeReadable.pipe(uploadStream);
        } catch {
          file.arrayBuffer().then((ab) => uploadStream.end(Buffer.from(ab))).catch(reject);
        }
      } else {
        file.arrayBuffer().then((ab) => uploadStream.end(Buffer.from(ab))).catch(reject);
      }
    });

    return NextResponse.json({
      ok: true,
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      width: uploadResult.width,
      height: uploadResult.height,
    });
  } catch (error: unknown) {
    console.error("Cloudinary upload error:", error);
    const message = error instanceof Error ? error.message : "Failed to upload image.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
