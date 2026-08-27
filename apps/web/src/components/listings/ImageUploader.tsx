"use client";

import { useState, useCallback } from "react";
import { X, Upload, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploaderProps {
  images: string[];
  onChange: (urls: string[]) => void;
  max?: number;
}

export function ImageUploader({ images, onChange, max = 3 }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = useCallback(
    async (file: File) => {
      if (images.length >= max) {
        setError(`Maximum ${max} images allowed`);
        return;
      }

      setUploading(true);
      setError(null);

      try {
        // 1. Get signed params from our API
        const res = await fetch("/api/upload-auth");
        const { token, expire, signature, publicKey, urlEndpoint } = await res.json();

        // 2. Build FormData for ImageKit
        const formData = new FormData();
        formData.append("file", file);
        formData.append("publicKey", publicKey);
        formData.append("signature", signature);
        formData.append("token", token);
        formData.append("expire", expire.toString());

        // 3. Upload to ImageKit
        const uploadRes = await fetch(`${urlEndpoint}/api/v1/files/upload`, {
          method: "POST",
          body: formData,
        });

        const data = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(data.message || "Upload failed");

        // 4. Add the URL to our images array
        onChange([...images, data.url]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [images, onChange, max]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleUpload(file);
    },
    [handleUpload]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleUpload(file);
    },
    [handleUpload]
  );

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {/* Image preview grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {images.map((url, idx) => (
            <div key={idx} className="relative aspect-square rounded-lg border overflow-hidden group">
              <img src={url} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload dropzone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center transition",
          uploading ? "opacity-50 pointer-events-none" : "hover:border-primary",
          images.length >= max && "hidden"
        )}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Uploading...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="w-8 h-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Drag & drop an image, or{" "}
              <label className="text-primary cursor-pointer hover:underline">
                browse
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileInput}
                  disabled={uploading}
                />
              </label>
            </p>
            <p className="text-xs text-muted-foreground">PNG, JPG, WEBP up to 10MB</p>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      <p className="text-xs text-muted-foreground">
        {images.length} / {max} images uploaded
      </p>
    </div>
  );
}