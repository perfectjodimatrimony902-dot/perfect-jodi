"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Camera, CheckCircle2, Loader2, RefreshCw, Trash2, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ProfileAvatar } from "./ProfileAvatar";

interface PhotoUploaderProps {
  currentPhotoUrl?: string;
  name: string;
  tone?: number;
  onPhotoUploaded: (url: string) => void;
  onPhotoRemoved?: () => void;
  className?: string;
}

/** Resize image on client to max 1200px to ensure tiny payload and zero buffer spikes */
async function compressImage(file: File, maxDim = 1200, quality = 0.85): Promise<File> {
  return new Promise((resolve) => {
    // If already small (< 300KB), keep original
    if (file.size <= 300 * 1024 && file.type === "image/jpeg") {
      return resolve(file);
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;

      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve(file);

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) return resolve(file);
          const compressed = new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), {
            type: "image/jpeg",
            lastModified: Date.now(),
          });
          resolve(compressed);
        },
        "image/jpeg",
        quality,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };

    img.src = objectUrl;
  });
}

export function PhotoUploader({
  currentPhotoUrl,
  name,
  tone = 1,
  onPhotoUploaded,
  onPhotoRemoved,
  className,
}: PhotoUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayUrl = previewUrl || currentPhotoUrl;

  const handleFile = async (file: File) => {
    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type.toLowerCase())) {
      toast.error("Please upload a valid image file (JPG, PNG, or WebP).");
      return;
    }

    // Max 10MB
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image file is too large. Maximum size is 10 MB.");
      return;
    }

    // Local instant preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setUploading(true);

    try {
      // Compress client-side first so buffer allocation is tiny
      const compressedFile = await compressImage(file);

      const formData = new FormData();
      formData.append("file", compressedFile);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to upload photo to Cloudinary");
      }

      onPhotoUploaded(data.url);
      setPreviewUrl(data.url);
      toast.success("Profile photo uploaded to Cloudinary!");
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Upload failed";
      toast.error(msg);
      setPreviewUrl(null);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    if (onPhotoRemoved) {
      onPhotoRemoved();
    }
    toast.info("Photo removed. Avatar will use initials and tone.");
  };

  return (
    <div className={cn("space-y-4", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg"
        className="hidden"
        onChange={handleInputChange}
        disabled={uploading}
      />

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl border-2 border-dashed transition-all",
          isDragging
            ? "border-primary bg-primary/10 scale-[1.01]"
            : "border-border/80 bg-card hover:border-gold/60",
          uploading && "opacity-80 pointer-events-none",
        )}
      >
        {/* Avatar / Photo Display */}
        <div className="relative shrink-0">
          <ProfileAvatar
            name={name}
            tone={tone}
            size="xl"
            photoUrl={displayUrl || undefined}
            className="ring-4 ring-gold/40 shadow-md"
          />
          {uploading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-xs">
              <Loader2 className="h-8 w-8 animate-spin text-gold" />
              <span className="text-[11px] font-medium mt-1">Uploading...</span>
            </div>
          )}
          {displayUrl && !uploading && (
            <div
              className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-success text-white shadow-md ring-2 ring-card"
              title="Uploaded to Cloudinary"
            >
              <CheckCircle2 className="h-4 w-4" />
            </div>
          )}
        </div>

        {/* Action Controls & Description */}
        <div className="flex-1 text-center sm:text-left space-y-2">
          <div>
            <h4 className="text-base font-semibold text-foreground flex items-center justify-center sm:justify-start gap-2">
              <Camera className="h-4 w-4 text-primary" />
              {displayUrl ? "Profile Photo Added" : "Upload Your Profile Photo"}
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              Profiles with genuine photos receive up to{" "}
              <strong className="text-primary font-semibold">8x more responses</strong> and match
              requests.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="border-gold/50 hover:bg-gold/10 hover:text-primary font-medium"
            >
              {displayUrl ? (
                <>
                  <RefreshCw className="mr-1.5 h-3.5 w-3.5 text-gold" /> Change Photo
                </>
              ) : (
                <>
                  <UploadCloud className="mr-1.5 h-4 w-4 text-primary" /> Choose Image File
                </>
              )}
            </Button>

            {displayUrl && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={uploading}
                onClick={handleRemove}
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Remove
              </Button>
            )}
          </div>

          <p className="text-[11px] text-muted-foreground">
            Supports JPG, PNG or WebP (max 10MB). Photos are securely processed and optimized via Cloudinary.
          </p>
        </div>
      </div>
    </div>
  );
}
